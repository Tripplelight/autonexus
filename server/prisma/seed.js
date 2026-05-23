// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@autonexus.com' },
    update: {},
    create: {
      name: 'AutoNexus Admin',
      email: 'admin@autonexus.com',
      password: await bcrypt.hash('Admin@1234', 12),
      role: 'SUPER_ADMIN'
    }
  });

  // Demo Dealer
  const dealerUser = await prisma.user.upsert({
    where: { email: 'dealer@autonexus.com' },
    update: {},
    create: {
      name: 'Demo Dealer',
      email: 'dealer@autonexus.com',
      password: await bcrypt.hash('Dealer@1234', 12),
      role: 'DEALER',
      phone: '0712345678'
    }
  });

  let dealer = await prisma.dealer.findUnique({ where: { userId: dealerUser.id } });
  if (!dealer) {
    dealer = await prisma.dealer.create({
      data: {
        userId: dealerUser.id,
        businessName: 'Demo Motors Nairobi',
        phone: '0712345678',
        location: 'Westlands, Nairobi',
        description: 'Premium car dealer in Nairobi.',
        subscriptionStatus: 'ACTIVE',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // Sample cars linked to dealer
  const cars = [
    { make: 'Toyota', model: 'Land Cruiser V8', year: 2022, price: 12500000, mileage: 35000, condition: 'USED', bodyType: 'SUV', fuel: 'DIESEL', transmission: 'AUTOMATIC', color: 'Pearl White', engine: '4.5L V8 Twin Turbo', horsepower: 272, description: 'Iconic full-size SUV. Bulletproof reliability meets off-road dominance. Perfect for Kenya\'s diverse terrain.', featured: true, images: [] },
    { make: 'Mercedes-Benz', model: 'GLE 350', year: 2023, price: 18000000, mileage: 12000, condition: 'CERTIFIED', bodyType: 'SUV', fuel: 'PETROL', transmission: 'AUTOMATIC', color: 'Obsidian Black', engine: '3.0L Inline-6 Turbo', horsepower: 362, description: 'Luxury meets performance. Air suspension, Burmester sound, AMG Line exterior.', featured: true, images: [] },
    { make: 'Toyota', model: 'Hilux GR Sport', year: 2023, price: 7200000, mileage: 8000, condition: 'CERTIFIED', bodyType: 'TRUCK', fuel: 'DIESEL', transmission: 'AUTOMATIC', color: 'Oxide Bronze', engine: '2.8L 1GD-FTV', horsepower: 204, description: 'Gazoo Racing touches on the world\'s most trusted pickup.', featured: false, images: [] },
    { make: 'Mazda', model: 'CX-5', year: 2022, price: 4800000, mileage: 28000, condition: 'USED', bodyType: 'SUV', fuel: 'PETROL', transmission: 'AUTOMATIC', color: 'Soul Red Crystal', engine: '2.5L SkyActiv-G', horsepower: 187, description: 'Premium compact SUV with Mazda\'s signature Kodo design.', featured: false, images: [] },
    { make: 'Subaru', model: 'Forester XT', year: 2021, price: 3900000, mileage: 44000, condition: 'USED', bodyType: 'SUV', fuel: 'PETROL', transmission: 'AUTOMATIC', color: 'Ice Silver', engine: '2.0L Boxer Turbo', horsepower: 177, description: 'Symmetrical AWD, EyeSight driver assist, panoramic sunroof.', featured: false, images: [] },
    { make: 'BMW', model: '3 Series 330i', year: 2023, price: 9500000, mileage: 5000, condition: 'NEW', bodyType: 'SEDAN', fuel: 'PETROL', transmission: 'AUTOMATIC', color: 'Portimao Blue', engine: '2.0L TwinPower Turbo', horsepower: 255, description: 'The benchmark sports sedan. Live Cockpit Pro, adaptive M suspension.', featured: true, images: [] }
  ];

  for (const car of cars) {
    await prisma.car.create({ data: { ...car, dealerId: dealer.id } });
  }

  console.log('✅ Seed complete');
  console.log('   Super Admin:', admin.email, '/ Admin@1234');
  console.log('   Demo Dealer:', dealerUser.email, '/ Dealer@1234');
  console.log('   Cars seeded:', cars.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());