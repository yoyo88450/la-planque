import ArtistCard from './ArtistCard';

interface Artist {
  id: string;
  name: string;
  description: string;
  profileImage: string;
  albumCover: string;
}

interface ArtistsGridProps {
  artists: Artist[];
  onEdit: (artist: Artist) => void;
  onDelete: (id: string) => void;
  onAddArtist: () => void;
}

export default function ArtistsGrid({ artists, onEdit, onDelete, onAddArtist }: ArtistsGridProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {artists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Aucun artiste ajouté pour le moment.</p>
          <button
            onClick={onAddArtist}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Ajouter le premier artiste
          </button>
        </div>
      )}
    </>
  );
}
