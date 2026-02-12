import { Notification } from "../models/notification.model.js";
import AppError from "../lib/AppError.js";
import { catchAsync } from "../lib/catchAsync.js";
import { parsePaginationParams } from "../utils/queryOptimization.js";

export const getNotifications = catchAsync(async (req, res, next) => {
    const { page, limit, skip } = parsePaginationParams({ ...req.query, limit: req.query.limit || 50 });

    const [notifications, totalCount] = await Promise.all([
        Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Notification.countDocuments({ recipient: req.user._id }),
    ]);

    res.json({
        notifications,
        total: totalCount,
        page: parseInt(page),
        pages: Math.ceil(totalCount / limit),
    });
});

export const getUnreadCount = catchAsync(async (req, res, next) => {
    const count = await Notification.countDocuments({
        recipient: req.user._id,
        read: false,
    });
    res.json({ count });
});

export const markAsRead = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate({ _id: id, recipient: req.user._id }, { read: true }, { new: true });
    if (!notification) {
        return next(new AppError("Notification not found", 404));
    }
    res.json(notification);
});

export const markAllAsRead = catchAsync(async (req, res, next) => {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
});

// Admin/Vendor sending notification
export const sendNotification = catchAsync(async (req, res, next) => {
    const { recipientId, title, body, type, data, translationKey, translationParams } = req.body;

    // Only allow admin or vendor to send specific types if needed,
    // for now we trust the protected route role check if we add one.

    if (!recipientId || (!title && !translationKey)) {
        return next(new AppError("Missing required fields", 400));
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
});
