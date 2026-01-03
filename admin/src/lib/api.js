import axiosInstance from "./axios";

export const productApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/admin/products");
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
};

export const orderApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/admin/orders");
    return data;
  },

  updateStatus: async ({ orderId, status }) => {
    const { data } = await axiosInstance.patch(`/admin/orders/${orderId}/status`, { status });
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
  getAll: async () => {
    const { data } = await axiosInstance.get("/admin/customers");
    return data;
  },
};

export const mobileApi = {
  // Hero
  getHero: async () => {
    const { data } = await axiosInstance.get("/hero");
    return data;
  },
  updateHero: async (id, heroData) => {
    const { data } = await axiosInstance.put(`/hero/${id}`, heroData);
    return data;
  },
  createHero: async (heroData) => {
    const { data } = await axiosInstance.post("/hero", heroData);
    return data;
  },

  // Categories
  getCategories: async () => {
    const { data } = await axiosInstance.get("/categories/all");
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
};
