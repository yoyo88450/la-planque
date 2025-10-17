export interface Reservation {
  id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  message?: string;
  service?: string;
}

export interface Appointment {
  id: string;
  title: string;
  description: string | null;
  date: string;
  duration: number;
  user: {
    username: string;
  };
  clientName?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientMessage?: string | null;
}
