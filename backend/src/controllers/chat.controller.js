import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { Vendor } from "../models/vendor.model.js";
import cloudinary from "../config/cloudinary.js";
import { catchAsync } from "../lib/catchAsync.js";
import AppError from "../lib/AppError.js";
import {
    parsePaginationParams,
    selectFields,
} from "../utils/queryOptimization.js";

export const getConversations = catchAsync(async (req, res, next) => {
    const user = req.user;
    const { page, limit, skip } = parsePaginationParams({ ...req.query, limit: req.query.limit || 50 });

    const [conversations, totalCount] = await Promise.all([
        Conversation.find({
            participants: user._id,
        })
            .populate(selectFields("participants", "name email avatar role clerkId _id"))
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Conversation.countDocuments({ participants: user._id }),
    ]);

    res.status(200).json({
        conversations,
        total: totalCount,
        page: parseInt(page),
        pages: Math.ceil(totalCount / limit),
    });
});

export const getMessages = catchAsync(async (req, res, next) => {
    const { conversationId } = req.params;
    const { page, limit, skip } = parsePaginationParams({ ...req.query, limit: req.query.limit || 50 });

    const [messages, totalCount] = await Promise.all([
        Message.find({ conversationId })
            .populate(selectFields("sender", "name email avatar clerkId _id"))
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Message.countDocuments({ conversationId }),
    ]);

    res.status(200).json({
        messages,
        total: totalCount,
        page: parseInt(page),
        pages: Math.ceil(totalCount / limit),
    });
});

export const getUnreadCount = catchAsync(async (req, res, next) => {
    const user = req.user;

    // Get all conversations for the user
    const conversations = await Conversation.find({
        participants: user._id,
    }).select('_id').lean();

    const conversationIds = conversations.map(c => c._id);

    // Count messages in these conversations where user is NOT in readBy
    const unreadCount = await Message.countDocuments({
        conversationId: { $in: conversationIds },
        sender: { $ne: user._id }, // Don't count user's own messages
        readBy: { $ne: user._id }, // User is not in readBy array
    });

    res.status(200).json({
        count: unreadCount,
    });
});

export const startConversation = catchAsync(async (req, res, next) => {
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
        return next(new AppError("Participant not found", 404));
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
});

export const sendMessage = catchAsync(async (req, res, next) => {
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
        attachments.forEach((a) => counts[a.type]++);
        if (counts.audio) lastMessageContent = "🎤 Voice message";
        else if (counts.image) lastMessageContent = "📷 Image";
        else lastMessageContent = "📎 Attachment";
    }

    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: lastMessageContent,
        lastMessageAt: new Date(),
    });

    const message = await Message.findById(newMessage._id).populate("sender", "name email avatar clerkId");

    const io = req.app.get("io");
    if (io) {
        io.to(conversationId).emit("newMessage", message);

        // Send notification to other participants
        // Find other participant
        const otherParticipants = await Conversation.findById(conversationId).select("participants");
        if (otherParticipants) {
            const recipients = otherParticipants.participants.filter((p) => p.toString() !== user._id.toString());
            const Notification = (await import("../models/notification.model.js")).Notification;
            const { sendMessageNotification } = await import("../services/pushNotification.service.js");

            for (const recipientId of recipients) {
                try {
                    const recipientUser = await User.findById(recipientId);

                    // Create in-app notification
                    const notification = await Notification.create({
                        recipient: recipientId,
                        type: "message",
                        title: `New message from ${user.name}`,
                        body: content || "Sent an attachment",
                        data: { conversationId: conversationId },
                    });

                    io.to(recipientId.toString()).emit("notification:new", notification);

                    // Send push notification
                    if (recipientUser) {
                        await sendMessageNotification(
                            recipientUser,
                            user.name,
                            content || "Sent an attachment",
                            conversationId
                        );
                    }
                } catch (err) {
                    console.error("Failed to notify recipient", err);
                }
            }
        }
    }

    res.status(201).json(message);
});
