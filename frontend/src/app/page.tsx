import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { categories, products } from '@/lib/mock-data';

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded bg-ink text-white">
        <img
          src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1800&q=80"
          alt="Athletes training"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="relative grid gap-8 px-6 py-14 md:grid-cols-[1.2fr_0.8fr] md:px-10 lg:px-14">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wide text-track">Sport Store Platform</p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Do the thao cho moi buoi tap.</h1>
            <p className="mt-5 text-base text-zinc-100 md:text-lg">
              Khung e-commerce san sang ket noi API NestJS, Prisma va PostgreSQL Neon.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products" className="rounded bg-track px-5 py-3 text-sm font-black text-ink">
                Mua sam ngay
              </Link>
              <Link href="/admin/dashboard" className="rounded border border-white/60 px-5 py-3 text-sm font-bold">
                Quan tri
              </Link>
            </div>
          </div>
          <div className="grid content-end gap-3 text-sm">
            {categories.slice(0, 4).map((category) => (
              <div key={category} className="rounded border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                {category}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-court">Noi bat</p>
            <h2 className="mt-2 text-3xl font-black text-ink">San pham ban chay</h2>
          </div>
          <Link href="/products" className="text-sm font-bold text-court">
            Xem tat ca
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

