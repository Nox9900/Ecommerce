import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useApi } from "@/lib/api";
import { useEffect, useState, useCallback, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { GlassView } from "@/components/ui/GlassView";
import { useTheme } from "@/lib/useTheme";
import { useTranslation } from "react-i18next";
import { AppText } from "@/components/ui/AppText";

interface Conversation {
    _id: string;
    participants: {
        _id: string;
        name: string;
        imageUrl?: string;
        clerkId?: string;
    }[];
    lastMessage: string;
    lastMessageAt: string;
}

export default function ChatScreen() {
    const { getToken, userId } = useAuth();
    const { theme } = useTheme();
    const api = useApi();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    const isFetchingRef = useRef(false);

    const fetchConversations = useCallback(async () => {
        // Prevent duplicate requests
        if (isFetchingRef.current) {
            return;
        }

        isFetchingRef.current = true;
        try {
            const response = await api.get("/chats");
            setConversations(response.data);
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [api]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const getOtherParticipant = (participants: Conversation["participants"]) => {
        return participants.find((p) => p.clerkId !== userId) || participants[0];
    };

    return (
        <SafeScreen>
            <View className="flex-1 bg-background">
                {/* Header */}
                <GlassView intensity={theme === 'dark' ? 20 : 40} className="px-6 pt-4 pb-6 border-b border-white/5">
                    <AnimatedContainer animation="fadeDown">
                        <AppText className="text-3xl font-bold text-text-primary tracking-tight">{t('chat.title')}</AppText>
                        <AppText className="text-text-secondary text-sm font-medium mt-1">
                            {loading ? "..." : t('chat.conversations', { count: conversations.length })}
                        </AppText>
                    </AnimatedContainer>
                </GlassView>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator color={theme === 'dark' ? "#fff" : "#000"} size="large" />
                    </View>
                ) : (
                    <ScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
                    >
                        {conversations.length === 0 ? (
                            <AnimatedContainer animation="fade" className="items-center justify-center py-20 px-10">
                                <View className="w-24 h-24 rounded-full bg-surface-light items-center justify-center mb-6 shadow-sm border border-white/5">
                                    <Ionicons name="chatbubbles-outline" size={40} color={theme === 'dark' ? "#94A3B8" : "#6366F1"} />
                                </View>
                                <AppText className="text-text-primary font-bold text-xl mb-2 text-center">{t('chat.empty_title')}</AppText>
                                <AppText className="text-text-secondary text-center text-base leading-snug">
                                    {t('chat.empty_desc')}
                                </AppText>
                            </AnimatedContainer>
                        ) : (
                            <View className="px-6">
                                {conversations.map((chat, index) => {
                                    const other = getOtherParticipant(chat.participants);
                                    return (
                                        <AnimatedContainer key={chat._id} animation="fadeUp" delay={index * 100}>
                                            <TouchableOpacity
                                                className="flex-row items-center bg-surface p-4 rounded-3xl mb-4 border border-white/5 shadow-sm active:bg-surface-light"
                                                onPress={() => router.push(`/chat/${chat._id}` as any)}
                                                activeOpacity={0.7}
                                            >
                                                <View className="relative">
                                                    <View className="w-16 h-16 rounded-full mr-4 bg-background border border-white/5 overflow-hidden shadow-sm">
                                                        <Image
                                                            source={other?.imageUrl ? { uri: other.imageUrl } : require("@/assets/images/default-avatar.png")}
                                                            className="w-full h-full"
                                                        />
                                                    </View>
                                                    <View className="absolute bottom-0 right-4 w-4 h-4 bg-green-500 rounded-full border-2 border-surface" />
                                                </View>
                                                <View className="flex-1">
                                                    <View className="flex-row items-center justify-between mb-1">
                                                        <AppText className="text-text-primary font-bold text-lg" numberOfLines={1}>
                                                            {other?.name || t('chat.unknown_user')}
                                                        </AppText>
                                                        <AppText className="text-text-tertiary text-xs">
                                                            {chat.lastMessageAt ? formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true }) : ""}
                                                        </AppText>
                                                    </View>
                                                    <View className="flex-row items-center justify-between">
                                                        <AppText
                                                            className={`text-sm flex-1 ${chat.lastMessage ? 'text-text-secondary' : 'text-text-tertiary italic'}`}
                                                            numberOfLines={1}
                                                        >
                                                            {chat.lastMessage || t('chat.empty_title')}
                                                        </AppText>
                                                        <Ionicons name="chevron-forward" size={16} color="#94A3B8" style={{ marginLeft: 8 }} />
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        </AnimatedContainer>
                                    );
                                })}
                            </View>
                        )}
                    </ScrollView>
                )}
            </View>
        </SafeScreen>
    );
}
