'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { apiFetch } from '@/lib/api';
import { money, statusLabel } from '@/lib/format';
import { demoOrders, type Order } from '@/lib/mock-data';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiFetch<Order[]>('/orders').then(setOrders).catch(() => setMessage('Đang dùng dữ liệu demo.'));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setOrders((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
    try {
      await apiFetch(`/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setMessage('Đã cập nhật trạng thái đơn.');
    } catch {
      setMessage('Đã cập nhật trạng thái ở chế độ demo.');
    }
  };

  return (
    <AdminShell title="Quản lý đơn hàng" description="Theo dõi trạng thái xử lý, thanh toán và giao hàng.">
      {message ? <p className="text-[14px] font-bold text-primary">{message}</p> : null}
      <div className="overflow-x-auto rounded-card border border-neutral-light bg-white">
        <table className="w-full min-w-[860px] text-left text-[14px]">
          <thead className="bg-neutral-offwhite text-[12px] uppercase text-neutral-medium tracking-wide">
            <tr>
              <th className="px-[16px] py-[12px] font-bold">Mã đơn</th>
              <th className="px-[16px] py-[12px] font-bold">Khách hàng</th>
              <th className="px-[16px] py-[12px] font-bold">Tổng tiền</th>
              <th className="px-[16px] py-[12px] font-bold">Thanh toán</th>
              <th className="px-[16px] py-[12px] font-bold">Trạng thái</th>
              <th className="px-[16px] py-[12px] font-bold">Sản phẩm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-light">
            {orders.map((order) => (
              <tr key={order.id} className="text-neutral-dark hover:bg-neutral-offwhite transition-colors">
                <td className="px-[16px] py-[16px] font-bold text-neutral-black">{order.code}</td>
                <td className="px-[16px] py-[16px]">{order.customerName}</td>
                <td className="px-[16px] py-[16px] font-bold text-neutral-black">{money(order.total)}</td>
                <td className="px-[16px] py-[16px]">{statusLabel(order.paymentStatus)}</td>
                <td className="px-[16px] py-[16px]">
                  <select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)} className="input-form w-auto bg-white py-[6px]">
                    {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                      <option key={status} value={status}>{statusLabel(status)}</option>
                    ))}
                  </select>
                </td>
                <td className="px-[16px] py-[16px]">{order.items?.length ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
