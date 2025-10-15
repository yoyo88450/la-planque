const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();

  try {
    console.log('Checking users...');
    const users = await prisma.user.findMany();
    console.log('Users:', users);

    console.log('Checking appointments...');
    const appointments = await prisma.appointment.findMany();
    console.log('Appointments:', appointments);

    console.log('Checking categories...');
    const categories = await prisma.category.findMany();
    console.log('Categories:', categories);

    console.log('Checking products...');
    const products = await prisma.product.findMany();
    console.log('Products:', products);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
