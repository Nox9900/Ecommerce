import { useApi } from "@/lib/api";
import { Shop, Product } from "@/types";
import { useQuery } from "@tanstack/react-query";

export const useRandomShops = (limit: number = 5) => {
    const api = useApi();

    return useQuery({
        queryKey: ["random-shops", limit],
        queryFn: async () => {
            const response = await api.get<Shop[]>(`/shops/random?limit=${limit}`);
            return response.data || [];
        },
    });
};

export const useShopDetail = (id: string) => {
    const api = useApi();

    return useQuery({
        queryKey: ["shop", id],
        queryFn: async () => {
            const { data } = await api.get<{ shop: Shop; products: Product[] }>(`/shops/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useVendorShops = () => {
    const api = useApi();

    return useQuery({
        queryKey: ["vendor-shops"],
        queryFn: async () => {
            const { data } = await api.get<Shop[]>("/shops");
            return data;
        },
    });
};
