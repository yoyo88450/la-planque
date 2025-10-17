interface EmptyStateProps {
  onAddProduct: () => void;
}

export default function EmptyState({ onAddProduct }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-400">Aucun produit dans la boutique.</p>
      <button
        onClick={onAddProduct}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
      >
        Ajouter le premier produit
      </button>
    </div>
  );
}
