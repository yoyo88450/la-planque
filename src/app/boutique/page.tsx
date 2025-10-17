'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '../../lib/stores';
import FloatingCartButton from '../../components/boutique_client/FloatingCartButton';
import CartDropdown from '../../components/boutique_client/CartDropdown';
import HeaderSection from '../../components/boutique_client/HeaderSection';
import CategoryFilter from '../../components/boutique_client/CategoryFilter';
import ProductsGrid from '../../components/boutique_client/ProductsGrid';
import InfoSection from '../../components/boutique_client/InfoSection';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
  category: { id: string; name: string };
  image?: string;
}

export default function BoutiquePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartItems = useCartStore((state) => state.items);
  const cartTotal = useCartStore((state) => state.getTotal());

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/admin/categories')
        ]);

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData.products);
        }

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.map((cat: any) => cat.name));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categoryFilters = ['all', ...categories];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category.name === selectedCategory);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || ''
    });
    // Removed alert, cart will show notification through UI
  };

  return (
    <div className="bg-black min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <FloatingCartButton
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          cartItems={cartItems}
        />

        <CartDropdown
          isCartOpen={isCartOpen}
          cartItems={cartItems}
          cartTotal={cartTotal}
          addItem={addItem}
          removeItem={removeItem}
          clearCart={clearCart}
          setIsCartOpen={setIsCartOpen}
        />

        <HeaderSection />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <ProductsGrid
          products={filteredProducts}
          loading={loading}
          onAddToCart={handleAddToCart}
        />

        <InfoSection />
      </div>
    </div>
  );
}
