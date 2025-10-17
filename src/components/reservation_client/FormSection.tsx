interface FormSectionProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function FormSection({ formData, handleChange, onSubmit }: FormSectionProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
      <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
        <svg className="w-6 h-6 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Informations de réservation
      </h2>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">
              Service souhaité *
            </label>
            <select
              id="service"
              name="service"
              required
              value={formData.service}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="" className="bg-gray-700">Choisir un service</option>
              <option value="enregistrement" className="bg-gray-700">Enregistrement</option>
              <option value="mixage" className="bg-gray-700">Mixage</option>
              <option value="mastering" className="bg-gray-700">Mastering</option>
            </select>
          </div>

          {/* Selected Date/Times Display */}
          {(formData.date && formData.times.length > 0) && (
            <div className="p-4 bg-blue-900/30 border border-blue-600/50 rounded-xl">
              <div className="flex items-center space-x-2 text-blue-300 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">
                  {formData.times.length === 1 ? 'Créneau sélectionné' : `${formData.times.length} créneaux sélectionnés`}
                </span>
              </div>
              <p className="text-white font-semibold mb-2">
                {new Date(formData.date).toLocaleDateString('fr-FR')}
              </p>
              <div className="flex flex-wrap gap-2">
                {formData.times.map((time: string) => (
                  <span key={time} className="px-3 py-1 bg-blue-600/50 text-blue-200 rounded-lg text-sm">
                    {time}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="+33 6 XX XX XX XX"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
              Téléphone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="+33 6 XX XX XX XX"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
              Message (optionnel)
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              value={formData.message}
              onChange={handleChange}
              placeholder="Informations supplémentaires, demandes spéciales..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!formData.date || formData.times.length === 0 || !formData.service}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Confirmer {formData.times.length > 1 ? `les ${formData.times.length} réservations` : 'la réservation'}
          </span>
        </button>
      </form>
    </div>
  );
}
