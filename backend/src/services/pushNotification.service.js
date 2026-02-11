import { Expo } from 'expo-server-sdk';

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Send a push notification to a single device
 * @param {string} expoPushToken - The Expo push token for the device
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data to send with the notification
 * @param {string} channelId - Android notification channel ID
 * @returns {Promise<boolean>} - Returns true if notification was sent successfully
 */
export async function sendPushNotification(expoPushToken, title, body, data = {}, channelId = 'default') {
    // Check if the push token is valid
    if (!expoPushToken || !Expo.isExpoPushToken(expoPushToken)) {
        console.error('Invalid Expo push token:', expoPushToken);
        return false;
    }

    // Construct the message
    const message = {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data,
        channelId,
        priority: 'high',
    };

    try {
        const ticketChunk = await expo.sendPushNotificationsAsync([message]);
        console.log('Push notification sent:', ticketChunk);

        // Check for errors in the ticket
        if (ticketChunk[0]?.status === 'error') {
            console.error('Error sending push notification:', ticketChunk[0].message);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error sending push notification:', error);
        return false;
    }
}

/**
 * Send push notifications to multiple devices
 * @param {Array} notifications - Array of notification objects with { expoPushToken, title, body, data, channelId }
 * @returns {Promise<Array>} - Returns array of results
 */
export async function sendBatchPushNotifications(notifications) {
    // Filter out invalid tokens and construct messages
    const messages = notifications
        .filter(n => n.expoPushToken && Expo.isExpoPushToken(n.expoPushToken))
        .map(n => ({
            to: n.expoPushToken,
            sound: 'default',
            title: n.title,
            body: n.body,
            data: n.data || {},
            channelId: n.channelId || 'default',
            priority: 'high',
        }));

    if (messages.length === 0) {
        console.log('No valid push tokens to send notifications to');
        return [];
    }

    try {
        // Expo allows sending up to 100 notifications at once
        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];

        for (const chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error('Error sending chunk of push notifications:', error);
            }
        }

        console.log(`Sent ${tickets.length} push notifications`);
        return tickets;
    } catch (error) {
        console.error('Error sending batch push notifications:', error);
        return [];
    }
}

/**
 * Helper function to send order status notification
 * @param {object} user - User object with expoPushToken
 * @param {string} orderId - Order ID
 * @param {string} status - Order status
 */
export async function sendOrderStatusNotification(user, orderId, status) {
    if (!user.expoPushToken) return false;

    const orderShortId = orderId.toString().slice(-6);
    const messages = {
        pending: {
            title: 'Order Placed',
            body: `Your order #${orderShortId} has been placed successfully!`,
            channelId: 'orders',
        },
        processing: {
            title: 'Order Processing',
            body: `Your order #${orderShortId} is being processed.`,
            channelId: 'orders',
        },
        shipped: {
            title: 'Order Shipped',
            body: `Great news! Your order #${orderShortId} has been shipped!`,
            channelId: 'delivery',
        },
        delivered: {
            title: 'Order Delivered',
            body: `Your order #${orderShortId} has been delivered. Enjoy!`,
            channelId: 'delivery',
        },
        cancelled: {
            title: 'Order Cancelled',
            body: `Your order #${orderShortId} has been cancelled.`,
            channelId: 'orders',
        },
        refunded: {
            title: 'Order Refunded',
            body: `Your order #${orderShortId} has been refunded.`,
            channelId: 'orders',
        },
    };

    const message = messages[status] || {
        title: 'Order Update',
        body: `Your order #${orderShortId} status has been updated.`,
        channelId: 'orders',
    };

    return await sendPushNotification(
        user.expoPushToken,
        message.title,
        message.body,
        { orderId: orderId.toString(), type: 'order' },
        message.channelId
    );
}

/**
 * Helper function to send delivery tracking notification
 * @param {object} user - User object with expoPushToken
 * @param {string} orderId - Order ID
 * @param {string} trackingNumber - Tracking number
 * @param {string} carrier - Carrier name
 */
export async function sendTrackingNotification(user, orderId, trackingNumber, carrier) {
    if (!user.expoPushToken) return false;

    const orderShortId = orderId.toString().slice(-6);
    return await sendPushNotification(
        user.expoPushToken,
        'Tracking Available',
        `Your order #${orderShortId} can now be tracked. Carrier: ${carrier}`,
        { orderId: orderId.toString(), trackingNumber, type: 'delivery' },
        'delivery'
    );
}

/**
 * Helper function to send new message notification
 * @param {object} user - User object with expoPushToken
 * @param {string} senderName - Name of the message sender
 * @param {string} messagePreview - Preview of the message
 * @param {string} conversationId - Conversation ID
 */
export async function sendMessageNotification(user, senderName, messagePreview, conversationId) {
    if (!user.expoPushToken) return false;

    return await sendPushNotification(
        user.expoPushToken,
        `New message from ${senderName}`,
        messagePreview || 'Sent an attachment',
        { conversationId: conversationId.toString(), type: 'message' },
        'default'
    );
}
