interface ArtistsHeaderProps {
  onAddArtist: () => void;
}

export default function ArtistsHeader({ onAddArtist }: ArtistsHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6 md:mb-8">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Gestion des Artistes</h2>
        <p className="text-gray-400 text-sm md:text-base">Gérez les artistes affichés sur la page d'accueil</p>
      </div>
      <button
        onClick={onAddArtist}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Ajouter un artiste
      </button>
    </div>
  );
}
