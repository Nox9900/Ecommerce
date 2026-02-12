import React, { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { useApi } from "@/lib/api";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Notification {
    _id: string;
    recipient: string;
    type: 'order' | 'message' | 'promotion' | 'system' | 'delivery' | 'wishlist';
    title: string;
    body: string;
    data?: any;
    read: boolean;
    createdAt: string;
    translationKey?: string;
    translationParams?: Record<string, any>;
}

interface NotificationContextType {
    unreadCount: number;
    notifications: Notification[];
    isLoading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const socket = useSocket();
    const api = useApi();
    const { isSignedIn } = useAuth();
    const queryClient = useQueryClient();

    // Fetch notifications
    const { data: notifications = [], isLoading, refetch } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            if (!isSignedIn) return [];
            const { data } = await api.get("/notifications");
            return data.notifications || [];
        },
        enabled: !!isSignedIn,
    });

    // Fetch unread count
    const { data: unreadCountData, refetch: refetchCount } = useQuery({
        queryKey: ["notifications", "unread"],
        queryFn: async () => {
            if (!isSignedIn) return { count: 0 };
            const { data } = await api.get("/notifications/unread");
            return data;
        },
        enabled: !!isSignedIn,
    });

    const unreadCount = unreadCountData?.count || 0;

    // Ensure notifications is always an array
    const safeNotifications = Array.isArray(notifications) ? notifications : [];

    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification: Notification) => {
            // Update cache optimistically or refetch
            queryClient.setQueryData(["notifications"], (old: Notification[] = []) => {
                return [notification, ...old];
            });
            queryClient.setQueryData(["notifications", "unread"], (old: any) => {
                return { count: (old?.count || 0) + 1 };
            });
        };

        socket.on("notification:new", handleNewNotification);

        return () => {
            socket.off("notification:new", handleNewNotification);
        };
    }, [socket, queryClient]);

    // Register for push notifications and save token
    useEffect(() => {
        if (!isSignedIn) return;

        const registerPushNotifications = async () => {
            try {
                const { registerForPushNotificationsAsync } = await import('@/lib/notifications');
                const token = await registerForPushNotificationsAsync();

                if (token) {
                    // Save token to backend
                    await api.post('/users/push-token', { expoPushToken: token });
                    console.log('Push token saved to backend');
                }
            } catch (error) {
                console.error('Error registering push notifications:', error);
            }
        };

        registerPushNotifications();
    }, [isSignedIn, api]);

    const markAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);

            // Optimistic update
            queryClient.setQueryData(["notifications"], (old: Notification[] = []) => {
                return old.map(n => n._id === id ? { ...n, read: true } : n);
            });
            refetchCount();
        } catch (error) {
            console.error("Error marking as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put(`/notifications/read-all`);
            refetch();
            refetchCount();
        } catch (error) {
            console.error("Error marking all as read", error);
        }
    };

    const refreshNotifications = () => {
        refetch();
        refetchCount();
    };

    return (
        <NotificationContext.Provider value={{
            unreadCount,
            notifications: safeNotifications,
            isLoading,
            markAsRead,
            markAllAsRead,
            refreshNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
