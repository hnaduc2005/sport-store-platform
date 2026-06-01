export type Product = {
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  salePrice?: number;
  image: string;
};

export const products: Product[] = [
  {
    name: 'Air Zoom Runner',
    slug: 'air-zoom-runner',
    brand: 'Nike',
    category: 'Running',
    price: 129,
    salePrice: 109,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Training Hoodie Pro',
    slug: 'training-hoodie-pro',
    brand: 'Adidas',
    category: 'Training',
    price: 79,
    image:
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Court Grip Basketball',
    slug: 'court-grip-basketball',
    brand: 'Wilson',
    category: 'Basketball',
    price: 49,
    image:
      'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Flex Gym Bag',
    slug: 'flex-gym-bag',
    brand: 'Puma',
    category: 'Accessories',
    price: 59,
    image:
      'https://images.unsplash.com/photo-1591382386627-349b692688ff?auto=format&fit=crop&w=900&q=80',
  },
];

export const categories = ['Running', 'Training', 'Basketball', 'Football', 'Accessories'];
export const brands = ['Nike', 'Adidas', 'Puma', 'Wilson', 'Under Armour'];

export const adminStats = [
  { label: 'Doanh thu', value: '$24,800' },
  { label: 'Don hang', value: '318' },
  { label: 'Khach hang', value: '1,240' },
  { label: 'San pham', value: '86' },
];

