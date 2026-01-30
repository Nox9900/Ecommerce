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
    Alert,
    Dimensions,
    LayoutAnimation,
    UIManager,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useAudioPlayer, useAudioRecorder, RecordingPresets, useAudioRecorderState } from "expo-audio";
import { useVideoPlayer, VideoView } from "expo-video"; // Import expo-video
import { useSocket } from "@/context/SocketContext";

interface Attachment {
    type: "image" | "file" | "audio" | "video"; // Added video type
    url: string;
    name?: string;
}

interface Message {
    _id: string;
    sender: {
        _id: string;
        clerkId: string;
        name: string;
        avatar?: string;
    };
    content: string;
    attachments?: Attachment[];
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
    const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [conversationId] = useState<string>(receiverId);
    const flatListRef = useRef<FlatList>(null);

    // Expo Audio Hooks
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

    // Fetch messages
    const { data: messages, isLoading } = useQuery<Message[]>({
        queryKey: ["chat", conversationId],
        queryFn: async () => {
            if (!conversationId) return [];
            const { data } = await api.get(`/chats/${conversationId}/messages`);
            return data;
        },
        enabled: !!conversationId,
    });

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'], // Allow videos
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedMedia([...selectedMedia, ...result.assets]);
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                multiple: true,
            });

            if (!result.canceled) {
                setSelectedMedia([...selectedMedia, ...result.assets]);
            }
        } catch (err) {
            console.error("Error picking document", err);
        }
    };

    const startRecording = async () => {
        try {
            if (audioRecorder.isRecording) return;
            await audioRecorder.record();
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert("Error", "Could not start recording");
        }
    };

    const stopRecording = async () => {
        if (!isRecording) return;

        try {
            await audioRecorder.stop();
            setIsRecording(false);

            const uri = audioRecorder.uri;

            if (uri) {
                setSelectedMedia([...selectedMedia, {
                    uri: uri,
                    name: `voice_${Date.now()}.m4a`,
                    mimeType: 'audio/m4a',
                    type: 'audio'
                }]);
            }
        } catch (err) {
            console.error("Error stopping recording", err);
        }
    };

    // Send message mutation
    const sendMessage = useMutation({
        mutationFn: async ({ text, media }: { text: string; media: any[] }) => {
            const formData = new FormData();
            formData.append("conversationId", conversationId);
            if (text) formData.append("content", text);

            media.forEach((asset, index) => {
                const uri = asset.uri;
                const name = asset.name || `file_${index}`;
                // Fallback mime type determination
                let type = asset.mimeType;
                if (!type) {
                    if (uri.endsWith(".jpg") || uri.endsWith(".jpeg")) type = "image/jpeg";
                    else if (uri.endsWith(".png")) type = "image/png";
                    else if (uri.endsWith(".mp4")) type = "video/mp4"; // Check for mp4
                    else if (uri.endsWith(".m4a")) type = "audio/m4a";
                    else type = "application/octet-stream";
                }

                // @ts-ignore
                formData.append("files", {
                    uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                    type,
                    name,
                });
            });

            const { data } = await api.post("/chats/message", formData);
            return data;
        },
        onSuccess: (newMessage) => {
            setInputText("");
            setSelectedMedia([]);
        },
    });

    const handleSend = () => {
        if (!inputText.trim() && selectedMedia.length === 0) return;
        sendMessage.mutate({ text: inputText, media: selectedMedia });
    };

    // Socket.IO
    useEffect(() => {
        if (!socket || !conversationId) return;
        socket.emit("joinConversation", conversationId);

        const handleNewMessage = (message: Message) => {
            queryClient.setQueryData(["chat", conversationId], (old: Message[] = []) => {
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

    // Auto-scroll
    useEffect(() => {
        if (messages?.length) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const AudioMessage = ({ url, isMe }: { url: string, isMe: boolean }) => {
        const player = useAudioPlayer(url);

        return (
            <TouchableOpacity
                className="flex-row items-center bg-background/20 p-2 rounded-lg"
                onPress={() => player.playing ? player.pause() : player.play()}
            >
                <Ionicons
                    name={player.playing ? "pause-circle" : "play-circle"}
                    size={32}
                    color={isMe ? "#fff" : "#1DB954"}
                />
                <View className="ml-2">
                    <Text className={`text-sm font-bold ${isMe ? "text-background" : "text-text-primary"}`}>
                        {player.playing ? "Playing..." : "Voice Message"}
                    </Text>
                    <Text className={`text-[10px] ${isMe ? "text-background/70" : "text-text-secondary"}`}>
                        {formatDuration(player.duration)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    const VideoMessage = ({ url }: { url: string }) => {
        const player = useVideoPlayer(url, player => {
            player.loop = false;
        });

        return (
            <View className="w-48 h-32 rounded-lg overflow-hidden bg-black">
                <VideoView
                    style={{ width: '100%', height: '100%' }}
                    player={player}
                    allowsFullscreen
                    allowsPictureInPicture
                />
            </View>
        );
    }

    const renderMessage = ({ item, index }: { item: Message, index: number }) => {
        const isMe = item.sender?.clerkId === user?.id;
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

                <View className={`flex-row mb-2 ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && (
                        <View className="w-8 h-8 rounded-full bg-surface mr-2 items-center justify-center overflow-hidden border border-white/10">
                            {item.sender?.avatar ? (
                                <Image source={{ uri: item.sender.avatar }} className="w-full h-full" />
                            ) : (
                                <Ionicons name="person-outline" color="#888" size={16} />
                            )}
                        </View>
                    )}

                    <View className={`px-4 py-3 rounded-2xl max-w-[75%] shadow-sm ${isMe ? "bg-primary rounded-tr-sm" : "bg-surface rounded-tl-sm"}`}>

                        {/* Attachments */}
                        {item.attachments?.map((att, idx) => (
                            <View key={idx} className="mb-2">
                                {att.type === "image" ? (
                                    <Image
                                        source={{ uri: att.url }}
                                        className="w-48 h-48 rounded-lg mb-1"
                                        resizeMode="cover"
                                    />
                                ) : att.type === "video" ? ( // Handle video type
                                    <VideoMessage url={att.url} />
                                ) : att.type === "audio" ? (
                                    <AudioMessage url={att.url} isMe={isMe} />
                                ) : (
                                    <TouchableOpacity
                                        className="flex-row items-center bg-background/20 p-2 rounded-lg"
                                    >
                                        <Ionicons name="document-attach-outline" size={24} color={isMe ? "#fff" : "#888"} />
                                        <Text className={`ml-2 text-sm ${isMe ? "text-background" : "text-text-primary"}`} numberOfLines={1}>
                                            {att.name || "File"}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}

                        {item.content ? (
                            <Text className={`${isMe ? "text-background font-medium" : "text-text-primary"} text-base leading-5`}>
                                {item.content}
                            </Text>
                        ) : null}

                        <View className="flex-row justify-end mt-1">
                            <Text className={`text-[10px] ${isMe ? "text-background/70" : "text-text-secondary"}`}>
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
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                style={{ flex: 1 }}
            >
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
                {productId && productName && !messages?.length && (
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
                ) : null}

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMessage}
                    contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                    className="flex-1"
                />

                {/* Input Area */}
                <View>
                    {/* Media Attachments Menu */}
                    {selectedMedia.length > 0 && (
                        <View className="px-4 py-2 border-t border-white/10 bg-surface/50 flex-row gap-2">
                            {selectedMedia.map((asset, index) => (
                                <View key={index} className="relative">
                                    {asset.uri?.includes("image") || asset.mimeType?.includes("image") || asset.type === 'image' || asset.mediaType === 'photo' ? (
                                        <Image source={{ uri: asset.uri }} className="w-16 h-16 rounded-lg" />
                                    ) : asset.mimeType?.includes("video") || asset.type === 'video' || asset.mediaType === 'video' ? (
                                        <View className="w-16 h-16 rounded-lg bg-surface items-center justify-center border border-white/10">
                                            <Ionicons name="videocam" size={24} color="#1DB954" />
                                            <Text className="text-[8px] text-text-secondary px-1" numberOfLines={1}>Video</Text>
                                        </View>
                                    ) : asset.mimeType?.includes("audio") || asset.type === 'audio' ? (
                                        <View className="w-16 h-16 rounded-lg bg-surface items-center justify-center border border-white/10">
                                            <Ionicons name="mic" size={24} color="#1DB954" />
                                            <Text className="text-[8px] text-text-secondary px-1" numberOfLines={1}>Voice</Text>
                                        </View>
                                    ) : (
                                        <View className="w-16 h-16 rounded-lg bg-surface items-center justify-center border border-white/10">
                                            <Ionicons name="document-outline" size={24} color="#888" />
                                            <Text className="text-[8px] text-text-secondary px-1" numberOfLines={1}>{asset.name}</Text>
                                        </View>
                                    )}
                                    <TouchableOpacity
                                        className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
                                        onPress={() => setSelectedMedia(selectedMedia.filter((_, i) => i !== index))}
                                    >
                                        <Ionicons name="close" size={14} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    <InputToolbar
                        inputText={inputText}
                        setInputText={setInputText}
                        handleSend={handleSend}
                        pickImage={pickImage}
                        pickDocument={pickDocument}
                        startRecording={startRecording}
                        stopRecording={stopRecording}
                        isRecording={isRecording}
                        isLoading={sendMessage.isPending}
                        audioRecorder={audioRecorder}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeScreen >
    );
}

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

function InputToolbar({
    inputText,
    setInputText,
    handleSend,
    pickImage,
    pickDocument,
    startRecording,
    stopRecording,
    isRecording,
    isLoading,
    audioRecorder
}: any) {
    const [showMenu, setShowMenu] = useState(false);
    const recorderState = useAudioRecorderState(audioRecorder, 100);

    const toggleMenu = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowMenu(!showMenu);
    };

    const handleStartRecording = () => {
        // Haptic feedback could be added here
        startRecording();
    };

    if (isRecording) {
        return (
            <View className="px-4 py-3 border-t border-white/10 flex-row items-center bg-background/95 backdrop-blur-md pb-8">
                <View className="flex-1 flex-row items-center bg-surface/50 rounded-2xl px-4 py-3 mr-2 border border-red-500/30">
                    <View className="w-2 h-2 rounded-full bg-red-500 mr-3 animate-pulse" />
                    <Text className="text-red-400 font-mono font-medium">
                        {formatDuration(recorderState.durationMillis / 1000)}
                    </Text>
                    <Text className="text-text-secondary text-xs ml-2">Recording...</Text>
                </View>

                <TouchableOpacity
                    onPress={stopRecording}
                    className="w-12 h-12 rounded-full items-center justify-center bg-red-500"
                >
                    <Ionicons name="stop" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="border-t border-white/10 bg-background/95 backdrop-blur-md pb-8">
            {/* Expanded Menu */}
            {showMenu && (
                <View className="flex-row p-4 pb-2 gap-4 justify-center animate-in slide-in-from-bottom-2 fade-in">
                    <TouchableOpacity onPress={pickImage} className="items-center">
                        <View className="w-12 h-12 bg-surface rounded-full items-center justify-center border border-white/10 mb-1">
                            <Ionicons name="image" size={24} color="#1DB954" />
                        </View>
                        <Text className="text-[10px] text-text-secondary">Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={pickDocument} className="items-center">
                        <View className="w-12 h-12 bg-surface rounded-full items-center justify-center border border-white/10 mb-1">
                            <Ionicons name="document-text" size={24} color="#1DB954" />
                        </View>
                        <Text className="text-[10px] text-text-secondary">File</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View className="flex-row items-end px-3 py-2">
                <TouchableOpacity
                    onPress={toggleMenu}
                    className={`p-2 mr-1 rounded-full ${showMenu ? 'bg-surface' : ''}`}
                >
                    <Ionicons
                        name={showMenu ? "close" : "add"}
                        size={28}
                        color="#1DB954"
                    />
                </TouchableOpacity>

                <View className="flex-1 bg-surface rounded-2xl flex-row items-center px-3 border border-white/5 mr-2">
                    <TextInput
                        className="flex-1 text-text-primary py-3 text-base max-h-32 min-h-[44px]"
                        placeholder="Type a message..."
                        placeholderTextColor="#666"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />

                    {/* Mic Icon inside input */}
                    {!inputText.trim() ? (
                        <TouchableOpacity
                            onPressIn={handleStartRecording}
                            onPressOut={stopRecording}
                            className="p-1"
                        >
                            <Ionicons name="mic" size={24} color="#1DB954" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Send Button (only appears when typing or has content) */}
                {/* Actually user logic was: Mic inside input. 
                    If text present -> Send button appears? 
                    Let's utilize the separate Send button for text sending as before, 
                    but maybe hide it if empty and strictly use the Mic inside input?
                    Common pattern:
                    - Empty: [ + ] [ Input (Mic) ] 
                    - Typing: [ + ] [ Input       ] [ Send ]
                */}

                {inputText.trim() ? (
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={isLoading}
                        className="w-12 h-12 rounded-full items-center justify-center bg-primary mb-[1px]"
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#121212" />
                        ) : (
                            <Ionicons name="send" size={20} color="#121212" style={{ marginLeft: 2 }} />
                        )}
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );
}

function formatDuration(seconds: number) {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
