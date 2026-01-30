import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { Vendor } from "../models/vendor.model.js";
import cloudinary from "../config/cloudinary.js";

export const getConversations = async (req, res) => {
    try {
        const user = req.user;

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
        const user = req.user;
        let participant = await User.findById(participantId);

        if (!participant) {
            const vendor = await Vendor.findById(participantId);
            if (vendor) {
                participant = await User.findById(vendor.owner);
            }
        }

        if (!participant) {
            return res.status(404).json({ message: "Participant not found" });
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
        const user = req.user;

        let attachments = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file) => {
                // Determine resource type based on mimetype
                let resourceType = "auto";
                if (file.mimetype.startsWith("audio/")) resourceType = "video"; // Cloudinary treats audio as video often, or allow auto

                return cloudinary.uploader.upload(file.path, {
                    folder: "chat_attachments",
                    resource_type: resourceType,
                });
            });

            const uploadResults = await Promise.all(uploadPromises);

            attachments = uploadResults.map((result, index) => {
                const mimetype = req.files[index].mimetype;
                let type = "file";
                if (mimetype.startsWith("image/")) type = "image";
                else if (mimetype.startsWith("audio/")) type = "audio";

                return {
                    type,
                    url: result.secure_url,
                    name: req.files[index].originalname,
                };
            });
        }

        const newMessage = new Message({
            conversationId,
            sender: user._id,
            content,
            attachments,
        });

        await newMessage.save();

        let lastMessageContent = content;
        if (!content && attachments.length > 0) {
            const counts = { image: 0, audio: 0, file: 0 };
            attachments.forEach(a => counts[a.type]++);
            if (counts.audio) lastMessageContent = "🎤 Voice message";
            else if (counts.image) lastMessageContent = "📷 Image";
            else lastMessageContent = "📎 Attachment";
        }

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: lastMessageContent,
            lastMessageAt: new Date(),
        });

        const message = await Message.findById(newMessage._id).populate(
            "sender",
            "name email avatar clerkId"
        );

        const io = req.app.get("io");
        if (io) {
            io.to(conversationId).emit("newMessage", message);

            // Send notification to other participants
            // Find other participant
            const otherParticipants = await Conversation.findById(conversationId).select('participants');
            if (otherParticipants) {
                const recipients = otherParticipants.participants.filter(p => p.toString() !== user._id.toString());
                const Notification = (await import("../models/notification.model.js")).Notification;

                for (const recipientId of recipients) {
                    try {
                        const notification = await Notification.create({
                            recipient: recipientId,
                            type: "message",
                            title: `New message from ${user.name}`,
                            body: content || "Sent an attachment",
                            data: { conversationId: conversationId }
                        });
                        io.to(recipientId.toString()).emit("notification:new", notification);
                    } catch (err) {
                        console.error("Failed to notifiy recipient", err);
                    }
                }
            }
        }

        res.status(201).json(message);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Failed to send message" });
    }
};
