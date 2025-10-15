 'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminStore } from '../../../lib/stores';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
  category: { id: string; name: string };
  image?: string;
}

interface EditingProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
  category: { id: string; name: string };
  categoryId: string;
  image?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminBoutiquePage() {
  const { isAuthenticated } = useAdminStore();
  const [productList, setProductList] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    inStock: true,
    image: ''
  });

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        if (isEditing) {
          setEditingProduct(prev => prev ? { ...prev, image: base64 } : null);
        } else {
          setNewProduct(prev => ({ ...prev, image: base64 }));
        }
      } catch (error) {
        console.error('Erreur lors de la conversion de l\'image:', error);
        alert('Erreur lors du traitement de l\'image');
      }
    }
  };

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/products');

        if (response.ok) {
          const data = await response.json();
          setProductList(Array.isArray(data.products) ? data.products : []);
          setLocalCategories(Array.isArray(data.categories) ? data.categories : []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Accès refusé</h1>
          <p className="text-gray-400">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.description && newProduct.categoryId) {
      try {
        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newProduct.name,
            description: newProduct.description,
            price: newProduct.price,
            inStock: newProduct.inStock,
            categoryId: newProduct.categoryId,
            image: newProduct.image
          }),
        });

        if (response.ok) {
          const newProductData = await response.json();
          setProductList([...productList, newProductData]);
          setNewProduct({ name: '', description: '', price: 0, categoryId: '', inStock: true, image: '' });
          setIsAddingProduct(false);
        } else {
          const error = await response.json();
          alert(error.error || 'Erreur lors de l\'ajout du produit');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'ajout du produit');
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({
      ...product,
      categoryId: product.category.id,
      image: product.image || ''
    });
  };

  const handleUpdateProduct = async () => {
    if (editingProduct) {
      try {
        const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editingProduct.name,
            description: editingProduct.description,
            price: editingProduct.price,
            inStock: editingProduct.inStock,
            categoryId: editingProduct.categoryId,
            image: editingProduct.image
          }),
        });

        if (response.ok) {
          const updatedProduct = await response.json();
          setProductList(productList.map(p => p.id === editingProduct.id ? updatedProduct : p));
          setEditingProduct(null);
        } else {
          const error = await response.json();
          alert(error.error || 'Erreur lors de la modification du produit');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la modification du produit');
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        const response = await fetch(`/api/admin/products/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setProductList(productList.filter(p => p.id !== id));
        } else {
          const error = await response.json();
          alert(error.error || 'Erreur lors de la suppression du produit');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression du produit');
      }
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim() && !localCategories.some(cat => cat.name === newCategory.trim())) {
      try {
        const response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newCategory.trim() }),
        });

        if (response.ok) {
          const newCategoryData = await response.json();
          setLocalCategories([...localCategories, newCategoryData]);
          setNewCategory('');
        } else {
          const error = await response.json();
          alert(error.error || 'Erreur lors de l\'ajout de la catégorie');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'ajout de la catégorie');
      }
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category}" ?`)) {
      try {
        // Find category ID first
        const categoriesResponse = await fetch('/api/admin/categories');
        const categories = await categoriesResponse.json();
        const categoryToDelete = categories.find((cat: any) => cat.name === category);

        if (categoryToDelete) {
          const response = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            setLocalCategories(localCategories.filter(c => c.id !== categoryToDelete.id));
          } else {
            const error = await response.json();
            alert(error.error || 'Erreur lors de la suppression de la catégorie');
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression de la catégorie');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Custom Navigation Menu */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg md:text-xl font-bold text-white">Administration La Planque</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/admin"
                className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Tableau de bord
              </Link>
              <Link
                href="/admin/reservations"
                className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Réservations
              </Link>
              <Link
                href="/admin/boutique"
                className="text-white hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Boutique
              </Link>
              <Link
                href="/admin"
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
              >
                Retour
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-gray-300 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-700 py-4">
              <div className="flex flex-col space-y-2">
                <Link
                  href="/admin"
                  className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                <Link
                  href="/admin/reservations"
                  className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Réservations
                </Link>
                <Link
                  href="/admin/boutique"
                  className="text-white hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Boutique
                </Link>
                <Link
                  href="/admin"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm text-left"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Retour
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Gestion de la boutique</h2>
            <p className="text-gray-400 text-sm md:text-base">Ajoutez, modifiez et supprimez les produits</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base"
            >
              Catégories
            </button>
            <button
              onClick={() => setIsAddingProduct(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm md:text-base"
            >
              + Ajouter un produit
            </button>
          </div>
        </div>

        {/* Add Product Modal - Mobile Optimized */}
        {isAddingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Ajouter un produit</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="Nom du produit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      rows={3}
                      placeholder="Description du produit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Prix (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Catégorie</label>
                    <select
                      value={newProduct.categoryId}
                      onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {localCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                    {newProduct.image && (
                      <div className="mt-2">
                        <img src={newProduct.image} alt="Preview" className="w-20 h-20 object-cover rounded" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newProduct.inStock}
                      onChange={(e) => setNewProduct({...newProduct, inStock: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-300">En stock</label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={handleAddProduct}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => setIsAddingProduct(false)}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal - Mobile Optimized */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Modifier le produit</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Prix (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Catégorie</label>
                    <select
                      value={editingProduct.categoryId}
                      onChange={(e) => setEditingProduct({...editingProduct, categoryId: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {localCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                    {editingProduct.image && (
                      <div className="mt-2">
                        <img src={editingProduct.image} alt="Preview" className="w-20 h-20 object-cover rounded" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingProduct.inStock}
                      onChange={(e) => setEditingProduct({...editingProduct, inStock: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-300">En stock</label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={handleUpdateProduct}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Management Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Gestion des catégories</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nouvelle catégorie</label>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      placeholder="Nom de la catégorie"
                    />
                    <button
                      onClick={handleAddCategory}
                      className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Catégories existantes</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {localCategories.map((category) => (
                        <div key={category.id} className="flex justify-between items-center bg-gray-700 px-3 py-2 rounded-md">
                          <span className="text-white text-sm">{category.name}</span>
                          <button
                            onClick={() => handleDeleteCategory(category.name)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Table - Mobile Optimized */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {/* Mobile Card View */}
          <div className="md:hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Produits ({productList.length})</h3>
            </div>
            <div className="divide-y divide-gray-700">
              {productList.map((product) => (
                <div key={product.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{product.name}</h4>
                      <p className="text-gray-400 text-sm truncate">{product.description}</p>
                    </div>
                    <span className="text-white font-bold ml-2">{product.price}€</span>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-300 text-sm">{product.category.name}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.inStock
                        ? 'bg-green-900 text-green-300'
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {product.inStock ? 'En stock' : 'Rupture'}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {productList.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{product.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">{product.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white font-medium">{product.price}€</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{product.category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.inStock
                          ? 'bg-green-900 text-green-300'
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {product.inStock ? 'En stock' : 'Rupture'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-400 hover:text-blue-300 mr-4"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {productList.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">Aucun produit dans la boutique.</p>
            <button
              onClick={() => setIsAddingProduct(true)}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Ajouter le premier produit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
