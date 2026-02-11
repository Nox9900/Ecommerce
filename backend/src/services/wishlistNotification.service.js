import { sendPushNotification, sendBatchPushNotifications } from "../services/pushNotification.service.js";

/**
 * Helper function to send wishlist price drop notifications
 * @param {string} productId - Product ID
 * @param {number} oldPrice - Old price
 * @param {number} newPrice - New price
 * @param {string} productName - Product name
 */
export async function notifyWishlistPriceDrop(productId, oldPrice, newPrice, productName) {
    try {
        const { User } = await import("../models/user.model.js");
        const { Notification } = await import("../models/notification.model.js");

        // Find all users who have this product in their wishlist
        const users = await User.find({ wishlist: productId });

        if (users.length === 0) {
            console.log("No users have this product in their wishlist");
            return;
        }

        const discount = oldPrice - newPrice;
        const discountPercent = Math.round((discount / oldPrice) * 100);

        // Prepare batch notifications
        const notifications = users
            .filter(user => user.expoPushToken)
            .map(user => ({
                expoPushToken: user.expoPushToken,
                title: "Price Drop Alert! 💰",
                body: `${productName} is now $${newPrice.toFixed(2)} (${discountPercent}% off!)`,
                data: { productId: productId.toString(), type: "wishlist" },
                channelId: "wishlist",
            }));

        // Create in-app notifications
        const inAppNotifications = users.map(user => ({
            recipient: user._id,
            type: "wishlist",
            title: "Price Drop Alert! 💰",
            body: `${productName} is now $${newPrice.toFixed(2)} (${discountPercent}% off!)`,
            data: { productId },
        }));

        await Notification.insertMany(inAppNotifications);

        // Send push notifications in batch
        if (notifications.length > 0) {
            await sendBatchPushNotifications(notifications);
            console.log(`Sent ${notifications.length} price drop notifications for product ${productName}`);
        }

        // Note: Socket notifications could be added here if needed
        // for (const user of users) {
        //     const io = req.app.get("io");
        //     if (io) {
        //         io.to(user._id.toString()).emit("notification:new", notification);
        //     }
        // }
    } catch (error) {
        console.error("Error sending wishlist price drop notifications:", error);
    }
}
