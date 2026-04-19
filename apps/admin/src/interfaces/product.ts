export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  stock: number;
  createdAt: string;
}

export interface ProductResponse {
  data: Product[];
  total: number;
}
