import { Category, NewProduct, EditingProduct } from './types';

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  product: NewProduct | EditingProduct | null;
  setProduct: React.Dispatch<React.SetStateAction<any>>;
  categories: Category[];
  onSubmit: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => void;
}

export default function AddEditProductModal({
  isOpen,
  onClose,
  isEditing,
  product,
  setProduct,
  categories,
  onSubmit,
  onImageUpload
}: AddEditProductModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {isEditing ? 'Modifier le produit' : 'Ajouter un produit'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
              <input
                type="text"
                value={product?.name || ''}
                onChange={(e) => setProduct((prev: any) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                placeholder="Nom du produit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={product?.description || ''}
                onChange={(e) => setProduct((prev: any) => ({ ...prev, description: e.target.value }))}
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
                value={product?.price || 0}
                onChange={(e) => setProduct((prev: any) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Catégorie</label>
              <select
                value={product?.categoryId || ''}
                onChange={(e) => setProduct((prev: any) => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
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
                onChange={(e) => onImageUpload(e, isEditing)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
              {product?.image && (
                <div className="mt-2">
                  <img src={product.image} alt="Preview" className="w-20 h-20 object-cover rounded" />
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={product?.inStock || false}
                onChange={(e) => setProduct((prev: any) => ({ ...prev, inStock: e.target.checked }))}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-300">En stock</label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={onSubmit}
              className={`flex-1 py-2 rounded-lg font-semibold hover:opacity-90 transition-colors ${
                isEditing ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isEditing ? 'Modifier' : 'Ajouter'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
