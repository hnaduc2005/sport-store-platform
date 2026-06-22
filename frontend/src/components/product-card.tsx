'use client';

import Link from 'next/link';
import type { Product } from '@/lib/mock-data';
import { averageRating, entityName, money, productImage, salePercent } from '@/lib/format';
import { addToCart } from '@/lib/store';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const discount = salePercent(product);
  const rating = averageRating(product);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
    // Bắn event để SiteHeader update số lượng giỏ hàng
    window.dispatchEvent(new Event('sport-store-updated'));
  };

  return (
    <div className="group relative overflow-hidden rounded-card border border-neutral-border bg-white transition-all hover:-translate-y-1 hover:shadow-lifted flex flex-col h-full">
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/3] overflow-hidden bg-neutral-offwhite shrink-0 block">
        <img
          src={productImage(product)}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {discount ? (
          <span className="absolute left-[12px] top-[12px] rounded-btn bg-alert-vibrant px-[8px] py-[4px] text-[12px] font-bold text-white z-10">
            -{discount}%
          </span>
        ) : null}
      </Link>
      <div className="flex flex-col flex-1 p-[16px] gap-[12px]">
        <div>
          <p className="text-[12px] font-bold uppercase text-primary mb-[4px]">{entityName(product.category)}</p>
          <Link href={`/products/${product.slug}`} className="block hover:text-primary transition-colors">
            <h3 className="text-[16px] font-bold text-neutral-black leading-[19.2px] line-clamp-2">{product.name}</h3>
          </Link>
          <p className="mt-[4px] text-[14px] text-neutral-medium">{entityName(product.brand)}</p>
        </div>
        <div className="mt-auto">
          <div className="flex items-center gap-[8px] mb-[12px]">
            <span className="text-[20px] sm:text-[24px] font-bold text-neutral-black leading-[24px]">{money(product.salePrice ?? product.price)}</span>
            {product.salePrice ? <span className="text-[14px] text-neutral-medium line-through">{money(product.price)}</span> : null}
          </div>
          <div className="flex items-center justify-between text-[12.8px] text-neutral-medium mb-[12px]">
            <span>{rating ? `${rating.toFixed(1)} sao` : 'Chưa có đánh giá'}</span>
            <span>Còn {product.stock}</span>
          </div>
          <button 
            onClick={handleQuickAdd}
            className="w-full rounded-btn border border-primary text-primary hover:bg-primary hover:text-white py-[8px] text-[14px] font-bold transition-all opacity-100 lg:opacity-0 lg:translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0"
          >
            Thêm nhanh
          </button>
        </div>
      </div>
    </div>
  );
}
