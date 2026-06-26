import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'T3Sport Store — Đồ Thể Thao Chính Hãng',
    template: '%s | T3Sport Store',
  },
  description:
    'T3Sport Store — Cửa hàng thể thao chính hãng: giày chạy bộ, trang phục gym, bóng đá, bóng rổ và phụ kiện luyện tập chất lượng cao.',
  keywords: ['đồ thể thao', 'giày chạy bộ', 'gym', 'bóng đá', 'bóng rổ', 'T3Sport'],
  openGraph: {
    siteName: 'T3Sport Store',
    locale: 'vi_VN',
    type: 'website',
  },
};

/* ─── Footer links ─── */
const footerLinks = {
  shop: [
    { href: '/products',              label: 'Tất cả sản phẩm' },
    { href: '/products?category=running',    label: 'Giày chạy bộ' },
    { href: '/products?category=training',   label: 'Tập luyện' },
    { href: '/products?category=football',   label: 'Bóng đá' },
    { href: '/products?category=basketball', label: 'Bóng rổ' },
  ],
  policies: [
    { href: '/policies/shipping',  label: 'Chính sách vận chuyển' },
    { href: '/policies/returns',   label: 'Đổi trả & hoàn tiền' },
    { href: '/policies/warranty',  label: 'Bảo hành sản phẩm' },
  ],
  support: [
    { href: '/contact', label: 'Liên hệ hỗ trợ' },
    { href: '/orders',  label: 'Tra cứu đơn hàng' },
    { href: '/profile', label: 'Tài khoản của tôi' },
  ],
};

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen flex flex-col bg-brand-offwhite">
        <SiteHeader />

        {/* ─── Main content ─── */}
        <main className="flex-1">
          {children}
        </main>

        {/* ─── Footer ─── */}
        <footer className="bg-brand-black text-gray-300 mt-16">
          {/* Top band */}
          <div className="border-b border-white/10">
            <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
              {/* Brand col */}
              <div>
                <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-accent font-black text-sm text-white">
                    T3
                  </div>
                  <span className="text-xl font-black text-white tracking-tight">
                    T3<span className="text-accent">Sport</span>
                  </span>
                </Link>
                <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
                  Cửa hàng thể thao dành cho chạy bộ, gym, bóng đá, bóng rổ và phụ kiện luyện tập chính hãng.
                </p>
                {/* Social links */}
                <div className="flex gap-3 mt-6">
                  {socialLinks.map(s => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex h-9 w-9 items-center justify-center rounded-btn bg-white/8 text-gray-400 transition-all hover:bg-accent hover:text-white"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Shop col */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Cửa hàng</p>
                <ul className="space-y-2.5">
                  {footerLinks.shop.map(l => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Policies col */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Chính sách</p>
                <ul className="space-y-2.5">
                  {footerLinks.policies.map(l => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support col */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Hỗ trợ</p>
                <ul className="space-y-2.5">
                  {footerLinks.support.map(l => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 space-y-1.5 text-sm text-gray-500">
                  <p className="font-medium text-gray-400">12 Nguyễn Huệ, Q.1, TP.HCM</p>
                  <p>Hotline: <a href="tel:0901234567" className="text-gray-400 hover:text-white">0901 234 567</a></p>
                  <p>8:00 – 21:00 hằng ngày</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500">
            <p>© {new Date().getFullYear()} T3Sport Store. Bảo lưu mọi quyền.</p>
            <div className="flex gap-4">
              <Link href="/policies/returns" className="hover:text-gray-300 transition-colors">Đổi trả</Link>
              <Link href="/policies/warranty" className="hover:text-gray-300 transition-colors">Bảo hành</Link>
              <Link href="/policies/shipping" className="hover:text-gray-300 transition-colors">Vận chuyển</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
