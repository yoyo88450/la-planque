const { PrismaClient } = require('@prisma/client');
const { categories, products, mockReservations } = require('../src/data/mockData.ts');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Début du seeding des données...');

    // Créer les catégories
    console.log('Création des catégories...');
    for (const categoryName of categories) {
      await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
    }
    console.log('Catégories créées avec succès');

    // Récupérer les catégories pour avoir leurs IDs
    const dbCategories = await prisma.category.findMany();
    const categoryMap = dbCategories.reduce((map, cat) => {
      map[cat.name] = cat.id;
      return map;
    }, {});

    // Créer les produits
    console.log('Création des produits...');
    for (const product of products) {
      const categoryId = categoryMap[product.category];
      if (!categoryId) {
        console.warn(`Catégorie "${product.category}" non trouvée pour le produit "${product.name}"`);
        continue;
      }

      await prisma.product.upsert({
        where: { id: product.id },
        update: {},
        create: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          inStock: product.inStock,
          categoryId: categoryId,
        },
      });
    }
    console.log('Produits créés avec succès');

    // Créer un utilisateur de test pour les réservations
    console.log('Création d\'un utilisateur de test...');
    const testUser = await prisma.user.upsert({
      where: { username: 'testuser' },
      update: {},
      create: {
        username: 'testuser',
        password: await require('bcrypt').hash('testpass', 10),
        role: 'user',
      },
    });

    // Créer les réservations
    console.log('Création des réservations...');
    for (const reservation of mockReservations) {
      await prisma.appointment.upsert({
        where: { id: reservation.id },
        update: {},
        create: {
          id: reservation.id,
          title: reservation.service ? `Réservation ${reservation.service}` : 'Réservation',
          description: reservation.message || null,
          date: new Date(reservation.date),
          duration: 60, // Durée par défaut de 60 minutes
          userId: testUser.id,
        },
      });
    }
    console.log('Réservations créées avec succès');

    console.log('Seeding terminé avec succès !');
  } catch (error) {
    console.error('Erreur lors du seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
