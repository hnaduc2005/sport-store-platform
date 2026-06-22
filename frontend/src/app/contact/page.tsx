'use client';

import { FormEvent, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('');

    try {
      await apiFetch('/contacts', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setStatus('Cảm ơn bạn, phản hồi đã được gửi đến cửa hàng.');
    } catch {
      setStatus('API chưa phản hồi, form đã được ghi nhận ở chế độ demo.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }
  };

  return (
    <div className="grid gap-[32px] lg:grid-cols-[1fr_420px]">
      <section>
        <p className="text-[12px] font-bold uppercase text-primary">Liên hệ</p>
        <h1 className="mt-[8px] text-[32px] font-bold leading-[32px] text-neutral-black">Gửi phản hồi cho BigSport</h1>
        <form onSubmit={handleSubmit} className="mt-[24px] grid gap-[16px] rounded-card border border-neutral-border bg-white p-[24px]">
          <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required className="input-form" placeholder="Họ tên" />
          <input value={form.email} onChange={(event) => updateField('email', event.target.value)} required className="input-form" placeholder="Email" type="email" />
          <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} className="input-form" placeholder="Số điện thoại" />
          <input value={form.subject} onChange={(event) => updateField('subject', event.target.value)} required className="input-form" placeholder="Chủ đề" />
          <textarea value={form.message} onChange={(event) => updateField('message', event.target.value)} required className="input-form min-h-32" placeholder="Nội dung phản hồi" />
          {status ? <p className="text-[14px] font-bold text-primary">{status}</p> : null}
          <button className="btn-primary w-fit">Gửi phản hồi</button>
        </form>
      </section>
      <aside className="space-y-[24px]">
        <div className="rounded-card border border-neutral-border bg-white p-[24px]">
          <h2 className="text-[20px] font-medium leading-[24px] text-neutral-black">Thông tin cửa hàng</h2>
          <div className="mt-[16px] grid gap-[12px] text-[14px] leading-[24px] text-neutral-medium">
            <p className="font-bold text-neutral-dark">BigSport Store</p>
            <p>12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
            <p>Hotline: 0901 234 567</p>
            <p>Email: support@bigsport.demo</p>
            <p>Giờ mở cửa: 8:00 - 21:00 hằng ngày</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-card border border-neutral-border bg-white">
          <iframe
            title="Bản đồ BigSport Store"
            src="https://www.google.com/maps?q=Nguyen%20Hue%20Ho%20Chi%20Minh%20City&output=embed"
            className="h-80 w-full"
            loading="lazy"
          />
        </div>
      </aside>
    </div>
  );
}
