import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View, RefreshControl, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotifications } from "@/context/NotificationContext";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsScreen() {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { notifications, isLoading, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return { name: 'bag-handle-outline', color: '#6366F1', bg: 'bg-primary/10', border: 'border-primary/20' };
            case 'message': return { name: 'chatbubble-ellipses-outline', color: '#10B981', bg: 'bg-green-500/10', border: 'border-green-500/20' };
            case 'promotion': return { name: 'receipt-outline', color: '#F59E0B', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
            case 'system': return { name: 'information-circle-outline', color: '#3B82F6', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
            default: return { name: 'notifications-outline', color: '#64748B', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
        }
    };

    const handlePress = (item: any) => {
        if (!item.read) {
            markAsRead(item._id);
        }

        if (item.type === 'message' && item.data?.conversationId) {
            router.push(`/chat/${item.data.conversationId}` as any);
        } else if (item.type === 'order' && item.data?.orderId) {
            // Navigate to order details if route exists
            router.push("/(profile)/orders" as any); // Fallback to orders list
        }
    };

    return (
        <View className="flex-1 bg-background">
            {/* HEADER */}
            <Header primaryText={t('notifications.title')} secondaryText="Recent Activity" />

            {isLoading && notifications.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#1DB954" />
                </View>
            ) : (
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshNotifications} />}
                >
                    {notifications.length === 0 ? (
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
                            {notifications.map((item, index) => {
                                const icon = getIcon(item.type);
                                return (
                                    <AnimatedContainer animation="fadeUp" delay={index * 50} key={item._id}>
                                        <TouchableOpacity
                                            className={`flex-row items-center p-5 rounded-[32px] mb-4 bg-surface/50 border ${item.read ? 'border-black/5 dark:border-white/5' : 'border-primary/20 bg-primary/5'}`}
                                            activeOpacity={0.7}
                                            onPress={() => handlePress(item)}
                                        >
                                            <View className={`${icon.bg} ${icon.border} border rounded-2xl w-14 h-14 items-center justify-center mr-4 shadow-sm`}>
                                                <Ionicons name={icon.name as any} size={24} color={icon.color} />
                                            </View>

                                            <View className="flex-1">
                                                <View className="flex-row justify-between items-start mb-1">
                                                    <Text className={`text-text-primary font-bold text-base flex-1 mr-2 leading-tight ${!item.read ? 'font-extrabold' : ''}`} numberOfLines={1}>
                                                        {item.translationKey ? t(item.translationKey, item.translationParams || {}) : item.title}
                                                    </Text>
                                                    <Text className="text-text-tertiary text-[10px] font-bold uppercase tracking-tighter mt-1">
                                                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                                    </Text>
                                                </View>
                                                <Text className={`text-text-secondary text-sm opacity-80 leading-5 ${!item.read ? 'text-text-primary' : ''}`} numberOfLines={2}>
                                                    {item.translationKey ? t(item.translationKey + '_body', item.translationParams || {}) : item.body}
                                                </Text>
                                            </View>

                                            {!item.read && (
                                                <View className="w-2 h-2 bg-primary rounded-full ml-2" />
                                            )}
                                        </TouchableOpacity>
                                    </AnimatedContainer>
                                );
                            })}

                            <AnimatedContainer animation="fadeUp" delay={notifications.length * 50} className="mt-8 items-center">
                                <TouchableOpacity
                                    className="bg-surface-light px-6 py-3 rounded-full border border-white/10"
                                    onPress={() => markAllAsRead()}
                                >
                                    <Text className="text-text-tertiary font-bold text-xs uppercase tracking-widest">Mark all as read</Text>
                                </TouchableOpacity>
                            </AnimatedContainer>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}
