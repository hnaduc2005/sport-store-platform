'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminNotice, EmptyState, LoadingBlocks, StatusBadge } from '@/components/admin-ui';
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
      totalRevenue: demoOrders.reduce((sum, order) => sum + Number(order.total), 0),
      totalOrders: demoOrders.length,
      totalUsers: 2,
      totalProducts: fallbackProducts.length,
      pendingOrders: demoOrders.filter((order) => order.status === 'PENDING').length,
      newContacts: demoContacts.filter((contact) => contact.status === 'NEW').length,
    },
    recentOrders: demoOrders,
    topProducts: fallbackProducts
      .slice()
      .sort((first, second) => (second.sold ?? 0) - (first.sold ?? 0))
      .slice(0, 5)
      .map((product) => ({
        productId: product.id,
        productName: product.name,
        _sum: { quantity: product.sold ?? 0, total: Number(product.salePrice ?? product.price) * (product.sold ?? 0) },
      })),
    revenueSeries: Array.from({ length: period === 'day' ? 14 : 12 }).map((_, index) => ({
      key: `demo-${index}`,
      label: period === 'day' ? `${String(index + 1).padStart(2, '0')}/06` : `${String(index + 1).padStart(2, '0')}/2026`,
      revenue: index % 3 === 0 ? 0 : 1200000 + index * 220000,
      orders: index % 3 === 0 ? 0 : 2 + index,
    })),
  };
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>('day');
  const [data, setData] = useState<DashboardData>(() => fallbackDashboard('day'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError('');

    apiFetch<DashboardData>(`/reports/dashboard?period=${period}`)
      .then((payload) => {
        if (active) setData(payload);
      })
      .catch(() => {
        if (active) {
          setData(fallbackDashboard(period));
          setError('Không tải được dữ liệu dashboard từ API. Đang hiển thị dữ liệu demo để tham khảo giao diện.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [period]);

  const metrics = useMemo(
    () => [
      { label: 'Doanh thu', value: money(data.summary.totalRevenue), hint: 'Tổng doanh thu ghi nhận' },
      { label: 'Đơn hàng', value: String(data.summary.totalOrders), hint: 'Tất cả đơn hàng' },
      { label: 'Khách hàng', value: String(data.summary.totalUsers), hint: 'Tài khoản trong hệ thống' },
      { label: 'Sản phẩm', value: String(data.summary.totalProducts), hint: 'SKU đang quản lý' },
      { label: 'Chờ xử lý', value: String(data.summary.pendingOrders), hint: 'Đơn cần xác nhận' },
      { label: 'Feedback mới', value: String(data.summary.newContacts), hint: 'Phản hồi chưa đọc' },
    ],
    [data],
  );

  const maxRevenue = Math.max(...data.revenueSeries.map((point) => point.revenue), 1);

  return (
    <AdminShell title="Dashboard" description="Tổng quan vận hành cửa hàng thể thao, đơn hàng, doanh thu và phản hồi khách hàng.">
      {error ? <AdminNotice type="error">{error}</AdminNotice> : null}

      {loading ? (
        <LoadingBlocks count={3} />
      ) : (
        <>
          <section className="grid gap-[16px] sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-card border border-neutral-border bg-white p-[20px]">
                <p className="text-[13px] font-bold text-neutral-medium">{metric.label}</p>
                <p className="mt-[12px] truncate text-[30px] font-bold leading-[32px] text-neutral-black">{metric.value}</p>
                <p className="mt-[8px] text-[13px] text-neutral-medium">{metric.hint}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-[24px] xl:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-card border border-neutral-border bg-white p-[20px]">
              <div className="flex flex-col gap-[12px] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[22px] font-bold leading-[26px] text-neutral-black">Doanh thu theo {period === 'day' ? 'ngày' : 'tháng'}</h2>
                  <p className="mt-[4px] text-[14px] text-neutral-medium">Dữ liệu lấy từ đơn hàng không bị hủy.</p>
                </div>
                <select value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="input-form w-full bg-white sm:w-[160px]">
                  <option value="day">14 ngày</option>
                  <option value="month">12 tháng</option>
                </select>
              </div>

              {data.revenueSeries.length ? (
                <div className="mt-[24px] flex h-[260px] items-end gap-[8px] overflow-x-auto border-b border-neutral-light pb-[12px]">
                  {data.revenueSeries.map((point) => {
                    const height = Math.max((point.revenue / maxRevenue) * 220, point.revenue ? 16 : 4);
                    return (
                      <div key={point.key} className="flex min-w-[42px] flex-1 flex-col items-center justify-end gap-[8px]">
                        <span className="text-[11px] font-bold text-neutral-medium">{compactNumber(point.revenue)}</span>
                        <div title={`${point.label}: ${money(point.revenue)} (${point.orders} đơn)`} className="w-full rounded-t-btn bg-primary" style={{ height }} />
                        <span className="text-[11px] text-neutral-medium">{point.label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="Chưa có dữ liệu doanh thu" description="Khi có đơn hàng, biểu đồ sẽ tự cập nhật." />
              )}
            </div>

            <div className="rounded-card border border-neutral-border bg-white p-[20px]">
              <h2 className="text-[22px] font-bold leading-[26px] text-neutral-black">Sản phẩm bán chạy</h2>
              <div className="mt-[16px] grid gap-[12px]">
                {data.topProducts.length ? (
                  data.topProducts.slice(0, 6).map((product, index) => (
                    <div key={product.productId} className="flex items-center justify-between gap-[12px] rounded-card border border-neutral-light p-[12px]">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-neutral-black">#{index + 1} {product.productName}</p>
                        <p className="text-[13px] text-neutral-medium">{product._sum.quantity ?? 0} sản phẩm</p>
                      </div>
                      <span className="text-[13px] font-bold text-primary">{money(product._sum.total)}</span>
                    </div>
                  ))
                ) : (
                  <EmptyState title="Chưa có sản phẩm bán chạy" />
                )}
              </div>
            </div>
          </section>

          <section className="rounded-card border border-neutral-border bg-white p-[20px]">
            <h2 className="text-[22px] font-bold leading-[26px] text-neutral-black">Đơn hàng gần đây</h2>
            {data.recentOrders.length ? (
              <div className="mt-[16px] overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-[14px]">
                  <thead className="bg-neutral-offwhite text-[12px] uppercase text-neutral-medium">
                    <tr>
                      <th className="px-[16px] py-[12px]">Mã đơn</th>
                      <th className="px-[16px] py-[12px]">Khách hàng</th>
                      <th className="px-[16px] py-[12px]">Tổng tiền</th>
                      <th className="px-[16px] py-[12px]">Trạng thái</th>
                      <th className="px-[16px] py-[12px]">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-light">
                    {data.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-neutral-offwhite">
                        <td className="px-[16px] py-[14px] font-bold text-neutral-black">{order.code}</td>
                        <td className="px-[16px] py-[14px]">{order.customerName}</td>
                        <td className="px-[16px] py-[14px] font-bold">{money(order.total)}</td>
                        <td className="px-[16px] py-[14px]"><StatusBadge status={order.status} /></td>
                        <td className="px-[16px] py-[14px] text-neutral-medium">{formatDateTime(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-[16px]"><EmptyState title="Chưa có đơn hàng" description="Đơn hàng mới sẽ xuất hiện tại đây." /></div>
            )}
          </section>
        </>
      )}
    </AdminShell>
  );
}
