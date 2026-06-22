'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { effectivePrice, entityName, money, productImage } from '@/lib/format';
import { getCart, removeFromCart, updateCartQuantity, type CartItem } from '@/lib/store';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + effectivePrice(item.product) * item.quantity, 0), [items]);
  const shippingFee = subtotal >= 1500000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shippingFee;

  useEffect(() => {
    setItems(getCart());
  }, []);

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(updateCartQuantity(productId, quantity));
  };

  const removeItem = (productId: string) => {
    setItems(removeFromCart(productId));
  };

  return (
    <div className="grid gap-[32px] lg:grid-cols-[1fr_360px]">
      <section className="space-y-[16px]">
        <div>
          <p className="text-[12px] font-bold uppercase text-primary">Giỏ hàng</p>
          <h1 className="mt-[8px] text-[32px] font-bold leading-[32px] text-neutral-black">Sản phẩm đã chọn</h1>
        </div>
        {items.length ? (
          items.map((item) => (
            <div key={item.product.id} className="grid gap-[16px] rounded-card border border-neutral-border bg-white p-[16px] md:grid-cols-[120px_1fr_auto]">
              <img src={productImage(item.product)} alt={item.product.name} className="aspect-square rounded-card object-cover bg-neutral-offwhite" />
              <div>
                <h2 className="font-bold text-neutral-black text-[16px] leading-[19.2px]">{item.product.name}</h2>
                <p className="text-[14px] text-neutral-medium mt-[4px]">{entityName(item.product.brand)}</p>
                <div className="mt-[12px] flex flex-wrap items-center gap-[8px]">
                  <input
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.product.id, Math.max(1, Number(event.target.value)))}
                    type="number"
                    min={1}
                    max={item.product.stock}
                    className="input-form w-[100px]"
                  />
                  <button onClick={() => removeItem(item.product.id)} className="rounded-btn border border-neutral-light px-[12px] py-[8px] h-[46px] text-[14px] font-bold text-alert hover:border-alert transition-colors">
                    Xóa
                  </button>
                </div>
              </div>
              <p className="font-bold text-[16px] text-neutral-black">{money(effectivePrice(item.product) * item.quantity)}</p>
            </div>
          ))
        ) : (
          <div className="rounded-card border border-dashed border-neutral-light bg-white p-[32px] text-center">
            <p className="font-bold text-[16px] text-neutral-black">Giỏ hàng đang trống.</p>
            <Link href="/products" className="btn-primary inline-flex mt-[16px]">
              Chọn sản phẩm
            </Link>
          </div>
        )}
      </section>
      <aside className="h-fit rounded-card border border-neutral-border bg-white p-[20px]">
        <h2 className="text-[20px] font-medium leading-[24px] text-neutral-black">Tổng đơn</h2>
        <div className="mt-[16px] space-y-[12px] text-[14px] text-neutral-medium">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Vận chuyển</span>
            <span>{shippingFee ? money(shippingFee) : 'Miễn phí'}</span>
          </div>
          <div className="flex justify-between border-t border-neutral-light pt-[12px] text-[16px] font-bold text-neutral-black">
            <span>Tổng</span>
            <span>{money(total)}</span>
          </div>
        </div>
        <Link
          href={items.length ? '/checkout' : '/products'}
          className="btn-primary w-full mt-[20px] bg-neutral-black hover:bg-neutral-dark"
        >
          {items.length ? 'Thanh toán' : 'Tiếp tục mua sắm'}
        </Link>
      </aside>
    </div>
  );
}
