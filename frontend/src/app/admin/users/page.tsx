'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { apiFetch } from '@/lib/api';

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([
    { id: 'demo-customer', name: 'Demo Customer', email: 'customer@sportstore.dev', role: 'CUSTOMER', createdAt: '2026-06-01' },
    { id: 'demo-admin', name: 'Demo Admin', email: 'admin@sportstore.dev', role: 'ADMIN', createdAt: '2026-06-01' },
  ]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiFetch<User[]>('/users').then(setUsers).catch(() => setMessage('Đang dùng dữ liệu demo.'));
  }, []);

  return (
    <AdminShell title="Quản lý người dùng" description="Danh sách khách hàng và tài khoản quản trị.">
      {message ? <p className="text-[14px] font-bold text-primary">{message}</p> : null}
      <div className="overflow-x-auto rounded-card border border-neutral-light bg-white">
        <table className="w-full min-w-[680px] text-left text-[14px]">
          <thead className="bg-neutral-offwhite text-[12px] uppercase text-neutral-medium tracking-wide">
            <tr>
              <th className="px-[16px] py-[12px] font-bold">Tên</th>
              <th className="px-[16px] py-[12px] font-bold">Email</th>
              <th className="px-[16px] py-[12px] font-bold">Vai trò</th>
              <th className="px-[16px] py-[12px] font-bold">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-light">
            {users.map((user) => (
              <tr key={user.id} className="text-neutral-dark hover:bg-neutral-offwhite transition-colors">
                <td className="px-[16px] py-[16px] font-bold text-neutral-black">{user.name ?? 'Chưa có tên'}</td>
                <td className="px-[16px] py-[16px]">{user.email}</td>
                <td className="px-[16px] py-[16px]">{user.role}</td>
                <td className="px-[16px] py-[16px]">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
