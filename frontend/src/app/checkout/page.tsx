'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { effectivePrice, money } from '@/lib/format';
import { clearCart, getCart, getSession, saveLocalOrder, type CartItem } from '@/lib/store';
import type { Order } from '@/lib/mock-data';

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    note: '',
    couponCode: '',
    paymentMethod: 'COD',
  });
  const [message, setMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + effectivePrice(item.product) * item.quantity, 0), [items]);
  const shippingFee = subtotal >= 1500000 || subtotal === 0 ? 0 : 30000;
  const discount = form.couponCode.trim().toUpperCase() === 'SPORT10' ? Math.round(subtotal * 0.1) : 0;
  const total = Math.max(subtotal + shippingFee - discount, 0);

  useEffect(() => {
    setItems(getCart());
    const session = getSession();
    if (session?.user.name) {
      setForm((value) => ({ ...value, customerName: session.user.name ?? '' }));
    }
  }, []);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const session = getSession();

    if (!items.length) {
      setMessage('Giỏ hàng đang trống.');
      return;
    }

    if (!session) {
      setMessage('Vui lòng đăng nhập trước khi đặt hàng.');
      return;
    }

    try {
      const order = await apiFetch<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          userId: session.user.id,
          customerName: form.customerName,
          phone: form.phone,
          address: form.address,
          note: form.note,
          couponCode: form.couponCode,
          paymentMethod: form.paymentMethod,
        }),
      });
      clearCart();
      setItems([]);
      setCreatedOrder(order);
      setMessage('Đặt hàng thành công.');
    } catch {
      const localOrder: Order = {
        id: `local-${Date.now()}`,
        code: `SS-${Date.now().toString().slice(-6)}`,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: form.paymentMethod,
        total,
        customerName: form.customerName,
        phone: form.phone,
        address: form.address,
        createdAt: new Date().toISOString(),
        items: items.map((item) => ({
          id: `${item.product.id}-${Date.now()}`,
          productId: item.product.id,
          productName: item.product.name,
          unitPrice: effectivePrice(item.product),
          quantity: item.quantity,
          total: effectivePrice(item.product) * item.quantity,
        })),
      };

      saveLocalOrder(localOrder);
      clearCart();
      setItems([]);
      setCreatedOrder(localOrder);
      setMessage('Đã tạo đơn ở chế độ demo vì chưa kết nối được API.');
    }
  };

  if (createdOrder) {
    return (
      <section className="mx-auto max-w-2xl rounded-card border border-neutral-border bg-white p-[24px] text-center">
        <p className="text-[12px] font-bold uppercase text-primary">Đặt hàng thành công</p>
        <h1 className="mt-[8px] text-[32px] font-bold leading-[32px] text-neutral-black">Mã đơn {createdOrder.code}</h1>
        <p className="mt-[12px] text-[16px] text-neutral-medium leading-[24px]">Cảm ơn bạn đã mua hàng. Đơn hàng đã được ghi nhận để theo dõi trong lịch sử đơn.</p>
        <div className="mt-[24px] flex flex-wrap justify-center gap-[12px]">
          <Link href="/orders" className="btn-primary">
            Xem đơn hàng
          </Link>
          <Link href="/products" className="btn-secondary !text-neutral-black !border-neutral-input hover:!bg-neutral-offwhite">
            Tiếp tục mua sắm
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-[32px] lg:grid-cols-[1fr_360px]">
      <section>
        <p className="text-[12px] font-bold uppercase text-primary">Thanh toán</p>
        <h1 className="mt-[8px] text-[32px] font-bold leading-[32px] text-neutral-black">Thông tin giao hàng</h1>
        <form onSubmit={handleSubmit} className="mt-[24px] grid gap-[16px] rounded-card border border-neutral-border bg-white p-[20px]">
          <input
            value={form.customerName}
            onChange={(event) => updateField('customerName', event.target.value)}
            required
            className="input-form w-full"
            placeholder="Họ tên"
          />
          <input
            value={form.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            required
            className="input-form w-full"
            placeholder="Số điện thoại"
          />
          <input
            value={form.address}
            onChange={(event) => updateField('address', event.target.value)}
            required
            className="input-form w-full"
            placeholder="Địa chỉ"
          />
          <select
            value={form.paymentMethod}
            onChange={(event) => updateField('paymentMethod', event.target.value)}
            className="input-form w-full bg-white"
          >
            <option value="COD">Thanh toán khi nhận hàng (COD)</option>
            <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
          </select>
          <input
            value={form.couponCode}
            onChange={(event) => updateField('couponCode', event.target.value)}
            className="input-form w-full"
            placeholder="Mã giảm giá (SPORT10)"
          />
          <textarea
            value={form.note}
            onChange={(event) => updateField('note', event.target.value)}
            className="min-h-[112px] rounded-none border border-neutral-inputLight px-[12px] py-[12px] text-[16px] text-[#495057] focus:border-primary focus:outline-none transition-colors w-full"
            placeholder="Ghi chú"
          />
          {message ? <p className="text-[14px] font-bold text-alert-dark">{message}</p> : null}
          <button className="btn-primary w-full py-[12px]">Đặt hàng</button>
        </form>
      </section>
      <aside className="h-fit rounded-card border border-neutral-border bg-white p-[20px]">
        <h2 className="text-[20px] font-medium leading-[24px] text-neutral-black">Xác nhận đơn hàng</h2>
        <div className="mt-[16px] grid gap-[12px] text-[14px] text-neutral-medium">
          {items.length ? (
            items.map((item) => (
              <div key={item.product.id} className="flex justify-between gap-[12px]">
                <span>{item.product.name} x {item.quantity}</span>
                <span>{money(effectivePrice(item.product) * item.quantity)}</span>
              </div>
            ))
          ) : (
            <p>Chưa có sản phẩm trong giỏ.</p>
          )}
          <div className="flex justify-between border-t border-neutral-light pt-[12px]">
            <span>Tạm tính</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Vận chuyển</span>
            <span>{shippingFee ? money(shippingFee) : 'Miễn phí'}</span>
          </div>
          <div className="flex justify-between">
            <span>Giảm giá</span>
            <span className="text-primary">-{money(discount)}</span>
          </div>
          <div className="flex justify-between text-[16px] font-bold text-neutral-black">
            <span>Tổng</span>
            <span>{money(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
