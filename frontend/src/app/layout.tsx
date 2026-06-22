import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

export const metadata: Metadata = {
  title: 'BigSport Store',
  description: 'Website thương mại điện tử bán đồ thể thao.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        <SiteHeader />
        <main className="mx-auto max-w-container px-[12px] sm:px-[16px] lg:px-[20px] py-[24px]">{children}</main>
        <footer className="mt-[24px] border-t border-neutral-light bg-primary-deep text-white">
          <div className="mx-auto grid max-w-container gap-[32px] px-[20px] py-[32px] text-[14px] md:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <div>
              <p className="text-[24px] font-bold">BigSport Store</p>
              <p className="mt-[12px] max-w-md text-white/75 leading-[21px]">
                Cửa hàng thể thao dành cho chạy bộ, gym, bóng đá, bóng rổ và phụ kiện luyện tập.
              </p>
            </div>
            <div>
              <p className="text-[16px] font-bold">Chính sách</p>
              <div className="mt-[12px] grid gap-[12px] text-white/75">
                <Link href="/policies/returns" className="hover:text-white transition-colors">Đổi trả</Link>
                <Link href="/policies/warranty" className="hover:text-white transition-colors">Bảo hành</Link>
                <Link href="/policies/shipping" className="hover:text-white transition-colors">Vận chuyển</Link>
              </div>
            </div>
            <div>
              <p className="text-[16px] font-bold">Cửa hàng</p>
              <div className="mt-[12px] grid gap-[12px] text-white/75">
                <Link href="/contact" className="hover:text-white transition-colors">Liên hệ</Link>
                <span>12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</span>
                <span>Hotline: 0901 234 567</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
