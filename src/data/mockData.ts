// Mock data for the application

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  message: string;
  rating: number;
  date: string;
}

export interface Reservation {
  id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  message?: string;
}

// Mock products for recording studio merchandise
export const products: Product[] = [
  {
    id: '1',
    name: 'T-shirt La Planque',
    description: 'T-shirt noir avec logo La Planque, 100% coton bio.',
    price: 25.99,
    image: '/images/tshirt.jpg',
    category: 'Vêtements',
    inStock: true
  },
  {
    id: '2',
    name: 'Bonnet La Planque',
    description: 'Bonnet en laine avec logo brodé, parfait pour les sessions hivernales.',
    price: 18.99,
    image: '/images/bonnet.jpg',
    category: 'Accessoires',
    inStock: true
  },
  {
    id: '3',
    name: 'Sweat La Planque',
    description: 'Sweat à capuche noir avec logo blanc, confortable et stylé.',
    price: 45.99,
    image: '/images/sweat.jpg',
    category: 'Vêtements',
    inStock: true
  },
  {
    id: '4',
    name: 'Veste La Planque',
    description: 'Veste bomber noire avec logo La Planque, coupe moderne.',
    price: 89.99,
    image: '/images/veste.jpg',
    category: 'Vêtements',
    inStock: true
  }
];

// Mock testimonials
export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Marie Dupont',
    message: 'Une expérience incroyable ! Le personnel est très accueillant et les équipements sont de qualité.',
    rating: 5,
    date: '2024-01-15'
  },
  {
    id: '2',
    name: 'Jean Martin',
    message: 'Parfait pour une sortie en famille. Les kayaks sont faciles à manier et le cadre est magnifique.',
    rating: 5,
    date: '2024-01-20'
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    message: 'Service impeccable et matériel bien entretenu. Je recommande vivement !',
    rating: 4,
    date: '2024-01-25'
  }
];

// Mock reservations (for admin view)
export const mockReservations: Reservation[] = [
  {
    id: '1',
    date: '2024-02-01',
    time: '10:00',
    name: 'Pierre Dubois',
    email: 'pierre@example.com',
    phone: '06 12 34 56 78',
    guests: 2,
    message: 'Réservation pour une sortie kayak'
  },
  {
    id: '2',
    date: '2024-02-02',
    time: '14:00',
    name: 'Anne Moreau',
    email: 'anne@example.com',
    phone: '06 98 76 54 32',
    guests: 4,
    message: 'Groupe de 4 personnes'
  }
];
