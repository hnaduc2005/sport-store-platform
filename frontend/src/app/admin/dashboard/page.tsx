import Link from 'next/link';
import { adminStats } from '@/lib/mock-data';

const adminLinks = [
  { href: '/admin/products', label: 'San pham' },
  { href: '/admin/categories', label: 'Danh muc' },
  { href: '/admin/brands', label: 'Thuong hieu' },
  { href: '/admin/orders', label: 'Don hang' },
  { href: '/admin/users', label: 'Nguoi dung' },
  { href: '/admin/reports', label: 'Bao cao' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <section className="border-b border-zinc-200 pb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-court">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600">Tong quan nhanh cho van hanh cua hang the thao.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {adminStats.map((stat) => (
          <div key={stat.label} className="rounded border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-black text-ink">{stat.value}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {adminLinks.map((item) => (
          <Link key={item.href} href={item.href} className="rounded border border-zinc-200 bg-white p-5 font-bold text-ink hover:border-court">
            {item.label}
          </Link>
        ))}
      </section>
    </div>
  );
}

