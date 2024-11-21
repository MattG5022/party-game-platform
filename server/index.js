import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Update CORS configuration for production
const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://heroic-caramel-f2e6b6.netlify.app",
      "http://localhost:5173",
      // Add any other domains that need access
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create_room', ({ playerName }) => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const player = { id: socket.id, name: playerName, status: 'waiting' };
    rooms.set(roomCode, { 
      host: socket.id, 
      players: [player],
      gameState: null 
    });
    
    socket.join(roomCode);
    socket.emit('room_created', roomCode);
    socket.emit('joined_room', { 
      roomCode, 
      players: rooms.get(roomCode).players 
    });
  });

  socket.on('join_room', ({ roomCode, playerName }) => {
    const room = rooms.get(roomCode);
    if (room) {
      const player = { id: socket.id, name: playerName, status: 'waiting' };
      room.players.push(player);
      socket.join(roomCode);
      socket.emit('joined_room', { roomCode, players: room.players });
      socket.to(roomCode).emit('player_joined', player);
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  socket.on('chat_message', ({ roomCode, message }) => {
    socket.to(roomCode).emit('chat_message', {
      ...message,
      user: rooms.get(roomCode)?.players.find(p => p.id === socket.id)?.name || 'Unknown'
    });
  });

  socket.on('disconnect', () => {
    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        io.to(roomCode).emit('player_left', socket.id);
      }
      if (room.host === socket.id) {
        io.to(roomCode).emit('host_left');
        rooms.delete(roomCode);
      }
    });
  });
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('Party Game Server is running!');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});