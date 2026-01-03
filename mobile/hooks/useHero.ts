import { useApi } from "@/lib/api";
import { Hero } from "@/types";
import { useQuery } from "@tanstack/react-query";

const useHero = () => {
    const api = useApi();

    const result = useQuery({
        queryKey: ["hero"],
        queryFn: async () => {
            const { data } = await api.get<Hero>("/hero");
            return data;
        },
    });

    return result;
};

export default useHero;
