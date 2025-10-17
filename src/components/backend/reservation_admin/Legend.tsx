export default function Legend() {
  return (
    <div className="mt-4 md:mt-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-3 md:p-4 border border-gray-700 shadow-xl backdrop-blur-sm">
      <h4 className="text-white font-medium mb-3 text-sm md:text-base">Légende</h4>
      <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-gray-700/50 to-gray-600/50 rounded shadow-md"></div>
          <span className="text-gray-300">Libre</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded shadow-lg"></div>
          <span className="text-gray-300">Réservé</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-green-600 to-green-700 rounded shadow-lg"></div>
          <span className="text-gray-300">Sélectionné</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-800/50 rounded"></div>
          <span className="text-gray-300">Passé</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-900/20 border border-blue-600/30 rounded shadow-md"></div>
          <span className="text-gray-300">Aujourd'hui</span>
        </div>
      </div>
    </div>
  );
}
