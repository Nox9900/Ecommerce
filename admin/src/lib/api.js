import axiosInstance from "./axios";

export const productApi = {
  getAll: async (q = "") => {
    const { data } = await axiosInstance.get(`/admin/products${q ? `?q=${q}` : ""}`);
    return data;
  },

  create: async (formData) => {
    const { data } = await axiosInstance.post("/admin/products", formData);
    return data;
  },

  update: async ({ id, formData }) => {
    const { data } = await axiosInstance.put(`/admin/products/${id}`, formData);
    return data;
  },

  delete: async (productId) => {
    const { data } = await axiosInstance.delete(`/admin/products/${productId}`);
    return data;
  },

  bulkDelete: async (productIds) => {
    const { data } = await axiosInstance.post("/admin/products/bulk-delete", { productIds });
    return data;
  },

  bulkUpdateStock: async (productIds, stock) => {
    const { data } = await axiosInstance.post("/admin/products/bulk-update-stock", { productIds, stock });
    return data;
  },

  getAllShops: async () => {
    const { data } = await axiosInstance.get("/admin/shops");
    return data;
  },
};

export const searchApi = {
  searchAll: async (q) => {
    const { data } = await axiosInstance.get(`/admin/search?q=${q}`);
    return data;
  },
};

export const orderApi = {
  getAll: async (q = "") => {
    const { data } = await axiosInstance.get(`/admin/orders${q ? `?q=${q}` : ""}`);
    return data;
  },

  updateStatus: async ({ orderId, status }) => {
    const { data } = await axiosInstance.patch(`/admin/orders/${orderId}/status`, { status });
    return data;
  },

  bulkUpdateStatus: async ({ orderIds, status }) => {
    const { data } = await axiosInstance.post("/admin/orders/bulk-status", { orderIds, status });
    return data;
  },

  bulkDelete: async (orderIds) => {
    const { data } = await axiosInstance.post("/admin/orders/bulk-delete", { orderIds });
    return data;
  },
};

export const statsApi = {
  getDashboard: async () => {
    const { data } = await axiosInstance.get("/admin/stats");
    return data;
  },
};

export const customerApi = {
  getAll: async (q = "") => {
    const { data } = await axiosInstance.get(`/admin/customers${q ? `?q=${q}` : ""}`);
    return data;
  },
};

export const mobileApi = {
  // Categories
  getCategories: async () => {
    const { data } = await axiosInstance.get("/categories/all");
    return data;
  },
  getActiveCategories: async () => {
    const { data } = await axiosInstance.get("/categories");
    return data;
  },
  createCategory: async (categoryData) => {
    const { data } = await axiosInstance.post("/categories", categoryData);
    return data;
  },
  updateCategory: async (id, categoryData) => {
    const { data } = await axiosInstance.put(`/categories/${id}`, categoryData);
    return data;
  },
  deleteCategory: async (id) => {
    const { data } = await axiosInstance.delete(`/categories/${id}`);
    return data;
  },

  // Promo Banners
  getPromoBanners: async () => {
    const { data } = await axiosInstance.get("/promo-banners/all");
    return data;
  },
  createPromoBanner: async (bannerData) => {
    const { data } = await axiosInstance.post("/promo-banners", bannerData);
    return data;
  },
  updatePromoBanner: async (id, bannerData) => {
    const { data } = await axiosInstance.put(`/promo-banners/${id}`, bannerData);
    return data;
  },
  deletePromoBanner: async (id) => {
    const { data } = await axiosInstance.delete(`/promo-banners/${id}`);
    return data;
  },
};

export const vendorApi = {
  register: async (vendorData) => {
    const { data } = await axiosInstance.post("/vendors/register", vendorData);
    return data;
  },
  getProfile: async () => {
    const { data } = await axiosInstance.get("/vendors/profile");
    return data;
  },
  getStats: async () => {
    const { data } = await axiosInstance.get("/vendors/stats");
    return data;
  },
  getProducts: async (q = "") => {
    const { data } = await axiosInstance.get(`/vendors/products${q ? `?q=${q}` : ""}`);
    return data;
  },
  createProduct: async (formData) => {
    const { data } = await axiosInstance.post("/vendors/products", formData);
    return data;
  },
  updateProduct: async ({ id, formData }) => {
    const { data } = await axiosInstance.put(`/vendors/products/${id}`, formData);
    return data;
  },

  bulkDelete: async (productIds) => {
    const { data } = await axiosInstance.post("/vendors/products/bulk-delete", { productIds });
    return data;
  },

  bulkUpdateStock: async (productIds, stock) => {
    const { data } = await axiosInstance.post("/vendors/products/bulk-update-stock", { productIds, stock });
    return data;
  },

  search: async (q) => {
    const { data } = await axiosInstance.get(`/vendors/search?q=${q}`);
    return data;
  },
};

export const shopApi = {
  getVendorShops: async (q = "") => {
    const { data } = await axiosInstance.get(`/shops${q ? `?q=${q}` : ""}`);
    return data;
  },
  create: async (formData) => {
    const { data } = await axiosInstance.post("/shops", formData);
    return data;
  },
  update: async (id, formData) => {
    const { data } = await axiosInstance.patch(`/shops/${id}`, formData);
    return data;
  },
  delete: async (id) => {
    const { data } = await axiosInstance.delete(`/shops/${id}`);
    return data;
  },
  getById: async (id) => {
    const { data } = await axiosInstance.get(`/shops/${id}`);
    return data;
  },
};

export const chatApi = {
  getConversations: async () => {
    const { data } = await axiosInstance.get("/chats");
    return data.conversations || [];
  },
  getMessages: async (conversationId) => {
    const { data } = await axiosInstance.get(`/chats/${conversationId}/messages`);
    return data.messages || [];
  },
  sendMessage: async (messageData) => {
    const { data } = await axiosInstance.post("/chats/message", messageData);
    return data;
  },
  startConversation: async (participantId) => {
    const { data } = await axiosInstance.post("/chats", { participantId });
    return data;
  },
};
