'use client';

import Link from 'next/link';
import type { Product } from '@/lib/mock-data';
import { averageRating, entityName, money, productImage, salePercent } from '@/lib/format';
import { addToCart } from '@/lib/store';

type ProductCardProps = { product: Product };

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(value) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = salePercent(product);
  const rating = averageRating(product);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
    window.dispatchEvent(new Event('sport-store-updated'));
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-card bg-white border border-brand-light transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover">
      {/* Image area */}
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden bg-brand-offwhite" style={{ aspectRatio: '3/4' }}>
        <img
          src={productImage(product)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="badge-orange font-bold">
              -{discount}%
            </span>
          )}
          {product.stock <= 0 && (
            <span className="badge-gray">Hết hàng</span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="badge-yellow">Sắp hết</span>
          )}
        </div>

        {/* Quick add — shown on hover */}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className="w-full rounded-btn bg-brand-black/90 backdrop-blur-sm px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stock <= 0 ? 'Hết hàng' : '+ Thêm vào giỏ'}
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4 gap-3">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent mb-1">
            {entityName(product.brand)}
          </p>
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-semibold text-brand-black leading-snug line-clamp-2 hover:text-accent transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-xs text-brand-muted">
            {entityName(product.category)}
          </p>
        </div>

        {/* Rating + stock */}
        <div className="flex items-center justify-between">
          {rating > 0 ? (
            <div className="flex items-center gap-1.5">
              <StarRating value={rating} />
              <span className="text-xs text-brand-muted">{rating.toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-xs text-brand-subtle">Chưa có đánh giá</span>
          )}
          <span className="text-xs text-brand-muted">Còn {product.stock}</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-lg font-bold text-brand-black">
            {money(product.salePrice ?? product.price)}
          </span>
          {product.salePrice && (
            <span className="text-sm text-brand-subtle line-through">
              {money(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
