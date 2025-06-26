const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const config = require('./config');

// Load environment variables
dotenv.config();

// Import routes
const todoRoutes = require('./routes/todos');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (temporary replacement for MongoDB)
global.todos = [];
global.todoIdCounter = 1;

console.log('Using in-memory storage (no MongoDB required)');

// Routes
app.use('/api/todos', todoRoutes);

// Socket.io for chat
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (userData) => {
    activeUsers.set(socket.id, userData);
    io.emit('userJoined', { user: userData, activeUsers: Array.from(activeUsers.values()) });
  });

  socket.on('sendMessage', (messageData) => {
    io.emit('newMessage', {
      ...messageData,
      timestamp: new Date(),
      socketId: socket.id
    });
  });

  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    activeUsers.delete(socket.id);
    io.emit('userLeft', { user, activeUsers: Array.from(activeUsers.values()) });
    console.log('Client disconnected');
  });
});

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
}); 