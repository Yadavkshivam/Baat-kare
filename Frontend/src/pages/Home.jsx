import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [pastedLink, setPastedLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinViaLink = async () => {
    if (!pastedLink.trim()) {
      setError('Please paste a valid link');
      return;
    }

    // Extract the link code from the pasted URL or use it directly
    let linkCode = pastedLink.trim();
    
    // Handle full URL: http://localhost:5173/join/abc123 -> abc123
    const urlMatch = pastedLink.match(/\/join\/([a-zA-Z0-9\-_]+)/);
    if (urlMatch) {
      linkCode = urlMatch[1];
    }

    setLoading(true);
    setError('');

    try {
      // Redirect to join page with the extracted link
      navigate(`/join/${linkCode}`);
    } catch (err) {
      setError('Invalid link format. Please check and try again.');
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoinViaLink();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer hover:opacity-80 transition">
              Baat Kare
            </h1>
          </Link>
          <div className="space-x-4">
            <Link
              to="/login"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Chat Without Language Barriers
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Connect with anyone, anywhere. Send messages in your language, and
            they'll receive it in theirs. Real-time translation powered by AI.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg"
            >
              Start Chatting
            </Link>
            <a
              href="#how-it-works"
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Quick Join Section */}
        <div className="mt-20 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Already Have a Link? 🔗
            </h3>
            <p className="text-center text-gray-600 mb-6">
              Paste the chat link below and start chatting instantly
            </p>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Paste link here (e.g., http://localhost:5173/join/abc123 or just abc123)"
                  value={pastedLink}
                  onChange={(e) => {
                    setPastedLink(e.target.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleJoinViaLink}
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white font-semibold transition ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Joining...
                  </span>
                ) : (
                  'Join Chat'
                )}
              </button>

              <p className="text-center text-gray-500 text-sm">
                💡 Tip: You can paste the full URL or just the link code
              </p>
            </div>
          </div>
        </div>

        {/* Demo Preview */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="space-y-4">
              {/* User 1 message */}
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-br-none max-w-xs">
                  <p>Hello! How are you?</p>
                  <span className="text-xs text-blue-200">English</span>
                </div>
              </div>
              {/* User 2 sees translated message */}
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-none max-w-xs">
                  <p>नमस्ते! आप कैसे हैं?</p>
                  <span className="text-xs text-gray-500">
                    Auto-translated to Hindi
                  </span>
                </div>
              </div>
              {/* User 2 replies in Hindi */}
              <div className="flex justify-start">
                <div className="bg-purple-600 text-white px-4 py-2 rounded-2xl rounded-bl-none max-w-xs">
                  <p>मैं ठीक हूं, धन्यवाद!</p>
                  <span className="text-xs text-purple-200">Hindi</span>
                </div>
              </div>
              {/* User 1 sees translated */}
              <div className="flex justify-end">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-br-none max-w-xs">
                  <p>I'm fine, thank you!</p>
                  <span className="text-xs text-gray-500">
                    Auto-translated to English
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <section id="how-it-works" className="mt-32">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">1️⃣</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Create & Share</h4>
              <p className="text-gray-600">
                Create a chat room and share the unique link with anyone
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">2️⃣</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Set Language</h4>
              <p className="text-gray-600">
                Each user selects their preferred language during signup
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">3️⃣</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Chat Freely</h4>
              <p className="text-gray-600">
                Messages are auto-translated in real-time for seamless
                communication
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500">
        <p>© 2026 Baat Kare. Breaking language barriers, one chat at a time.</p>
      </footer>
    </div>
  );
};

export default Home;
