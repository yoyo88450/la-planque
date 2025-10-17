import { CartItem } from '../../lib/stores';

interface CartDropdownProps {
  isCartOpen: boolean;
  cartItems: CartItem[];
  cartTotal: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
}

export default function CartDropdown({
  isCartOpen,
  cartItems,
  cartTotal,
  addItem,
  removeItem,
  clearCart,
  setIsCartOpen
}: CartDropdownProps) {
  if (!isCartOpen) return null;

  return (
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
  );
}
