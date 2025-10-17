'use client';

import { useState, useEffect } from 'react';
import NavigationMenu from '../../../components/artiste_admin/NavigationMenu';
import ArtistsHeader from '../../../components/artiste_admin/ArtistsHeader';
import ArtistsGrid from '../../../components/artiste_admin/ArtistsGrid';
import AddEditArtistModal from '../../../components/artiste_admin/AddEditArtistModal';

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
      <NavigationMenu />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <ArtistsHeader onAddArtist={openAddModal} />

        <ArtistsGrid
          artists={artists}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddArtist={openAddModal}
        />
      </div>

      <AddEditArtistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingArtist={editingArtist}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
