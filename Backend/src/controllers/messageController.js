import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import { translateText } from '../services/translateService.js';

// @desc    Get messages for a chat
// @route   GET /api/messages/:chatId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Verify user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ chatId })
      .populate('sender', 'name preferredLanguage')
      .sort({ createdAt: 1 });

    // Return messages with translation for user's preferred language
    const userLanguage = req.user.preferredLanguage;
    const formattedMessages = messages.map((msg) => ({
      _id: msg._id,
      sender: msg.sender,
      originalText: msg.originalText,
      translatedText: msg.translations.get(userLanguage) || msg.originalText,
      originalLanguage: msg.originalLanguage,
      createdAt: msg.createdAt,
    }));

    res.json(formattedMessages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;

    // Verify user is participant
    const chat = await Chat.findById(chatId).populate('participants');
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isParticipant = chat.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get sender's language
    const senderLanguage = req.user.preferredLanguage || 'en';

    // Initialize translations with sender's original text
    const translations = new Map();
    translations.set(senderLanguage, text);

    // Get unique languages from all participants
    const participantLanguages = [
      ...new Set(chat.participants.map((p) => p.preferredLanguage || 'en')),
    ];

    // Translate for each participant's language (except sender's)
    for (const lang of participantLanguages) {
      if (lang !== senderLanguage) {
        const { translatedText } = await translateText(text, lang, senderLanguage);
        translations.set(lang, translatedText);
      }
    }

    // Create message
    const message = await Message.create({
      chatId,
      sender: req.user._id,
      originalText: text,
      originalLanguage: senderLanguage,
      translations,
    });

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name preferredLanguage'
    );

    const responseData = {
      _id: populatedMessage._id,
      sender: populatedMessage.sender,
      originalText: populatedMessage.originalText,
      translations: Object.fromEntries(populatedMessage.translations),
      originalLanguage: populatedMessage.originalLanguage,
      createdAt: populatedMessage.createdAt,
    };

    res.status(201).json(responseData);
  } catch (error) {
    console.error('SendMessage error:', error);
    res.status(500).json({ message: error.message });
  }
};
