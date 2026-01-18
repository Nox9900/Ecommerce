import { useApi } from "@/lib/api";
import { PromoBanner } from "@/types";
import { useQuery } from "@tanstack/react-query";

const usePromoBanners = () => {
    const api = useApi();

    const result = useQuery({
        queryKey: ["promo-banners"],
        queryFn: async () => {
            const { data } = await api.get<PromoBanner[]>("/promo-banners");
            return data;
        },
    });

    return result;
};

export default usePromoBanners;
