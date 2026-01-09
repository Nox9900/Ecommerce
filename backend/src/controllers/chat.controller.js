import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

export const getConversations = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const conversations = await Conversation.find({
            participants: user._id,
        })
            .populate("participants", "name email avatar role clerkId")
            .sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ message: "Failed to fetch conversations" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .populate("sender", "name email avatar clerkId")
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

export const startConversation = async (req, res) => {
    try {
        const { participantId } = req.body;
        const userId = req.auth.userId;
        const user = await User.findOne({ clerkId: userId });
        const participant = await User.findById(participantId);

        if (!user || !participant) {
            return res.status(404).json({ message: "User or participant not found" });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [user._id, participant._id] },
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [user._id, participant._id],
            });
            await conversation.save();
        }

        await conversation.populate("participants", "name email avatar role clerkId");

        res.status(200).json(conversation);
    } catch (error) {
        console.error("Error starting conversation:", error);
        res.status(500).json({ message: "Failed to start conversation" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;
        const userId = req.auth.userId;
        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newMessage = new Message({
            conversationId,
            sender: user._id,
            content,
        });

        await newMessage.save();

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: content,
            lastMessageAt: new Date(),
        });

        const message = await Message.findById(newMessage._id).populate(
            "sender",
            "name email avatar clerkId"
        );

        const io = req.app.get("io");
        if (io) {
            io.to(conversationId).emit("newMessage", message);
        }

        res.status(201).json(message);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Failed to send message" });
    }
};
