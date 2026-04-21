import axiosInstance from '../axiosInstance';
import type { Product, PaginatedResponse } from '../../interfaces';

const API_PATH = '/products';

// Mock Data (Xóa khi có API thật)
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    price: 34990000,
    description: 'Chip A17 Pro, Camera 48MP',
    category: 'Điện thoại',
    image: 'https://placehold.co/100x100',
    stock: 50,
    status: 'active',
    createdAt: '2024-03-20T10:00:00Z',
  },
  {
    id: '2',
    name: 'MacBook Air M3',
    price: 27990000,
    description: 'Siêu mỏng, siêu mạnh',
    category: 'Laptop',
    image: 'https://placehold.co/100x100',
    stock: 20,
    status: 'active',
    createdAt: '2024-03-21T09:00:00Z',
  },
];

export const productService = {
  /**
   * Lấy danh sách sản phẩm (có phân trang/lọc)
   */
  getProducts: async (params?: any): Promise<PaginatedResponse<Product>> => {
    console.log("Checking params = ", params);
    // KHI CÓ API THẬT:
    // const response = await axiosInstance.get(API_PATH, { params });
    // return response as unknown as PaginatedResponse<Product>;

    // GIẢ LẬP GỌI API:
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          content: MOCK_PRODUCTS,
          totalElements: MOCK_PRODUCTS.length,
          totalPages: 1,
          size: 10,
          number: 0
        });
      }, 500);
    });
  },

  /**
   * Lấy chi tiết sản phẩm
   */
  getProductById: async (id: string | number): Promise<Product> => {
    // KHI CÓ API THẬT:
    // const response = await axiosInstance.get(`${API_PATH}/${id}`);
    // return response as unknown as Product;

    return new Promise((resolve, reject) => {
      const product = MOCK_PRODUCTS.find(p => p.id.toString() === id.toString());
      if (product) resolve(product);
      else reject(new Error('Không tìm thấy sản phẩm'));
    });
  },

  /**
   * Tạo sản phẩm mới
   */
  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const response = await axiosInstance.post(API_PATH, data);
    return response as unknown as Product;
  },

  /**
   * Cập nhật sản phẩm
   */
  updateProduct: async (id: string | number, data: Partial<Product>): Promise<Product> => {
    const response = await axiosInstance.put(`${API_PATH}/${id}`, data);
    return response as unknown as Product;
  },

  /**
   * Xóa sản phẩm
   */
  deleteProduct: async (id: string | number): Promise<void> => {
    await axiosInstance.delete(`${API_PATH}/${id}`);
  }
};
