import { useApi } from "@/lib/api";
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";

const useProducts = (params?: {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  minRating?: number;
  limit?: number;
}) => {
  const api = useApi();

  const result = useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const { data } = await api.get<{ products: Product[]; total: number }>("/products", {
        params,
      });
      // Handle both old array response and new object response for backward compatibility if needed, 
      // though we changed the backend to return { products, total }
      return Array.isArray(data) ? data : data.products;
    },
  });

  return result;
};

export default useProducts;
