import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PREFERENCES_KEY = 'notification_preferences';

export interface NotificationPreferences {
    pushEnabled: boolean;
    emailEnabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
    pushEnabled: true,
    emailEnabled: true,
};

/**
 * Get notification preferences from storage
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
        const stored = await AsyncStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        return DEFAULT_PREFERENCES;
    } catch (error) {
        console.error('Error getting notification preferences:', error);
        return DEFAULT_PREFERENCES;
    }
}

/**
 * Save notification preferences to storage
 */
export async function saveNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    try {
        await AsyncStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
        console.error('Error saving notification preferences:', error);
        throw error;
    }
}

/**
 * Update push notification preference
 */
export async function setPushNotificationEnabled(enabled: boolean): Promise<void> {
    const prefs = await getNotificationPreferences();
    prefs.pushEnabled = enabled;
    await saveNotificationPreferences(prefs);
}

/**
 * Update email notification preference
 */
export async function setEmailNotificationEnabled(enabled: boolean): Promise<void> {
    const prefs = await getNotificationPreferences();
    prefs.emailEnabled = enabled;
    await saveNotificationPreferences(prefs);
}

/**
 * Check if push notifications are enabled
 */
export async function isPushNotificationEnabled(): Promise<boolean> {
    const prefs = await getNotificationPreferences();
    return prefs.pushEnabled;
}

/**
 * Check if email notifications are enabled
 */
export async function isEmailNotificationEnabled(): Promise<boolean> {
    const prefs = await getNotificationPreferences();
    return prefs.emailEnabled;
}
