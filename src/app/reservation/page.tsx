'use client';

import { useState, useEffect } from 'react';
import { useBookingStore } from '../../lib/stores';
import InfoSection from '../../components/reservation_client/InfoSection';
import CalendarSection from '../../components/reservation_client/CalendarSection';
import FormSection from '../../components/reservation_client/FormSection';
import ConfirmationModal from '../../components/reservation_client/ConfirmationModal';

export default function ReservationPage() {
  const [formData, setFormData] = useState({
    date: '',
    times: {} as Record<number, string[]>,
    duration: 1,
    service: '',
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [existingReservations, setExistingReservations] = useState([]);

  const addBooking = useBookingStore((state) => state.addBooking);
  const getBookingsByDate = useBookingStore((state) => state.getBookingsByDate);

  // Fetch existing reservations on component mount and when form is submitted
  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        // Transformer les données pour correspondre au format attendu
        const transformedData = data.map((appointment: any) => ({
          date: appointment.start.split('T')[0],
          time: new Date(appointment.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }));
        setExistingReservations(transformedData);
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Créer les rendez-vous via l'API - un appel pour chaque heure de la durée
      const appointments = [];

      // Get all selected times for the current duration
      const selectedTimes = formData.times[formData.duration] || [];

      for (const startTime of selectedTimes) {
        const startDateTime = new Date(`${formData.date}T${startTime}`);

        // Créer un rendez-vous pour chaque heure de la durée
        for (let hour = 0; hour < formData.duration; hour++) {
          const appointmentTime = new Date(startDateTime);
          appointmentTime.setHours(startDateTime.getHours() + hour);
          const timeStr = appointmentTime.toTimeString().slice(0, 5);

          appointments.push({
            date: formData.date,
            time: timeStr,
            service: formData.service,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            guests: 1,
            message: formData.message
          });
        }
      }

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointments }),
      });

      if (response.ok) {
        // Rafraîchir les réservations depuis la base de données
        await fetchReservations();

        // Ajouter aussi au store local pour l'affichage immédiat
        appointments.forEach(appointment => {
          addBooking({
            date: appointment.date,
            time: appointment.time,
            name: appointment.name,
            email: appointment.email,
            phone: appointment.phone,
            guests: 1,
            message: appointment.message
          });
        });

        setShowConfirmationModal(true);
      } else {
        console.error('Erreur lors de la création des rendez-vous');
        alert('Erreur lors de la réservation. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la réservation. Veuillez réessayer.');
    }
  };

  const handleConfirmReservation = () => {
    setShowConfirmationModal(false);
    setIsSubmitted(true);
    setFormData({
      date: '',
      times: {},
      duration: 1,
      service: '',
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    setSelectedDate('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <br></br>
      <br></br>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-center text-white mb-4">Réserver votre session</h1>
          <p className="text-center text-gray-300 mb-12 text-lg">Choisissez votre date et service pour une session d'enregistrement professionnelle</p>

          <InfoSection />

          <br></br>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <CalendarSection
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              formData={formData}
              setFormData={setFormData}
              existingReservations={existingReservations}
            />

            <FormSection
              formData={formData}
              handleChange={handleChange}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>

      <ConfirmationModal
        showConfirmationModal={showConfirmationModal}
        setShowConfirmationModal={setShowConfirmationModal}
        formData={formData}
        handleConfirmReservation={handleConfirmReservation}
      />
    </div>
  );
}
