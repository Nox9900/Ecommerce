import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View, I18nManager } from "react-native";
import { useTranslation } from "react-i18next";

interface NotificationItem {
    id: string;
    type: 'order' | 'message' | 'promotion';
    title: string;
    body: string;
    time: string;
    read: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
    {
        id: '1',
        type: 'order',
        title: 'Order Delivered',
        body: 'Your order #12345 has been successfully delivered.',
        time: '2h ago',
        read: false,
    },
    {
        id: '2',
        type: 'message',
        title: 'New Message',
        body: 'Vendor "TechStore" sent you a message about your inquiry.',
        time: '5h ago',
        read: true,
    },
    {
        id: '3',
        type: 'promotion',
        title: 'Flash Sale Alert!',
        body: 'Get up to 50% off on electronics this weekend.',
        time: '1d ago',
        read: true,
    },
];

export default function NotificationsScreen() {
    const { t } = useTranslation();

    const getIcon = (type: NotificationItem['type']) => {
        switch (type) {
            case 'order': return { name: 'bag-handle-outline', color: '#6366F1', bg: 'bg-primary/20' };
            case 'message': return { name: 'chatbubble-ellipses-outline', color: '#10B981', bg: 'bg-green-500/20' };
            case 'promotion': return { name: 'receipt-outline', color: '#F59E0B', bg: 'bg-yellow-500/20' };
            default: return { name: 'notifications-outline', color: '#64748B', bg: 'bg-gray-500/20' };
        }
    };

    return (
        <SafeScreen>
            <View className="flex-1 bg-background">
                {/* HEADER */}
                <View className="px-6 pb-5 border-b border-surface flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name={I18nManager.isRTL ? "arrow-forward" : "arrow-back"} size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-text-primary text-2xl font-bold">{t('notifications.title')}</Text>
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                >
                    {MOCK_NOTIFICATIONS.length === 0 ? (
                        <View className="flex-1 items-center justify-center py-20">
                            <View className="w-20 h-20 rounded-full bg-surface-light items-center justify-center mb-4">
                                <Ionicons name="notifications-off-outline" size={32} color="#94A3B8" />
                            </View>
                            <Text className="text-text-primary font-bold text-lg mb-2">{t('notifications.empty')}</Text>
                        </View>
                    ) : (
                        MOCK_NOTIFICATIONS.map((item) => {
                            const icon = getIcon(item.type);
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    className={`flex-row items-center p-4 rounded-2xl mb-4 bg-surface border-2 ${item.read ? 'border-transparent' : 'border-primary/10'}`}
                                    activeOpacity={0.7}
                                >
                                    <View className={`${icon.bg} rounded-full w-12 h-12 items-center justify-center mr-4`}>
                                        <Ionicons name={icon.name as any} size={24} color={icon.color} />
                                    </View>

                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-start mb-1">
                                            <Text className="text-text-primary font-bold text-base flex-1 mr-2">{item.title}</Text>
                                            <Text className="text-text-tertiary text-xs">{item.time}</Text>
                                        </View>
                                        <Text className="text-text-secondary text-sm" numberOfLines={2}>{item.body}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </ScrollView>
            </View>
        </SafeScreen>
    );
}
