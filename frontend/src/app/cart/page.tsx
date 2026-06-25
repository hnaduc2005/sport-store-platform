'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { effectivePrice, entityName, money, productImage } from '@/lib/format';
import { getCart, removeFromCart, updateCartQuantity, type CartItem } from '@/lib/store';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + effectivePrice(i.product) * i.quantity, 0), [items]);
  const shippingFee = subtotal >= 1500000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shippingFee;

  useEffect(() => { setItems(getCart()); }, []);

  const updateQty = (id: string, qty: number) => setItems(updateCartQuantity(id, qty));
  const removeItem = (id: string) => setItems(removeFromCart(id));

  /* ── Empty state ── */
  if (!items.length) {
    return (
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center text-center py-16">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand-offwhite text-5xl mb-6">🛒</div>
          <h1 className="text-2xl font-bold text-brand-black">Giỏ hàng đang trống</h1>
          <p className="mt-2 text-brand-muted max-w-sm">Hãy thêm sản phẩm vào giỏ để bắt đầu mua sắm nhé!</p>
          <Link href="/products" className="btn-primary mt-6 px-8 py-3 text-base font-bold">
            Khám phá sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <span className="section-label">Giỏ hàng</span>
        <h1 className="section-title">Sản phẩm đã chọn ({items.length})</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* ── Cart items ── */}
        <section className="space-y-4">
          {items.map(item => {
            const price = effectivePrice(item.product);
            return (
              <div
                key={item.product.id}
                className="flex gap-4 rounded-xl border border-brand-light bg-white p-4 sm:p-5 transition-shadow hover:shadow-sm"
              >
                {/* Image */}
                <Link href={`/products/${item.product.slug}`} className="shrink-0">
                  <img
                    src={productImage(item.product)}
                    alt={item.product.name}
                    className="h-24 w-24 rounded-lg object-cover bg-brand-offwhite sm:h-28 sm:w-28"
                  />
                </Link>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-2 min-w-0">
                  <div>
                    <p className="text-xs font-semibold uppercase text-accent">{entityName(item.product.brand)}</p>
                    <Link href={`/products/${item.product.slug}`}>
                      <h2 className="font-bold text-brand-black text-sm sm:text-base leading-snug hover:text-accent transition-colors line-clamp-2 mt-0.5">
                        {item.product.name}
                      </h2>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-3 mt-auto">
                    {/* Quantity stepper */}
                    <div className="flex items-center border border-brand-light rounded-btn overflow-hidden">
                      <button
                        onClick={() => updateQty(item.product.id, item.quantity - 1)}
                        className="px-3 py-2 text-brand-dark hover:bg-brand-offwhite transition-colors font-bold text-sm"
                      >−</button>
                      <span className="w-10 text-center font-bold text-brand-black text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                        className="px-3 py-2 text-brand-dark hover:bg-brand-offwhite transition-colors font-bold text-sm"
                      >+</button>
                    </div>

                    {/* Line price + delete */}
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-brand-black">{money(price * item.quantity)}</span>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1.5 text-brand-subtle hover:text-danger transition-colors rounded"
                        title="Xóa sản phẩm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Tiếp tục mua sắm
          </Link>
        </section>

        {/* ── Order summary ── */}
        <aside className="h-fit rounded-xl border border-brand-light bg-white p-6 space-y-4 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-brand-black">Tóm tắt đơn hàng</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-brand-muted">
              <span>Tạm tính ({items.length} sản phẩm)</span>
              <span className="font-medium text-brand-dark">{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Phí vận chuyển</span>
              <span className={`font-medium ${shippingFee === 0 ? 'text-success' : 'text-brand-dark'}`}>
                {shippingFee === 0 ? 'Miễn phí 🎉' : money(shippingFee)}
              </span>
            </div>
            {subtotal < 1500000 && subtotal > 0 && (
              <p className="text-xs text-accent bg-accent-bg rounded-lg px-3 py-2">
                Mua thêm {money(1500000 - subtotal)} để được freeship!
              </p>
            )}
          </div>

          <div className="border-t border-brand-light pt-4">
            <div className="flex justify-between font-bold text-brand-black text-lg">
              <span>Tổng cộng</span>
              <span>{money(total)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="btn-dark w-full py-4 text-base font-bold text-center block"
          >
            Tiến hành thanh toán →
          </Link>

          <p className="text-xs text-center text-brand-subtle">
            🔒 Thanh toán an toàn, bảo mật thông tin
          </p>
        </aside>
      </div>
    </div>
  );
}
