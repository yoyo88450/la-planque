'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '../../lib/stores';
import FloatingCartButton from '../../components/boutique_client/FloatingCartButton';
import CartDropdown from '../../components/boutique_client/CartDropdown';
import HeaderSection from '../../components/boutique_client/HeaderSection';
import CategoryFilter from '../../components/boutique_client/CategoryFilter';
import ProductsGrid from '../../components/boutique_client/ProductsGrid';
import InfoSection from '../../components/boutique_client/InfoSection';
import LoadingSpinner from '../../components/boutique_client/LoadingSpinner';

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
  const [boutiqueEnabled, setBoutiqueEnabled] = useState<boolean | null>(null); // null = loading
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartItems = useCartStore((state) => state.items);
  const cartTotal = useCartStore((state) => state.getTotal());

  // Check if boutique is enabled
  useEffect(() => {
    const checkBoutiqueStatus = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const settings = await response.json();
          setBoutiqueEnabled(settings.boutiqueEnabled);
        } else {
          // Default to enabled if API fails
          setBoutiqueEnabled(true);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des paramètres:', error);
        // Default to enabled if error
        setBoutiqueEnabled(true);
      }
    };

    checkBoutiqueStatus();
  }, []);

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

    if (boutiqueEnabled === true) {
      fetchData();
    }
  }, [boutiqueEnabled]);

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

  // Show loading spinner while checking boutique status
  if (boutiqueEnabled === null) {
    return <LoadingSpinner />;
  }

  // Show maintenance page if boutique is disabled
  if (boutiqueEnabled === false) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <svg className="mx-auto h-24 w-24 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Boutique en maintenance</h1>
          <p className="text-gray-400 text-lg mb-8">La boutique est temporairement indisponible. Veuillez revenir plus tard.</p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

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
