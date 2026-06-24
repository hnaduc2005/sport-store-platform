'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminNotice, EmptyState, LoadingBlocks } from '@/components/admin-ui';
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
      <div className="flex flex-col gap-[12px] rounded-card border border-neutral-border bg-white p-[16px] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[16px] font-bold text-neutral-black">Khoảng thời gian</p>
          <p className="text-[14px] text-neutral-medium">Chọn cách gom nhóm doanh thu theo ngày hoặc tháng.</p>
        </div>
        <select value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="input-form bg-white sm:w-[180px]">
          <option value="day">14 ngày</option>
          <option value="month">12 tháng</option>
        </select>
      </div>

      {error ? <AdminNotice type="error">{error}</AdminNotice> : null}

      {loading ? (
        <LoadingBlocks count={3} />
      ) : (
        <>
          <section className="grid gap-[16px] sm:grid-cols-2 xl:grid-cols-3">
            {cards.map(([label, value]) => (
              <div key={label} className="rounded-card border border-neutral-border bg-white p-[20px]">
                <p className="text-[13px] font-bold text-neutral-medium">{label}</p>
                <p className="mt-[12px] truncate text-[28px] font-bold leading-[32px] text-neutral-black">{value}</p>
              </div>
            ))}
          </section>

          <section className="rounded-card border border-neutral-border bg-white p-[20px]">
            <h2 className="text-[22px] font-bold leading-[26px] text-neutral-black">Biểu đồ doanh thu</h2>
            {revenueSeries.length ? (
              <div className="mt-[24px] flex h-[260px] items-end gap-[8px] overflow-x-auto border-b border-neutral-light pb-[12px]">
                {revenueSeries.map((point) => {
                  const height = Math.max((point.revenue / maxRevenue) * 220, point.revenue ? 16 : 4);
                  return (
                    <div key={point.key} className="flex min-w-[42px] flex-1 flex-col items-center justify-end gap-[8px]">
                      <span className="text-[11px] font-bold text-neutral-medium">{compactNumber(point.revenue)}</span>
                      <div title={`${point.label}: ${money(point.revenue)}`} className="w-full rounded-t-btn bg-primary" style={{ height }} />
                      <span className="text-[11px] text-neutral-medium">{point.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="Chưa có dữ liệu doanh thu" />
            )}
          </section>

          <section className="rounded-card border border-neutral-border bg-white p-[20px]">
            <h2 className="text-[22px] font-bold leading-[26px] text-neutral-black">Sản phẩm bán chạy</h2>
            {topProducts.length ? (
              <div className="mt-[16px] overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-[14px]">
                  <thead className="bg-neutral-offwhite text-[12px] uppercase text-neutral-medium">
                    <tr>
                      <th className="px-[16px] py-[12px]">Sản phẩm</th>
                      <th className="px-[16px] py-[12px]">Số lượng</th>
                      <th className="px-[16px] py-[12px]">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-light">
                    {topProducts.map((product) => (
                      <tr key={product.productId}>
                        <td className="px-[16px] py-[14px] font-bold text-neutral-black">{product.productName}</td>
                        <td className="px-[16px] py-[14px]">{product._sum.quantity ?? 0}</td>
                        <td className="px-[16px] py-[14px] font-bold">{money(product._sum.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-[16px]"><EmptyState title="Chưa có dữ liệu bán chạy" description="Dữ liệu sẽ xuất hiện sau khi có đơn hàng." /></div>
            )}
          </section>
        </>
      )}
    </AdminShell>
  );
}
