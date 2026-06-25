'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { averageRating, entityName, formatDate, money, productImage, salePercent } from '@/lib/format';
import type { Product } from '@/lib/mock-data';
import { addToCart, getSession } from '@/lib/store';

type ProductDetailPageProps = { params: { slug: string } };

function StarRating({ value, interactive = false, onRate }: { value: number; interactive?: boolean; onRate?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          tabIndex={interactive ? 0 : -1}
        >
          <svg
            className={`${interactive ? 'w-6 h-6' : 'w-4 h-4'} transition-colors ${
              star <= (hover || Math.round(value)) ? 'text-amber-400' : 'text-gray-200'
            }`}
            fill="currentColor" viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartMsg, setCartMsg] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setCartMsg(''); setActiveImg(0);
    apiFetch<Product>(`/products/${params.slug}`)
      .then(data => { if (active) { setProduct(data); setQuantity(1); } })
      .catch(() => { if (active) { setProduct(null); setError('Không tải được sản phẩm hoặc sản phẩm không còn hoạt động.'); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params.slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    window.dispatchEvent(new Event('sport-store-updated'));
    setCartMsg('✓ Đã thêm vào giỏ hàng!');
    setTimeout(() => setCartMsg(''), 3000);
  };

  const handleReview = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;
    const session = getSession();
    if (!session) { setReviewMsg('Vui lòng đăng nhập để đánh giá.'); return; }
    setSubmitting(true);
    try {
      const saved = await apiFetch<NonNullable<Product['reviews']>[number]>('/reviews', {
        method: 'POST',
        body: JSON.stringify({ userId: session.user.id, productId: product.id, rating, comment }),
      });
      setProduct(v => v ? { ...v, reviews: [saved, ...(v.reviews ?? [])] } : v);
      setComment(''); setReviewMsg('✓ Cảm ơn bạn đã gửi đánh giá!');
    } catch {
      setProduct(v => v ? {
        ...v, reviews: [{
          id: `local-${Date.now()}`, userId: session.user.id, productId: v.id,
          rating, comment, isVisible: true, createdAt: new Date().toISOString(), user: session.user,
        }, ...(v.reviews ?? [])],
      } : v);
      setComment(''); setReviewMsg('✓ Đánh giá đã lưu tạm thời trên trình duyệt.');
    } finally { setSubmitting(false); }
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          <div className="skeleton rounded-card" style={{ aspectRatio: '3/4' }} />
          <div className="space-y-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`skeleton rounded h-${i === 0 ? 4 : i === 2 ? 10 : 5} w-${i % 2 === 0 ? 'full' : '3/4'}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!product) {
    return (
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-offwhite text-4xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-brand-black">Không tìm thấy sản phẩm</h1>
        <p className="mt-2 text-brand-muted">{error || 'Sản phẩm chưa được tạo hoặc đang bị ẩn.'}</p>
        <Link href="/products" className="btn-primary mt-6 inline-flex">← Quay lại danh sách</Link>
      </div>
    );
  }

  const discount = salePercent(product);
  const avgRating = averageRating(product);
  const images = product.images?.length ? product.images : [productImage(product)];
  const visibleReviews = (product.reviews ?? []).filter(r => r.isVisible !== false);

  return (
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-brand-muted">
        <Link href="/" className="hover:text-accent transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-accent transition-colors">Sản phẩm</Link>
        <span>/</span>
        <span className="text-brand-black font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* ── Main layout ── */}
      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        {/* Left — Gallery */}
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-xl bg-brand-offwhite border border-brand-light" style={{ aspectRatio: '3/4' }}>
            <img
              src={images[activeImg]}
              alt={product.name}
              className="h-full w-full object-cover transition-opacity duration-300"
            />
            {discount > 0 && (
              <div className="absolute left-4 top-4">
                <span className="badge-orange text-sm font-bold px-3 py-1.5">-{discount}%</span>
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    i === activeImg ? 'border-accent' : 'border-transparent hover:border-brand-light'
                  }`}
                  style={{ width: 72, height: 72 }}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — Info (sticky) */}
        <div className="lg:sticky lg:top-24 h-fit space-y-6">
          {/* Brand + title */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">{entityName(product.brand)}</span>
              <span className="text-brand-subtle">·</span>
              <span className="text-xs text-brand-muted">{entityName(product.category)}</span>
            </div>
            <h1 className="text-3xl font-bold text-brand-black leading-tight">{product.name}</h1>
            {/* Rating summary */}
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating value={avgRating} />
                <span className="text-sm font-semibold text-brand-black">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-brand-muted">({visibleReviews.length} đánh giá)</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-brand-black">
              {money(product.salePrice ?? product.price)}
            </span>
            {product.salePrice && (
              <span className="text-xl text-brand-subtle line-through">{money(product.price)}</span>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-sm text-brand-muted leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Stock info */}
          <div className="rounded-xl border border-brand-light bg-brand-offwhite p-4 grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="font-bold text-brand-black">{product.stock}</p>
              <p className="text-brand-muted text-xs mt-0.5">Tồn kho</p>
            </div>
            <div>
              <p className="font-bold text-brand-black">{product.sold ?? 0}</p>
              <p className="text-brand-muted text-xs mt-0.5">Đã bán</p>
            </div>
            <div>
              <p className="font-bold text-brand-black">{avgRating > 0 ? avgRating.toFixed(1) + '★' : '—'}</p>
              <p className="text-brand-muted text-xs mt-0.5">Đánh giá</p>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="form-label">Số lượng</label>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center border border-brand-light rounded-btn overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2.5 text-brand-dark hover:bg-brand-offwhite transition-colors font-bold"
                >−</button>
                <span className="w-12 text-center font-bold text-brand-black text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-4 py-2.5 text-brand-dark hover:bg-brand-offwhite transition-colors font-bold"
                >+</button>
              </div>
              <span className="text-xs text-brand-muted">Còn {product.stock} sản phẩm</span>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="btn-dark w-full py-4 text-base font-bold disabled:opacity-50"
            >
              {product.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            </button>
            <Link
              href="/checkout"
              onClick={handleAddToCart}
              className="btn-primary w-full py-4 text-base font-bold text-center block"
            >
              Mua ngay
            </Link>
            {cartMsg && (
              <p className="text-center text-sm font-semibold text-success animate-fade-in">{cartMsg}</p>
            )}
          </div>

          {/* Trust badges */}
          <div className="border-t border-brand-light pt-5 grid gap-3">
            {[
              ['Vận chuyển miễn phí toàn quốc', '🚚'],
              ['Đổi trả dễ dàng trong 30 ngày', '🔄'],
              ['Bảo hành chính hãng trọn đời', '🛡️'],
            ].map(([text, icon]) => (
              <div key={text} className="flex items-center gap-3 text-sm text-brand-dark">
                <span className="text-lg">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs: Mô tả / Đánh giá ── */}
      <div className="rounded-xl border border-brand-light bg-white overflow-hidden">
        {/* Tab nav */}
        <div className="flex border-b border-brand-light">
          {([
            { id: 'desc', label: 'Mô tả sản phẩm' },
            { id: 'specs', label: 'Thông số' },
            { id: 'reviews', label: `Đánh giá (${visibleReviews.length})` },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-brand-muted hover:text-brand-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 lg:p-8">
          {activeTab === 'desc' && (
            <div className="prose prose-sm max-w-none text-brand-dark leading-relaxed">
              {product.description
                ? <p>{product.description}</p>
                : <p className="text-brand-muted italic">Chưa có mô tả chi tiết cho sản phẩm này.</p>}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['SKU', product.sku],
                ['Danh mục', entityName(product.category)],
                ['Thương hiệu', entityName(product.brand)],
                ['Tồn kho', `${product.stock} sản phẩm`],
                ['Đã bán', `${product.sold ?? 0} sản phẩm`],
                ['Giá bán', money(product.salePrice ?? product.price)],
                ...(product.salePrice ? [['Giá gốc', money(product.price)]] : []),
              ].map(([key, val]) => (
                <div key={key} className="flex justify-between py-3 border-b border-brand-light last:border-0">
                  <span className="text-sm text-brand-muted">{key}</span>
                  <span className="text-sm font-semibold text-brand-black">{val}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              {/* Review list */}
              <div className="space-y-4">
                {visibleReviews.length ? (
                  visibleReviews.map(r => (
                    <div key={r.id} className="rounded-xl border border-brand-light p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-brand-black text-sm">{r.user?.name ?? 'Khách hàng'}</p>
                          <p className="text-xs text-brand-muted mt-0.5">{formatDate(r.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <StarRating value={r.rating} />
                          <span className="text-xs font-semibold text-brand-black">{r.rating}.0</span>
                        </div>
                      </div>
                      {r.comment && <p className="mt-3 text-sm text-brand-dark leading-relaxed">{r.comment}</p>}
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-brand-muted">
                    <p className="text-4xl mb-3">💬</p>
                    <p className="font-semibold">Chưa có đánh giá nào.</p>
                    <p className="text-sm mt-1">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                  </div>
                )}
              </div>

              {/* Write review form */}
              <form onSubmit={handleReview} className="rounded-xl border border-brand-light p-5 h-fit space-y-4">
                <h3 className="font-bold text-brand-black text-base">Viết đánh giá</h3>
                <div>
                  <label className="form-label">Số sao</label>
                  <div className="mt-2">
                    <StarRating value={rating} interactive onRate={setRating} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Bình luận</label>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    required
                    rows={4}
                    className="textarea-form w-full mt-1"
                    placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                  />
                </div>
                {reviewMsg && <p className="text-sm font-semibold text-success">{reviewMsg}</p>}
                <button disabled={submitting} className="btn-dark w-full py-3 disabled:opacity-60">
                  {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Back link */}
      <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Quay lại danh sách sản phẩm
      </Link>
    </div>
  );
}
