'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '../../lib/stores';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
  category: { id: string; name: string };
  image?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
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
        {/* Floating Cart Button - Bottom */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsCartOpen(!isCartOpen)}
          className="relative bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-2 border-gray-600 hover:border-gray-500"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8z" />
          </svg>
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-7 w-7 flex items-center justify-center font-bold shadow-lg border-2 border-gray-900 animate-pulse">
              {cartItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Cart Dropdown */}
      {isCartOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-[70vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <h3 className="text-lg font-semibold text-white">Votre Panier</h3>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {cartItems.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                Votre panier est vide
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">{item.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-gray-400 text-sm">{item.price}€ × {item.quantity}</p>
                        <p className="text-white font-semibold text-sm">{(item.price * item.quantity).toFixed(2)}€</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            const newQuantity = item.quantity - 1;
                            if (newQuantity > 0) {
                              // Update quantity in store
                              const updatedItems = cartItems.map(cartItem =>
                                cartItem.id === item.id
                                  ? { ...cartItem, quantity: newQuantity }
                                  : cartItem
                              );
                              // Since we can't directly call updateQuantity, we'll remove and re-add
                              removeItem(item.id);
                              for (let i = 0; i < newQuantity; i++) {
                                addItem({
                                  id: item.id,
                                  name: item.name,
                                  price: item.price,
                                  image: item.image
                                });
                              }
                            } else {
                              removeItem(item.id);
                            }
                          }}
                          className="text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600"
                        >
                          -
                        </button>
                        <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => {
                            addItem({
                              id: item.id,
                              name: item.name,
                              price: item.price,
                              image: item.image
                            });
                          }}
                          className="text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="p-4 border-t border-gray-700 flex-shrink-0">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-semibold">Total: {cartTotal.toFixed(2)}€</span>
                <span className="text-gray-400 text-sm">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} articles</span>
              </div>
              <button
                onClick={() => {
                  alert('Commande confirmée !');
                  clearCart();
                  setIsCartOpen(false);
                }}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 border border-gray-600 hover:border-gray-500 shadow-lg"
              >
                Confirmer le panier
              </button>
            </div>
          )}
        </div>
      )}

      <div className="text-center mb-12">
        <br></br>
        <br></br>
        <h1 className="text-4xl font-bold text-white mb-4">Notre Boutique</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Découvrez notre sélection de produits La Planque.
          Merchandising officiel pour les passionnés de musique.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center mb-12">
        <div className="flex space-x-3">
          {categoryFilters.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-white text-black shadow-lg scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
              }`}
            >
              {category === 'all' ? 'Tous' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center text-gray-400">Chargement des produits...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group bg-gray-900 rounded-xl overflow-hidden hover:bg-gray-800 transition-all duration-300 border border-gray-700 hover:border-gray-600">
              <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                    {product.category.name === 'Vêtements' ? '👕' :
                     product.category.name === 'Accessoires' ? '🧢' : '🎸'}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-white group-hover:text-gray-200 transition-colors">{product.name}</h3>
                  <span className="text-xl font-bold text-white bg-gray-800 px-3 py-1 rounded-full">{product.price}€</span>
                </div>

                <p className="text-gray-400 mb-4 leading-relaxed">{product.description}</p>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.inStock
                      ? 'bg-green-900/50 text-green-400 border border-green-700'
                      : 'bg-red-900/50 text-red-400 border border-red-700'
                  }`}>
                    {product.inStock ? 'En stock' : 'Rupture'}
                  </span>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                      product.inStock
                        ? 'bg-white text-black hover:bg-gray-200 hover:scale-105'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}



      {/* Info Section */}
      <div className="mt-12 bg-gray-800 border border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Informations livraison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
          <div>
            <h4 className="font-medium mb-2">Livraison</h4>
            <ul className="space-y-1 text-sm">
              <li>• Livraison gratuite dès 50€ d'achat</li>
              <li>• Livraison sous 3-5 jours ouvrés</li>
              <li>• Suivi de commande par email</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Retours</h4>
            <ul className="space-y-1 text-sm">
              <li>• Retour gratuit sous 30 jours</li>
              <li>• Produits neufs uniquement</li>
              <li>• Remboursement sous 7 jours</li>
            </ul>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
