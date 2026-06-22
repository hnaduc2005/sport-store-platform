'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { apiFetch } from '@/lib/api';
import { statusLabel } from '@/lib/format';
import { demoContacts, type ContactFeedback } from '@/lib/mock-data';

export default function AdminFeedbackPage() {
  const [contacts, setContacts] = useState<ContactFeedback[]>(demoContacts);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiFetch<ContactFeedback[]>('/contacts').then(setContacts).catch(() => setMessage('Đang dùng dữ liệu demo.'));
  }, []);

  const updateStatus = async (id: string, status: ContactFeedback['status']) => {
    setContacts((items) => items.map((item) => (item.id === id ? { ...item, status } : item)));
    try {
      await apiFetch(`/contacts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setMessage('Đã cập nhật feedback.');
    } catch {
      setMessage('Đã cập nhật feedback ở chế độ demo.');
    }
  };

  return (
    <AdminShell title="Quản lý feedback" description="Theo dõi liên hệ, phản hồi và trạng thái xử lý từ khách hàng.">
      {message ? <p className="text-[14px] font-bold text-primary">{message}</p> : null}
      <div className="grid gap-[16px]">
        {contacts.map((contact) => (
          <div key={contact.id} className="rounded-card border border-neutral-border bg-white p-[20px]">
            <div className="flex flex-col justify-between gap-[16px] md:flex-row">
              <div>
                <p className="font-bold text-[16px] text-neutral-black">{contact.subject}</p>
                <p className="mt-[4px] text-[14px] text-neutral-medium">{contact.name} • {contact.email} • {contact.phone ?? 'Chưa có SĐT'}</p>
                <p className="mt-[12px] text-[14px] leading-[24px] text-neutral-dark">{contact.message}</p>
              </div>
              <select value={contact.status} onChange={(event) => updateStatus(contact.id, event.target.value as ContactFeedback['status'])} className="input-form h-auto py-[8px] bg-white text-[14px] w-full md:w-auto self-start">
                {['NEW', 'READ', 'RESOLVED'].map((status) => (
                  <option key={status} value={status}>{statusLabel(status)}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
