import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });

    const categories = await prisma.category.findMany();

    return NextResponse.json({
      products,
      categories
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, inStock, categoryId } = body;

    if (!name || !description || price === undefined || !categoryId) {
      return NextResponse.json(
        { error: 'Nom, description, prix et catégorie sont requis' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        inStock: inStock !== undefined ? inStock : true,
        categoryId
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
