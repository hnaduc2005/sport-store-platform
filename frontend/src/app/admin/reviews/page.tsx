'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { apiFetch } from '@/lib/api';
import { products, reviews as fallbackReviews, type Review } from '@/lib/mock-data';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiFetch<Review[]>('/reviews').then(setReviews).catch(() => setMessage('Đang dùng dữ liệu demo.'));
  }, []);

  const updateVisibility = async (id: string, isVisible: boolean) => {
    setReviews((items) => items.map((item) => (item.id === id ? { ...item, isVisible } : item)));
    try {
      await apiFetch(`/reviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isVisible }),
      });
      setMessage('Đã cập nhật đánh giá.');
    } catch {
      setMessage('Đã cập nhật đánh giá ở chế độ demo.');
    }
  };

  const removeReview = async (id: string) => {
    setReviews((items) => items.filter((item) => item.id !== id));
    try {
      await apiFetch(`/reviews/${id}`, { method: 'DELETE' });
      setMessage('Đã xóa đánh giá.');
    } catch {
      setMessage('Đã xóa đánh giá khỏi danh sách demo.');
    }
  };

  return (
    <AdminShell title="Quản lý đánh giá" description="Xem, ẩn hoặc xóa đánh giá và bình luận sản phẩm.">
      {message ? <p className="text-[14px] font-bold text-primary">{message}</p> : null}
      <div className="grid gap-[16px]">
        {reviews.map((review) => {
          const product = products.find((item) => item.id === review.productId);

          return (
            <div key={review.id} className="rounded-card border border-neutral-border bg-white p-[20px]">
              <div className="flex flex-col justify-between gap-[12px] md:flex-row md:items-start">
                <div>
                  <p className="font-bold text-[16px] text-neutral-black">{product?.name ?? 'Sản phẩm'}</p>
                  <p className="mt-[4px] text-[14px] text-neutral-medium">{review.user?.name ?? 'Khách hàng'} • {review.rating}/5 sao</p>
                  <p className="mt-[12px] text-[14px] leading-[21px] text-neutral-dark">{review.comment}</p>
                </div>
                <div className="flex gap-[8px]">
                  <button onClick={() => updateVisibility(review.id, !(review.isVisible ?? true))} className="rounded-btn border border-neutral-light px-[12px] py-[8px] text-[14px] font-bold hover:bg-neutral-offwhite transition-colors">
                    {review.isVisible === false ? 'Hiện' : 'Ẩn'}
                  </button>
                  <button onClick={() => removeReview(review.id)} className="rounded-btn border border-neutral-light px-[12px] py-[8px] text-[14px] font-bold text-alert hover:border-alert transition-colors">
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
