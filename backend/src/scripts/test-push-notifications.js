// Test push notification service
// Usage: node src/scripts/test-push-notifications.js <userId>

import { User } from "../models/user.model.js";
import { sendPushNotification } from "../services/pushNotification.service.js";
import { connectDB } from "../config/db.js";

const testPushNotification = async (userId) => {
    try {
        await connectDB();

        const user = await User.findById(userId);
        if (!user) {
            console.error("User not found");
            process.exit(1);
        }

        if (!user.expoPushToken) {
            console.error("User does not have a push token saved");
            process.exit(1);
        }

        console.log(`Sending test notification to user: ${user.name}`);
        console.log(`Push token: ${user.expoPushToken}`);

        const success = await sendPushNotification(
            user.expoPushToken,
            "Test Notification",
            "This is a test push notification from your e-commerce app!",
            { type: "test" },
            "default"
        );

        if (success) {
            console.log("✅ Test notification sent successfully!");
        } else {
            console.error("❌ Failed to send test notification");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error sending test notification:", error);
        process.exit(1);
    }
};

const userId = process.argv[2];

if (!userId) {
    console.error("Please provide a user ID as an argument");
    console.error("Usage: node src/scripts/test-push-notifications.js <userId>");
    process.exit(1);
}

testPushNotification(userId);
