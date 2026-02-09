import api from './api';

export const chatService = {
  createChat: async () => {
    const response = await api.post('/chat/create');
    return response.data;
  },

  joinChat: async (link) => {
    const response = await api.post(`/chat/join/${link}`);
    return response.data;
  },

  getChatById: async (chatId) => {
    const response = await api.get(`/chat/${chatId}`);
    return response.data;
  },

  getUserChats: async () => {
    const response = await api.get('/chat');
    return response.data;
  },

  getMessages: async (chatId) => {
    const response = await api.get(`/messages/${chatId}`);
    return response.data;
  },

  sendMessage: async (chatId, text) => {
    const response = await api.post('/messages', { chatId, text });
    return response.data;
  },
};
