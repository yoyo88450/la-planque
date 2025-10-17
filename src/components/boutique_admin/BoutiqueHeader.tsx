interface BoutiqueHeaderProps {
  onAddProduct: () => void;
  onOpenCategoryModal: () => void;
}

export default function BoutiqueHeader({ onAddProduct, onOpenCategoryModal }: BoutiqueHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8">
      <div className="mb-4 md:mb-0">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Gestion de la boutique</h2>
        <p className="text-gray-400 text-sm md:text-base">Ajoutez, modifiez et supprimez les produits</p>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={onOpenCategoryModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          Catégories
        </button>
        <button
          onClick={onAddProduct}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm md:text-base"
        >
          + Ajouter un produit
        </button>
      </div>
    </div>
  );
}
