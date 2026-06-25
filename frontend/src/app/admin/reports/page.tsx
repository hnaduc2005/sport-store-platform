'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminNotice, AdminTable, AdminToolbar, EmptyState, LoadingBlocks } from '@/components/admin-ui';
import { apiFetch } from '@/lib/api';
import { compactNumber, money } from '@/lib/format';

type Period = 'day' | 'month';

type Summary = {
  totalRevenue: number | string;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalContacts?: number;
  newContacts?: number;
  totalReviews?: number;
  pendingOrders?: number;
};

type TopProduct = {
  productId: string;
  productName: string;
  _sum: {
    quantity: number | null;
    total: number | string | null;
  };
};

type RevenuePoint = {
  key: string;
  label: string;
  revenue: number;
  orders: number;
};

const fallbackSummary: Summary = { totalRevenue: 24800000, totalOrders: 318, totalProducts: 86, totalUsers: 1240, totalContacts: 12, newContacts: 3, totalReviews: 28, pendingOrders: 8 };

export default function AdminReportsPage() {
  const [period, setPeriod] = useState<Period>('day');
  const [summary, setSummary] = useState<Summary>(fallbackSummary);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [revenueSeries, setRevenueSeries] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      apiFetch<Summary>('/reports/sales-summary'),
      apiFetch<TopProduct[]>('/reports/top-products'),
      apiFetch<RevenuePoint[]>(`/reports/revenue-series?period=${period}`),
    ])
      .then(([summaryData, topProductData, revenueData]) => {
        if (!active) return;
        setSummary(summaryData);
        setTopProducts(topProductData);
        setRevenueSeries(revenueData);
      })
      .catch(() => {
        if (!active) return;
        setSummary(fallbackSummary);
        setTopProducts([]);
        setRevenueSeries(Array.from({ length: period === 'day' ? 14 : 12 }).map((_, index) => ({
          key: `fallback-${index}`,
          label: period === 'day' ? `${String(index + 1).padStart(2, '0')}/06` : `${String(index + 1).padStart(2, '0')}/2026`,
          revenue: index % 4 === 0 ? 0 : 900000 + index * 180000,
          orders: index % 4 === 0 ? 0 : index + 1,
        })));
        setError('Không tải được báo cáo từ API. Đang hiển thị dữ liệu demo.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [period]);

  const maxRevenue = Math.max(...revenueSeries.map((point) => point.revenue), 1);
  const cards = [
    ['Doanh thu', money(summary.totalRevenue)],
    ['Đơn hàng', String(summary.totalOrders)],
    ['Khách hàng', String(summary.totalUsers)],
    ['Sản phẩm', String(summary.totalProducts)],
    ['Đơn chờ', String(summary.pendingOrders ?? 0)],
    ['Feedback mới', String(summary.newContacts ?? 0)],
  ];

  return (
    <AdminShell title="Báo cáo" description="Báo cáo doanh thu, số đơn, sản phẩm bán chạy và hiệu suất catalog.">
      <AdminToolbar>
        <div className="flex-1">
          <p className="font-bold text-brand-black">Khoảng thời gian</p>
          <p className="text-sm text-brand-muted mt-1">Chọn cách gom nhóm doanh thu theo ngày hoặc tháng.</p>
        </div>
        <select value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="select-form bg-white sm:w-48">
          <option value="day">14 ngày</option>
          <option value="month">12 tháng</option>
        </select>
      </AdminToolbar>

      {error ? <AdminNotice type="error">{error}</AdminNotice> : null}

      {loading ? (
        <LoadingBlocks count={3} />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-brand-light bg-white p-5 hover:shadow-card transition-shadow">
                <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide">{label}</p>
                <p className="mt-2 truncate text-3xl font-black text-brand-black">{value}</p>
              </div>
            ))}
          </section>

          <section className="rounded-xl border border-brand-light bg-white p-5">
            <h2 className="text-xl font-bold text-brand-black">Biểu đồ doanh thu</h2>
            {revenueSeries.length ? (
              <div className="mt-6 flex h-64 items-end gap-2 overflow-x-auto border-b border-brand-light pb-3">
                {revenueSeries.map((point) => {
                  const height = Math.max((point.revenue / maxRevenue) * 240, point.revenue ? 16 : 4);
                  return (
                    <div key={point.key} className="flex min-w-[42px] flex-1 flex-col items-center justify-end gap-2">
                      <span className="text-xs font-semibold text-brand-muted">{compactNumber(point.revenue)}</span>
                      <div title={`${point.label}: ${money(point.revenue)}`} className="w-full rounded-t-btn bg-accent/80 hover:bg-accent transition-colors cursor-default" style={{ height }} />
                      <span className="text-xs text-brand-muted">{point.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="Chưa có dữ liệu doanh thu" />
            )}
          </section>

          <section className="rounded-xl border border-brand-light bg-white p-5">
            <h2 className="text-xl font-bold text-brand-black mb-4">Sản phẩm bán chạy</h2>
            {topProducts.length ? (
              <AdminTable minWidth={720}>
                <thead>
                  <tr>
                    {['Sản phẩm', 'Số lượng', 'Doanh thu'].map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product) => (
                    <tr key={product.productId}>
                      <td><span className="font-bold text-brand-black">{product.productName}</span></td>
                      <td>{product._sum.quantity ?? 0}</td>
                      <td><span className="font-bold text-brand-black">{money(product._sum.total)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </AdminTable>
            ) : (
              <div className="mt-4"><EmptyState title="Chưa có dữ liệu bán chạy" description="Dữ liệu sẽ xuất hiện sau khi có đơn hàng." /></div>
            )}
          </section>
        </>
      )}
    </AdminShell>
  );
}
