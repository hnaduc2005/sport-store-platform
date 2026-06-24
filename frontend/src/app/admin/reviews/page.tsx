'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminModal, AdminNotice, EmptyState, LoadingBlocks, StatusBadge, TableActionButton } from '@/components/admin-ui';
import { ApiError, apiFetch, type PaginatedResponse, queryString } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import type { Product, Review } from '@/lib/mock-data';

type AdminReview = Review & {
  product?: Pick<Product, 'id' | 'name' | 'slug' | 'sku'>;
};

type AdminProductListResponse = Product[] | PaginatedResponse<Product>;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState({ productId: '', rating: '', visibility: 'all', page: 1, limit: 10 });
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, pageCount: 1 });
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [reviewData, productData] = await Promise.all([
        apiFetch<PaginatedResponse<AdminReview>>(`/reviews${queryString(filters)}`),
        apiFetch<AdminProductListResponse>('/products/admin/list?limit=100'),
      ]);
      setReviews(reviewData.data);
      setMeta(reviewData.meta);
      setProducts(Array.isArray(productData) ? productData : productData.data);
    } catch {
      setReviews([]);
      setProducts([]);
      setMeta({ total: 0, page: filters.page, limit: filters.limit, pageCount: 1 });
      setError('Không tải được đánh giá từ API. Vui lòng kiểm tra đăng nhập admin, backend hoặc database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const setFilter = (patch: Partial<typeof filters>) => {
    setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  };

  const updateVisibility = async (review: AdminReview, isVisible: boolean) => {
    setMessage('');
    try {
      const updated = await apiFetch<AdminReview>(`/reviews/${review.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isVisible }),
      });
      setReviews((items) => items.map((item) => (item.id === review.id ? updated : item)));
      setMessage('Đã cập nhật đánh giá.');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không thể cập nhật đánh giá.');
    }
  };

  const removeReview = async (review: AdminReview) => {
    if (!window.confirm('Ẩn mềm đánh giá này?')) return;

    try {
      const updated = await apiFetch<AdminReview>(`/reviews/${review.id}`, { method: 'DELETE' });
      setReviews((items) => items.map((item) => (item.id === review.id ? updated : item)));
      setSelectedReview((current) => (current?.id === review.id ? updated : current));
      setMessage('Đã ẩn đánh giá.');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không thể ẩn đánh giá.');
    }
  };

  const productName = (review: AdminReview) => review.product?.name ?? products.find((product) => product.id === review.productId)?.name ?? 'Sản phẩm';

  return (
    <AdminShell title="Quản lý đánh giá" description="Lọc, duyệt, ẩn/hiện hoặc xóa đánh giá sản phẩm từ khách hàng.">
      <div className="grid gap-[12px] rounded-card border border-neutral-border bg-white p-[16px] md:grid-cols-3">
        <select value={filters.productId} onChange={(event) => setFilter({ productId: event.target.value })} className="input-form bg-white">
          <option value="">Tất cả sản phẩm</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
        </select>
        <select value={filters.rating} onChange={(event) => setFilter({ rating: event.target.value })} className="input-form bg-white">
          <option value="">Mọi số sao</option>
          {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} sao</option>)}
        </select>
        <select value={filters.visibility} onChange={(event) => setFilter({ visibility: event.target.value })} className="input-form bg-white">
          <option value="all">Tất cả trạng thái</option>
          <option value="visible">Đang hiển thị</option>
          <option value="hidden">Đang ẩn</option>
        </select>
      </div>

      {error ? <AdminNotice type="error">{error}</AdminNotice> : null}
      {message ? <AdminNotice type={message.startsWith('Đã') ? 'success' : 'error'}>{message}</AdminNotice> : null}

      {loading ? (
        <LoadingBlocks count={4} />
      ) : reviews.length ? (
        <div className="grid gap-[16px]">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-card border border-neutral-border bg-white p-[20px]">
              <div className="flex flex-col justify-between gap-[16px] lg:flex-row lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-[8px]">
                    <p className="font-bold text-[16px] text-neutral-black">{productName(review)}</p>
                    <StatusBadge status={review.isVisible === false ? 'inactive' : 'active'}>{review.isVisible === false ? 'Đang ẩn' : 'Hiển thị'}</StatusBadge>
                  </div>
                  <p className="mt-[4px] text-[14px] text-neutral-medium">
                    {review.user?.name ?? review.user?.email ?? 'Khách hàng'} • {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} • {formatDateTime(review.createdAt)}
                  </p>
                  <p className="mt-[12px] text-[14px] leading-[21px] text-neutral-dark">{review.comment || 'Không có nội dung.'}</p>
                </div>
                <div className="flex shrink-0 gap-[8px]">
                  <TableActionButton onClick={() => setSelectedReview(review)} tone="neutral">Chi tiết</TableActionButton>
                  <TableActionButton onClick={() => updateVisibility(review, !(review.isVisible ?? true))} tone="primary">
                    {review.isVisible === false ? 'Hiện' : 'Ẩn'}
                  </TableActionButton>
                  <TableActionButton onClick={() => removeReview(review)} tone="danger">Ẩn mềm</TableActionButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Không có đánh giá" description="Đánh giá mới từ khách hàng sẽ xuất hiện tại đây." />
      )}

      <div className="flex flex-col justify-between gap-[12px] text-[14px] text-neutral-medium sm:flex-row sm:items-center">
        <span>Trang {meta.page}/{meta.pageCount}, tổng {meta.total} đánh giá</span>
        <div className="flex gap-[8px]">
          <button disabled={meta.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} className="rounded-btn border border-neutral-light px-[12px] py-[8px] font-bold disabled:opacity-50">Trước</button>
          <button disabled={meta.page >= meta.pageCount} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} className="rounded-btn border border-neutral-light px-[12px] py-[8px] font-bold disabled:opacity-50">Sau</button>
        </div>
      </div>

      {selectedReview ? (
        <AdminModal title={`Đánh giá ${productName(selectedReview)}`} description="Thông tin chi tiết đánh giá từ khách hàng." onClose={() => setSelectedReview(null)}>
          <div className="grid gap-[16px] text-[14px] text-neutral-dark">
            <div className="rounded-card border border-neutral-light p-[16px]">
              <p><b>Sản phẩm:</b> {productName(selectedReview)}</p>
              <p className="mt-[8px]"><b>Người gửi:</b> {selectedReview.user?.name ?? selectedReview.user?.email ?? 'Khách hàng'}</p>
              <p className="mt-[8px]"><b>Số sao:</b> {'★'.repeat(selectedReview.rating)}{'☆'.repeat(5 - selectedReview.rating)}</p>
              <p className="mt-[8px]"><b>Ngày tạo:</b> {formatDateTime(selectedReview.createdAt)}</p>
              <div className="mt-[8px]"><StatusBadge status={selectedReview.isVisible === false ? 'inactive' : 'active'}>{selectedReview.isVisible === false ? 'Đang ẩn' : 'Hiển thị'}</StatusBadge></div>
            </div>
            <div className="rounded-card bg-neutral-offwhite p-[16px] leading-[24px]">{selectedReview.comment || 'Không có nội dung.'}</div>
            <div className="flex justify-end gap-[8px]">
              <TableActionButton onClick={() => updateVisibility(selectedReview, !(selectedReview.isVisible ?? true))} tone="primary">{selectedReview.isVisible === false ? 'Hiện đánh giá' : 'Ẩn đánh giá'}</TableActionButton>
              <TableActionButton onClick={() => removeReview(selectedReview)} tone="danger">Ẩn mềm</TableActionButton>
            </div>
          </div>
        </AdminModal>
      ) : null}
    </AdminShell>
  );
}
