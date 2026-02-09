import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { chatService } from '../services/chatService';
import { formatTime, getInitials } from '../utils/helpers';
import { getLanguageName } from '../utils/languages';

const Chat = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { socket, joinChat, leaveChat, sendMessage, onNewMessage, onUserTyping, onUserStopTyping, startTyping, stopTyping, onUserJoined } = useSocket();
  const navigate = useNavigate();

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const fetchChatData = useCallback(async () => {
    try {
      const [chatData, messagesData] = await Promise.all([
        chatService.getChatById(chatId),
        chatService.getMessages(chatId),
      ]);
      setChat(chatData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to fetch chat:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [chatId, navigate]);

  useEffect(() => {
    fetchChatData();
    joinChat(chatId);

    return () => {
      leaveChat(chatId);
    };
  }, [chatId, fetchChatData, joinChat, leaveChat]);

  useEffect(() => {
    onNewMessage((message) => {
      // Skip if this message is from the current user (we already added it)
      if (message.sender?._id === user?._id) {
        return;
      }
      
      // Get translated text for current user's language
      const userLang = user?.preferredLanguage || 'en';
      const translatedText = message.translations?.[userLang] || message.translatedText || message.originalText;
      
      setMessages((prev) => [...prev, {
        ...message,
        translatedText: translatedText,
      }]);
    });

    onUserTyping((data) => {
      if (data.userId !== user?._id) {
        setTypingUsers((prev) => {
          if (!prev.find((u) => u.userId === data.userId)) {
            return [...prev, data];
          }
          return prev;
        });
      }
    });

    onUserStopTyping((data) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    // When a new user joins, refresh chat data to get updated participants
    onUserJoined((data) => {
      fetchChatData();
    });
  }, [user?._id, onNewMessage, onUserTyping, onUserStopTyping, onUserJoined, fetchChatData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    startTyping(chatId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(chatId);
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const message = await chatService.sendMessage(chatId, newMessage.trim());
      
      // Broadcast to other users via socket
      sendMessage(chatId, message);
      
      // For sender, show their original text (their own language)
      const userLang = user?.preferredLanguage || 'en';
      const displayText = message.translations?.[userLang] || message.originalText;
      
      setMessages((prev) => [...prev, {
        ...message,
        translatedText: displayText,
      }]);
      setNewMessage('');
      stopTyping(chatId);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const otherParticipants = chat?.participants?.filter((p) => p._id !== user?._id) || [];
  const otherParticipant = otherParticipants[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-600 hover:text-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          {otherParticipants.length > 0 ? (
            <>
              <h2 className="font-semibold text-gray-900">
                {otherParticipants.map(p => p.name).join(', ')}
              </h2>
              <p className="text-sm text-gray-500">
                Speaks: {otherParticipants.map(p => getLanguageName(p.preferredLanguage)).join(', ')}
              </p>
            </>
          ) : (
            <>
              <h2 className="font-semibold text-gray-900">Waiting for someone to join...</h2>
              <p className="text-sm text-gray-500">
                Share link: {window.location.origin}/join/{chat?.uniqueLink}
              </p>
            </>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Your language</p>
          <p className="text-sm font-medium text-blue-600">
            {getLanguageName(user?.preferredLanguage)}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {otherParticipants.length === 0 ? (
              <div>
                <p className="mb-2">Share this link with someone to start chatting:</p>
                <code className="bg-gray-100 px-3 py-2 rounded text-sm block max-w-md mx-auto break-all">
                  {window.location.origin}/join/{chat?.uniqueLink}
                </code>
              </div>
            ) : (
              <p>No messages yet. Start the conversation!</p>
            )}
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender._id === user?._id;
            return (
              <div
                key={msg._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                  {!isOwn && (
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(msg.sender.name)}
                    </div>
                  )}
                  <div
                    className={`message-bubble px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p>{msg.translatedText || msg.originalText}</p>
                    <div className={`flex items-center gap-2 mt-1 text-xs ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                      <span>{formatTime(msg.createdAt)}</span>
                      {msg.originalLanguage !== user?.preferredLanguage && !isOwn && (
                        <span className="italic">translated</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="bg-gray-200 px-4 py-2 rounded-2xl rounded-bl-none">
              <div className="flex gap-1">
                <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full"></span>
                <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full"></span>
                <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="bg-white border-t p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder={`Type in ${getLanguageName(user?.preferredLanguage)}...`}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
