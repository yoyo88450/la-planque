import Image from 'next/image';

interface Artist {
  id: string;
  name: string;
  description: string;
  profileImage: string;
  albumCover: string;
}

interface ArtistCardProps {
  artist: Artist;
  onEdit: (artist: Artist) => void;
  onDelete: (id: string) => void;
}

export default function ArtistCard({ artist, onEdit, onDelete }: ArtistCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
      <div className="flex items-center space-x-4 mb-4">
        <Image
          src={artist.profileImage || '/placeholder-avatar.png'}
          alt={artist.name}
          width={60}
          height={60}
          className="rounded-full object-cover"
        />
        <div>
          <h3 className="text-lg font-semibold text-white">{artist.name}</h3>
        </div>
      </div>

      <div className="mb-4">
        <Image
          src={artist.albumCover || '/placeholder-album.png'}
          alt={`Album de ${artist.name}`}
          width={200}
          height={200}
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-3">{artist.description}</p>

      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(artist)}
          className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
        >
          Modifier
        </button>
        <button
          onClick={() => onDelete(artist.id)}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
