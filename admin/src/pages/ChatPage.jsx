import { useEffect, useState, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { io } from "socket.io-client";
import { Send, User as UserIcon, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatPage = () => {
    const { getToken, userId } = useAuth();
    const { user } = useUser();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const initSocket = async () => {
            const token = await getToken();
            if (token && userId) {
                const newSocket = io(API_URL, {
                    transports: ["websocket"],
                });

                newSocket.on("connect", () => {
                    console.log("Socket connected:", newSocket.id);
                });

                newSocket.on("newMessage", (message) => {
                    if (selectedConversation && message.conversationId === selectedConversation._id) {
                        setMessages((prev) => [...prev, message]);
                        scrollToBottom();
                    }
                    // Update last message in conversation list
                    setConversations((prev) =>
                        prev.map((c) =>
                            c._id === message.conversationId
                                ? { ...c, lastMessage: message.content, lastMessageAt: message.createdAt }
                                : c
                        ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
                    );
                });

                setSocket(newSocket);

                return () => newSocket.disconnect();
            }
        };
        initSocket();
    }, [userId, selectedConversation]); // Re-attach listener if selectedConversation changes? No, better logic inside listener. 
    // Actually, listener inside useEffect with selectedConversation dependency is safer for closure, 
    // but better to use ref for selectedConversation or functional state update if logic gets complex.
    // For simplicity, let's keep listener simple but realize it captures scope. 
    // Better: separate socket setup and message listener.

    // Refactor socket setup:
    useEffect(() => {
        const newSocket = io(API_URL, { transports: ["websocket"] });
        setSocket(newSocket);
        return () => newSocket.disconnect();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            setMessages(prev => {
                // Only append if belongs to current conversation
                // We need a way to know current selectedConversation without dependency cycle.
                // Using functional state for selectedConversation? No.
                // Let's rely on checking message.conversationId against current ID in specific useEffect for that?
                // Or simplier: just update conversation list, and if message.conversationId matches active one, update messages.
                return prev;
            });

            // This is tricky with hooks. Let's just update conversations always.
            setConversations((prev) =>
                prev.map((c) =>
                    c._id === message.conversationId
                        ? { ...c, lastMessage: message.content, lastMessageAt: message.createdAt }
                        : c
                ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
            );
        };

        socket.on("newMessage", handleNewMessage);
        return () => socket.off("newMessage", handleNewMessage);
    }, [socket]);

    // Separate effect to handle "Message Received" for active chat
    useEffect(() => {
        if (!socket || !selectedConversation) return;

        const handleActiveMessage = (message) => {
            if (message.conversationId === selectedConversation._id) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();
            }
        };

        socket.on("newMessage", handleActiveMessage);
        return () => socket.off("newMessage", handleActiveMessage);
    }, [socket, selectedConversation]);


    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation._id);
            if (socket) {
                socket.emit("joinConversation", selectedConversation._id);
            }
        }
    }, [selectedConversation, socket]);

    const fetchConversations = async () => {
        try {
            const token = await getToken();
            const res = await axios.get(`${API_URL}/api/chats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setConversations(res.data);
        } catch (error) {
            console.error("Error fetching chats", error);
            toast.error("Failed to load chats");
        }
    };

    const fetchMessages = async (id) => {
        try {
            const token = await getToken();
            const res = await axios.get(`${API_URL}/api/chats/${id}/messages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages(res.data);
            scrollToBottom();
        } catch (error) {
            console.error("Error fetching messages", error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedConversation) return;

        try {
            const token = await getToken();
            const content = inputText.trim();
            setInputText("");

            // Optimistic update handled by socket return, but we can also push manually if we want instant feedback.
            // waiting for socket is safer for consistency.

            await axios.post(
                `${API_URL}/api/chats/message`,
                { conversationId: selectedConversation._id, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Error sending message", error);
            toast.error("Failed to send message");
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const getOtherParticipant = (participants) => {
        if (!participants || participants.length === 0) return null;
        return participants.find((p) => p.clerkId !== userId) || participants[0];
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-base-100 rounded-lg overflow-hidden border border-base-300">
            {/* Sidebar */}
            <div className="w-1/3 border-r border-base-300 flex flex-col">
                <div className="p-4 border-b border-base-300 bg-base-200/50">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <MessageSquare size={20} /> Chats
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-base-content/50">No conversations</div>
                    ) : (
                        conversations.map((conv) => {
                            const other = getOtherParticipant(conv.participants);
                            return (
                                <div
                                    key={conv._id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`p-4 border-b border-base-300 cursor-pointer hover:bg-base-200 transition-colors ${selectedConversation?._id === conv._id ? "bg-primary/10 border-l-4 border-l-primary" : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="avatar placeholder">
                                            <div className="bg-neutral text-neutral-content rounded-full w-10">
                                                {other?.avatar ? <img src={other.avatar} /> : <span>{other?.name?.[0] || "?"}</span>}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{other?.name || "Unknown"}</h3>
                                            <p className="text-sm text-base-content/70 truncate">{conv.lastMessage}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-base-100">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b border-base-300 flex items-center gap-3 bg-base-200/50">
                            <div className="avatar placeholder">
                                <div className="bg-neutral text-neutral-content rounded-full w-8">
                                    <span>{getOtherParticipant(selectedConversation.participants)?.name?.[0]}</span>
                                </div>
                            </div>
                            <span className="font-bold">{getOtherParticipant(selectedConversation.participants)?.name}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100">
                            {messages.map((msg) => {
                                // Check if me. msg.sender has clerkId now (per my backend update).
                                const isMe = msg.sender?.clerkId === userId;
                                return (
                                    <div key={msg._id} className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
                                        <div className="chat-image avatar">
                                            <div className="w-8 rounded-full bg-neutral text-neutral-content flex items-center justify-center">
                                                {msg.sender?.avatar ? <img src={msg.sender.avatar} /> : <span>{msg.sender?.name?.[0]}</span>}
                                            </div>
                                        </div>
                                        <div className={`chat-bubble ${isMe ? "chat-bubble-primary" : "chat-bubble-secondary"}`}>
                                            {msg.content}
                                        </div>
                                        <div className="chat-footer opacity-50 text-xs mt-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={sendMessage} className="p-4 border-t border-base-300 bg-base-100 flex gap-2">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="input input-bordered flex-1"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary" disabled={!inputText.trim()}>
                                <Send size={18} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-base-content/50">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
