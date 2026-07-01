'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { effectivePrice, money } from '@/lib/format';
import { clearCart, getCart, getSession, saveLocalOrder, type CartItem } from '@/lib/store';
import type { Order } from '@/lib/mock-data';

const PAYMENT_METHODS = [
  { value: 'COD', label: 'Thanh toán khi nhận hàng (COD)', icon: '🚚' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng', icon: '🏦' },
];

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({
    customerName: '', phone: '', address: '', note: '',
    couponCode: '', paymentMethod: 'COD',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'info'>('error');
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const subtotal = useMemo(() => items.reduce((s, i) => s + effectivePrice(i.product) * i.quantity, 0), [items]);
  const shippingFee = subtotal >= 1500000 || subtotal === 0 ? 0 : 30000;
  const discount = form.couponCode.trim().toUpperCase() === 'SPORT10' ? Math.round(subtotal * 0.1) : 0;
  const total = Math.max(subtotal + shippingFee - discount, 0);

  useEffect(() => {
    setItems(getCart());
    const session = getSession();
    if (session?.user.name) setForm(v => ({ ...v, customerName: session.user.name ?? '' }));
  }, []);

  const set = (field: keyof typeof form, value: string) =>
    setForm(c => ({ ...c, [field]: value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!items.length) { setMessage('Giỏ hàng đang trống.'); setMessageType('error'); return; }
    const session = getSession();
    if (!session) { setMessage('Vui lòng đăng nhập trước khi đặt hàng.'); setMessageType('error'); return; }
    setSubmitting(true); setMessage('');
    try {
      // Sync cart local → DB trước khi đặt hàng
      await Promise.allSettled(
        items.map(item =>
          apiFetch(`/cart/${session.user.id}/items`, {
            method: 'POST',
            body: JSON.stringify({ productId: item.product.id, quantity: item.quantity }),
          })
        )
      );

      const order = await apiFetch<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          userId: session.user.id, customerName: form.customerName, phone: form.phone,
          address: form.address, note: form.note, couponCode: form.couponCode,
          paymentMethod: form.paymentMethod,
        }),
      });
      clearCart(); setItems([]); setCreatedOrder(order); setMessage('Đặt hàng thành công.');
    } catch {
      const localOrder: Order = {
        id: `local-${Date.now()}`, code: `SS-${Date.now().toString().slice(-6)}`,
        status: 'PENDING', paymentStatus: 'UNPAID', paymentMethod: form.paymentMethod,
        total, customerName: form.customerName, phone: form.phone, address: form.address,
        createdAt: new Date().toISOString(),
        items: items.map(i => ({
          id: `${i.product.id}-${Date.now()}`, productId: i.product.id,
          productName: i.product.name, unitPrice: effectivePrice(i.product),
          quantity: i.quantity, total: effectivePrice(i.product) * i.quantity,
        })),
      };
      saveLocalOrder(localOrder); clearCart(); setItems([]); setCreatedOrder(localOrder);
      setMessage('Đã tạo đơn ở chế độ demo (chưa kết nối API).'); setMessageType('info');
    } finally { setSubmitting(false); }
  };

  /* ── Order success ── */
  if (createdOrder) {
    return (
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-lg text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-success-light text-5xl mx-auto mb-6">✅</div>
          <h1 className="text-3xl font-bold text-brand-black">Đặt hàng thành công!</h1>
          <p className="mt-2 text-brand-muted">
            Mã đơn hàng: <span className="font-bold text-brand-black font-mono">{createdOrder.code}</span>
          </p>
          {messageType === 'info' && message && (
            <p className="mt-3 text-sm text-brand-muted bg-brand-offwhite rounded-lg px-4 py-3">{message}</p>
          )}
          <p className="mt-4 text-brand-muted">Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ xác nhận sớm nhất.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/orders" className="btn-dark px-7 py-3 font-bold">Xem đơn hàng</Link>
            <Link href="/products" className="btn-outline px-7 py-3 font-bold">Tiếp tục mua sắm</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <span className="section-label">Thanh toán</span>
        <h1 className="section-title">Hoàn tất đơn hàng</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Contact */}
          <div className="form-section">
            <h2 className="form-section-title">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">1</span>
              Thông tin người nhận
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormRow label="Họ và tên *">
                <input value={form.customerName} onChange={e => set('customerName', e.target.value)} required className="input-form w-full" placeholder="Nguyễn Văn A" />
              </FormRow>
              <FormRow label="Số điện thoại *">
                <input value={form.phone} onChange={e => set('phone', e.target.value)} required className="input-form w-full" placeholder="0901 234 567" type="tel" />
              </FormRow>
            </div>
            <div className="mt-4">
              <FormRow label="Địa chỉ giao hàng *">
                <input value={form.address} onChange={e => set('address', e.target.value)} required className="input-form w-full" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
              </FormRow>
            </div>
            <div className="mt-4">
              <FormRow label="Ghi chú đơn hàng">
                <textarea value={form.note} onChange={e => set('note', e.target.value)} className="textarea-form w-full" placeholder="Yêu cầu đặc biệt, thời gian giao..." rows={3} />
              </FormRow>
            </div>
          </div>

          {/* Section: Payment */}
          <div className="form-section">
            <h2 className="form-section-title">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">2</span>
              Phương thức thanh toán
            </h2>
            <div className="grid gap-3">
              {PAYMENT_METHODS.map(pm => (
                <label
                  key={pm.value}
                  className={`flex items-center gap-4 cursor-pointer rounded-xl border-2 p-4 transition-all ${
                    form.paymentMethod === pm.value
                      ? 'border-accent bg-accent-bg'
                      : 'border-brand-light bg-white hover:border-accent/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.value}
                    checked={form.paymentMethod === pm.value}
                    onChange={e => set('paymentMethod', e.target.value)}
                    className="accent-accent"
                  />
                  <span className="text-xl">{pm.icon}</span>
                  <span className="font-semibold text-sm text-brand-black">{pm.label}</span>
                </label>
              ))}
            </div>

            {form.paymentMethod === 'BANK_TRANSFER' && (
              <div className="mt-4 rounded-xl bg-info-light border border-info/20 p-5 space-y-2">
                <p className="text-sm font-bold text-info-dark">Thông tin chuyển khoản:</p>
                <div className="grid gap-1.5 text-sm">
                  {[['Ngân hàng', 'Vietcombank'], ['Số tài khoản', '1234567890'], ['Chủ tài khoản', 'BIGSPORT STORE'], ['Nội dung', 'Thanh toan don hang']].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-info-dark/70">{k}:</span>
                      <span className="font-bold text-info-dark font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: Coupon */}
          <div className="form-section">
            <h2 className="form-section-title">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">3</span>
              Mã giảm giá
            </h2>
            <div className="flex gap-3">
              <input
                value={form.couponCode}
                onChange={e => set('couponCode', e.target.value.toUpperCase())}
                className="input-form flex-1"
                placeholder="Nhập mã giảm giá (thử SPORT10)"
              />
            </div>
            {discount > 0 && (
              <p className="mt-2 text-sm font-semibold text-success">✓ Áp dụng mã thành công! Giảm {money(discount)}</p>
            )}
          </div>

          {message && (
            <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${messageType === 'error' ? 'bg-danger-light text-danger-dark' : 'bg-info-light text-info-dark'}`}>
              {message}
            </div>
          )}

          <button disabled={submitting} className="btn-dark w-full py-4 text-base font-bold disabled:opacity-60">
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Đang xử lý...
              </span>
            ) : `Đặt hàng — ${money(total)}`}
          </button>
        </form>

        {/* ── Order summary ── */}
        <aside className="h-fit rounded-xl border border-brand-light bg-white p-6 space-y-4 lg:sticky lg:top-24">
          <h2 className="font-bold text-brand-black text-base">Xác nhận đơn hàng</h2>

          <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin pr-1">
            {items.map(i => (
              <div key={i.product.id} className="flex justify-between gap-3 text-sm">
                <span className="text-brand-dark line-clamp-2 flex-1">{i.product.name} <span className="text-brand-muted">×{i.quantity}</span></span>
                <span className="font-semibold text-brand-black whitespace-nowrap">{money(effectivePrice(i.product) * i.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-brand-light pt-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-brand-muted">
              <span>Tạm tính</span><span className="text-brand-dark font-medium">{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Vận chuyển</span>
              <span className={shippingFee === 0 ? 'text-success font-medium' : 'text-brand-dark font-medium'}>
                {shippingFee === 0 ? 'Miễn phí' : money(shippingFee)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Giảm giá</span><span className="font-medium">-{money(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-brand-black text-lg border-t border-brand-light pt-3">
              <span>Tổng cộng</span><span>{money(total)}</span>
            </div>
          </div>

          <p className="text-xs text-center text-brand-subtle pt-2">
            🔒 Thông tin của bạn được bảo mật tuyệt đối
          </p>
        </aside>
      </div>
    </div>
  );
}
