'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminModal, AdminNotice, AdminTable, AdminToolbar, EmptyState, LoadingTable, StatusBadge, TableActionButton } from '@/components/admin-ui';
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
      <AdminToolbar>
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={filters.q} onChange={e => setFilter({ q: e.target.value })} className="input-form pl-10 w-full" placeholder="Tìm tên, email, số điện thoại..." />
        </div>
        <select value={filters.role} onChange={e => setFilter({ role: e.target.value })} className="select-form w-full sm:w-48">
          <option value="">Mọi vai trò</option>
          <option value="CUSTOMER">Khách hàng</option>
          <option value="ADMIN">Quản trị</option>
        </select>
      </AdminToolbar>

      {error ? <AdminNotice type="error">{error}</AdminNotice> : null}
      {message ? <AdminNotice type={message.startsWith('Đã') ? 'success' : 'error'}>{message}</AdminNotice> : null}

      {loading ? (
        <LoadingTable columns={6} />
      ) : users.length ? (
        <AdminTable minWidth={820}>
          <thead>
            <tr>
              {['Người dùng', 'Email', 'SĐT', 'Vai trò', 'Đơn hàng', 'Thao tác'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <p className="font-bold text-brand-black">{user.name ?? 'Chưa có tên'}</p>
                  <p className="text-xs text-brand-muted mt-0.5">Tạo ngày {formatDate(user.createdAt)}</p>
                </td>
                <td>{user.email}</td>
                <td>{user.phone ?? 'Chưa có'}</td>
                <td>
                  <select value={user.role} onChange={e => updateRole(user, e.target.value as User['role'])} className="select-form h-9 py-1 text-xs w-32">
                    <option value="CUSTOMER">Khách hàng</option>
                    <option value="ADMIN">Quản trị</option>
                  </select>
                </td>
                <td><span className="font-semibold">{user._count?.orders ?? 0}</span></td>
                <td>
                  <TableActionButton onClick={() => openDetail(user)} tone="primary">Chi tiết</TableActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : (
        <EmptyState title="Không có người dùng" description="Thử thay đổi bộ lọc tìm kiếm." />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-brand-muted">
        <span>Trang {meta.page}/{meta.pageCount} · Tổng {meta.total} người dùng</span>
        <div className="flex gap-2">
          <button disabled={meta.page <= 1} onClick={() => setFilters(c => ({ ...c, page: c.page - 1 }))} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">← Trước</button>
          <button disabled={meta.page >= meta.pageCount} onClick={() => setFilters(c => ({ ...c, page: c.page + 1 }))} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">Sau →</button>
        </div>
      </div>

      {selectedUser ? (
        <AdminModal title={selectedUser.name ?? selectedUser.email} description="Thông tin chi tiết người dùng." onClose={() => setSelectedUser(null)}>
          {detailLoading ? (
            <div className="skeleton h-40" />
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-brand-light p-4"><p className="text-sm text-brand-muted">Vai trò</p><div className="mt-2"><StatusBadge status={selectedUser.role} /></div></div>
                <div className="rounded-xl border border-brand-light p-4"><p className="text-sm text-brand-muted">Đơn hàng</p><p className="mt-2 text-2xl font-bold text-brand-black">{selectedUser.orders?.length ?? selectedUser._count?.orders ?? 0}</p></div>
                <div className="rounded-xl border border-brand-light p-4"><p className="text-sm text-brand-muted">Đánh giá</p><p className="mt-2 text-2xl font-bold text-brand-black">{selectedUser.reviews?.length ?? selectedUser._count?.reviews ?? 0}</p></div>
              </div>
              <div className="rounded-xl border border-brand-light p-4 text-sm space-y-2 text-brand-black">
                <p><span className="text-brand-muted w-24 inline-block">Email:</span> {selectedUser.email}</p>
                <p><span className="text-brand-muted w-24 inline-block">SĐT:</span> {selectedUser.phone ?? 'Chưa có'}</p>
                <p><span className="text-brand-muted w-24 inline-block">Ngày tạo:</span> {formatDate(selectedUser.createdAt)}</p>
              </div>
              <div className="rounded-xl border border-brand-light p-4">
                <h3 className="text-lg font-bold text-brand-black mb-3">Đơn hàng gần đây</h3>
                <div className="space-y-2">
                  {selectedUser.orders?.length ? selectedUser.orders.map(order => (
                    <div key={order.id} className="flex justify-between items-center gap-3 rounded-lg bg-brand-offwhite p-3 text-sm">
                      <span className="font-mono font-bold text-brand-black">{order.code}</span>
                      <span className="font-bold text-brand-black">{money(order.total)}</span>
                    </div>
                  )) : <p className="text-sm text-brand-muted">Chưa có đơn hàng.</p>}
                </div>
              </div>
            </div>
          )}
        </AdminModal>
      ) : null}
    </AdminShell>
  );
}
