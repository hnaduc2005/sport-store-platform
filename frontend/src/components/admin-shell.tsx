'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { getSession, type Session } from '@/lib/store';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/products', label: 'Sản phẩm' },
  { href: '/admin/categories', label: 'Danh mục' },
  { href: '/admin/brands', label: 'Thương hiệu' },
  { href: '/admin/orders', label: 'Đơn hàng' },
  { href: '/admin/reviews', label: 'Đánh giá' },
  { href: '/admin/feedback', label: 'Feedback' },
  { href: '/admin/users', label: 'Người dùng' },
  { href: '/admin/reports', label: 'Báo cáo' },
];

type AdminShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AdminShell({ title, description, children }: AdminShellProps) {
  const [session, setSession] = useState<Session | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setSession(getSession());
  }, []);

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <section className="mx-auto max-w-2xl rounded-card border border-neutral-border bg-white p-[24px] text-center">
        <p className="text-[12px] font-bold uppercase text-primary">Admin</p>
        <h1 className="mt-[8px] text-[32px] font-bold leading-[32px] text-neutral-black">Cần quyền quản trị</h1>
        <p className="mt-[12px] text-[14px] leading-[21px] text-neutral-medium">Vui lòng đăng nhập bằng tài khoản admin để truy cập khu vực quản trị.</p>
        <Link href="/login" className="btn-primary mt-[20px] inline-flex">
          Đăng nhập admin
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-[24px] lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-card border border-neutral-border bg-white p-[12px]">
        <nav className="grid gap-[4px] text-[14px] font-bold">
          {adminLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`rounded-btn px-[12px] py-[12px] transition-colors ${isActive ? 'bg-primary text-white' : 'text-neutral-dark hover:bg-neutral-offwhite hover:text-primary'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <section className="space-y-[24px]">
        <div className="border-b border-neutral-light pb-[20px]">
          <p className="text-[12px] font-bold uppercase text-primary">Admin</p>
          <h1 className="mt-[8px] text-[32px] font-bold leading-[32px] text-neutral-black">{title}</h1>
          <p className="mt-[8px] text-[14px] leading-[21px] text-neutral-medium">{description}</p>
        </div>
        {children}
      </section>
    </div>
  );
}
