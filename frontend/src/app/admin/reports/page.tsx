'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { apiFetch } from '@/lib/api';
import { money } from '@/lib/format';

export default function AdminReportsPage() {
  const [rows, setRows] = useState([
    ['Doanh thu', '24,8 triệu', '+12%'],
    ['Sản phẩm bán chạy', 'Nike Air Zoom Runner', '+8%'],
    ['Tỷ lệ hủy đơn', '2,1%', '-0,4%'],
  ]);

  useEffect(() => {
    Promise.all([
      apiFetch<{ totalRevenue: number | string; totalOrders: number; totalProducts: number; totalUsers: number }>('/reports/sales-summary'),
      apiFetch<Array<{ productName: string; _sum: { quantity: number | null; total: number | string | null } }>>('/reports/top-products'),
    ])
      .then(([summary, topProducts]) =>
        setRows([
          ['Doanh thu', money(summary.totalRevenue), `${summary.totalOrders} đơn`],
          ['Sản phẩm', String(summary.totalProducts), `${summary.totalUsers} khách hàng`],
          ['Bán chạy', topProducts[0]?.productName ?? 'Chưa có', `${topProducts[0]?._sum.quantity ?? 0} lượt`],
        ]),
      )
      .catch(() => undefined);
  }, []);

  return (
    <AdminShell title="Báo cáo" description="Báo cáo doanh thu, sản phẩm bán chạy và hiệu suất catalog.">
      <div className="overflow-x-auto rounded-[8px] border border-black/10 bg-white">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-[#F5F5F5] text-xs uppercase text-[#666666]">
            <tr>
              <th className="px-4 py-3">Chỉ số</th>
              <th className="px-4 py-3">Giá trị</th>
              <th className="px-4 py-3">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EBEBEB]">
            {rows.map((row) => (
              <tr key={row.join('-')}>
                {row.map((cell) => (
                  <td key={cell} className="px-4 py-4">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
