import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Retourner les informations du formulaire de contact
    const contactForm = {
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nom' },
        { name: 'email', type: 'email', required: true, label: 'Email' },
        { name: 'phone', type: 'tel', required: false, label: 'Téléphone' },
        { name: 'subject', type: 'text', required: true, label: 'Sujet' },
        { name: 'message', type: 'textarea', required: true, label: 'Message' }
      ]
    };

    return NextResponse.json(contactForm);
  } catch (error) {
    console.error('Erreur lors de la récupération du formulaire contact:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Ici vous pouvez ajouter la logique d'envoi d'email ou sauvegarde en base
    console.log('Nouveau message de contact:', body);

    // Validation basique
    const { name, email, message } = body;
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Simulation d'envoi réussi
    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
