import { CartItem } from '../../lib/stores';

interface FloatingCartButtonProps {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartItems: CartItem[];
}

export default function FloatingCartButton({ isCartOpen, setIsCartOpen, cartItems }: FloatingCartButtonProps) {
  return (
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
  );
}
