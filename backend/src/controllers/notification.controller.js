import { Notification } from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications
        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            read: false,
        });
        res.json({ count });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ message: "Failed to fetch unread count" });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: req.user._id },
            { read: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        res.json(notification);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Failed to mark notification as read" });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { read: true }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all as read:", error);
        res.status(500).json({ message: "Failed to mark all as read" });
    }
};

// Admin/Vendor sending notification
export const sendNotification = async (req, res) => {
    try {
        const { recipientId, title, body, type, data, translationKey, translationParams } = req.body;

        // Only allow admin or vendor to send specific types if needed, 
        // for now we trust the protected route role check if we add one.

        if (!recipientId || (!title && !translationKey)) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const notification = await Notification.create({
            recipient: recipientId,
            type: type || "system",
            title: title || "New Notification", // Fallback
            body: body || "",
            data,
            translationKey,
            translationParams,
        });

        const io = req.app.get("io");
        if (io) {
            io.to(recipientId).emit("notification:new", notification);
        }

        res.status(201).json(notification);
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ message: "Failed to send notification" });
    }
};
