import { useApi } from "@/lib/api";
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useTrendingProducts = () => {
    const api = useApi();
    return useQuery({
        queryKey: ["products", "trending"],
        queryFn: async () => {
            const { data } = await api.get<Product[]>("/recommendations/trending");
            return data;
        },
    });
};

export const usePersonalizedRecommendations = (isEnabled = true) => {
    const api = useApi();
    return useQuery({
        queryKey: ["products", "personalized"],
        queryFn: async () => {
            const { data } = await api.get<Product[]>("/recommendations/personalized");
            return data;
        },
        enabled: isEnabled,
    });
};
