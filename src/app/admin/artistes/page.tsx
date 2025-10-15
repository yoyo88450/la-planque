'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Artist {
  id: string;
  name: string;
  description: string;
  profileImage: string;
  albumCover: string;
}

export default function ArtistsAdminPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    profileImage: '',
    albumCover: ''
  });
  const [loading, setLoading] = useState(false);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'profileImage' | 'albumCover') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setFormData(prev => ({ ...prev, [field]: base64 }));
      } catch (error) {
        alert('Erreur lors de la conversion de l\'image');
      }
    }
  };

  // Load artists from API
  const loadArtists = async () => {
    try {
      const response = await fetch('/api/admin/artists');
      if (response.ok) {
        const data = await response.json();
        setArtists(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des artistes:', error);
    }
  };

  useEffect(() => {
    loadArtists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingArtist
        ? `/api/admin/artists/${editingArtist.id}`
        : '/api/admin/artists';

      const method = editingArtist ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadArtists();
        setFormData({ name: '', description: '', profileImage: '', albumCover: '' });
        setEditingArtist(null);
        setIsModalOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (artist: Artist) => {
    setEditingArtist(artist);
    setFormData({
      name: artist.name,
      description: artist.description,
      profileImage: artist.profileImage,
      albumCover: artist.albumCover
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet artiste ?')) return;

    try {
      const response = await fetch(`/api/admin/artists/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadArtists();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const openAddModal = () => {
    setEditingArtist(null);
    setFormData({ name: '', description: '', profileImage: '', albumCover: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Custom Navigation Menu */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg md:text-xl font-bold text-white">Administration La Planque</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/admin"
                className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Tableau de bord
              </Link>
              <Link
                href="/admin/reservations"
                className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Réservations
              </Link>
              <Link
                href="/admin/artistes"
                className="text-white hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Artistes
              </Link>
              <Link
                href="/admin/boutique"
                className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Boutique
              </Link>
              <button
                onClick={() => window.location.href = '/admin'}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
              >
                Déconnexion
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => {}}
                className="text-white hover:text-gray-300 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Gestion des Artistes</h2>
            <p className="text-gray-400 text-sm md:text-base">Gérez les artistes affichés sur la page d'accueil</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Ajouter un artiste
          </button>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <div key={artist.id} className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
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
                  onClick={() => handleEdit(artist)}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(artist.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {artists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Aucun artiste ajouté pour le moment.</p>
            <button
              onClick={openAddModal}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Ajouter le premier artiste
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingArtist ? 'Modifier l\'artiste' : 'Ajouter un artiste'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nom de l'artiste *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Image de profil *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profileImage')}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  required={!editingArtist}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Pochette d'album *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'albumCover')}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  required={!editingArtist}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sauvegarde...' : (editingArtist ? 'Modifier' : 'Ajouter')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
