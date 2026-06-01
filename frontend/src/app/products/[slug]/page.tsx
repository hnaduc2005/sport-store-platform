import Link from 'next/link';
import { products } from '@/lib/mock-data';

type ProductDetailPageProps = {
  params: {
    slug: string;
  };
};

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = products.find((item) => item.slug === params.slug) ?? products[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <section className="overflow-hidden rounded border border-zinc-200 bg-white">
        <img src={product.image} alt={product.name} className="aspect-[4/3] w-full object-cover" />
      </section>
      <section className="space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-court">{product.brand}</p>
          <h1 className="mt-3 text-4xl font-black text-ink">{product.name}</h1>
          <p className="mt-3 text-zinc-600">
            Mau trang chi tiet san pham, san sang noi API /products/:slug va cac lua chon bien the.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black text-ink">${product.salePrice ?? product.price}</span>
          {product.salePrice ? <span className="text-lg text-zinc-400 line-through">${product.price}</span> : null}
        </div>
        <div className="space-y-3">
          <label className="text-sm font-bold text-ink" htmlFor="size">
            Kich co
          </label>
          <select id="size" className="w-full rounded border border-zinc-300 bg-white px-3 py-3">
            <option>Size 40</option>
            <option>Size 41</option>
            <option>Size 42</option>
          </select>
        </div>
        <button className="w-full rounded bg-court px-5 py-3 font-black text-white">Them vao gio hang</button>
        <Link href="/products" className="block text-sm font-bold text-court">
          Quay lai danh sach san pham
        </Link>
      </section>
    </div>
  );
}

