import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";

export interface VendorProfile {
    _id: string;
    shopName: string;
    description: string;
    logoUrl: string;
    owner?: {
        name: string;
        avatar: string;
    };
    bannerUrl?: string;
    rating?: number;
    joinedAt: string;
}

export const useVendor = (vendorId: string) => {
    const api = useApi();

    return useQuery<VendorProfile>({
        queryKey: ["vendor", vendorId],
        queryFn: async () => {
            const { data } = await api.get(`/vendors/${vendorId}`);
            return data;
        },
        enabled: !!vendorId,
    });
};
