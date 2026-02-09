import { createContext, useContext, useEffect, useState } from 'react';
import { socketService } from '../services/socketService';
import { authService } from '../services/authService';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      const socketInstance = socketService.connect(token);
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });
    }

    return () => {
      socketService.disconnect();
    };
  }, []);

  const value = {
    socket,
    isConnected,
    joinChat: socketService.joinChat.bind(socketService),
    leaveChat: socketService.leaveChat.bind(socketService),
    sendMessage: socketService.sendMessage.bind(socketService),
    startTyping: socketService.startTyping.bind(socketService),
    stopTyping: socketService.stopTyping.bind(socketService),
    onNewMessage: socketService.onNewMessage.bind(socketService),
    onUserJoined: socketService.onUserJoined.bind(socketService),
    onUserTyping: socketService.onUserTyping.bind(socketService),
    onUserStopTyping: socketService.onUserStopTyping.bind(socketService),
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
