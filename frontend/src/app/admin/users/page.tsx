'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminModal, AdminNotice, EmptyState, LoadingTable, StatusBadge, TableActionButton } from '@/components/admin-ui';
import { ApiError, apiFetch, type PaginatedResponse, queryString } from '@/lib/api';
import { formatDate, money } from '@/lib/format';

type User = {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
  _count?: {
    orders: number;
    reviews: number;
    favorites: number;
  };
};

type UserDetail = User & {
  updatedAt: string;
  orders?: Array<{ id: string; code: string; total: number | string; status: string; createdAt: string }>;
  favorites?: Array<{ id: string; product: { name: string } }>;
  reviews?: Array<{ id: string; rating: number; comment?: string | null; product: { name: string } }>;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({ q: '', role: '', page: 1, limit: 10 });
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, pageCount: 1 });
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    apiFetch<PaginatedResponse<User>>(`/users${queryString(filters)}`)
      .then((response) => {
        if (active) {
          setUsers(response.data);
          setMeta(response.meta);
        }
      })
      .catch(() => {
        if (active) {
          setUsers([]);
          setMeta({ total: 0, page: filters.page, limit: filters.limit, pageCount: 1 });
          setError('Không tải được người dùng từ API. Vui lòng kiểm tra đăng nhập admin, backend hoặc database.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filters]);

  const setFilter = (patch: Partial<typeof filters>) => {
    setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  };

  const openDetail = async (user: User) => {
    setDetailLoading(true);
    setSelectedUser({ ...user, updatedAt: user.createdAt });

    try {
      setSelectedUser(await apiFetch<UserDetail>(`/users/${user.id}`));
    } catch {
      setSelectedUser({ ...user, updatedAt: user.createdAt });
    } finally {
      setDetailLoading(false);
    }
  };

  const updateRole = async (user: User, role: User['role']) => {
    if (user.role === role) return;
    if (!window.confirm(`Đổi vai trò của "${user.email}" thành ${role === 'ADMIN' ? 'Quản trị' : 'Khách hàng'}?`)) return;

    setMessage('');

    try {
      const updated = await apiFetch<User>(`/users/${user.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      setUsers((items) => items.map((item) => (item.id === user.id ? { ...item, ...updated } : item)));
      setSelectedUser((current) => (current?.id === user.id ? { ...current, ...updated } : current));
      setMessage('Đã cập nhật vai trò người dùng.');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không thể cập nhật vai trò người dùng.');
    }
  };

  return (
    <AdminShell title="Quản lý người dùng" description="Danh sách khách hàng và tài khoản quản trị; xem chi tiết và đổi vai trò có xác nhận.">
      <div className="grid gap-[12px] rounded-card border border-neutral-border bg-white p-[16px] md:grid-cols-[1fr_220px]">
        <input value={filters.q} onChange={(event) => setFilter({ q: event.target.value })} className="input-search w-full" placeholder="Tìm tên, email, số điện thoại..." />
        <select value={filters.role} onChange={(event) => setFilter({ role: event.target.value })} className="input-form bg-white">
          <option value="">Mọi vai trò</option>
          <option value="CUSTOMER">Khách hàng</option>
          <option value="ADMIN">Quản trị</option>
        </select>
      </div>

      {error ? <AdminNotice type="error">{error}</AdminNotice> : null}
      {message ? <AdminNotice type={message.startsWith('Đã') ? 'success' : 'error'}>{message}</AdminNotice> : null}

      {loading ? (
        <LoadingTable columns={6} />
      ) : users.length ? (
        <div className="overflow-x-auto rounded-card border border-neutral-light bg-white">
          <table className="w-full min-w-[820px] text-left text-[14px]">
            <thead className="bg-neutral-offwhite text-[12px] uppercase text-neutral-medium tracking-wide">
              <tr>
                <th className="px-[16px] py-[12px] font-bold">Người dùng</th>
                <th className="px-[16px] py-[12px] font-bold">Email</th>
                <th className="px-[16px] py-[12px] font-bold">SĐT</th>
                <th className="px-[16px] py-[12px] font-bold">Vai trò</th>
                <th className="px-[16px] py-[12px] font-bold">Đơn hàng</th>
                <th className="px-[16px] py-[12px] font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {users.map((user) => (
                <tr key={user.id} className="text-neutral-dark hover:bg-neutral-offwhite">
                  <td className="px-[16px] py-[16px]">
                    <p className="font-bold text-neutral-black">{user.name ?? 'Chưa có tên'}</p>
                    <p className="text-[12px] text-neutral-medium">Tạo ngày {formatDate(user.createdAt)}</p>
                  </td>
                  <td className="px-[16px] py-[16px]">{user.email}</td>
                  <td className="px-[16px] py-[16px]">{user.phone ?? 'Chưa có'}</td>
                  <td className="px-[16px] py-[16px]">
                    <select value={user.role} onChange={(event) => updateRole(user, event.target.value as User['role'])} className="h-[34px] rounded-btn border border-neutral-light bg-white px-[10px] text-[12px] font-bold">
                      <option value="CUSTOMER">Khách hàng</option>
                      <option value="ADMIN">Quản trị</option>
                    </select>
                  </td>
                  <td className="px-[16px] py-[16px]">{user._count?.orders ?? 0}</td>
                  <td className="px-[16px] py-[16px]"><TableActionButton onClick={() => openDetail(user)} tone="primary">Chi tiết</TableActionButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Không có người dùng" description="Thử thay đổi bộ lọc tìm kiếm." />
      )}

      <div className="flex flex-col justify-between gap-[12px] text-[14px] text-neutral-medium sm:flex-row sm:items-center">
        <span>Trang {meta.page}/{meta.pageCount}, tổng {meta.total} người dùng</span>
        <div className="flex gap-[8px]">
          <button disabled={meta.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} className="rounded-btn border border-neutral-light px-[12px] py-[8px] font-bold disabled:opacity-50">Trước</button>
          <button disabled={meta.page >= meta.pageCount} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} className="rounded-btn border border-neutral-light px-[12px] py-[8px] font-bold disabled:opacity-50">Sau</button>
        </div>
      </div>

      {selectedUser ? (
        <AdminModal title={selectedUser.name ?? selectedUser.email} description="Thông tin chi tiết người dùng." onClose={() => setSelectedUser(null)}>
          {detailLoading ? (
            <div className="h-[160px] animate-pulse rounded-card bg-neutral-offwhite" />
          ) : (
            <div className="grid gap-[20px]">
              <div className="grid gap-[16px] md:grid-cols-3">
                <div className="rounded-card border border-neutral-light p-[16px]"><p className="text-neutral-medium">Vai trò</p><div className="mt-[8px]"><StatusBadge status={selectedUser.role} /></div></div>
                <div className="rounded-card border border-neutral-light p-[16px]"><p className="text-neutral-medium">Đơn hàng</p><p className="mt-[8px] text-[24px] font-bold">{selectedUser.orders?.length ?? selectedUser._count?.orders ?? 0}</p></div>
                <div className="rounded-card border border-neutral-light p-[16px]"><p className="text-neutral-medium">Đánh giá</p><p className="mt-[8px] text-[24px] font-bold">{selectedUser.reviews?.length ?? selectedUser._count?.reviews ?? 0}</p></div>
              </div>
              <div className="rounded-card border border-neutral-light p-[16px] text-[14px]">
                <p><b>Email:</b> {selectedUser.email}</p>
                <p className="mt-[8px]"><b>Số điện thoại:</b> {selectedUser.phone ?? 'Chưa có'}</p>
                <p className="mt-[8px]"><b>Ngày tạo:</b> {formatDate(selectedUser.createdAt)}</p>
              </div>
              <div className="rounded-card border border-neutral-light p-[16px]">
                <h3 className="text-[18px] font-bold text-neutral-black">Đơn hàng gần đây</h3>
                <div className="mt-[12px] grid gap-[8px]">
                  {selectedUser.orders?.length ? selectedUser.orders.map((order) => (
                    <div key={order.id} className="flex justify-between gap-[12px] rounded-card bg-neutral-offwhite p-[12px] text-[14px]">
                      <span>{order.code}</span>
                      <b>{money(order.total)}</b>
                    </div>
                  )) : <p className="text-[14px] text-neutral-medium">Chưa có đơn hàng.</p>}
                </div>
              </div>
            </div>
          )}
        </AdminModal>
      ) : null}
    </AdminShell>
  );
}
