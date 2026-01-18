import SafeScreen from "@/components/SafeScreen";
import { useApi } from "@/lib/api";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
} from "react-native";
import { useSocket } from "@/context/SocketContext";

interface Message {
    _id: string;
    sender: {
        _id: string;
        clerkId: string;
        name: string;
    };
    content: string;
    conversationId: string;
    createdAt: string;
}

export default function ChatScreen() {
    const { id: receiverId, productId, productName, productImage } = useLocalSearchParams<{
        id: string;
        productId?: string;
        productName?: string;
        productImage?: string;
    }>();
    const { user } = useUser();
    const api = useApi();
    const queryClient = useQueryClient();
    const socket = useSocket();
    const [inputText, setInputText] = useState("");
    const [conversationId] = useState<string>(receiverId);
    const flatListRef = useRef<FlatList>(null);

    // Fetch messages
    const { data: messages, isLoading } = useQuery<Message[]>({
        queryKey: ["chat", conversationId],
        queryFn: async () => {
            if (!conversationId) return [];
            const { data } = await api.get(`/chats/${conversationId}/messages`);
            return data;
        },
        enabled: !!conversationId,
        // Removed polling - using Socket.IO for real-time updates
    });

    // Send message mutation
    const sendMessage = useMutation({
        mutationFn: async (text: string) => {
            const { data } = await api.post("/chats/message", {
                conversationId,
                content: text,
            });
            return data;
        },
        onSuccess: (newMessage) => {
            queryClient.setQueryData(["chat", conversationId], (old: Message[] = []) => [
                ...old,
                newMessage,
            ]);
            setInputText("");
        },
    });

    const handleSend = () => {
        if (!inputText.trim()) return;
        sendMessage.mutate(inputText);
    };

    // Socket.IO: Join conversation room and listen for new messages
    useEffect(() => {
        if (!socket || !conversationId) return;

        console.log("Joining conversation:", conversationId);
        socket.emit("joinConversation", conversationId);

        const handleNewMessage = (message: Message) => {
            console.log("Received new message:", message);
            // Update the query cache with the new message
            queryClient.setQueryData(["chat", conversationId], (old: Message[] = []) => {
                // Check if message already exists to avoid duplicates
                const exists = old.some(m => m._id === message._id);
                if (exists) return old;
                return [...old, message];
            });
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket, conversationId, queryClient]);

    // Auto-scroll when messages change
    useEffect(() => {
        if (messages?.length) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const renderMessage = ({ item, index }: { item: Message, index: number }) => {
        // Check if the message sender is the current user
        const isMe = item.sender?.clerkId === user?.id;

        // Show date if it's the first message or if significant time passed since last
        const showDate = index === 0 ||
            (item.createdAt && messages && messages[index - 1]?.createdAt &&
                new Date(item.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 1000 * 60 * 60);

        return (
            <View>
                {showDate && item.createdAt && (
                    <View className="items-center my-4">
                        <Text className="text-xs text-text-secondary bg-surface px-2 py-1 rounded-full">
                            {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                )}

                <View
                    className={`flex-row mb-2 ${isMe ? "justify-end" : "justify-start"}`}
                >
                    {!isMe && (
                        <View className="w-8 h-8 rounded-full bg-surface mr-2 items-center justify-center overflow-hidden border border-white/10">
                            <Ionicons name="storefront-outline" color="#888" size={16} />
                        </View>
                    )}

                    <View
                        className={`px-4 py-3 rounded-2xl max-w-[75%] shadow-sm ${isMe ? "bg-primary rounded-tr-sm" : "bg-surface rounded-tl-sm"
                            }`}
                    >
                        <Text
                            className={`${isMe ? "text-background font-medium" : "text-text-primary"} text-base leading-5`}
                        >
                            {item.content}
                        </Text>
                        <View className="flex-row justify-end mt-1">
                            <Text
                                className={`text-[10px] ${isMe ? "text-background/70" : "text-text-secondary"
                                    }`}
                            >
                                {new Date(item.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </Text>
                            {isMe && <Ionicons name="checkmark-done" size={12} color="rgba(0,0,0,0.5)" style={{ marginLeft: 4 }} />}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeScreen>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-white/5 bg-background z-10">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1">
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-text-primary">Chat with Vendor</Text>
                    {!isLoading && <Text className="text-xs text-green-500">Fast reply</Text>}
                </View>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Product Context Banner */}
            {productId && productName && (
                <View className="bg-surface/50 p-3 mx-4 mt-2 rounded-xl flex-row items-center border border-white/10">
                    <Image
                        source={{ uri: productImage }}
                        className="w-10 h-10 rounded-lg bg-surface mr-3"
                    />
                    <View className="flex-1">
                        <Text className="text-xs text-text-secondary uppercase font-bold text-[10px]">Inquiry about</Text>
                        <Text className="text-text-primary font-medium text-sm" numberOfLines={1}>{productName}</Text>
                    </View>
                </View>
            )}

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#1DB954" />
                </View>
            ) : (
                <Image
                    source={require("@/assets/images/auth-image.png")}
                    className="absolute inset-0 opacity-5"
                // contentFit="cover"
                />
            )}

            {!isLoading && (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMessage}
                    contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                    className="flex-1"
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <View className="p-3 border-t border-white/10 flex-row items-end bg-background/95 backdrop-blur-md pb-6">
                    <TouchableOpacity className="p-3 mr-1">
                        <Ionicons name="add-circle-outline" size={28} color="#1DB954" />
                    </TouchableOpacity>

                    <TextInput
                        className="flex-1 bg-surface rounded-2xl px-4 py-3 text-text-primary mr-2 text-base max-h-24"
                        placeholder="Type a message..."
                        placeholderTextColor="#666"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!inputText.trim() || sendMessage.isPending}
                        className={`w-12 h-12 rounded-full items-center justify-center mb-1 ${!inputText.trim() ? "bg-surface" : "bg-primary"
                            }`}
                    >
                        {sendMessage.isPending ? (
                            <ActivityIndicator size="small" color="#121212" />
                        ) : (
                            <Ionicons
                                name="send"
                                size={20}
                                color={!inputText.trim() ? "#666" : "#121212"}
                                style={{ marginLeft: 2 }}
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeScreen>
    );
}
