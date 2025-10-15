import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupérer tous les produits avec leurs catégories
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });

    // Récupérer toutes les catégories
    const categories = await prisma.category.findMany();

    return NextResponse.json({
      products,
      categories: categories.map(cat => cat.name)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
