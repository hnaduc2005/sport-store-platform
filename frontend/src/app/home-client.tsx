'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import { apiFetch } from '@/lib/api';
import type { Category, Product } from '@/lib/mock-data';

/* ── Static benefit items ── */
const benefits = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    title: 'Freeship toàn quốc',
    desc: 'Miễn phí vận chuyển cho đơn từ 1.500.000đ',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Hàng chính hãng 100%',
    desc: 'Sản phẩm đến thẳng từ nhà sản xuất uy tín',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    title: 'Đổi trả dễ dàng',
    desc: 'Hỗ trợ đổi size, trả hàng trong vòng 30 ngày',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
      </svg>
    ),
    title: 'Hỗ trợ 7/24',
    desc: 'Tư vấn chọn đồ, giải đáp thắc mắc mọi lúc',
  },
];

/* ── Sport categories with emojis ── */
const sportEmojis: Record<string, string> = {
  running: '🏃',
  training: '💪',
  football: '⚽',
  basketball: '🏀',
  accessories: '🎒',
};

/* ── Skeleton ── */
function ProductSkeleton() {
  return (
    <div className="rounded-card border border-brand-light bg-white overflow-hidden">
      <div className="skeleton" style={{ aspectRatio: '3/4' }} />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-3 w-1/3 rounded-full" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="skeleton h-5 w-1/2 rounded mt-1" />
      </div>
    </div>
  );
}

function CategorySkeleton() {
  return <div className="skeleton rounded-card" style={{ aspectRatio: '4/3' }} />;
}

export function HomeClientPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function loadHomeData() {
      setLoading(true);
      setError('');
      try {
        const [productData, categoryData] = await Promise.all([
          apiFetch<Product[]>('/products/featured'),
          apiFetch<Category[]>('/categories'),
        ]);
        if (!active) return;
        setFeaturedProducts(productData);
        setCategories(categoryData.filter(c => c.isActive !== false));
      } catch {
        if (!active) return;
        setFeaturedProducts([]);
        setCategories([]);
        setError('Không tải được dữ liệu. Vui lòng kiểm tra backend.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadHomeData();
    return () => { active = false; };
  }, []);

  return (
    <div>
      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] overflow-hidden bg-brand-black flex items-center">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1800&q=80"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 gradient-hero" />

        {/* Content */}
        <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8 w-full py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
            {/* Left — headline */}
            <div className="max-w-3xl animate-fade-in">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4 border border-accent/40 rounded-full px-3 py-1">
                T3Sport
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
                Đỉnh cao
                <br />
                <span className="text-accent">thể thao.</span>
                <br />
                Mọi buổi tập.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-gray-300 leading-relaxed">
                Giày chạy bộ, trang phục tập luyện, bóng đá, bóng rổ và phụ kiện chính hãng —
                được đồng bộ trực tiếp từ catalog sản phẩm.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="btn-primary px-7 py-3.5 text-base font-bold shadow-lg hover:shadow-accent/30"
                >
                  Mua sắm ngay →
                </Link>
                <Link
                  href="/products?onSale=true"
                  className="btn-secondary px-7 py-3.5 text-base font-bold"
                >
                  Xem khuyến mãi
                </Link>
              </div>
              {/* Stats bar */}
              <div className="mt-12 flex flex-wrap gap-8">
                {[
                  {
                    lbl: 'Khách hàng',
                    icon: (
                      <svg className="w-8 h-8 text-blue-400 drop-shadow-[0_0_12px_rgba(96,165,250,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )
                  },
                  {
                    lbl: 'Sản phẩm',
                    icon: (
                      <svg className="w-8 h-8 text-purple-400 drop-shadow-[0_0_12px_rgba(192,132,252,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )
                  },
                  {
                    lbl: 'Thương hiệu',
                    icon: (
                      <svg className="w-8 h-8 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    )
                  },
                  {
                    lbl: 'Chính hãng',
                    icon: (
                      <svg className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    )
                  }
                ].map(({ lbl, icon }) => (
                  <div key={lbl} className="flex flex-col items-center gap-1.5">
                    {icon}
                    <p className="text-[13px] font-medium text-gray-300 uppercase tracking-wider">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — category pills */}
            <div className="hidden lg:flex flex-col gap-3 min-w-[220px]">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Danh mục nhanh</p>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-white/10" />
                  ))
                : categories.slice(0, 5).map(cat => (
                    <Link
                      key={cat.slug}
                      href={`/products?category=${cat.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/8 px-4 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:border-accent/50 hover:bg-white/15"
                    >
                      <span className="text-xl">{sportEmojis[cat.slug] ?? '🏅'}</span>
                      <span>{cat.name}</span>
                      <svg className="ml-auto w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  ))
              }
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 animate-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BENEFITS BAR
      ══════════════════════════════════════════ */}
      <section className="bg-white border-b border-brand-light">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-brand-light">
            {benefits.map(b => (
              <div key={b.title} className="flex items-start gap-4 p-6 lg:p-7">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-bg text-accent">
                  {b.icon}
                </div>
                <div>
                  <p className="font-bold text-brand-black text-sm">{b.title}</p>
                  <p className="mt-0.5 text-xs text-brand-muted leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════════ */}
      <section className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="section-label">Danh mục</span>
            <h2 className="section-title mt-2">Mua theo môn thể thao</h2>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
            Xem tất cả
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => <CategorySkeleton key={i} />)}
          </div>
        ) : categories.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-card bg-brand-offwhite"
                style={{ aspectRatio: '4/3' }}
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 gradient-dark-bottom opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-bold text-white text-sm leading-tight">{cat.name}</p>
                  <p className="mt-0.5 text-xs text-white/70">{cat._count?.products ?? 0} sản phẩm</p>
                </div>
                <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-brand-light bg-white p-12 text-center text-brand-muted">
            Chưa có danh mục hoạt động.
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          PROMO BANNER
      ══════════════════════════════════════════ */}
      <section className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative overflow-hidden rounded-2xl bg-brand-black p-8 md:p-12">
          <img
            src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1400&q=80"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="badge-orange text-xs mb-3">Ưu đãi đặc biệt</span>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                Giảm <span className="text-accent">10%</span> đơn hàng hôm nay
              </h2>
              <p className="mt-3 text-gray-300 max-w-lg">
                Nhập mã <code className="font-mono font-bold text-accent bg-white/10 px-2 py-0.5 rounded text-sm">SPORT10</code> ở bước thanh toán.
                Áp dụng cho tất cả sản phẩm đang bán.
              </p>
            </div>
            <Link
              href="/products?onSale=true"
              className="btn-primary px-7 py-3.5 text-base font-bold whitespace-nowrap self-start md:self-center"
            >
              Xem sản phẩm sale
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════ */}
      <section className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="section-label">Nổi bật</span>
            <h2 className="section-title mt-2">Sản phẩm bán chạy</h2>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
            Xem tất cả
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-card border border-danger/30 bg-danger-light px-4 py-3 text-sm text-danger-dark font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : featuredProducts.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map(p => <ProductCard key={p.slug} product={p} />)}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-brand-light bg-white p-12 text-center">
            <p className="text-brand-muted">Chưa có sản phẩm nổi bật. Thêm sản phẩm trong trang admin.</p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/products" className="btn-outline px-8 py-3 font-semibold">
            Xem toàn bộ sản phẩm
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY US
      ══════════════════════════════════════════ */}
      <section className="bg-white border-t border-brand-light py-16">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="section-label">Cam kết</span>
            <h2 className="section-title mt-2">Tại sao chọn BigSport?</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Chọn lọc kỹ lưỡng',
                desc: 'Mỗi sản phẩm đều được kiểm định chất lượng và chọn lọc từ các nhà sản xuất uy tín hàng đầu thế giới.',
                img: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80',
              },
              {
                title: 'Đồng hành luyện tập',
                desc: 'Từ giày chạy đến phụ kiện gym — tất cả những gì bạn cần cho mỗi buổi tập đều có tại BigSport.',
                img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
              },
              {
                title: 'Giao hàng nhanh chóng',
                desc: 'Đội ngũ logistics chuyên nghiệp đảm bảo đơn hàng đến tay bạn an toàn trong 1-3 ngày làm việc.',
                img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
              },
            ].map(item => (
              <div key={item.title} className="group overflow-hidden rounded-xl border border-brand-light bg-brand-offwhite">
                <div className="overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <img
                    src={item.img}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-base font-bold text-brand-black mb-2">{item.title}</h3>
                  <p className="text-sm text-brand-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BRAND LOGOS
      ══════════════════════════════════════════ */}
      <section className="bg-brand-offwhite border-t border-brand-light py-12">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-brand-subtle mb-8">
            Thương hiệu đối tác
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
            {['Nike', 'Adidas', 'Puma', 'Under Armour', 'Wilson', 'New Balance'].map(brand => (
              <Link
                key={brand}
                href={`/products?brand=${brand.toLowerCase().replace(/ /g, '-')}`}
                className="text-xl font-black text-brand-subtle/60 transition-colors hover:text-brand-black tracking-tight"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
