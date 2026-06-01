import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Trang chu' },
  { href: '/products', label: 'San pham' },
  { href: '/cart', label: 'Gio hang' },
  { href: '/orders', label: 'Don hang' },
  { href: '/admin/dashboard', label: 'Admin' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-lg font-black tracking-tight text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded bg-ink text-sm font-black text-white">
            SS
          </span>
          Sport Store
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-zinc-600 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded border border-zinc-300 px-3 py-2 text-sm font-semibold text-ink">
            Dang nhap
          </Link>
          <Link href="/register" className="rounded bg-court px-3 py-2 text-sm font-semibold text-white">
            Dang ky
          </Link>
        </div>
      </div>
    </header>
  );
}

