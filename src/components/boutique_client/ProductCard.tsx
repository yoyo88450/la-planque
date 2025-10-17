interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
  category: { id: string; name: string };
  image?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="group bg-gray-900 rounded-xl overflow-hidden hover:bg-gray-800 transition-all duration-300 border border-gray-700 hover:border-gray-600">
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
            onClick={() => onAddToCart(product)}
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
  );
}
