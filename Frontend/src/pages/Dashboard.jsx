import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { copyToClipboard, formatRelativeTime } from '../utils/helpers';

const Dashboard = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const data = await chatService.getUserChats();
      setChats(data);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    setCreating(true);
    try {
      const data = await chatService.createChat();
      setShareLink(data.shareableLink);
      setShowModal(true);
      fetchChats();
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareLink);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
           <Link to="/">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer hover:opacity-80 transition">
              Baat Kare
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Hi, <span className="font-semibold">{user?.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Create New Chat */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Start a New Conversation
            </h2>
            <p className="text-gray-600 mb-4">
              Create a chat room and share the link with anyone. They can join
              and chat in their preferred language!
            </p>
            <button
              onClick={handleCreateChat}
              disabled={creating}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {creating ? 'Creating...' : '+ Create New Chat'}
            </button>
          </div>

          {/* Chat List */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Chats
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No chats yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chats.map((chat) => (
                  <Link
                    key={chat._id}
                    to={`/chat/${chat._id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Chat with{' '}
                          {chat.participants
                            .filter((p) => p._id !== user?._id)
                            .map((p) => p.name)
                            .join(', ') || 'Waiting for others...'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {chat.participants.length} participant(s)
                        </p>
                      </div>
                      <span className="text-sm text-gray-400">
                        {formatRelativeTime(chat.updatedAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Share Link Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Chat Created! 🎉
            </h3>
            <p className="text-gray-600 mb-4">
              Share this link with anyone you want to chat with:
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
