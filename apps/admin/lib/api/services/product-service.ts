import axiosInstance from "../axios-instance";
import type { Product, PaginatedResponse } from "../../types";

const API_PATH = "/products";

export const productService = {
  getProducts: async (params?: any): Promise<PaginatedResponse<Product>> => {
    return axiosInstance.get(API_PATH, { params });
  },

  getProductById: async (id: string | number): Promise<Product> => {
    return axiosInstance.get(`${API_PATH}/${id}`);
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    return axiosInstance.post(API_PATH, data);
  },

  updateProduct: async (id: string | number, data: Partial<Product>): Promise<Product> => {
    return axiosInstance.put(`${API_PATH}/${id}`, data);
  },

  deleteProduct: async (id: string | number): Promise<void> => {
    return axiosInstance.delete(`${API_PATH}/${id}`);
  }
};
