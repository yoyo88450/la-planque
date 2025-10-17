import { Reservation } from './types';

interface EditFormModalProps {
  showEditForm: boolean;
  setShowEditForm: (show: boolean) => void;
  editingReservation: Reservation | null;
  editFormData: {
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
    date: string;
    time: string;
  };
  setEditFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
    date: string;
    time: string;
  }>>;
  handleEditSubmit: (e: React.FormEvent) => void;
  handleEditFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function EditFormModal({
  showEditForm,
  setShowEditForm,
  editingReservation,
  editFormData,
  setEditFormData,
  handleEditSubmit,
  handleEditFormChange
}: EditFormModalProps) {
  if (!showEditForm || !editingReservation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">Modifier la réservation</h3>
            <button
              onClick={() => setShowEditForm(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-service" className="block text-sm font-medium text-gray-300 mb-2">
                Service souhaité *
              </label>
              <select
                id="edit-service"
                name="service"
                required
                value={editFormData.service}
                onChange={handleEditFormChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="" className="bg-gray-700">Choisir un service</option>
                <option value="enregistrement" className="bg-gray-700">Enregistrement</option>
                <option value="mixage" className="bg-gray-700">Mixage</option>
                <option value="mastering" className="bg-gray-700">Mastering</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-date" className="block text-sm font-medium text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="edit-date"
                  name="date"
                  required
                  value={editFormData.date}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="edit-time" className="block text-sm font-medium text-gray-300 mb-2">
                  Heure *
                </label>
                <input
                  type="time"
                  id="edit-time"
                  name="time"
                  required
                  value={editFormData.time}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-300 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  required
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  required
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-300 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                id="edit-phone"
                name="phone"
                required
                value={editFormData.phone}
                onChange={handleEditFormChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="+33 6 XX XX XX XX"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                Modifier la réservation
              </button>
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
