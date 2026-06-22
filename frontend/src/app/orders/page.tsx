'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { money, statusLabel } from '@/lib/format';
import { demoOrders, type Order } from '@/lib/mock-data';
import { getLocalOrders, getSession } from '@/lib/store';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const session = getSession();
    const localOrders = getLocalOrders();

    if (!session) {
      setOrders([...localOrders, ...demoOrders]);
      setMessage('Bạn đang xem đơn demo. Đăng nhập để đồng bộ đơn hàng từ API.');
      return;
    }

    apiFetch<Order[]>(`/orders/user/${session.user.id}`)
      .then((data) => setOrders([...localOrders, ...data]))
      .catch(() => {
        setOrders([...localOrders, ...demoOrders]);
        setMessage('Đang hiển thị dữ liệu demo vì chưa kết nối được API.');
      });
  }, []);

  return (
    <section className="space-y-[24px]">
      <div>
        <p className="text-[12px] font-bold uppercase text-primary">Đơn hàng</p>
        <h1 className="mt-[8px] text-[32px] font-bold leading-[32px] text-neutral-black">Lịch sử mua hàng</h1>
        {message ? <p className="mt-[8px] text-[14px] text-alert-dark">{message}</p> : null}
      </div>
      <div className="overflow-x-auto rounded-card border border-neutral-light bg-white">
        <table className="w-full min-w-[640px] text-left text-[14px]">
          <thead className="bg-neutral-offwhite text-[12px] uppercase text-neutral-medium tracking-wide">
            <tr>
              <th className="px-[16px] py-[12px] font-bold">Mã đơn</th>
              <th className="px-[16px] py-[12px] font-bold">Trạng thái</th>
              <th className="px-[16px] py-[12px] font-bold">Thanh toán</th>
              <th className="px-[16px] py-[12px] font-bold">Tổng tiền</th>
              <th className="px-[16px] py-[12px] font-bold">Sản phẩm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-light">
            {orders.map((order) => (
              <tr key={order.id} className="text-neutral-dark hover:bg-neutral-offwhite transition-colors">
                <td className="px-[16px] py-[16px] font-bold text-neutral-black">{order.code}</td>
                <td className="px-[16px] py-[16px]">{statusLabel(order.status)}</td>
                <td className="px-[16px] py-[16px]">{statusLabel(order.paymentStatus)}</td>
                <td className="px-[16px] py-[16px] font-bold text-neutral-black">{money(order.total)}</td>
                <td className="px-[16px] py-[16px]">{order.items?.length ?? 0} sản phẩm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
