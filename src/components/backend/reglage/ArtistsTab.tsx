'use client';

import { useState, useEffect } from 'react';
import ArtistsHeader from '../artiste_admin/ArtistsHeader';
import ArtistsGrid from '../artiste_admin/ArtistsGrid';
import AddEditArtistModal from '../artiste_admin/AddEditArtistModal';

interface Artist {
  id: string;
  name: string;
  description: string;
  profileImage: string;
  albumCover: string;
}

export default function ArtistsTab() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [artistFormData, setArtistFormData] = useState({
    name: '',
    description: '',
    profileImage: '',
    albumCover: ''
  });
  const [artistLoading, setArtistLoading] = useState(false);

  // Load artists
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

  // Artists handlers
  const handleArtistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setArtistLoading(true);

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
        body: JSON.stringify(artistFormData),
      });

      if (response.ok) {
        await loadArtists();
        setArtistFormData({ name: '', description: '', profileImage: '', albumCover: '' });
        setEditingArtist(null);
        setIsArtistModalOpen(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setArtistLoading(false);
    }
  };

  const handleEditArtist = (artist: Artist) => {
    setEditingArtist(artist);
    setArtistFormData({
      name: artist.name,
      description: artist.description,
      profileImage: artist.profileImage,
      albumCover: artist.albumCover
    });
    setIsArtistModalOpen(true);
  };

  const handleDeleteArtist = async (id: string) => {
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

  const openAddArtistModal = () => {
    setEditingArtist(null);
    setArtistFormData({ name: '', description: '', profileImage: '', albumCover: '' });
    setIsArtistModalOpen(true);
  };

  return (
    <div>
      <ArtistsHeader onAddArtist={openAddArtistModal} />

      <ArtistsGrid
        artists={artists}
        onEdit={handleEditArtist}
        onDelete={handleDeleteArtist}
        onAddArtist={openAddArtistModal}
      />

      <AddEditArtistModal
        isOpen={isArtistModalOpen}
        onClose={() => setIsArtistModalOpen(false)}
        editingArtist={editingArtist}
        formData={artistFormData}
        setFormData={setArtistFormData}
        onSubmit={handleArtistSubmit}
        loading={artistLoading}
      />
    </div>
  );
}
