'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminModal, AdminNotice, AdminTable, AdminToolbar, EmptyState, LoadingTable, StatusBadge, TableActionButton } from '@/components/admin-ui';
import { ApiError, apiFetch, type PaginatedResponse, queryString } from '@/lib/api';
import { formatDateTime, money, statusLabel } from '@/lib/format';
import type { Order } from '@/lib/mock-data';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';

type AdminOrder = Omit<Order, 'items'> & {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingFee?: number | string;
  discount?: number | string;
  note?: string | null;
  user?: { id: string; name: string | null; email: string };
  coupon?: { code: string } | null;
  items: Array<{
    id: string; productId: string; productName: string;
    variantName?: string | null; unitPrice: number | string; quantity: number; total: number | string;
  }>;
};

const orderStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const paymentStatuses: PaymentStatus[] = ['UNPAID', 'PAID', 'REFUNDED'];
const orderFlow: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

function availableOrderStatuses(current: OrderStatus) {
  if (current === 'DELIVERED' || current === 'CANCELLED') return [current];
  const idx = orderFlow.indexOf(current);
  return orderStatuses.filter(s => s === 'CANCELLED' || orderFlow.indexOf(s) >= idx);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filters, setFilters] = useState({ q: '', status: '', paymentStatus: '', page: 1, limit: 10 });
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, pageCount: 1 });
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true); setError('');
    try {
      const res = await apiFetch<PaginatedResponse<AdminOrder>>(`/orders${queryString(filters)}`);
      setOrders(res.data); setMeta(res.meta);
    } catch {
      setOrders([]); setMeta({ total: 0, page: filters.page, limit: filters.limit, pageCount: 1 });
      setError('Không tải được đơn hàng. Kiểm tra đăng nhập admin và backend.');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filters]); // eslint-disable-line

  const setFilter = (patch: Partial<typeof filters>) =>
    setFilters(c => ({ ...c, ...patch, page: patch.page ?? 1 }));

  const updateOrder = async (order: AdminOrder, patch: Partial<Pick<AdminOrder, 'status' | 'paymentStatus'>>) => {
    setMessage('');
    try {
      const updated = await apiFetch<AdminOrder>(`/orders/${order.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      setOrders(items => items.map(i => i.id === order.id ? updated : i));
      setSelectedOrder(c => c?.id === order.id ? updated : c);
      setMessage('Đã cập nhật đơn hàng.');
    } catch (err) { setMessage(err instanceof ApiError ? err.message : 'Không thể cập nhật đơn hàng.'); }
  };

  return (
    <AdminShell title="Quản lý đơn hàng" description="Theo dõi trạng thái xử lý, thanh toán, giao hàng và chi tiết đơn.">
      <AdminToolbar>
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={filters.q} onChange={e => setFilter({ q: e.target.value })} className="input-form pl-10 w-full" placeholder="Tìm mã đơn, khách hàng, SĐT..." />
        </div>
        <select value={filters.status} onChange={e => setFilter({ status: e.target.value })} className="select-form w-full sm:w-48">
          <option value="">Mọi trạng thái đơn</option>
          {orderStatuses.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        <select value={filters.paymentStatus} onChange={e => setFilter({ paymentStatus: e.target.value })} className="select-form w-full sm:w-44">
          <option value="">Mọi thanh toán</option>
          {paymentStatuses.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
      </AdminToolbar>

      {error && <AdminNotice type="error">{error}</AdminNotice>}
      {message && <AdminNotice type={message.startsWith('Đã') ? 'success' : 'error'}>{message}</AdminNotice>}

      {loading ? (
        <LoadingTable columns={7} />
      ) : orders.length ? (
        <AdminTable minWidth={1040}>
          <thead>
            <tr>
              {['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Phương thức', 'Thanh toán', 'Đơn hàng', 'Ngày tạo', 'Thao tác'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td><span className="font-mono font-bold text-brand-black">{order.code}</span></td>
                <td>
                  <p className="font-semibold text-brand-black">{order.customerName}</p>
                  <p className="text-xs text-brand-muted mt-0.5">{order.phone}</p>
                </td>
                <td><span className="font-bold text-brand-black">{money(order.total)}</span></td>
                <td><span className="text-xs text-brand-muted">{order.paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}</span></td>
                <td><StatusBadge status={order.paymentStatus} /></td>
                <td><StatusBadge status={order.status} /></td>
                <td className="text-brand-muted">{formatDateTime(order.createdAt)}</td>
                <td>
                  <TableActionButton onClick={() => setSelectedOrder(order)} tone="primary">Chi tiết</TableActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : (
        <EmptyState title="Không có đơn hàng" description="Đơn hàng mới sẽ xuất hiện tại đây." icon="📦" />
      )}

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-brand-muted">
        <span>Trang {meta.page}/{meta.pageCount} · Tổng {meta.total} đơn hàng</span>
        <div className="flex gap-2">
          <button disabled={meta.page <= 1} onClick={() => setFilters(c => ({ ...c, page: c.page - 1 }))} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">← Trước</button>
          <button disabled={meta.page >= meta.pageCount} onClick={() => setFilters(c => ({ ...c, page: c.page + 1 }))} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">Sau →</button>
        </div>
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <AdminModal title={`Đơn hàng ${selectedOrder.code}`} description="Thông tin khách, sản phẩm, phí và trạng thái xử lý." onClose={() => setSelectedOrder(null)} wide>
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Customer info */}
              <div className="rounded-xl border border-brand-light p-4 space-y-2">
                <h3 className="font-bold text-brand-black">Thông tin khách hàng</h3>
                {[
                  ['Họ tên', selectedOrder.customerName],
                  ['SĐT', selectedOrder.phone],
                  ['Email', selectedOrder.user?.email ?? 'Chưa có'],
                  ['Địa chỉ', selectedOrder.address],
                  ...(selectedOrder.note ? [['Ghi chú', selectedOrder.note]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 text-sm">
                    <span className="text-brand-muted">{k}:</span>
                    <span className="font-medium text-brand-black text-right">{v}</span>
                  </div>
                ))}
              </div>

              {/* Status update */}
              <div className="rounded-xl border border-brand-light p-4 space-y-4">
                <h3 className="font-bold text-brand-black">Cập nhật trạng thái</h3>
                <div>
                  <label className="form-label">Trạng thái đơn</label>
                  <select value={selectedOrder.status} onChange={e => updateOrder(selectedOrder, { status: e.target.value as OrderStatus })} className="select-form w-full mt-1.5">
                    {availableOrderStatuses(selectedOrder.status).map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Thanh toán</label>
                  <select value={selectedOrder.paymentStatus} onChange={e => updateOrder(selectedOrder, { paymentStatus: e.target.value as PaymentStatus })} className="select-form w-full mt-1.5">
                    {paymentStatuses.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Items table */}
            <AdminTable minWidth={560}>
              <thead><tr>{['Sản phẩm', 'Đơn giá', 'SL', 'Thành tiền'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {selectedOrder.items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <p className="font-semibold text-brand-black">{item.productName}</p>
                      {item.variantName && <p className="text-xs text-brand-muted">{item.variantName}</p>}
                    </td>
                    <td>{money(item.unitPrice)}</td>
                    <td>{item.quantity}</td>
                    <td className="font-bold text-brand-black">{money(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>

            {/* Totals */}
            <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-brand-muted"><span>Phí ship</span><span>{money(selectedOrder.shippingFee)}</span></div>
              <div className="flex justify-between text-brand-muted"><span>Giảm giá</span><span>-{money(selectedOrder.discount)}</span></div>
              <div className="flex justify-between font-bold text-brand-black text-lg border-t border-brand-light pt-2"><span>Tổng</span><span>{money(selectedOrder.total)}</span></div>
            </div>
          </div>
        </AdminModal>
      )}
    </AdminShell>
  );
}
