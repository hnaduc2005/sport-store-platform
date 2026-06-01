import Link from 'next/link';
import type { Product } from '@/lib/mock-data';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="aspect-[4/3] overflow-hidden bg-zinc-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-court">{product.category}</p>
          <h3 className="mt-1 text-base font-bold text-ink">{product.name}</h3>
          <p className="text-sm text-zinc-500">{product.brand}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-ink">${product.salePrice ?? product.price}</span>
          {product.salePrice ? <span className="text-sm text-zinc-400 line-through">${product.price}</span> : null}
        </div>
      </div>
    </Link>
  );
}

