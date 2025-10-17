export default function Legend() {
  return (
    <div className="mt-4 md:mt-6 bg-gray-800 rounded-lg p-3 md:p-4 border border-gray-700">
      <h4 className="text-white font-medium mb-3 text-sm md:text-base">Légende</h4>
      <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-700/50 rounded"></div>
          <span className="text-gray-300">Libre</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-600 rounded"></div>
          <span className="text-gray-300">Réservé</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-green-600 rounded"></div>
          <span className="text-gray-300">Sélectionné</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-800/50 rounded"></div>
          <span className="text-gray-300">Passé</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-900/20 border border-blue-600/30 rounded"></div>
          <span className="text-gray-300">Aujourd'hui</span>
        </div>
      </div>
    </div>
  );
}
