import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";

// Mock data - replace with actual API call
const MOCK_CHATS = [
    {
        id: "1",
        userName: "Tech Store",
        lastMessage: "Your order has been confirmed!",
        timestamp: "2m ago",
        unread: 2,
        avatar: "https://ui-avatars.com/api/?name=Tech+Store&background=6366F1&color=fff",
    },
    {
        id: "2",
        userName: "Fashion Hub",
        lastMessage: "We have a new collection for you",
        timestamp: "1h ago",
        unread: 0,
        avatar: "https://ui-avatars.com/api/?name=Fashion+Hub&background=A855F7&color=fff",
    },
];

export default function ChatScreen() {
    return (
        <SafeScreen>
            <View className="flex-1 bg-background">
                {/* Header */}
                <View className="px-6 pt-4 pb-6">
                    <Text className="text-2xl font-bold text-text-primary">Messages</Text>
                    <Text className="text-text-secondary text-sm mt-1">
                        {MOCK_CHATS.length} conversations
                    </Text>
                </View>

                <ScrollView
                    className="flex-1 px-6"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {MOCK_CHATS.length === 0 ? (
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
                        MOCK_CHATS.map((chat) => (
                            <TouchableOpacity
                                key={chat.id}
                                className="flex-row items-center bg-surface-light p-4 rounded-2xl mb-3 border border-white/5 active:bg-surface"
                                onPress={() => router.push(`/chat/${chat.id}` as any)}
                                activeOpacity={0.7}
                            >
                                <Image
                                    source={{ uri: chat.avatar }}
                                    className="w-14 h-14 rounded-full mr-4"
                                />
                                <View className="flex-1">
                                    <View className="flex-row items-center justify-between mb-1">
                                        <Text className="text-text-primary font-bold text-base">
                                            {chat.userName}
                                        </Text>
                                        <Text className="text-text-tertiary text-xs">{chat.timestamp}</Text>
                                    </View>
                                    <View className="flex-row items-center justify-between">
                                        <Text
                                            className="text-text-secondary text-sm flex-1"
                                            numberOfLines={1}
                                        >
                                            {chat.lastMessage}
                                        </Text>
                                        {chat.unread > 0 && (
                                            <View className="bg-primary w-5 h-5 rounded-full items-center justify-center ml-2">
                                                <Text className="text-white text-xs font-bold">{chat.unread}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </View>
        </SafeScreen>
    );
}
