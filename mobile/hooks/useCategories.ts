import { useApi } from "@/lib/api";
import { Category } from "@/types";
import { useQuery } from "@tanstack/react-query";

const useCategories = () => {
    const api = useApi();

    const result = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const { data } = await api.get<Category[]>("/categories");
            return data;
        },
    });

    return result;
};

export default useCategories;
