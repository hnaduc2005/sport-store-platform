'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { apiFetch } from '@/lib/api';
import { money } from '@/lib/format';
import { adminStats } from '@/lib/mock-data';

const adminLinks = [
  { href: '/admin/products', label: 'Sản phẩm' },
  { href: '/admin/categories', label: 'Danh mục' },
  { href: '/admin/brands', label: 'Thương hiệu' },
  { href: '/admin/orders', label: 'Đơn hàng' },
  { href: '/admin/reviews', label: 'Đánh giá' },
  { href: '/admin/feedback', label: 'Feedback' },
  { href: '/admin/users', label: 'Người dùng' },
  { href: '/admin/reports', label: 'Báo cáo' },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(adminStats);

  useEffect(() => {
    apiFetch<{
      totalRevenue: number | string;
      totalOrders: number;
      totalUsers: number;
      totalProducts: number;
      totalContacts?: number;
      totalReviews?: number;
    }>('/reports/sales-summary')
      .then((data) =>
        setStats([
          { label: 'Doanh thu', value: money(data.totalRevenue) },
          { label: 'Đơn hàng', value: String(data.totalOrders) },
          { label: 'Khách hàng', value: String(data.totalUsers) },
          { label: 'Sản phẩm', value: String(data.totalProducts) },
          { label: 'Feedback', value: String(data.totalContacts ?? 0) },
          { label: 'Đánh giá', value: String(data.totalReviews ?? 0) },
        ]),
      )
      .catch(() => setStats(adminStats));
  }, []);

  return (
    <AdminShell title="Dashboard" description="Tổng quan nhanh cho vận hành cửa hàng thể thao.">
      <section className="grid gap-[24px] sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          let icon = null;
          let trend = '';
          let trendColor = '';
          if (stat.label === 'Doanh thu') {
            icon = <svg className="w-[24px] h-[24px] text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
            trend = '+12.5%';
            trendColor = 'text-[#0ea5e9] bg-[#e0f2fe]';
          } else if (stat.label === 'Đơn hàng') {
            icon = <svg className="w-[24px] h-[24px] text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
            trend = '+5.2%';
            trendColor = 'text-[#0ea5e9] bg-[#e0f2fe]';
          } else if (stat.label === 'Khách hàng') {
            icon = <svg className="w-[24px] h-[24px] text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
            trend = '+18.1%';
            trendColor = 'text-[#0ea5e9] bg-[#e0f2fe]';
          } else if (stat.label === 'Sản phẩm') {
            icon = <svg className="w-[24px] h-[24px] text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
          } else {
            icon = <svg className="w-[24px] h-[24px] text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
          }

          return (
            <div key={stat.label} className="rounded-card border border-neutral-border bg-white p-[24px] hover:shadow-lifted transition-shadow">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-bold text-neutral-medium">{stat.label}</p>
                <div className="rounded-full bg-neutral-offwhite p-[8px]">
                  {icon}
                </div>
              </div>
              <div className="mt-[16px] flex items-end gap-[12px]">
                <p className="text-[32px] font-bold leading-[32px] text-neutral-black truncate">{stat.value}</p>
                {trend ? <span className={`text-[12px] font-bold px-[8px] py-[4px] rounded-btn ${trendColor} mb-[2px] shrink-0`}>{trend}</span> : null}
              </div>
            </div>
          );
        })}
      </section>
      <section className="grid gap-[24px] md:grid-cols-3">
        {adminLinks.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-card border border-neutral-border bg-white p-[20px] font-bold text-[16px] text-neutral-black hover:border-primary hover:text-primary transition-colors flex items-center justify-between group">
            {item.label}
            <svg className="w-[20px] h-[20px] text-neutral-light group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </Link>
        ))}
      </section>
    </AdminShell>
  );
}
