'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { clearSession, getCart, getSession, type Session } from '@/lib/store';

const navItems = [
  { href: '/',         label: 'Trang chủ' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/contact',  label: 'Liên hệ' },
  { href: '/orders',   label: 'Đơn hàng' },
];

const CartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export function SiteHeader() {
  const [session, setSession] = useState<Session | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  /* ── Sync session & cart ── */
  useEffect(() => {
    const sync = () => {
      setSession(getSession());
      setCartCount(getCart().reduce((sum, item) => sum + item.quantity, 0));
    };
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('sport-store-updated', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('sport-store-updated', sync);
    };
  }, []);

  /* ── Scroll shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Close mobile on route change ── */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setMobileOpen(false);
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-brand-black/98 shadow-lg backdrop-blur-sm'
            : 'bg-brand-black'
        }`}
      >
        <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-4 py-0 sm:px-6 lg:px-8">

          {/* ─── Logo ─── */}
          <Link
            href="/"
            className="group flex min-w-fit items-center gap-2.5 py-4 transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-accent text-white font-black text-xs tracking-wider">
              BS
            </div>
            <span className="text-base font-black text-white tracking-tight">
              Big<span className="text-accent">Sport</span>
            </span>
          </Link>

          {/* ─── Desktop nav ─── */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-4 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-accent'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            ))}
            {session?.user.role === 'ADMIN' && (
              <Link
                href="/admin/dashboard"
                className={`relative flex items-center gap-1.5 px-3 py-4 text-sm font-medium transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'text-accent'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <ShieldIcon />
                Quản trị
                {pathname.startsWith('/admin') && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            )}
          </nav>

          {/* ─── Desktop actions ─── */}
          <div className="hidden items-center gap-2 sm:flex">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 rounded-btn border border-white/15 px-3 py-2 text-sm font-medium text-gray-200 transition-all hover:border-accent/60 hover:text-accent"
            >
              <CartIcon />
              <span className="hidden sm:inline">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {session ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-btn border border-white/15 px-3 py-2 text-sm font-medium text-gray-200 transition-all hover:border-accent/60 hover:text-accent"
                >
                  <UserIcon />
                  <span className="max-w-[120px] truncate">{session.user.name ?? session.user.email}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-btn bg-white/10 px-3 py-2 text-sm font-medium text-gray-200 transition-all hover:bg-white/20 hover:text-white"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-btn px-3 py-2 text-sm font-medium text-gray-200 transition-all hover:text-white"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* ─── Mobile actions ─── */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/cart" className="relative p-2 text-gray-300 hover:text-accent transition-colors" aria-label="Giỏ hàng">
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* ─── Mobile menu ─── */}
        {mobileOpen && (
          <div className="border-t border-white/10 bg-brand-charcoal animate-fade-in lg:hidden">
            <nav className="mx-auto max-w-container space-y-1 px-4 py-4 sm:px-6">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-btn px-4 py-3 text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-accent/15 text-accent'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {session?.user.role === 'ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center gap-2 rounded-btn px-4 py-3 text-sm font-medium transition-all ${
                    pathname.startsWith('/admin')
                      ? 'bg-accent/15 text-accent'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <ShieldIcon />
                  Quản trị
                </Link>
              )}

              <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                {session ? (
                  <>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-btn px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <UserIcon />
                      {session.user.name ?? session.user.email}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-btn bg-white/10 px-4 py-3 text-left text-sm font-medium text-gray-300 hover:bg-white/20 hover:text-white transition-all"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      className="rounded-btn border border-white/20 px-4 py-3 text-center text-sm font-medium text-gray-300 hover:border-white/40 hover:text-white transition-all"
                    >
                      Đăng nhập
                    </Link>
                    <Link href="/register" className="btn-primary py-3 text-center text-sm">
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
