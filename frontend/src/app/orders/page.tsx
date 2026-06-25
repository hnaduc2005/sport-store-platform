'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { money, statusLabel } from '@/lib/format';
import { demoOrders, type Order } from '@/lib/mock-data';
import { getLocalOrders, getSession } from '@/lib/store';

const statusStyle: Record<string, string> = {
  PENDING:    'badge-yellow',
  CONFIRMED:  'badge-blue',
  PROCESSING: 'badge-purple',
  SHIPPED:    'badge-blue',
  DELIVERED:  'badge-green',
  CANCELLED:  'badge-red',
  UNPAID:     'badge-yellow',
  PAID:       'badge-green',
  REFUNDED:   'badge-purple',
};

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-brand-light bg-white overflow-hidden transition-shadow hover:shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-brand-black text-sm">{order.code}</span>
            <span className={statusStyle[order.status] ?? 'badge-gray'}>
              {statusLabel(order.status)}
            </span>
            <span className={statusStyle[order.paymentStatus] ?? 'badge-gray'}>
              {statusLabel(order.paymentStatus)}
            </span>
          </div>
          <p className="mt-1 text-xs text-brand-muted">
            {new Date(order.createdAt).toLocaleString('vi-VN')}
            {order.paymentMethod && ` · ${order.paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}`}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-brand-black">{money(order.total)}</p>
          <p className="text-xs text-brand-muted mt-0.5">{order.items?.length ?? 0} sản phẩm</p>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 border-t border-brand-light bg-brand-offwhite/50 text-xs font-semibold text-brand-muted hover:text-brand-dark transition-colors"
      >
        <span>{open ? 'Ẩn chi tiết' : 'Xem chi tiết sản phẩm'}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Items */}
      {open && (
        <div className="divide-y divide-brand-light border-t border-brand-light animate-fade-in">
          {(order.items ?? []).map(item => (
            <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-brand-black line-clamp-1">{item.productName}</p>
                <p className="text-xs text-brand-muted mt-0.5">×{item.quantity} · {money(item.unitPrice)}/sp</p>
              </div>
              <span className="font-bold text-brand-black whitespace-nowrap">{money(item.total)}</span>
            </div>
          ))}
          <div className="flex justify-between px-5 py-3 text-sm font-bold text-brand-black bg-brand-offwhite">
            <span>Tổng đơn</span>
            <span>{money(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const session = getSession();
    const local = getLocalOrders();

    if (!session) {
      setOrders([...local, ...demoOrders]);
      setNotice('Bạn đang xem đơn demo. Đăng nhập để xem đơn hàng thực từ API.');
      setLoading(false);
      return;
    }

    apiFetch<Order[]>(`/orders/user/${session.user.id}`)
      .then(data => setOrders([...local, ...data]))
      .catch(() => {
        setOrders([...local, ...demoOrders]);
        setNotice('Đang hiển thị dữ liệu demo vì chưa kết nối được API.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <span className="section-label">Lịch sử</span>
          <h1 className="section-title">Đơn hàng của tôi</h1>
        </div>
        <Link href="/products" className="btn-outline px-4 py-2 text-sm font-semibold">
          Tiếp tục mua sắm
        </Link>
      </div>

      {notice && (
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning-light px-4 py-3 text-sm text-warning-dark">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : orders.length ? (
        <div className="space-y-4">
          {orders.map(o => <OrderCard key={o.id} order={o} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-offwhite text-4xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-brand-black">Chưa có đơn hàng nào</h2>
          <p className="mt-2 text-brand-muted">Hãy mua sắm để bắt đầu!</p>
          <Link href="/products" className="btn-dark mt-6 px-7 py-3 font-bold">Khám phá sản phẩm</Link>
        </div>
      )}
    </div>
  );
}
