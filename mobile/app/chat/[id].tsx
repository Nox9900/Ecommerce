import React, { useEffect, useState, useRef } from "react";
import { View, Text, FlatList, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/lib/useTheme";
import { useSocket } from "@/context/SocketContext";

interface Message {
    _id: string;
    sender: {
        _id: string;
        name: string;
        clerkId?: string;
    };
    content: string;
    createdAt: string;
}

export default function ChatRoomScreen() {
    const { id } = useLocalSearchParams();
    const { getToken, userId } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef<FlatList>(null);
    const { theme } = useTheme();
    const socket = useSocket();

    useEffect(() => {
        fetchMessages();
        if (socket) {
            socket.emit("joinConversation", id);

            socket.on("newMessage", (message: Message) => {
                setMessages((prev) => [...prev, message]);
                scrollToBottom();
            });

            return () => {
                socket.off("newMessage");
            };
        }
    }, [id, socket]);

    const fetchMessages = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_API_URL}/api/chats/${id}/messages`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setMessages(response.data);
            setLoading(false);
            setTimeout(() => scrollToBottom(), 100);
        } catch (error) {
            console.error("Error fetching messages:", error);
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        try {
            const token = await getToken();
            const content = inputText.trim();
            setInputText(""); // Optimistic clear

            // Send to API
            await axios.post(
                `${process.env.EXPO_PUBLIC_API_URL}/api/chats/message`,
                {
                    conversationId: id,
                    content,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const scrollToBottom = () => {
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white dark:bg-black">
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-white dark:bg-black"
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <View className="flex-1">
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => {
                        // Check if message is from me using Clerk ID
                        const isMe = item.sender.clerkId === userId;

                        return (
                            <View
                                className={`mb-3 p-3 rounded-lg max-w-[80%] ${isMe ? "self-end bg-blue-500" : "self-start bg-gray-200 dark:bg-gray-700"
                                    }`}
                            >
                                {!isMe && (
                                    <Text className="text-xs text-gray-500 mb-1">{item.sender.name}</Text>
                                )}
                                <Text className={isMe ? "text-white" : "text-black dark:text-white"}>{item.content}</Text>
                            </View>
                        );
                    }}
                    onContentSizeChange={scrollToBottom}
                />
                <View className="p-4 border-t border-gray-200 dark:border-gray-800 flex-row items-center bg-white dark:bg-neutral-900">
                    <TextInput
                        className="flex-1 bg-gray-100 dark:bg-gray-800 p-3 rounded-full mr-2 text-black dark:text-white"
                        placeholder="Type a message..."
                        placeholderTextColor="#9CA3AF"
                        value={inputText}
                        onChangeText={setInputText}
                    />
                    <TouchableOpacity onPress={sendMessage} disabled={!inputText.trim()}>
                        <Ionicons name="send" size={24} color="#6366F1" />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
