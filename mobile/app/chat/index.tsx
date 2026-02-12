import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { useApi } from "@/lib/api";
import { useRouter, useFocusEffect } from "expo-router";
import { format } from "date-fns";
import { useTheme } from "@/lib/useTheme";

interface Conversation {
    _id: string;
    participants: {
        _id: string;
        name: string;
        avatar?: string;
    }[];
    lastMessage: string;
    lastMessageAt: string;
}

export default function ChatListScreen() {
    const { getToken, userId } = useAuth();
    const api = useApi();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { theme } = useTheme();
    const isFetchingRef = useRef(false);

    const fetchConversations = useCallback(async () => {
        // Prevent duplicate requests
        if (isFetchingRef.current) {
            return;
        }

        isFetchingRef.current = true;
        try {
            const response = await api.get("/chats");
            setConversations(response.data.conversations || []);
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [api]);

    // Fetch on mount
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // Refetch when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchConversations();
        }, [fetchConversations])
    );

    const getOtherParticipant = (participants: Conversation["participants"]) => {
        return participants.find((p) => true) || participants[0]; // Temporary fallback
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white dark:bg-black">
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <View className="flex-1 p-4 bg-white dark:bg-black">
            <Text className="text-2xl font-bold mb-4 text-black dark:text-white">
                Messages
            </Text>
            <FlatList
                data={conversations}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => {
                    const otherParticipant = getOtherParticipant(item.participants);
                    return (
                        <TouchableOpacity
                            className="flex-row items-center p-3 border-b border-gray-200 dark:border-gray-800"
                            onPress={() => router.push(`/chat/${item._id}` as any)}
                        >
                            <View className="flex-1">
                                <Text className="font-semibold text-black dark:text-white">
                                    {otherParticipant?.name || "Unknown User"}
                                </Text>
                                <Text className="text-gray-500" numberOfLines={1}>
                                    {item.lastMessage || "Start a conversation"}
                                </Text>
                            </View>
                            <Text className="text-xs text-gray-400">
                                {item.lastMessageAt
                                    ? format(new Date(item.lastMessageAt), "MMM d, HH:mm")
                                    : ""}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <Text className="text-center mt-10 text-gray-500">
                        No conversations yet.
                    </Text>
                }
            />
        </View>
    );
}
