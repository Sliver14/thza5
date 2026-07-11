const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const qr = require('qrcode');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create default admin user: admin / admin123
  const existingAdmin = await prisma.admin.findFirst({
    where: { username: 'admin' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
      },
    });
    console.log('Default admin created successfully! User: admin | Pass: admin123');
  } else {
    console.log('Admin user already exists.');
  }

  // Create a default program for initial test
  const existingProgram = await prisma.program.findUnique({
    where: { slug: 'money-night-4' },
  });

  // Dynamically generate QR code for seeded item
  const registerUrl = `http://localhost:3000/register/money-night-4`;
  const qrCodeUrl = await qr.toDataURL(registerUrl, {
    color: {
      dark: '#c8007c',
      light: '#ffffff'
    },
    width: 400,
    margin: 2
  });

  if (!existingProgram) {
    await prisma.program.create({
      data: {
        title: 'Money Night 4.0',
        description: 'The Rain of the Supernatural. Aligning your finances with kingdom wealth.',
        slug: 'money-night-4',
        startDate: new Date('2026-08-15T18:00:00Z'),
        endDate: new Date('2026-08-15T21:00:00Z'),
        venue: 'The Haven Zone A5 Main Auditorium',
        flyerUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
        qrCodeUrl,
        status: 'UPCOMING',
        customFields: JSON.stringify([
          { key: 'accommodation', label: 'Do you require accommodation?', type: 'select', options: ['Yes', 'No'], required: true },
          { key: 'dietary', label: 'Any dietary restrictions?', type: 'text', required: false }
        ]),
      },
    });
    console.log('Sample program "Money Night 4.0" created!');
  }

  // Create default member account for initial test: member@thza5.com / member123
  const existingMember = await prisma.member.findUnique({
    where: { email: 'member@thza5.com' },
  });

  if (!existingMember) {
    const memberPassword = await bcrypt.hash('member123', 10);
    await prisma.member.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'member@thza5.com',
        phone: '+2348011112222',
        password: memberPassword,
        kcUsername: 'johndoe_kc',
        chapter: 'Lagos Chapter',
        careGroup: 'CG 3',
        role: 'Executive Member',
        occupation: 'Software Engineer',
      },
    });
    console.log('Sample member created successfully! User: member@thza5.com | Pass: member123');
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
