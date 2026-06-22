export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  _count?: { products: number };
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  _count?: { products: number };
};

export type Review = {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  isVisible?: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email?: string;
    avatarUrl?: string | null;
  };
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  price: number | string;
  salePrice?: number | string | null;
  stock: number;
  sold?: number;
  images: string[];
  image?: string;
  isActive?: boolean;
  categoryId?: string;
  brandId?: string;
  category: Category | string;
  brand: Brand | string;
  reviews?: Review[];
  createdAt?: string;
};

export type Order = {
  id: string;
  code: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  total: number | string;
  customerName: string;
  phone: string;
  address: string;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    unitPrice: number | string;
    quantity: number;
    total: number | string;
  }>;
};

export type ContactFeedback = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'RESOLVED';
  createdAt: string;
};

export const categories: Category[] = [
  {
    id: 'cat-running',
    name: 'Giày chạy bộ',
    slug: 'running',
    description: 'Giày nhẹ, êm và bám đường cho chạy bộ hằng ngày.',
    imageUrl: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80',
    _count: { products: 3 },
  },
  {
    id: 'cat-training',
    name: 'Tập luyện',
    slug: 'training',
    description: 'Trang phục và dụng cụ cho gym, yoga, cross-training.',
    imageUrl: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=900&q=80',
    _count: { products: 3 },
  },
  {
    id: 'cat-football',
    name: 'Bóng đá',
    slug: 'football',
    description: 'Giày, bóng và phụ kiện cho sân cỏ.',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=900&q=80',
    _count: { products: 2 },
  },
  {
    id: 'cat-basketball',
    name: 'Bóng rổ',
    slug: 'basketball',
    description: 'Bóng, áo thi đấu và phụ kiện cho sân bóng rổ.',
    imageUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=900&q=80',
    _count: { products: 2 },
  },
  {
    id: 'cat-accessories',
    name: 'Phụ kiện',
    slug: 'accessories',
    description: 'Túi, bình nước, vớ và phụ kiện thể thao.',
    imageUrl: 'https://images.unsplash.com/photo-1591382386627-349b692688ff?auto=format&fit=crop&w=900&q=80',
    _count: { products: 2 },
  },
];

export const brands: Brand[] = [
  { id: 'brand-nike', name: 'Nike', slug: 'nike', _count: { products: 2 } },
  { id: 'brand-adidas', name: 'Adidas', slug: 'adidas', _count: { products: 3 } },
  { id: 'brand-puma', name: 'Puma', slug: 'puma', _count: { products: 3 } },
  { id: 'brand-wilson', name: 'Wilson', slug: 'wilson', _count: { products: 1 } },
  { id: 'brand-ua', name: 'Under Armour', slug: 'under-armour', _count: { products: 3 } },
];

export const products: Product[] = [
  {
    id: 'prod-air-zoom',
    name: 'Nike Air Zoom Runner',
    slug: 'air-zoom-runner',
    sku: 'SHOE-NIKE-AZR',
    description: 'Đệm phản hồi nhanh, thân giày thoáng khí và đế bám tốt cho các buổi chạy dài.',
    price: 2890000,
    salePrice: 2490000,
    stock: 42,
    sold: 168,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'],
    category: categories[0],
    brand: brands[0],
  },
  {
    id: 'prod-ultraboost',
    name: 'Adidas Ultraboost Tempo',
    slug: 'adidas-ultraboost-tempo',
    sku: 'SHOE-ADI-UBT',
    description: 'Giày chạy bộ cao cấp với upper co giãn và đệm êm cho nhịp chạy ổn định.',
    price: 3190000,
    salePrice: null,
    stock: 30,
    sold: 121,
    images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80'],
    category: categories[0],
    brand: brands[1],
  },
  {
    id: 'prod-velocity',
    name: 'Puma Velocity Nitro',
    slug: 'puma-velocity-nitro',
    sku: 'SHOE-PUMA-VN',
    description: 'Thiết kế nhẹ, ổn định và phù hợp chạy tempo hoặc luyện tập hằng ngày.',
    price: 2590000,
    salePrice: 2090000,
    stock: 25,
    sold: 95,
    images: ['https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=900&q=80'],
    category: categories[0],
    brand: brands[2],
  },
  {
    id: 'prod-hoodie',
    name: 'Áo Hoodie Training Pro',
    slug: 'training-hoodie-pro',
    sku: 'APP-ADI-HOODIE-PRO',
    description: 'Áo hoodie co giãn nhẹ, giữ ấm vừa đủ cho khởi động, di chuyển và phục hồi.',
    price: 990000,
    salePrice: 790000,
    stock: 60,
    sold: 210,
    images: ['https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80'],
    category: categories[1],
    brand: brands[1],
  },
  {
    id: 'prod-shorts',
    name: 'Quần Short Gym Flex',
    slug: 'ua-flex-gym-shorts',
    sku: 'APP-UA-SHORT-FLEX',
    description: 'Chất liệu nhanh khô, cạp chắc và túi khóa kéo cho các bài tập cường độ cao.',
    price: 590000,
    salePrice: null,
    stock: 74,
    sold: 188,
    images: ['https://images.unsplash.com/photo-1506629905607-d9e297d58c9f?auto=format&fit=crop&w=900&q=80'],
    category: categories[1],
    brand: brands[4],
  },
  {
    id: 'prod-yoga',
    name: 'Thảm Yoga Balance 6mm',
    slug: 'yoga-balance-mat-6mm',
    sku: 'ACC-UA-YOGA-6MM',
    description: 'Bề mặt chống trượt, độ dày 6mm hỗ trợ cổ tay và đầu gối khi tập yoga.',
    price: 450000,
    salePrice: 390000,
    stock: 38,
    sold: 80,
    images: ['https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=900&q=80'],
    category: categories[1],
    brand: brands[4],
  },
  {
    id: 'prod-turf',
    name: 'Giày Đá Bóng Mercurial Turf',
    slug: 'nike-mercurial-turf-boots',
    sku: 'FB-NIKE-MT',
    description: 'Đế TF bám sân cỏ nhân tạo, upper ôm chân và hỗ trợ xoay trở nhanh.',
    price: 1990000,
    salePrice: 1690000,
    stock: 33,
    sold: 144,
    images: ['https://images.unsplash.com/photo-1600679472829-3044539ce8ed?auto=format&fit=crop&w=900&q=80'],
    category: categories[2],
    brand: brands[0],
  },
  {
    id: 'prod-football',
    name: 'Bóng Đá Adidas League',
    slug: 'adidas-league-football',
    sku: 'BALL-ADI-LEAGUE',
    description: 'Bóng may máy bền, giữ form tốt cho luyện tập và thi đấu phong trào.',
    price: 650000,
    salePrice: null,
    stock: 55,
    sold: 116,
    images: ['https://images.unsplash.com/photo-1614632537190-23e4146777db?auto=format&fit=crop&w=900&q=80'],
    category: categories[2],
    brand: brands[1],
  },
  {
    id: 'prod-basketball',
    name: 'Wilson Court Grip Basketball',
    slug: 'wilson-court-grip-basketball',
    sku: 'BALL-WIL-COURT',
    description: 'Bề mặt bám tay, độ nảy ổn định cho sân trong nhà và ngoài trời.',
    price: 790000,
    salePrice: 690000,
    stock: 47,
    sold: 132,
    images: ['https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=900&q=80'],
    category: categories[3],
    brand: brands[3],
  },
  {
    id: 'prod-jersey',
    name: 'Áo Bóng Rổ Street Dunk',
    slug: 'puma-street-dunk-jersey',
    sku: 'APP-PUMA-DUNK',
    description: 'Áo lưới thoáng khí, phom rộng thoải mái cho luyện tập và street style.',
    price: 720000,
    salePrice: null,
    stock: 44,
    sold: 77,
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'],
    category: categories[3],
    brand: brands[2],
  },
  {
    id: 'prod-bag',
    name: 'Túi Gym Flex 35L',
    slug: 'puma-flex-gym-bag-35l',
    sku: 'BAG-PUMA-FLEX35',
    description: 'Ngăn giày riêng, vải chống bám bẩn và dây đeo êm cho lịch tập bận rộn.',
    price: 890000,
    salePrice: 760000,
    stock: 29,
    sold: 101,
    images: ['https://images.unsplash.com/photo-1591382386627-349b692688ff?auto=format&fit=crop&w=900&q=80'],
    category: categories[4],
    brand: brands[2],
  },
  {
    id: 'prod-bottle',
    name: 'Bình Nước Sport Hydrate',
    slug: 'ua-sport-hydrate-bottle',
    sku: 'ACC-UA-HYDRATE',
    description: 'Dung tích 750ml, nắp chống rò và thân bình dễ cầm khi chạy hoặc tập gym.',
    price: 320000,
    salePrice: 260000,
    stock: 120,
    sold: 245,
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80'],
    category: categories[4],
    brand: brands[4],
  },
];

export const reviews: Review[] = [
  {
    id: 'review-1',
    userId: 'demo-customer',
    productId: 'prod-air-zoom',
    rating: 5,
    comment: 'Giày nhẹ, đi chạy buổi sáng rất êm. Shop đóng gói kỹ.',
    isVisible: true,
    createdAt: '2026-06-01T08:00:00.000Z',
    user: { id: 'demo-customer', name: 'Minh Anh', email: 'customer@sportstore.dev' },
  },
  {
    id: 'review-2',
    userId: 'demo-customer',
    productId: 'prod-hoodie',
    rating: 4,
    comment: 'Form đẹp, chất vải mềm. Màu ngoài đời giống hình.',
    isVisible: true,
    createdAt: '2026-06-02T08:00:00.000Z',
    user: { id: 'demo-customer', name: 'Hoàng Nam', email: 'customer@sportstore.dev' },
  },
];

products[0].reviews = [reviews[0]];
products[3].reviews = [reviews[1]];

export const demoOrders: Order[] = [
  {
    id: 'order-demo-1',
    code: 'SS-DEMO-1001',
    status: 'PROCESSING',
    paymentStatus: 'UNPAID',
    paymentMethod: 'COD',
    total: 2520000,
    customerName: 'Demo Customer',
    phone: '0901234567',
    address: '12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    createdAt: '2026-06-01T10:00:00.000Z',
    items: [
      {
        id: 'order-item-1',
        productId: 'prod-air-zoom',
        productName: 'Nike Air Zoom Runner',
        unitPrice: 2490000,
        quantity: 1,
        total: 2490000,
      },
    ],
  },
];

export const demoContacts: ContactFeedback[] = [
  {
    id: 'feedback-1',
    name: 'Nguyễn Minh Linh',
    email: 'linh.nguyen@example.com',
    phone: '0912345678',
    subject: 'Tư vấn chọn giày chạy bộ',
    message: 'Mình cần đôi giày chạy 5km mỗi ngày, shop tư vấn giúp size và mẫu phù hợp nhé.',
    status: 'NEW',
    createdAt: '2026-06-01T09:00:00.000Z',
  },
  {
    id: 'feedback-2',
    name: 'Trần Quốc Bảo',
    email: 'bao.tran@example.com',
    phone: '0987654321',
    subject: 'Chính sách đổi trả',
    message: 'Nếu mua giày đá bóng nhưng không vừa size thì thời gian đổi trả là bao lâu?',
    status: 'READ',
    createdAt: '2026-06-02T09:00:00.000Z',
  },
];

export const adminStats = [
  { label: 'Doanh thu', value: '24,8 triệu' },
  { label: 'Đơn hàng', value: '318' },
  { label: 'Khách hàng', value: '1.240' },
  { label: 'Sản phẩm', value: '86' },
];
