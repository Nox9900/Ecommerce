import { useState, useEffect } from 'react';
import { useApi } from '@/lib/api';
import { useAuth } from '@clerk/clerk-expo';

export const useUnreadMessages = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const api = useApi();
    const { userId } = useAuth();

    useEffect(() => {
        if (!userId) {
            setUnreadCount(0);
            return;
        }

        const fetchUnreadCount = async () => {
            try {
                const response = await api.get('/chats/unread-count');
                setUnreadCount(response.data.count || 0);
            } catch (error) {
                console.error('Error fetching unread message count:', error);
                setUnreadCount(0);
            }
        };

        fetchUnreadCount();

        // Poll every 30 seconds for updates
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, [userId, api]);

    return unreadCount;
};
