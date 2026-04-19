import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '/vercel/share/.env.project' });
dotenv.config({ path: '/vercel/share/.env.snowflake' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if a port is available
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, '0.0.0.0');
  });
}

// Find an available port starting from the preferred one
async function findAvailablePort(preferredPort: number): Promise<number> {
  const portsToTry = [preferredPort, 3001, 3002, 5173, 8080];
  for (const port of portsToTry) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  // If all preferred ports are taken, let OS assign one
  return 0;
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Find an available port (prefer PORT env var, then try alternatives)
  const preferredPort = parseInt(process.env.PORT || '3000', 10);
  const PORT = await findAvailablePort(preferredPort);

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

  // Serve static files and handle SPA routing
  const distPath = path.join(__dirname, 'dist');
  
  if (process.env.NODE_ENV !== 'production') {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files from dist
    app.use(express.static(distPath, { index: 'index.html' }));
  }
  
  // SPA fallback: serve index.html for any non-API, non-static route
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    // Serve index.html for SPA client-side routing
    if (process.env.NODE_ENV !== 'production') {
      // In dev mode, Vite handles this
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
