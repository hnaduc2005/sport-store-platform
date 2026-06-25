'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminModal, AdminNotice, AdminToolbar, EmptyState, LoadingBlocks, StatusBadge, TableActionButton } from '@/components/admin-ui';
import { ApiError, apiFetch, type PaginatedResponse, queryString } from '@/lib/api';
import { formatDateTime, statusLabel } from '@/lib/format';
import type { ContactFeedback } from '@/lib/mock-data';

export default function AdminFeedbackPage() {
  const [contacts, setContacts] = useState<ContactFeedback[]>([]);
  const [filters, setFilters] = useState({ q: '', status: '', page: 1, limit: 10 });
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, pageCount: 1 });
  const [selectedContact, setSelectedContact] = useState<ContactFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiFetch<PaginatedResponse<ContactFeedback>>(`/contacts${queryString(filters)}`);
      setContacts(response.data);
      setMeta(response.meta);
    } catch {
      setContacts([]);
      setMeta({ total: 0, page: filters.page, limit: filters.limit, pageCount: 1 });
      setError('Không tải được feedback từ API. Vui lòng kiểm tra đăng nhập admin, backend hoặc database.');
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

  const updateStatus = async (contact: ContactFeedback, status: ContactFeedback['status']) => {
    setMessage('');
    try {
      const updated = await apiFetch<ContactFeedback>(`/contacts/${contact.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setContacts((items) => items.map((item) => (item.id === contact.id ? updated : item)));
      setSelectedContact((current) => (current?.id === contact.id ? updated : current));
      setMessage('Đã cập nhật feedback.');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không thể cập nhật feedback.');
    }
  };

  const removeContact = async (contact: ContactFeedback) => {
    if (!window.confirm('Xóa phản hồi này?')) return;

    try {
      await apiFetch(`/contacts/${contact.id}`, { method: 'DELETE' });
      setContacts((items) => items.filter((item) => item.id !== contact.id));
      setSelectedContact(null);
      setMessage('Đã xóa feedback.');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không thể xóa feedback.');
    }
  };

  return (
    <AdminShell title="Quản lý feedback" description="Theo dõi liên hệ, phản hồi và trạng thái xử lý từ khách hàng.">
      <AdminToolbar>
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={filters.q} onChange={(event) => setFilter({ q: event.target.value })} className="input-form pl-10 w-full" placeholder="Tìm tên, email, chủ đề, nội dung..." />
        </div>
        <select value={filters.status} onChange={(event) => setFilter({ status: event.target.value })} className="select-form w-full md:w-48">
          <option value="">Mọi trạng thái</option>
          {['NEW', 'READ', 'RESOLVED'].map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
        </select>
      </AdminToolbar>

      {error ? <AdminNotice type="error">{error}</AdminNotice> : null}
      {message ? <AdminNotice type={message.startsWith('Đã') ? 'success' : 'error'}>{message}</AdminNotice> : null}

      {loading ? (
        <LoadingBlocks count={4} />
      ) : contacts.length ? (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="rounded-xl border border-brand-light bg-white p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-base text-brand-black">{contact.subject}</p>
                    <StatusBadge status={contact.status} />
                  </div>
                  <p className="mt-1 text-sm text-brand-muted">{contact.name} • {contact.email} • {contact.phone ?? 'Chưa có SĐT'} • {formatDateTime(contact.createdAt)}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-brand-dark">{contact.message}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <TableActionButton onClick={() => setSelectedContact(contact)} tone="primary">Xem</TableActionButton>
                  <select value={contact.status} onChange={(event) => updateStatus(contact, event.target.value as ContactFeedback['status'])} className="select-form h-9 py-1 text-xs w-32">
                    {['NEW', 'READ', 'RESOLVED'].map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                  </select>
                  <TableActionButton onClick={() => removeContact(contact)} tone="danger">Xóa</TableActionButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Không có feedback" description="Phản hồi mới từ khách hàng sẽ xuất hiện tại đây." />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-brand-muted">
        <span>Trang {meta.page}/{meta.pageCount} · Tổng {meta.total} feedback</span>
        <div className="flex gap-2">
          <button disabled={meta.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">← Trước</button>
          <button disabled={meta.page >= meta.pageCount} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">Sau →</button>
        </div>
      </div>

      {selectedContact ? (
        <AdminModal title={selectedContact.subject} description="Nội dung phản hồi đầy đủ từ khách hàng." onClose={() => setSelectedContact(null)}>
          <div className="space-y-4 text-sm text-brand-dark">
            <div className="rounded-xl border border-brand-light p-4">
              <p><b className="text-brand-black">Khách hàng:</b> {selectedContact.name}</p>
              <p className="mt-2"><b className="text-brand-black">Email:</b> {selectedContact.email}</p>
              <p className="mt-2"><b className="text-brand-black">SĐT:</b> {selectedContact.phone ?? 'Chưa có'}</p>
              <p className="mt-2"><b className="text-brand-black">Ngày gửi:</b> {formatDateTime(selectedContact.createdAt)}</p>
            </div>
            <div className="rounded-xl bg-brand-offwhite p-4 leading-relaxed">{selectedContact.message}</div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-brand-light pt-2">
              <select value={selectedContact.status} onChange={(event) => updateStatus(selectedContact, event.target.value as ContactFeedback['status'])} className="select-form sm:w-56">
                {['NEW', 'READ', 'RESOLVED'].map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
              </select>
              <button onClick={() => removeContact(selectedContact)} className="btn-danger px-4 py-2">Xóa feedback</button>
            </div>
          </div>
        </AdminModal>
      ) : null}
    </AdminShell>
  );
}
