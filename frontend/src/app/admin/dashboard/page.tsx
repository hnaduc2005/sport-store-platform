'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminNotice, EmptyState, LoadingBlocks, StatCard, StatusBadge } from '@/components/admin-ui';
import { apiFetch } from '@/lib/api';
import { compactNumber, formatDateTime, money } from '@/lib/format';
import { demoContacts, demoOrders, products as fallbackProducts } from '@/lib/mock-data';

type Period = 'day' | 'month';

type DashboardOrder = {
  id: string;
  code: string;
  status: string;
  paymentStatus: string;
  total: number | string;
  customerName: string;
  createdAt: string;
  items?: Array<{ id: string }>;
};

type TopProduct = {
  productId: string;
  productName: string;
  _sum: { quantity: number | null; total: number | string | null };
};

type RevenuePoint = {
  key: string;
  label: string;
  revenue: number;
  orders: number;
};

type DashboardData = {
  summary: {
    totalRevenue: number | string;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    pendingOrders: number;
    newContacts: number;
  };
  recentOrders: DashboardOrder[];
  topProducts: TopProduct[];
  revenueSeries: RevenuePoint[];
};

function fallbackDashboard(period: Period): DashboardData {
  return {
    summary: {
      totalRevenue: demoOrders.reduce((s, o) => s + Number(o.total), 0),
      totalOrders: demoOrders.length,
      totalUsers: 2,
      totalProducts: fallbackProducts.length,
      pendingOrders: demoOrders.filter(o => o.status === 'PENDING').length,
      newContacts: demoContacts.filter(c => c.status === 'NEW').length,
    },
    recentOrders: demoOrders,
    topProducts: fallbackProducts
      .slice().sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0)).slice(0, 5)
      .map(p => ({
        productId: p.id, productName: p.name,
        _sum: { quantity: p.sold ?? 0, total: Number(p.salePrice ?? p.price) * (p.sold ?? 0) },
      })),
    revenueSeries: Array.from({ length: period === 'day' ? 14 : 12 }).map((_, i) => ({
      key: `demo-${i}`,
      label: period === 'day' ? `${String(i + 1).padStart(2, '0')}/06` : `${String(i + 1).padStart(2, '0')}/2026`,
      revenue: i % 3 === 0 ? 0 : 1200000 + i * 220000,
      orders: i % 3 === 0 ? 0 : 2 + i,
    })),
  };
}

const statIcons = {
  revenue: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  orders: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  products: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  pending: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  feedback: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
};

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>('day');
  const [data, setData] = useState<DashboardData>(() => fallbackDashboard('day'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    apiFetch<DashboardData>(`/reports/dashboard?period=${period}`)
      .then(payload => { if (active) setData(payload); })
      .catch(() => {
        if (active) { setData(fallbackDashboard(period)); setError('Đang hiển thị dữ liệu demo — chưa kết nối được API.'); }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [period]);

  const maxRevenue = Math.max(...data.revenueSeries.map(p => p.revenue), 1);

  const statCards = useMemo(() => [
    { title: 'Doanh thu', value: money(data.summary.totalRevenue), sub: 'Tổng doanh thu ghi nhận', icon: statIcons.revenue, color: 'orange' as const },
    { title: 'Đơn hàng', value: String(data.summary.totalOrders), sub: 'Tất cả đơn hàng', icon: statIcons.orders, color: 'blue' as const },
    { title: 'Khách hàng', value: String(data.summary.totalUsers), sub: 'Tài khoản trong hệ thống', icon: statIcons.users, color: 'green' as const },
    { title: 'Sản phẩm', value: String(data.summary.totalProducts), sub: 'SKU đang quản lý', icon: statIcons.products, color: 'purple' as const },
    { title: 'Chờ xử lý', value: String(data.summary.pendingOrders), sub: 'Đơn cần xác nhận', icon: statIcons.pending, color: 'orange' as const },
    { title: 'Feedback mới', value: String(data.summary.newContacts), sub: 'Phản hồi chưa đọc', icon: statIcons.feedback, color: 'blue' as const },
  ], [data]);

  return (
    <AdminShell
      title="Dashboard"
      description="Tổng quan vận hành cửa hàng thể thao, đơn hàng, doanh thu và phản hồi khách hàng."
    >
      {error && <AdminNotice type="warning">{error}</AdminNotice>}

      {loading ? (
        <LoadingBlocks count={3} />
      ) : (
        <>
          {/* ── Stat cards ── */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {statCards.map(card => (
              <StatCard key={card.title} {...card} />
            ))}
          </section>

          {/* ── Chart + Top products ── */}
          <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            {/* Revenue chart */}
            <div className="rounded-xl border border-brand-light bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-brand-black">
                    Doanh thu theo {period === 'day' ? 'ngày' : 'tháng'}
                  </h2>
                  <p className="text-sm text-brand-muted mt-0.5">Dữ liệu từ đơn hàng không bị hủy.</p>
                </div>
                <select
                  value={period}
                  onChange={e => setPeriod(e.target.value as Period)}
                  className="select-form w-full sm:w-36"
                >
                  <option value="day">14 ngày gần đây</option>
                  <option value="month">12 tháng gần đây</option>
                </select>
              </div>

              {data.revenueSeries.length ? (
                <div className="flex h-60 items-end gap-1.5 overflow-x-auto pb-2 border-b border-brand-light">
                  {data.revenueSeries.map(point => {
                    const pct = Math.max((point.revenue / maxRevenue) * 100, point.revenue ? 5 : 1);
                    return (
                      <div
                        key={point.key}
                        className="flex min-w-[38px] flex-1 flex-col items-center justify-end gap-1.5"
                        title={`${point.label}: ${money(point.revenue)} (${point.orders} đơn)`}
                      >
                        <span className="text-[10px] font-semibold text-brand-muted">
                          {point.revenue > 0 ? compactNumber(point.revenue) : ''}
                        </span>
                        <div
                          className="w-full rounded-t-btn bg-accent/80 hover:bg-accent transition-colors cursor-default"
                          style={{ height: `${pct}%` }}
                        />
                        <span className="text-[10px] text-brand-subtle whitespace-nowrap">{point.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="Chưa có dữ liệu doanh thu" description="Biểu đồ sẽ tự cập nhật khi có đơn hàng." />
              )}
            </div>

            {/* Top products */}
            <div className="rounded-xl border border-brand-light bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-brand-black">Bán chạy nhất</h2>
                <Link href="/admin/products" className="text-xs font-semibold text-accent hover:text-accent-hover">
                  Xem tất cả →
                </Link>
              </div>
              <div className="space-y-3">
                {data.topProducts.length ? (
                  data.topProducts.slice(0, 6).map((p, i) => (
                    <div key={p.productId} className="flex items-center gap-3">
                      <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-black ${
                        i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-gray-700' : i === 2 ? 'bg-amber-700/70 text-white' : 'bg-brand-offwhite text-brand-muted'
                      }`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-brand-black truncate">{p.productName}</p>
                        <p className="text-xs text-brand-muted">{p._sum.quantity ?? 0} đã bán</p>
                      </div>
                      <span className="text-xs font-bold text-accent whitespace-nowrap">{money(p._sum.total)}</span>
                    </div>
                  ))
                ) : (
                  <EmptyState title="Chưa có dữ liệu" />
                )}
              </div>
            </div>
          </section>

          {/* ── Recent orders table ── */}
          <section className="rounded-xl border border-brand-light bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-brand-black">Đơn hàng gần đây</h2>
              <Link href="/admin/orders" className="text-xs font-semibold text-accent hover:text-accent-hover">
                Xem tất cả →
              </Link>
            </div>
            {data.recentOrders.length ? (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-brand-offwhite text-xs uppercase text-brand-muted tracking-wide">
                    <tr>
                      {['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Trạng thái', 'Ngày tạo'].map(h => (
                        <th key={h} className="px-4 py-3 font-semibold first:pl-5 last:pr-5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-light">
                    {data.recentOrders.map(order => (
                      <tr key={order.id} className="hover:bg-brand-offwhite/60 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-brand-black first:pl-5">{order.code}</td>
                        <td className="px-4 py-3.5 text-brand-dark">{order.customerName}</td>
                        <td className="px-4 py-3.5 font-bold text-brand-black">{money(order.total)}</td>
                        <td className="px-4 py-3.5"><StatusBadge status={order.status} /></td>
                        <td className="px-4 py-3.5 text-brand-muted last:pr-5">{formatDateTime(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="Chưa có đơn hàng" description="Đơn hàng mới sẽ xuất hiện tại đây." />
            )}
          </section>
        </>
      )}
    </AdminShell>
  );
}
