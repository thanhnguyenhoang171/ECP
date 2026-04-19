import type { Product, PaginatedResponse } from '../../interfaces';

// Mock Data
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
  // Hàm lấy danh sách sản phẩm
  getProducts: async (): Promise<PaginatedResponse<Product>> => {
    // Giả lập gọi API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          content: MOCK_PRODUCTS,
          totalElements: MOCK_PRODUCTS.length,
          totalPages: 1,
          size: 10,
          number: 0
        });
      }, 800); // Trễ 800ms
    });
    
    /* SAU NÀY CÓ API THẬT CHỈ CẦN:
    const response = await axiosInstance.get('/products');
    return response.data;
    */
  },

  // Hàm lấy chi tiết sản phẩm
  getProductById: async (id: string): Promise<Product> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const product = MOCK_PRODUCTS.find(p => p.id === id);
        if (product) resolve(product);
        else reject(new Error('Không tìm thấy sản phẩm'));
      }, 500);
    });
  }
};
