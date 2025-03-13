import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import dotenv from 'dotenv';
import gameState from './game/GameState';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Set port
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Basic health check route
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/players', (_req, res) => {
  res.json(gameState.getAllPlayers());
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));
  
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Handle player joining
  socket.on('player:join', (playerData) => {
    console.log('Player joined:', playerData);
    
    // Add player to game state
    const player = gameState.addPlayer(socket, playerData.name);
    
    // Acknowledge the join
    socket.emit('player:joined', player);
    
    // Broadcast to other players
    socket.broadcast.emit('player:new', player);
    
    // Send existing players to the new player
    socket.emit('players:list', gameState.getAllPlayers());
  });
  
  // Handle player movement
  socket.on('player:move', (position) => {
    if (gameState.updatePlayerPosition(socket.id, position)) {
      // Broadcast position update to other players
      socket.broadcast.emit('player:moved', {
        id: socket.id,
        position
      });
    }
  });
  
  // Handle player rotation
  socket.on('player:rotate', (rotation) => {
    if (gameState.updatePlayerRotation(socket.id, rotation)) {
      // Broadcast rotation update to other players
      socket.broadcast.emit('player:rotated', {
        id: socket.id,
        rotation
      });
    }
  });
  
  // Handle player disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove player from game state
    if (gameState.removePlayer(socket.id)) {
      // Broadcast player left to other players
      socket.broadcast.emit('player:left', { id: socket.id });
    }
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 