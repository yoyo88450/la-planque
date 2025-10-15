import { create } from 'zustand';

// Cart store for boutique
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existingItem = state.items.find(i => i.id === item.id);
    if (existingItem) {
      return {
        items: state.items.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      };
    }
    return { items: [...state.items, { ...item, quantity: 1 }] };
  }),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(item =>
      item.id === id ? { ...item, quantity } : item
    )
  })),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0)
}));

// Booking store for reservations
interface Booking {
  id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  message?: string;
}

interface BookingStore {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => void;
  removeBooking: (id: string) => void;
  getBookingsByDate: (date: string) => Booking[];
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  addBooking: (booking) => set((state) => ({
    bookings: [...state.bookings, { ...booking, id: Date.now().toString() }]
  })),
  removeBooking: (id) => set((state) => ({
    bookings: state.bookings.filter(b => b.id !== id)
  })),
  getBookingsByDate: (date) => get().bookings.filter(b => b.date === date)
}));

// Admin store for session management
interface AdminStore {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  isAuthenticated: false,
  login: (password) => {
    // Simple password check - in production, use proper authentication
    if (password === 'admin123') {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ isAuthenticated: false })
}));
