import { Category } from './types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  newCategory: string;
  setNewCategory: (value: string) => void;
  onAddCategory: () => void;
  onDeleteCategory: (categoryName: string) => void;
}

export default function CategoryModal({
  isOpen,
  onClose,
  categories,
  newCategory,
  setNewCategory,
  onAddCategory,
  onDeleteCategory
}: CategoryModalProps) {
  if (!isOpen) return null;

  return (
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
                onClick={onAddCategory}
                className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Ajouter
              </button>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Catégories existantes</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex justify-between items-center bg-gray-700 px-3 py-2 rounded-md">
                    <span className="text-white text-sm">{category.name}</span>
                    <button
                      onClick={() => onDeleteCategory(category.name)}
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
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
