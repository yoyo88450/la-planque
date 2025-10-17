const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Données fictives pour les artistes
const fakeArtists = [
  {
    name: 'Luna Eclipse',
    description: 'Artiste émergente spécialisée dans la musique électronique expérimentale. Ses compositions mélangent des sons synthétiques avec des éléments acoustiques traditionnels.',
    profileImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    albumCover: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  },
  {
    name: 'Marcus Storm',
    description: 'Guitariste virtuose et compositeur de rock alternatif. Connu pour ses riffs puissants et ses textes introspectifs sur la société moderne.',
    profileImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    albumCover: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  },
  {
    name: 'Sofia Rivera',
    description: 'Chanteuse et pianiste de jazz contemporain. Ses performances live sont légendaires, mélangeant des standards classiques avec des compositions originales.',
    profileImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    albumCover: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  },
  {
    name: 'DJ Vortex',
    description: 'Producteur et DJ spécialisé dans la musique électronique underground. Ses sets sont connus pour leur énergie contagieuse et leurs transitions innovantes.',
    profileImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    albumCover: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
  }
];

// Données fictives pour les produits
const fakeProducts = [
  {
    name: 'Vinyle Classique 33T',
    description: 'Vinyle de haute qualité 33 tours, parfait pour les audiophiles. Format standard avec pochette incluse.',
    price: 25.99,
    categoryName: 'Vinyles',
    inStock: true
  },
  {
    name: 'CD Audio Premium',
    description: 'CD audio de qualité supérieure avec mastering professionnel. Compatible avec tous les lecteurs CD.',
    price: 15.99,
    categoryName: 'CD',
    inStock: true
  },
  {
    name: 'Cassette Audio Vintage',
    description: 'Cassette audio rétro avec son analogique chaleureux. Idéale pour les collectionneurs.',
    price: 12.99,
    categoryName: 'Cassettes',
    inStock: true
  },
  {
    name: 'T-shirt Concert Officiel',
    description: 'T-shirt 100% coton avec impression de qualité. Disponible en plusieurs tailles.',
    price: 29.99,
    categoryName: 'Goodies',
    inStock: true
  },
  {
    name: 'Casque Audio Professionnel',
    description: 'Casque de monitoring professionnel avec réduction de bruit active. Parfait pour le studio.',
    price: 199.99,
    categoryName: 'Accessoires',
    inStock: true
  },
  {
    name: 'Vinyle Collector Édition Limitée',
    description: 'Édition limitée avec artwork exclusif et mastering audiophile. Numéroté et signé par l\'artiste.',
    price: 49.99,
    categoryName: 'Vinyles',
    inStock: false
  },
  {
    name: 'CD Box Set 3 Disques',
    description: 'Coffret collector contenant 3 CD avec bonus tracks et livret exclusif.',
    price: 39.99,
    categoryName: 'CD',
    inStock: true
  },
  {
    name: 'Cassette Mixtape Personnalisée',
    description: 'Cassette avec compilation personnalisée selon vos goûts musicaux.',
    price: 18.99,
    categoryName: 'Cassettes',
    inStock: true
  },
  {
    name: 'Poster Concert Format A2',
    description: 'Poster officiel du concert en format A2, parfait pour décorer votre intérieur.',
    price: 9.99,
    categoryName: 'Goodies',
    inStock: true
  },
  {
    name: 'Interface Audio USB',
    description: 'Interface audio professionnelle 2 entrées/2 sorties avec préamplis micro de qualité studio.',
    price: 149.99,
    categoryName: 'Accessoires',
    inStock: true
  }
];

async function initializeDatabase() {
  try {
    console.log('🚀 Initialisation de la base de données...');

    // Générer le client Prisma
    console.log('Génération du client Prisma...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Client Prisma généré avec succès');
    } catch (error) {
      console.log('ℹ️  Erreur lors de la génération du client:', error.message);
    }

    // Pousser le schéma Prisma pour créer les tables
    console.log('Synchronisation du schéma Prisma...');
    try {
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('✅ Schéma synchronisé avec succès');
    } catch (error) {
      console.log('ℹ️  Le schéma est déjà synchronisé ou une erreur est survenue:', error.message);
    }

    // Créer quelques catégories de base
    console.log('Création des catégories de base...');
    const categories = [
      'Vinyles',
      'CD',
      'Cassettes',
      'Goodies',
      'Accessoires'
    ];

    const createdCategories = [];
    for (const categoryName of categories) {
      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
      createdCategories.push(category);
    }
    console.log('✅ Catégories créées:', categories.join(', '));

    // Créer des artistes fictifs
    console.log('Création des artistes fictifs...');
    const createdArtists = [];
    for (const artistData of fakeArtists) {
      const artist = await prisma.artist.create({
        data: artistData
      });
      createdArtists.push(artist);
    }
    console.log('✅ Artistes créés:', createdArtists.length);

    // Créer des produits fictifs
    console.log('Création des produits fictifs...');
    const createdProducts = [];
    for (const productData of fakeProducts) {
      const category = createdCategories.find(cat => cat.name === productData.categoryName);
      if (category) {
        const { categoryName, ...productWithoutCategoryName } = productData;
        const product = await prisma.product.create({
          data: {
            ...productWithoutCategoryName,
            categoryId: category.id
          }
        });
        createdProducts.push(product);
      }
    }
    console.log('✅ Produits créés:', createdProducts.length);

    console.log('🎉 Base de données initialisée avec succès !');
    console.log('');
    console.log('📋 Résumé:');
    console.log('   - Catégories créées:', createdCategories.length);
    console.log('   - Artistes créés:', createdArtists.length);
    console.log('   - Produits créés:', createdProducts.length);
    console.log('');
    console.log('💡 Vous pouvez maintenant utiliser l\'application avec des données fictives.');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initializeDatabase();
