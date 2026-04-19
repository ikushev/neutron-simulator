import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Real-time states
  const roomStates = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', (roomCode) => {
      socket.join(roomCode);
      console.log(`User ${socket.id} joined room ${roomCode}`);
      
      if (roomStates.has(roomCode)) {
        socket.emit('sync-physics', roomStates.get(roomCode));
      }
    });

    socket.on('request-current-state', (roomCode) => {
      if (roomStates.has(roomCode)) {
        socket.emit('sync-physics', roomStates.get(roomCode));
      }
    });

    socket.on('teacher-move', ({ roomCode, updated }) => {
      roomStates.set(roomCode, updated);
      socket.to(roomCode).emit('sync-physics', updated);
    });

    socket.on('raise-hand', ({ roomCode, studentName }) => {
      io.to(roomCode).emit('student-alert', {
        type: 'hand-raise',
        message: `${studentName || 'Студент'} вдигна ръка`,
        timestamp: new Date().toLocaleTimeString('bg-BG')
      });
    });

    socket.on('start-quiz', ({ roomCode, questionData }) => {
      io.to(roomCode).emit('incoming-quiz', questionData);
    });

    socket.on('submit-answer', ({ roomCode, answerIndex }) => {
      io.to(roomCode).emit('new-answer', { answerIndex });
    });

    socket.on('close-quiz', (roomCode) => {
      io.to(roomCode).emit('quiz-closed');
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
