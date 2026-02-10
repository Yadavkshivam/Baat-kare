import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io;

export const initializeSocket = (server) => {
  // CORS configuration for deployment
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
  ].filter(Boolean); // Remove undefined values

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'], // Support both transports
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name}`);

    // Join a chat room
    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
      console.log(`${socket.user.name} joined chat: ${chatId}`);
      
      // Notify others in the room
      socket.to(chatId).emit('user-joined', {
        userId: socket.user._id,
        name: socket.user.name,
      });
    });

    // Leave a chat room
    socket.on('leave-chat', (chatId) => {
      socket.leave(chatId);
      console.log(`${socket.user.name} left chat: ${chatId}`);
    });

    // Handle new message
    socket.on('send-message', (data) => {
      const { chatId, message } = data;
      
      // Broadcast to all users in the chat room
      io.to(chatId).emit('new-message', message);
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('user-typing', {
        userId: socket.user._id,
        name: socket.user.name,
      });
    });

    // Handle stop typing
    socket.on('stop-typing', (data) => {
      const { chatId } = data;
      socket.to(chatId).emit('user-stop-typing', {
        userId: socket.user._id,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
