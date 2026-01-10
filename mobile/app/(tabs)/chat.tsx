import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

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
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConversations = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_API_URL}/api/chats`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setConversations(response.data);
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const getOtherParticipant = (participants: Conversation["participants"]) => {
        return participants.find((p) => p.clerkId !== userId) || participants[0];
    };

    return (
        <SafeScreen>
            <View className="flex-1 bg-background">
                {/* Header */}
                <View className="px-6 pt-4 pb-6">
                    <Text className="text-2xl font-bold text-text-primary">Messages</Text>
                    <Text className="text-text-secondary text-sm mt-1">
                        {loading ? "..." : conversations.length} conversations
                    </Text>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator color="#6366F1" size="large" />
                    </View>
                ) : (
                    <ScrollView
                        className="flex-1 px-6"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    >
                        {conversations.length === 0 ? (
                            <View className="items-center justify-center py-20">
                                <View className="w-20 h-20 rounded-full bg-surface-light items-center justify-center mb-4">
                                    <Ionicons name="chatbubbles-outline" size={32} color="#94A3B8" />
                                </View>
                                <Text className="text-text-primary font-bold text-lg mb-2">No messages yet</Text>
                                <Text className="text-text-secondary text-center text-sm">
                                    Start a conversation with a seller from a product page
                                </Text>
                            </View>
                        ) : (
                            conversations.map((chat) => {
                                const other = getOtherParticipant(chat.participants);
                                return (
                                    <TouchableOpacity
                                        key={chat._id}
                                        className="flex-row items-center bg-surface-light p-4 rounded-2xl mb-3 border border-white/5 active:bg-surface"
                                        onPress={() => router.push(`/chat/${chat._id}` as any)}
                                        activeOpacity={0.7}
                                    >
                                        <View className="w-14 h-14 rounded-full mr-4 bg-surface items-center justify-center">
                                            {other?.imageUrl ? (
                                                <Image
                                                    source={{ uri: other.imageUrl }}
                                                    className="w-14 h-14 rounded-full"
                                                />
                                            ) : (
                                                <Ionicons name="person" size={24} color="#94A3B8" />
                                            )}
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row items-center justify-between mb-1">
                                                <Text className="text-text-primary font-bold text-base">
                                                    {other?.name || "Unknown"}
                                                </Text>
                                                <Text className="text-text-tertiary text-xs">
                                                    {chat.lastMessageAt ? formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true }) : ""}
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center justify-between">
                                                <Text
                                                    className="text-text-secondary text-sm flex-1"
                                                    numberOfLines={1}
                                                >
                                                    {chat.lastMessage || "No messages yet"}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </ScrollView>
                )}
            </View>
        </SafeScreen>
    );
}
