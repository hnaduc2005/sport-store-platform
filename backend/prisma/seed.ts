import { PrismaClient, Role, DiscountType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const running = await prisma.category.upsert({
    where: { slug: 'running' },
    update: {},
    create: {
      name: 'Running',
      slug: 'running',
      description: 'Shoes, apparel, and accessories for daily running.',
      imageUrl:
        'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80',
    },
  });

  const training = await prisma.category.upsert({
    where: { slug: 'training' },
    update: {},
    create: {
      name: 'Training',
      slug: 'training',
      description: 'Durable gear for gym, cross-training, and team workouts.',
      imageUrl:
        'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1200&q=80',
    },
  });

  const nike = await prisma.brand.upsert({
    where: { slug: 'nike' },
    update: {},
    create: {
      name: 'Nike',
      slug: 'nike',
      description: 'Performance sportswear and training products.',
    },
  });

  const adidas = await prisma.brand.upsert({
    where: { slug: 'adidas' },
    update: {},
    create: {
      name: 'Adidas',
      slug: 'adidas',
      description: 'Classic athletic footwear, clothing, and gear.',
    },
  });

  await prisma.product.upsert({
    where: { slug: 'air-zoom-runner' },
    update: {},
    create: {
      name: 'Air Zoom Runner',
      slug: 'air-zoom-runner',
      sku: 'SHOE-NIKE-AZR',
      description: 'Lightweight running shoe with responsive cushioning.',
      price: '129.00',
      salePrice: '109.00',
      stock: 42,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
      ],
      categoryId: running.id,
      brandId: nike.id,
      variants: {
        create: [
          { name: 'Size 40 / Black', sku: 'SHOE-NIKE-AZR-40-BLK', size: '40', color: 'Black', stock: 12 },
          { name: 'Size 41 / White', sku: 'SHOE-NIKE-AZR-41-WHT', size: '41', color: 'White', stock: 10 },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: 'training-hoodie-pro' },
    update: {},
    create: {
      name: 'Training Hoodie Pro',
      slug: 'training-hoodie-pro',
      sku: 'APP-ADI-HOODIE-PRO',
      description: 'Breathable hoodie for warm-up, recovery, and travel.',
      price: '79.00',
      stock: 60,
      images: [
        'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80',
      ],
      categoryId: training.id,
      brandId: adidas.id,
      variants: {
        create: [
          { name: 'M / Navy', sku: 'APP-ADI-HOODIE-M-NVY', size: 'M', color: 'Navy', stock: 20 },
          { name: 'L / Grey', sku: 'APP-ADI-HOODIE-L-GRY', size: 'L', color: 'Grey', stock: 18 },
        ],
      },
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@sportstore.dev' },
    update: {},
    create: {
      email: 'customer@sportstore.dev',
      name: 'Demo Customer',
      password: 'change-me-after-adding-hashing',
      role: Role.CUSTOMER,
      cart: { create: {} },
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@sportstore.dev' },
    update: {},
    create: {
      email: 'admin@sportstore.dev',
      name: 'Demo Admin',
      password: 'change-me-after-adding-hashing',
      role: Role.ADMIN,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'SPORT10' },
    update: {},
    create: {
      code: 'SPORT10',
      description: '10 percent discount for demo checkout.',
      discountType: DiscountType.PERCENTAGE,
      value: '10',
      usageLimit: 100,
    },
  });

  const firstProduct = await prisma.product.findUnique({
    where: { slug: 'air-zoom-runner' },
  });

  if (firstProduct) {
    await prisma.favorite.upsert({
      where: {
        userId_productId: {
          userId: customer.id,
          productId: firstProduct.id,
        },
      },
      update: {},
      create: {
        userId: customer.id,
        productId: firstProduct.id,
      },
    });

    await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: customer.id,
          productId: firstProduct.id,
        },
      },
      update: {},
      create: {
        userId: customer.id,
        productId: firstProduct.id,
        rating: 5,
        comment: 'Comfortable shoe for everyday runs.',
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

