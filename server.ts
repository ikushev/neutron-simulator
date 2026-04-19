import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';
import fs from 'fs';

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
  
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(__dirname, 'dist');
  const rootPath = path.resolve(__dirname);

  // Log environment for debugging
  console.log(`[v0] Environment: ${isProduction ? 'production' : 'development'}`);
  console.log(`[v0] Root path: ${rootPath}`);
  console.log(`[v0] Dist path: ${distPath}`);
  console.log(`[v0] NEXT_PUBLIC_SOCKET_URL: ${process.env.NEXT_PUBLIC_SOCKET_URL ? '[SET]' : '[NOT SET]'}`);

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

  // ==================== API ROUTES (FIRST) ====================
  
  // Health check endpoint for diagnostics
  app.get('/health', (req, res) => {
    res.send('Server is alive');
  });

  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      port: PORT,
      mode: isProduction ? 'production' : 'development',
      timestamp: new Date().toISOString()
    });
  });

  // ==================== VITE MIDDLEWARE (SECOND) ====================
  
  if (!isProduction) {
    // Development: Use Vite as middleware
    const vite = await createViteServer({
      root: rootPath,
      server: { 
        middlewareMode: true,
        hmr: {
          port: 24678
        }
      },
      appType: 'spa',
    });
    
    // Vite middleware handles ALL requests in dev mode (including index.html)
    app.use(vite.middlewares);
    
    console.log(`[v0] Vite middleware attached for development`);
  } else {
    // Production: Serve static files from dist
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, { index: 'index.html' }));
      console.log(`[v0] Serving static files from: ${distPath}`);
    } else {
      console.warn(`[v0] Warning: dist folder not found at ${distPath}`);
    }
  }

  // ==================== SPA FALLBACK (LAST) ====================
  
  app.get('*', (req, res, next) => {
    // Skip API and socket.io routes
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io') || req.path === '/health') {
      return next();
    }
    
    // In dev mode, Vite middleware already handles this
    if (!isProduction) {
      return next();
    }
    
    // Production: serve index.html for SPA client-side routing
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('index.html not found in dist folder');
    }
  });

  // ==================== START SERVER ====================
  
  httpServer.listen(PORT, '0.0.0.0', () => {
    // Special log format for v0 sandbox port detection
    console.log(`V0_PORT_DETECTION: LISTENING ON PORT ${PORT}`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

startServer();
