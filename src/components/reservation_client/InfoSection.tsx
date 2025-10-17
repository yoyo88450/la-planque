export default function InfoSection() {
  return (
    <div className="mt-12 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-2xl p-8">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Informations importantes
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300">Les réservations sont confirmées sous 24h</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300">Apportez vos instruments et partitions</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300">Annulation gratuite jusqu'à 48h avant</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300">Équipements professionnels fournis</p>
          </div>
        </div>
      </div>
    </div>
  );
}
