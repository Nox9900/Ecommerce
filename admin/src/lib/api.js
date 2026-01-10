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
  getProducts: async () => {
    const { data } = await axiosInstance.get("/vendors/products");
    return data;
  },
  createProduct: async (formData) => {
    const { data } = await axiosInstance.post("/vendors/products", formData);
    return data;
  },
};

export const shopApi = {
  getVendorShops: async () => {
    const { data } = await axiosInstance.get("/shops");
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
