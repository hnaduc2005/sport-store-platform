'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminModal, AdminNotice, EmptyState, LoadingBlocks, StatusBadge, TableActionButton } from '@/components/admin-ui';
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
      <div className="grid gap-[12px] rounded-card border border-neutral-border bg-white p-[16px] md:grid-cols-[1fr_220px]">
        <input value={filters.q} onChange={(event) => setFilter({ q: event.target.value })} className="input-search w-full" placeholder="Tìm tên, email, chủ đề, nội dung..." />
        <select value={filters.status} onChange={(event) => setFilter({ status: event.target.value })} className="input-form bg-white">
          <option value="">Mọi trạng thái</option>
          {['NEW', 'READ', 'RESOLVED'].map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
        </select>
      </div>

      {error ? <AdminNotice type="error">{error}</AdminNotice> : null}
      {message ? <AdminNotice type={message.startsWith('Đã') ? 'success' : 'error'}>{message}</AdminNotice> : null}

      {loading ? (
        <LoadingBlocks count={4} />
      ) : contacts.length ? (
        <div className="grid gap-[16px]">
          {contacts.map((contact) => (
            <div key={contact.id} className="rounded-card border border-neutral-border bg-white p-[20px]">
              <div className="flex flex-col justify-between gap-[16px] lg:flex-row lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-[8px]">
                    <p className="font-bold text-[16px] text-neutral-black">{contact.subject}</p>
                    <StatusBadge status={contact.status} />
                  </div>
                  <p className="mt-[4px] text-[14px] text-neutral-medium">{contact.name} • {contact.email} • {contact.phone ?? 'Chưa có SĐT'} • {formatDateTime(contact.createdAt)}</p>
                  <p className="mt-[12px] line-clamp-2 text-[14px] leading-[21px] text-neutral-dark">{contact.message}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-[8px]">
                  <TableActionButton onClick={() => setSelectedContact(contact)} tone="primary">Xem</TableActionButton>
                  <select value={contact.status} onChange={(event) => updateStatus(contact, event.target.value as ContactFeedback['status'])} className="h-[34px] rounded-btn border border-neutral-light bg-white px-[10px] text-[12px] font-bold">
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

      <div className="flex flex-col justify-between gap-[12px] text-[14px] text-neutral-medium sm:flex-row sm:items-center">
        <span>Trang {meta.page}/{meta.pageCount}, tổng {meta.total} feedback</span>
        <div className="flex gap-[8px]">
          <button disabled={meta.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} className="rounded-btn border border-neutral-light px-[12px] py-[8px] font-bold disabled:opacity-50">Trước</button>
          <button disabled={meta.page >= meta.pageCount} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} className="rounded-btn border border-neutral-light px-[12px] py-[8px] font-bold disabled:opacity-50">Sau</button>
        </div>
      </div>

      {selectedContact ? (
        <AdminModal title={selectedContact.subject} description="Nội dung phản hồi đầy đủ từ khách hàng." onClose={() => setSelectedContact(null)}>
          <div className="grid gap-[16px]">
            <div className="rounded-card border border-neutral-light p-[16px] text-[14px] text-neutral-dark">
              <p><b>Khách hàng:</b> {selectedContact.name}</p>
              <p className="mt-[8px]"><b>Email:</b> {selectedContact.email}</p>
              <p className="mt-[8px]"><b>SĐT:</b> {selectedContact.phone ?? 'Chưa có'}</p>
              <p className="mt-[8px]"><b>Ngày gửi:</b> {formatDateTime(selectedContact.createdAt)}</p>
            </div>
            <div className="rounded-card bg-neutral-offwhite p-[16px] text-[14px] leading-[24px] text-neutral-dark">{selectedContact.message}</div>
            <div className="flex flex-col gap-[12px] sm:flex-row sm:items-center sm:justify-between">
              <select value={selectedContact.status} onChange={(event) => updateStatus(selectedContact, event.target.value as ContactFeedback['status'])} className="input-form bg-white sm:w-[220px]">
                {['NEW', 'READ', 'RESOLVED'].map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
              </select>
              <button onClick={() => removeContact(selectedContact)} className="rounded-btn border border-alert-dark px-[16px] py-[10px] font-bold text-alert-dark hover:bg-[#fef2f2]">Xóa feedback</button>
            </div>
          </div>
        </AdminModal>
      ) : null}
    </AdminShell>
  );
}
