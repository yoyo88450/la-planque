import { NextRequest, NextResponse } from 'next/server';
import { products } from '../../../data/mockData';

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let filteredProducts = products;

    if (category && category !== 'all') {
      filteredProducts = products.filter(product => product.category === category);
    }

    return NextResponse.json(filteredProducts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    const requiredFields = ['name', 'description', 'price', 'category'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create new product
    const newProduct = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      image: body.image || '/images/default-product.jpg',
      category: body.category,
      inStock: body.inStock !== undefined ? body.inStock : true
    };

    // In a real app, this would be saved to a database
    products.push(newProduct);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
