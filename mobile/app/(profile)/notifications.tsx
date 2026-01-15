import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View, I18nManager } from "react-native";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    const insets = useSafeAreaInsets();

    const getIcon = (type: NotificationItem['type']) => {
        switch (type) {
            case 'order': return { name: 'bag-handle-outline', color: '#6366F1', bg: 'bg-primary/10', border: 'border-primary/20' };
            case 'message': return { name: 'chatbubble-ellipses-outline', color: '#10B981', bg: 'bg-green-500/10', border: 'border-green-500/20' };
            case 'promotion': return { name: 'receipt-outline', color: '#F59E0B', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
            default: return { name: 'notifications-outline', color: '#64748B', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
        }
    };

    return (
        <View className="flex-1 bg-background">
            {/* HEADER */}
            <Header primaryText={t('notifications.title')} secondaryText="Recent Activity" />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {MOCK_NOTIFICATIONS.length === 0 ? (
                    <AnimatedContainer animation="fadeUp" className="flex-1 items-center justify-center py-40 px-10">
                        <View className="w-24 h-24 rounded-full bg-surface-light items-center justify-center mb-6 border border-black/5 dark:border-white/5">
                            <Ionicons name="notifications-off-outline" size={48} color="#475569" />
                        </View>
                        <Text className="text-text-primary font-bold text-xl mb-2 text-center">{t('notifications.empty')}</Text>
                        <Text className="text-text-secondary text-center text-base opacity-70">
                            You're all caught up! No new notifications at the moment.
                        </Text>
                    </AnimatedContainer>
                ) : (
                    <View className="px-6 py-6">
                        {MOCK_NOTIFICATIONS.map((item, index) => {
                            const icon = getIcon(item.type);
                            return (
                                <AnimatedContainer animation="fadeUp" delay={index * 100} key={item.id}>
                                    <TouchableOpacity
                                        className={`flex-row items-center p-5 rounded-[32px] mb-4 bg-surface/50 border ${item.read ? 'border-black/5 dark:border-white/5' : 'border-primary/20 bg-primary/5'}`}
                                        activeOpacity={0.7}
                                    >
                                        <View className={`${icon.bg} ${icon.border} border rounded-2xl w-14 h-14 items-center justify-center mr-4 shadow-sm`}>
                                            <Ionicons name={icon.name as any} size={24} color={icon.color} />
                                        </View>

                                        <View className="flex-1">
                                            <View className="flex-row justify-between items-start mb-1">
                                                <Text className="text-text-primary font-bold text-base flex-1 mr-2 leading-tight" numberOfLines={1}>
                                                    {item.title}
                                                </Text>
                                                <Text className="text-text-tertiary text-[10px] font-bold uppercase tracking-tighter mt-1">{item.time}</Text>
                                            </View>
                                            <Text className="text-text-secondary text-sm opacity-80 leading-5" numberOfLines={2}>
                                                {item.body}
                                            </Text>
                                        </View>

                                        {!item.read && (
                                            <View className="w-2 h-2 bg-primary rounded-full ml-2" />
                                        )}
                                    </TouchableOpacity>
                                </AnimatedContainer>
                            );
                        })}

                        <AnimatedContainer animation="fadeUp" delay={MOCK_NOTIFICATIONS.length * 100} className="mt-8 items-center">
                            <TouchableOpacity className="bg-surface-light px-6 py-3 rounded-full border border-white/10">
                                <Text className="text-text-tertiary font-bold text-xs uppercase tracking-widest">Mark all as read</Text>
                            </TouchableOpacity>
                        </AnimatedContainer>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
