'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminModal, AdminNotice, EmptyState, LoadingTable, StatusBadge, TableActionButton } from '@/components/admin-ui';
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
  user?: { id: string; name: string | null; email: string; phone?: string | null };
  coupon?: { code: string } | null;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    variantName?: string | null;
    unitPrice: number | string;
    quantity: number;
    total: number | string;
  }>;
};

const orderStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const paymentStatuses: PaymentStatus[] = ['UNPAID', 'PAID', 'REFUNDED'];
const orderFlow: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

function availableOrderStatuses(current: OrderStatus) {
  if (current === 'DELIVERED' || current === 'CANCELLED') return [current];

  const currentIndex = orderFlow.indexOf(current);
  return orderStatuses.filter((status) => status === 'CANCELLED' || orderFlow.indexOf(status) >= currentIndex);
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
    setLoading(true);
    setError('');
    try {
      const response = await apiFetch<PaginatedResponse<AdminOrder>>(`/orders${queryString(filters)}`);
      setOrders(response.data);
      setMeta(response.meta);
    } catch {
      setOrders([]);
      setMeta({ total: 0, page: filters.page, limit: filters.limit, pageCount: 1 });
      setError('Không tải được đơn hàng từ API. Vui lòng kiểm tra đăng nhập admin, backend hoặc database.');
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

  const updateOrder = async (order: AdminOrder, patch: Partial<Pick<AdminOrder, 'status' | 'paymentStatus'>>) => {
    setMessage('');

    try {
      const updated = await apiFetch<AdminOrder>(`/orders/${order.id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      setOrders((items) => items.map((item) => (item.id === order.id ? updated : item)));
      setSelectedOrder((current) => (current?.id === order.id ? updated : current));
      setMessage('Đã cập nhật đơn hàng.');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không thể cập nhật đơn hàng.');
    }
  };

  return (
    <AdminShell title="Quản lý đơn hàng" description="Theo dõi trạng thái xử lý, thanh toán, giao hàng và chi tiết đơn.">
      <div className="grid gap-[12px] rounded-card border border-neutral-border bg-white p-[16px] md:grid-cols-[1fr_220px_220px]">
        <input value={filters.q} onChange={(event) => setFilter({ q: event.target.value })} className="input-search w-full" placeholder="Tìm mã đơn, khách, SĐT..." />
        <select value={filters.status} onChange={(event) => setFilter({ status: event.target.value })} className="input-form bg-white">
          <option value="">Mọi trạng thái đơn</option>
          {orderStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
        </select>
        <select value={filters.paymentStatus} onChange={(event) => setFilter({ paymentStatus: event.target.value })} className="input-form bg-white">
          <option value="">Mọi thanh toán</option>
          {paymentStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
        </select>
      </div>

      {error ? <AdminNotice type="error">{error}</AdminNotice> : null}
      {message ? <AdminNotice type={message.startsWith('Đã') ? 'success' : 'error'}>{message}</AdminNotice> : null}

      {loading ? (
        <LoadingTable columns={8} />
      ) : orders.length ? (
        <div className="overflow-x-auto rounded-card border border-neutral-light bg-white">
          <table className="w-full min-w-[1040px] text-left text-[14px]">
            <thead className="bg-neutral-offwhite text-[12px] uppercase text-neutral-medium tracking-wide">
              <tr>
                <th className="px-[16px] py-[12px] font-bold">Mã đơn</th>
                <th className="px-[16px] py-[12px] font-bold">Khách hàng</th>
                <th className="px-[16px] py-[12px] font-bold">Tổng tiền</th>
                <th className="px-[16px] py-[12px] font-bold">Thanh toán</th>
                <th className="px-[16px] py-[12px] font-bold">Trạng thái</th>
                <th className="px-[16px] py-[12px] font-bold">Ngày tạo</th>
                <th className="px-[16px] py-[12px] font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {orders.map((order) => (
                <tr key={order.id} className="text-neutral-dark hover:bg-neutral-offwhite">
                  <td className="px-[16px] py-[16px] font-bold text-neutral-black">{order.code}</td>
                  <td className="px-[16px] py-[16px]">
                    <p className="font-bold text-neutral-black">{order.customerName}</p>
                    <p className="text-[12px] text-neutral-medium">{order.phone}</p>
                  </td>
                  <td className="px-[16px] py-[16px] font-bold text-neutral-black">{money(order.total)}</td>
                  <td className="px-[16px] py-[16px]"><StatusBadge status={order.paymentStatus} /></td>
                  <td className="px-[16px] py-[16px]"><StatusBadge status={order.status} /></td>
                  <td className="px-[16px] py-[16px] text-neutral-medium">{formatDateTime(order.createdAt)}</td>
                  <td className="px-[16px] py-[16px]">
                    <TableActionButton onClick={() => setSelectedOrder(order)} tone="primary">Chi tiết</TableActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Không có đơn hàng" description="Đơn hàng mới sẽ xuất hiện tại đây." />
      )}

      <div className="flex flex-col justify-between gap-[12px] text-[14px] text-neutral-medium sm:flex-row sm:items-center">
        <span>Trang {meta.page}/{meta.pageCount}, tổng {meta.total} đơn hàng</span>
        <div className="flex gap-[8px]">
          <button disabled={meta.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} className="rounded-btn border border-neutral-light px-[12px] py-[8px] font-bold disabled:opacity-50">Trước</button>
          <button disabled={meta.page >= meta.pageCount} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} className="rounded-btn border border-neutral-light px-[12px] py-[8px] font-bold disabled:opacity-50">Sau</button>
        </div>
      </div>

      {selectedOrder ? (
        <AdminModal title={`Đơn hàng ${selectedOrder.code}`} description="Thông tin khách, sản phẩm, phí và trạng thái xử lý." onClose={() => setSelectedOrder(null)}>
          <div className="grid gap-[20px]">
            <div className="grid gap-[16px] md:grid-cols-2">
              <div className="rounded-card border border-neutral-light p-[16px]">
                <h3 className="text-[18px] font-bold text-neutral-black">Khách hàng</h3>
                <div className="mt-[12px] grid gap-[8px] text-[14px] text-neutral-dark">
                  <p><b>Họ tên:</b> {selectedOrder.customerName}</p>
                  <p><b>SĐT:</b> {selectedOrder.phone}</p>
                  <p><b>Email:</b> {selectedOrder.user?.email ?? 'Chưa có'}</p>
                  <p><b>Địa chỉ:</b> {selectedOrder.address}</p>
                  {selectedOrder.note ? <p><b>Ghi chú:</b> {selectedOrder.note}</p> : null}
                </div>
              </div>
              <div className="rounded-card border border-neutral-light p-[16px]">
                <h3 className="text-[18px] font-bold text-neutral-black">Cập nhật trạng thái</h3>
                <div className="mt-[12px] grid gap-[12px]">
                  <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Trạng thái đơn
                    <select value={selectedOrder.status} onChange={(event) => updateOrder(selectedOrder, { status: event.target.value as OrderStatus })} className="input-form bg-white">
                      {availableOrderStatuses(selectedOrder.status).map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Thanh toán
                    <select value={selectedOrder.paymentStatus} onChange={(event) => updateOrder(selectedOrder, { paymentStatus: event.target.value as PaymentStatus })} className="input-form bg-white">
                      {paymentStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-card border border-neutral-light">
              <table className="w-full min-w-[680px] text-left text-[14px]">
                <thead className="bg-neutral-offwhite text-[12px] uppercase text-neutral-medium">
                  <tr>
                    <th className="px-[16px] py-[12px]">Sản phẩm</th>
                    <th className="px-[16px] py-[12px]">Đơn giá</th>
                    <th className="px-[16px] py-[12px]">SL</th>
                    <th className="px-[16px] py-[12px]">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-light">
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-[16px] py-[14px]">
                        <p className="font-bold text-neutral-black">{item.productName}</p>
                        {item.variantName ? <p className="text-[12px] text-neutral-medium">{item.variantName}</p> : null}
                      </td>
                      <td className="px-[16px] py-[14px]">{money(item.unitPrice)}</td>
                      <td className="px-[16px] py-[14px]">{item.quantity}</td>
                      <td className="px-[16px] py-[14px] font-bold">{money(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ml-auto grid w-full max-w-sm gap-[8px] text-[14px]">
              <div className="flex justify-between"><span>Phí ship</span><b>{money(selectedOrder.shippingFee)}</b></div>
              <div className="flex justify-between"><span>Giảm giá</span><b>-{money(selectedOrder.discount)}</b></div>
              <div className="flex justify-between border-t border-neutral-light pt-[8px] text-[18px] text-neutral-black"><span>Tổng</span><b>{money(selectedOrder.total)}</b></div>
            </div>
          </div>
        </AdminModal>
      ) : null}
    </AdminShell>
  );
}

