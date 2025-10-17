export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
  category: { id: string; name: string };
  image?: string;
}

export interface EditingProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
  category: { id: string; name: string };
  categoryId: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface NewProduct {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  inStock: boolean;
  image: string;
}
