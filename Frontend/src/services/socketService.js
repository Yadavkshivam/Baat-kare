import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';

class SocketService {
  socket = null;

  connect(token) {
    this.socket = io(SOCKET_URL, {
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChat(chatId) {
    if (this.socket) {
      this.socket.emit('join-chat', chatId);
    }
  }

  leaveChat(chatId) {
    if (this.socket) {
      this.socket.emit('leave-chat', chatId);
    }
  }

  sendMessage(chatId, message) {
    if (this.socket) {
      this.socket.emit('send-message', { chatId, message });
    }
  }

  startTyping(chatId) {
    if (this.socket) {
      this.socket.emit('typing', { chatId });
    }
  }

  stopTyping(chatId) {
    if (this.socket) {
      this.socket.emit('stop-typing', { chatId });
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user-stop-typing', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketService = new SocketService();
