import Chat from '../models/Chat.js';
import generateUniqueLink from '../utils/generateLink.js';

// @desc    Create a new chat room
// @route   POST /api/chat/create
// @access  Private
export const createChat = async (req, res) => {
  try {
    const uniqueLink = generateUniqueLink();

    const chat = await Chat.create({
      uniqueLink,
      createdBy: req.user._id,
      participants: [req.user._id],
    });

    res.status(201).json({
      _id: chat._id,
      uniqueLink: chat.uniqueLink,
      shareableLink: `${process.env.CLIENT_URL}/join/${chat.uniqueLink}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a chat room via link
// @route   POST /api/chat/join/:link
// @access  Private
export const joinChat = async (req, res) => {
  try {
    const { link } = req.params;

    const chat = await Chat.findOne({ uniqueLink: link }).populate(
      'participants',
      'name email preferredLanguage'
    );

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.isActive) {
      return res.status(400).json({ message: 'This chat is no longer active' });
    }

    // Check if user is already a participant
    const isParticipant = chat.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      chat.participants.push(req.user._id);
      await chat.save();
    }

    // Fetch updated chat with all participants
    const updatedChat = await Chat.findById(chat._id).populate(
      'participants',
      'name email preferredLanguage'
    );

    res.json(updatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get chat details
// @route   GET /api/chat/:chatId
// @access  Private
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate(
      'participants',
      'name email preferredLanguage'
    );

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all chats for current user
// @route   GET /api/chat
// @access  Private
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
      isActive: true,
    })
      .populate('participants', 'name email preferredLanguage')
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
