import { DiscountType, PaymentMethod, PaymentStatus, PrismaClient, Role } from '@prisma/client';

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

  const basketball = await prisma.category.upsert({
    where: { slug: 'basketball' },
    update: {},
    create: {
      name: 'Basketball',
      slug: 'basketball',
      description: 'Basketball shoes, jerseys, balls, and court accessories.',
      imageUrl:
        'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80',
    },
  });

  const football = await prisma.category.upsert({
    where: { slug: 'football' },
    update: {},
    create: {
      name: 'Football',
      slug: 'football',
      description: 'Football boots, balls, and gear for turf and grass fields.',
      imageUrl:
        'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80',
    },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Gym bags, bottles, socks, yoga mats, and daily sport essentials.',
      imageUrl:
        'https://images.unsplash.com/photo-1591382386627-349b692688ff?auto=format&fit=crop&w=1200&q=80',
    },
  });

  const puma = await prisma.brand.upsert({
    where: { slug: 'puma' },
    update: {},
    create: {
      name: 'Puma',
      slug: 'puma',
      description: 'Modern sport lifestyle products.',
    },
  });

  const wilson = await prisma.brand.upsert({
    where: { slug: 'wilson' },
    update: {},
    create: {
      name: 'Wilson',
      slug: 'wilson',
      description: 'Ball sports equipment and accessories.',
    },
  });

  const underArmour = await prisma.brand.upsert({
    where: { slug: 'under-armour' },
    update: {},
    create: {
      name: 'Under Armour',
      slug: 'under-armour',
      description: 'Training apparel and durable sport accessories.',
    },
  });

  await prisma.product.upsert({
    where: { slug: 'air-zoom-runner' },
    update: {
      name: 'Nike Air Zoom Runner',
      description: 'Lightweight running shoe with responsive cushioning for daily 5K and long runs.',
      price: '2890000',
      salePrice: '2490000',
      stock: 42,
      sold: 168,
    },
    create: {
      name: 'Nike Air Zoom Runner',
      slug: 'air-zoom-runner',
      sku: 'SHOE-NIKE-AZR',
      description: 'Lightweight running shoe with responsive cushioning for daily 5K and long runs.',
      price: '2890000',
      salePrice: '2490000',
      stock: 42,
      sold: 168,
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
    update: {
      name: 'Training Hoodie Pro',
      description: 'Breathable hoodie for warm-up, recovery, and travel.',
      price: '990000',
      salePrice: '790000',
      stock: 60,
      sold: 210,
    },
    create: {
      name: 'Training Hoodie Pro',
      slug: 'training-hoodie-pro',
      sku: 'APP-ADI-HOODIE-PRO',
      description: 'Breathable hoodie for warm-up, recovery, and travel.',
      price: '990000',
      salePrice: '790000',
      stock: 60,
      sold: 210,
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

  const additionalProducts = [
    {
      name: 'Adidas Ultraboost Tempo',
      slug: 'adidas-ultraboost-tempo',
      sku: 'SHOE-ADI-UBT',
      description: 'Premium running shoe with soft cushioning and a flexible upper.',
      price: '3190000',
      salePrice: null,
      stock: 30,
      sold: 121,
      categoryId: running.id,
      brandId: adidas.id,
      image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Puma Velocity Nitro',
      slug: 'puma-velocity-nitro',
      sku: 'SHOE-PUMA-VN',
      description: 'Lightweight trainer for tempo days and everyday mileage.',
      price: '2590000',
      salePrice: '2090000',
      stock: 25,
      sold: 95,
      categoryId: running.id,
      brandId: puma.id,
      image: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'UA Flex Gym Shorts',
      slug: 'ua-flex-gym-shorts',
      sku: 'APP-UA-SHORT-FLEX',
      description: 'Quick-dry shorts with secure pockets for intense training sessions.',
      price: '590000',
      salePrice: null,
      stock: 74,
      sold: 188,
      categoryId: training.id,
      brandId: underArmour.id,
      image: 'https://images.unsplash.com/photo-1506629905607-d9e297d58c9f?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Yoga Balance Mat 6mm',
      slug: 'yoga-balance-mat-6mm',
      sku: 'ACC-UA-YOGA-6MM',
      description: 'Anti-slip 6mm mat that supports wrists and knees during yoga practice.',
      price: '450000',
      salePrice: '390000',
      stock: 38,
      sold: 80,
      categoryId: training.id,
      brandId: underArmour.id,
      image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Nike Mercurial Turf Boots',
      slug: 'nike-mercurial-turf-boots',
      sku: 'FB-NIKE-MT',
      description: 'Turf football boots with grippy outsole and locked-in upper.',
      price: '1990000',
      salePrice: '1690000',
      stock: 33,
      sold: 144,
      categoryId: football.id,
      brandId: nike.id,
      image: 'https://images.unsplash.com/photo-1600679472829-3044539ce8ed?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Adidas League Football',
      slug: 'adidas-league-football',
      sku: 'BALL-ADI-LEAGUE',
      description: 'Durable machine-stitched football for training and weekend matches.',
      price: '650000',
      salePrice: null,
      stock: 55,
      sold: 116,
      categoryId: football.id,
      brandId: adidas.id,
      image: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Wilson Court Grip Basketball',
      slug: 'wilson-court-grip-basketball',
      sku: 'BALL-WIL-COURT',
      description: 'Reliable grip and bounce for indoor and outdoor basketball courts.',
      price: '790000',
      salePrice: '690000',
      stock: 47,
      sold: 132,
      categoryId: basketball.id,
      brandId: wilson.id,
      image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Puma Street Dunk Jersey',
      slug: 'puma-street-dunk-jersey',
      sku: 'APP-PUMA-DUNK',
      description: 'Breathable mesh basketball jersey with a relaxed street-ready fit.',
      price: '720000',
      salePrice: null,
      stock: 44,
      sold: 77,
      categoryId: basketball.id,
      brandId: puma.id,
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Puma Flex Gym Bag 35L',
      slug: 'puma-flex-gym-bag-35l',
      sku: 'BAG-PUMA-FLEX35',
      description: 'Spacious gym bag with shoe compartment and padded shoulder strap.',
      price: '890000',
      salePrice: '760000',
      stock: 29,
      sold: 101,
      categoryId: accessories.id,
      brandId: puma.id,
      image: 'https://images.unsplash.com/photo-1591382386627-349b692688ff?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'UA Sport Hydrate Bottle',
      slug: 'ua-sport-hydrate-bottle',
      sku: 'ACC-UA-HYDRATE',
      description: 'Leak-resistant 750ml bottle with easy-grip body for training days.',
      price: '320000',
      salePrice: '260000',
      stock: 120,
      sold: 245,
      categoryId: accessories.id,
      brandId: underArmour.id,
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  for (const product of additionalProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        sku: product.sku,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
        sold: product.sold,
        images: [product.image],
        categoryId: product.categoryId,
        brandId: product.brandId,
        isActive: true,
      },
      create: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
        sold: product.sold,
        images: [product.image],
        categoryId: product.categoryId,
        brandId: product.brandId,
        variants: {
          create: [
            { name: 'Default', sku: `${product.sku}-DEFAULT`, stock: product.stock },
            { name: 'Limited', sku: `${product.sku}-LIMITED`, stock: Math.max(3, Math.floor(product.stock / 4)) },
          ],
        },
      },
    });
  }

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
