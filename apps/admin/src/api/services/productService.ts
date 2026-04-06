import axiosInstance from '../axiosInstance';

export const productService = {
  // Lấy danh sách sản phẩm
  getProducts: (params?: any) => {
    return axiosInstance.get('/products', { params });
  },

  // Lấy chi tiết một sản phẩm
  getProductById: (id: string | number) => {
    return axiosInstance.get(`/products/${id}`);
  },

  // Tạo sản phẩm mới
  createProduct: (data: any) => {
    return axiosInstance.post('/products', data);
  },

  // Cập nhật sản phẩm
  updateProduct: (id: string | number, data: any) => {
    return axiosInstance.put(`/products/${id}`, data);
  },

  // Xóa sản phẩm
  deleteProduct: (id: string | number) => {
    return axiosInstance.delete(`/products/${id}`);
  },
};