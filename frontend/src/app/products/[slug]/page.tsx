'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { averageRating, entityName, money, productImage, salePercent } from '@/lib/format';
import { products as fallbackProducts, type Product } from '@/lib/mock-data';
import { addToCart, getSession } from '@/lib/store';

type ProductDetailPageProps = {
  params: {
    slug: string;
  };
};

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product>(fallbackProducts.find((item) => item.slug === params.slug) ?? fallbackProducts[0]);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const discount = salePercent(product);
  const avgRating = averageRating(product);

  useEffect(() => {
    let active = true;

    apiFetch<Product>(`/products/${params.slug}`)
      .then((data) => {
        if (active) setProduct(data);
      })
      .catch(() => {
        if (active) setMessage('Đang hiển thị dữ liệu demo vì chưa kết nối được API.');
      });

    return () => {
      active = false;
    };
  }, [params.slug]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setMessage('Đã thêm sản phẩm vào giỏ hàng.');
  };

  const handleReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const session = getSession();

    if (!session) {
      setReviewMessage('Vui lòng đăng nhập để đánh giá sản phẩm.');
      return;
    }

    try {
      const savedReview = await apiFetch<NonNullable<Product['reviews']>[number]>(`/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          userId: session.user.id,
          productId: product.id,
          rating,
          comment,
        }),
      });

      setProduct((value) => ({
        ...value,
        reviews: [savedReview, ...(value.reviews ?? [])],
      }));
      setComment('');
      setReviewMessage('Cảm ơn bạn đã gửi đánh giá.');
    } catch {
      setProduct((value) => ({
        ...value,
        reviews: [
          {
            id: `local-${Date.now()}`,
            userId: session.user.id,
            productId: value.id,
            rating,
            comment,
            isVisible: true,
            createdAt: new Date().toISOString(),
            user: session.user,
          },
          ...(value.reviews ?? []),
        ],
      }));
      setComment('');
      setReviewMessage('Đã lưu đánh giá ở chế độ demo.');
    }
  };

  return (
    <div className="space-y-[32px]">
      <div className="grid gap-[32px] lg:grid-cols-[1fr_420px]">
      <section className="overflow-hidden rounded-card border border-neutral-border bg-neutral-offwhite flex items-center justify-center">
        <img src={productImage(product)} alt={product.name} className="aspect-[4/3] w-full object-cover" />
      </section>
      <section className="space-y-[24px] lg:sticky lg:top-[100px] h-fit">
        <div>
          <p className="text-[12px] font-bold uppercase text-primary mb-[8px]">{entityName(product.brand)}</p>
          <h1 className="mt-[12px] text-[40px] font-medium leading-[48px] text-neutral-black">{product.name}</h1>
          <p className="mt-[16px] leading-[21px] text-[14px] text-neutral-medium">{product.description}</p>
        </div>
        <div className="flex items-center gap-[12px]">
          <span className="text-[32px] font-bold leading-[32px] text-neutral-black">{money(product.salePrice ?? product.price)}</span>
          {product.salePrice ? <span className="text-[16px] text-neutral-medium line-through">{money(product.price)}</span> : null}
          {discount ? <span className="rounded-btn bg-alert-vibrant px-[8px] py-[4px] text-[12px] font-bold text-white">-{discount}%</span> : null}
        </div>
        <div className="grid gap-[12px] rounded-card border border-neutral-border bg-white p-[16px] text-[14px] text-neutral-medium">
          <div className="flex justify-between">
            <span>Tồn kho</span>
            <span className="font-bold text-neutral-black">{product.stock} sản phẩm</span>
          </div>
          <div className="flex justify-between">
            <span>Đã bán</span>
            <span className="font-bold text-neutral-black">{product.sold ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Đánh giá</span>
            <span className="font-bold text-neutral-black">{avgRating ? `${avgRating.toFixed(1)}/5` : 'Chưa có'}</span>
          </div>
        </div>
        <label className="block">
          <span className="text-[14px] font-bold text-neutral-black">Số lượng</span>
          <input
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
            min={1}
            max={product.stock}
            type="number"
            className="input-form w-full mt-[8px]"
          />
        </label>
        <button onClick={handleAddToCart} className="btn-primary w-full py-[12px]">
          Thêm vào giỏ hàng
        </button>
        {message ? <p className="text-[14px] font-bold text-primary">{message}</p> : null}
        <div className="grid gap-[12px] pt-[24px] border-t border-neutral-light">
          <div className="flex items-center gap-[12px] text-[14px] text-neutral-dark font-medium">
            <svg className="w-[20px] h-[20px] text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            <span>Vận chuyển miễn phí toàn quốc</span>
          </div>
          <div className="flex items-center gap-[12px] text-[14px] text-neutral-dark font-medium">
            <svg className="w-[20px] h-[20px] text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            <span>Đổi trả dễ dàng trong 30 ngày</span>
          </div>
          <div className="flex items-center gap-[12px] text-[14px] text-neutral-dark font-medium">
            <svg className="w-[20px] h-[20px] text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span>Bảo hành chính hãng trọn đời</span>
          </div>
        </div>
        <Link href="/products" className="block text-[16px] font-normal text-primary hover:text-primary-hover transition-colors">
          Quay lại danh sách sản phẩm
        </Link>
      </section>
      </div>

      <section className="grid gap-[24px] lg:grid-cols-[1fr_360px]">
        <div className="rounded-card border border-neutral-border bg-white p-[20px]">
          <h2 className="text-[24px] font-medium leading-[28.8px] text-neutral-black">Đánh giá & bình luận</h2>
          <div className="mt-[20px] grid gap-[16px]">
            {(product.reviews ?? []).length ? (
              product.reviews?.map((review) => (
                <div key={review.id} className="rounded-card border border-neutral-light p-[16px]">
                  <div className="flex items-center justify-between gap-[12px]">
                    <p className="font-bold text-neutral-black">{review.user?.name ?? 'Khách hàng'}</p>
                    <p className="text-[14px] font-bold text-primary">{review.rating}/5 sao</p>
                  </div>
                  <p className="mt-[8px] text-[14px] leading-[21px] text-neutral-medium">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="rounded-card bg-neutral-offwhite p-[16px] text-[14px] text-neutral-medium">Chưa có đánh giá cho sản phẩm này.</p>
            )}
          </div>
        </div>

        <form onSubmit={handleReview} className="h-fit rounded-card border border-neutral-border bg-white p-[20px]">
          <h2 className="text-[20px] font-medium leading-[24px] text-neutral-black">Viết đánh giá</h2>
          <label className="mt-[16px] block text-[14px] font-bold text-neutral-black">
            Số sao
            <select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="input-form w-full mt-[8px]">
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} sao
                </option>
              ))}
            </select>
          </label>
          <label className="mt-[16px] block text-[14px] font-bold text-neutral-black">
            Bình luận
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              required
              className="mt-[8px] min-h-[112px] w-full rounded-none border border-neutral-inputLight px-[12px] py-[12px] text-[16px] text-[#495057] focus:border-primary focus:outline-none transition-colors"
              placeholder="Chia sẻ trải nghiệm của bạn"
            />
          </label>
          <button className="btn-primary w-full mt-[16px] bg-neutral-black hover:bg-neutral-dark">Gửi đánh giá</button>
          {reviewMessage ? <p className="mt-[12px] text-[14px] text-primary">{reviewMessage}</p> : null}
        </form>
      </section>
    </div>
  );
}
