import { useApi } from '@/lib/api';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useUnreadMessages = () => {
    const api = useApi();
    const { userId, isSignedIn } = useAuth();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['unread-messages'],
        queryFn: async () => {
            if (!isSignedIn) return 0;
            const { data } = await api.get('/chats/unread-count');
            return data.count || 0;
        },
        enabled: !!isSignedIn,
        refetchInterval: 30000, // Poll every 30 seconds
    });

    const markAsRead = useMutation({
        mutationFn: async (conversationId: string) => {
            await api.put(`/chats/${conversationId}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
        },
    });

    return {
        count: query.data || 0,
        refetch: query.refetch,
        markAsRead: markAsRead.mutate,
    };
};
