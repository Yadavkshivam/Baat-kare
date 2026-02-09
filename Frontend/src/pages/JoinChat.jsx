import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';

const JoinChat = () => {
  const { link } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Wait for auth to be checked first
    if (authLoading) return;
    
    if (isAuthenticated) {
      joinChatRoom();
    }
  }, [isAuthenticated, authLoading, link]);

  const joinChatRoom = async () => {
    setLoading(true);
    try {
      const chat = await chatService.joinChat(link);
      navigate(`/chat/${chat._id}`, { replace: true });
    } catch (err) {
      console.error('Join error:', err);
      setError(err.response?.data?.message || 'Failed to join chat');
      setLoading(false);
    }
  };

  // Still checking auth
  if (authLoading || (isAuthenticated && loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Joining chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Join</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-block"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Not authenticated - show login/register options
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          You've been invited to chat!
        </h2>
        <p className="text-gray-600 mb-6">
          Sign in or create an account to join this multilingual conversation.
        </p>
        <div className="space-y-3">
          <Link
            to={`/login?redirect=/join/${link}`}
            className="block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Sign In
          </Link>
          <Link
            to={`/register?redirect=/join/${link}`}
            className="block border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JoinChat;
