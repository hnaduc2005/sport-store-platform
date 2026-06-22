'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clearSession, getCart, getSession, type Session } from '@/lib/store';

const navItems = [
  { href: '/', label: 'Trang chủ' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/contact', label: 'Liên hệ' },
  { href: '/orders', label: 'Đơn hàng' },
];

export function SiteHeader() {
  const [session, setSession] = useState<Session | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [open, setOpen] = useState(false);

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

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-light bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-container items-center justify-between gap-[12px] px-[12px] py-[12px] sm:px-[16px] lg:px-[20px]">
        <Link href="/" className="flex min-w-fit items-center gap-[12px] text-[18px] font-black text-neutral-black">
          <span className="flex h-[40px] w-[40px] items-center justify-center rounded-btn bg-primary text-[14px] font-black text-white">
            BS
          </span>
          BigSport
        </Link>
        <nav className="hidden items-center gap-[20px] text-[16px] font-normal text-neutral-black lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-primary">
              {item.label}
            </Link>
          ))}
          {session?.user.role === 'ADMIN' ? (
            <Link href="/admin/dashboard" className="transition-colors hover:text-primary">
              Quản trị
            </Link>
          ) : null}
        </nav>
        <div className="hidden items-center gap-[8px] sm:flex">
          <Link href="/cart" className="rounded-btn border border-neutral-light px-[12px] py-[8px] text-[14px] font-bold text-neutral-black hover:border-primary transition-colors">
            Giỏ hàng ({cartCount})
          </Link>
          {session ? (
            <>
              <Link href="/profile" className="rounded-btn border border-neutral-light px-[12px] py-[8px] text-[14px] font-bold text-neutral-black hover:border-primary transition-colors">
                {session.user.name ?? session.user.email}
              </Link>
              <button onClick={handleLogout} className="rounded-btn bg-neutral-black px-[12px] py-[8px] text-[14px] font-bold text-white hover:bg-neutral-dark transition-colors">
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-btn border border-neutral-input px-[12px] py-[8px] text-[14px] font-bold text-neutral-black hover:border-primary hover:text-primary transition-colors">
                Đăng nhập
              </Link>
              <Link href="/register" className="btn-primary py-[8px]">
                Đăng ký
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-[8px] lg:hidden">
          <Link href="/cart" className="relative p-[8px] text-neutral-black hover:text-primary transition-colors" aria-label="Giỏ hàng">
            <svg className="w-[24px] h-[24px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {cartCount > 0 ? <span className="absolute top-[0px] right-[0px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-alert-vibrant text-[10px] font-bold text-white">{cartCount}</span> : null}
          </Link>
          <button
            onClick={() => setOpen((value) => !value)}
            className="p-[8px] text-neutral-black hover:text-primary transition-colors"
            aria-label="Mở menu"
          >
            {open ? (
              <svg className="w-[24px] h-[24px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-[24px] h-[24px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-neutral-light bg-white px-[12px] py-[12px] lg:hidden">
          <nav className="mx-auto grid max-w-container gap-[8px] text-[14px] font-semibold text-neutral-dark">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-btn px-[12px] py-[12px] hover:bg-neutral-offwhite">
                {item.label}
              </Link>
            ))}
            {session?.user.role === 'ADMIN' ? (
              <Link href="/admin/dashboard" onClick={() => setOpen(false)} className="rounded-btn px-[12px] py-[12px] hover:bg-neutral-offwhite">
                Quản trị
              </Link>
            ) : null}
            {session ? (
              <button onClick={handleLogout} className="rounded-btn bg-neutral-black px-[12px] py-[12px] text-left text-white">
                Đăng xuất
              </button>
            ) : (
              <div className="grid gap-[8px] sm:grid-cols-2">
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-btn border border-neutral-input px-[12px] py-[12px] text-center text-neutral-black">
                  Đăng nhập
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="btn-primary py-[12px]">
                  Đăng ký
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
