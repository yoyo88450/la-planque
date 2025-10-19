const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🔄 Réinitialisation de la base de données...');

    // Supprimer toutes les données dans l'ordre inverse des dépendances
    console.log('Suppression des réservations...');
    await prisma.appointment.deleteMany();

    console.log('Suppression des produits...');
    await prisma.product.deleteMany();

    console.log('Suppression des artistes...');
    await prisma.artist.deleteMany();

    console.log('Suppression des catégories...');
    await prisma.category.deleteMany();

    console.log('Suppression des utilisateurs...');
    await prisma.user.deleteMany();

    console.log('Suppression des paramètres...');
    await prisma.settings.deleteMany();

    console.log('✅ Base de données réinitialisée avec succès !');
    console.log('ℹ️  Toutes les données ont été supprimées.');

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation de la base de données:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
