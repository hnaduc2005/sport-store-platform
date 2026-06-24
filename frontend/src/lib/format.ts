import type { Brand, Category, Product } from './mock-data';

export function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return 0;
  return Number(value);
}

export function money(value: number | string | null | undefined) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

export function compactNumber(value: number | string | null | undefined) {
  return new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(toNumber(value));
}

export function percent(value: number | string | null | undefined) {
  return `${toNumber(value).toFixed(1).replace('.0', '')}%`;
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return 'Chưa có';
  return new Date(value).toLocaleDateString('vi-VN');
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return 'Chưa có';
  return new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function entityName(entity: Brand | Category | string | undefined) {
  if (!entity) return 'Chưa phân loại';
  return typeof entity === 'string' ? entity : entity.name;
}

export function entitySlug(entity: Brand | Category | string | undefined) {
  if (!entity) return '';
  return typeof entity === 'string' ? entity.toLowerCase() : entity.slug;
}

export function productImage(product: Product) {
  return product.images?.[0] ?? product.image ?? 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80';
}

export function effectivePrice(product: Product) {
  return toNumber(product.salePrice ?? product.price);
}

export function salePercent(product: Product) {
  const price = toNumber(product.price);
  const salePrice = toNumber(product.salePrice);

  if (!salePrice || salePrice >= price) return 0;

  return Math.round(((price - salePrice) / price) * 100);
}

export function averageRating(product: Product) {
  const visibleReviews = product.reviews?.filter((review) => review.isVisible !== false) ?? [];

  if (!visibleReviews.length) return 0;

  return visibleReviews.reduce((sum, review) => sum + review.rating, 0) / visibleReviews.length;
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    PROCESSING: 'Đang xử lý',
    SHIPPED: 'Đang giao',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã hủy',
    UNPAID: 'Chưa thanh toán',
    PAID: 'Đã thanh toán',
    REFUNDED: 'Đã hoàn tiền',
    NEW: 'Mới',
    READ: 'Đã đọc',
    RESOLVED: 'Đã xử lý',
    ADMIN: 'Quản trị',
    CUSTOMER: 'Khách hàng',
  };

  return labels[status] ?? status;
}
