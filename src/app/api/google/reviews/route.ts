import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupération des informations Google depuis la BDD
    const settings = await prisma.settings.findFirst();
    const apiKey = settings?.googleApiKey; // Utiliser l'API key pour Places API
    const placeId = settings?.googlePlaceId;

    console.log('Google settings:', { apiKey: apiKey ? 'configured' : 'missing', placeId: placeId ? 'configured' : 'missing' });

    if (!apiKey || !placeId) {
      console.warn('Accès Google non configuré correctement, aucun avis récupéré');
      return NextResponse.json({ reviews: [] });
    }

    // Appel de l'API Google Places pour les avis en utilisant placeId
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`;
    console.log('Fetching Google Places API:', url.replace(apiKey, '[API_KEY]'));

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Google API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API Google Business:', response.status, errorText);
      return NextResponse.json({ reviews: [] });
    }

    const data = await response.json();
    console.log('Google API response data:', JSON.stringify(data, null, 2));

    // Transformation des avis Google Places API
    const reviews = (data.result?.reviews || []).map((review: any) => ({
      id: review.time + '_' + review.author_name, // Créer un ID unique
      author_name: review.author_name || 'Anonyme',
      rating: review.rating || 0,
      text: review.text || 'Aucun commentaire',
      time: review.time || Date.now() / 1000,
      relative_time_description: review.relative_time_description || 'Récemment',
    }));

    console.log('Transformed reviews:', reviews.length);

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Erreur serveur lors de la récupération des avis Google:', error);
    return NextResponse.json({ reviews: [] });
  }
}
