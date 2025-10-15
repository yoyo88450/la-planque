const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  try {
    // Hash du mot de passe "admin"
    const hashedPassword = await bcrypt.hash('admin', 10);

    // Créer l'utilisateur admin
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
      },
    });

    console.log('Utilisateur admin créé avec succès:', adminUser);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
