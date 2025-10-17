'use client';

import { useState, useEffect } from 'react';
import BoutiqueHeader from '../boutique_admin/BoutiqueHeader';
import AddEditProductModal from '../boutique_admin/AddEditProductModal';
import CategoryModal from '../boutique_admin/CategoryModal';
import ProductsTable from '../boutique_admin/ProductsTable';
import EmptyState from '../boutique_admin/EmptyState';
import { Product, EditingProduct, Category, NewProduct } from '../boutique_admin/types';

export default function BoutiqueTab() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [boutiqueLoading, setBoutiqueLoading] = useState(true);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    inStock: true,
    image: ''
  });

  // Load boutique data
  const loadBoutiqueData = async () => {
    try {
      setBoutiqueLoading(true);
      const response = await fetch('/api/admin/products');

      if (response.ok) {
        const data = await response.json();
        setProductList(Array.isArray(data.products) ? data.products : []);
        setLocalCategories(Array.isArray(data.categories) ? data.categories : []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données boutique:', error);
    } finally {
      setBoutiqueLoading(false);
    }
  };

  useEffect(() => {
    loadBoutiqueData();
  }, []);

  // Boutique handlers
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

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.description || !newProduct.categoryId) {
      alert('Veuillez remplir tous les champs obligatoires (nom, description, catégorie)');
      return;
    }

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
    <div>
      <BoutiqueHeader
        onAddProduct={() => setIsAddingProduct(true)}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
      />

      <AddEditProductModal
        isOpen={isAddingProduct}
        onClose={() => setIsAddingProduct(false)}
        isEditing={false}
        product={newProduct}
        setProduct={setNewProduct}
        categories={localCategories}
        onSubmit={handleAddProduct}
        onImageUpload={handleImageUpload}
      />

      <AddEditProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        isEditing={true}
        product={editingProduct}
        setProduct={setEditingProduct}
        categories={localCategories}
        onSubmit={handleUpdateProduct}
        onImageUpload={handleImageUpload}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={localCategories}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {productList.length > 0 ? (
        <ProductsTable
          products={productList}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      ) : (
        <EmptyState onAddProduct={() => setIsAddingProduct(true)} />
      )}
    </div>
  );
}
