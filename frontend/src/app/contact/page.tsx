'use client';

import { FormEvent, useState } from 'react';
import { apiFetch } from '@/lib/api';

const storeInfo = [
  { icon: '📍', label: 'Địa chỉ', value: '12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh' },
  { icon: '📞', label: 'Hotline', value: '0901 234 567' },
  { icon: '✉️', label: 'Email', value: 'support@bigsport.demo' },
  { icon: '🕐', label: 'Giờ mở cửa', value: '8:00 – 21:00 hằng ngày' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'info'>('success');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(c => ({ ...c, [k]: v }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(''); setLoading(true);
    try {
      await apiFetch('/contacts', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setStatus('✓ Cảm ơn bạn! Chúng tôi sẽ phản hồi trong vòng 24 giờ.');
      setStatusType('success');
    } catch {
      setStatus('Đã ghi nhận phản hồi ở chế độ demo (API chưa kết nối).');
      setStatusType('info');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="section-label">Liên hệ</span>
        <h1 className="section-title mt-2">Gửi phản hồi cho BigSport</h1>
        <p className="mt-3 text-brand-muted max-w-lg mx-auto">
          Có câu hỏi về sản phẩm, đơn hàng hoặc cần tư vấn? Đội ngũ BigSport luôn sẵn sàng hỗ trợ bạn.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* ── Contact form ── */}
        <form onSubmit={handleSubmit} className="form-section space-y-5">
          <h2 className="form-section-title">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Gửi tin nhắn
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">Họ và tên *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required className="input-form w-full mt-1.5" placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="form-label">Email *</label>
              <input value={form.email} onChange={e => set('email', e.target.value)} type="email" required className="input-form w-full mt-1.5" placeholder="you@example.com" />
            </div>
            <div>
              <label className="form-label">Số điện thoại</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input-form w-full mt-1.5" placeholder="0901 234 567" />
            </div>
            <div>
              <label className="form-label">Chủ đề *</label>
              <input value={form.subject} onChange={e => set('subject', e.target.value)} required className="input-form w-full mt-1.5" placeholder="Tư vấn chọn giày chạy bộ..." />
            </div>
          </div>

          <div>
            <label className="form-label">Nội dung phản hồi *</label>
            <textarea value={form.message} onChange={e => set('message', e.target.value)} required rows={5} className="textarea-form w-full mt-1.5" placeholder="Mô tả chi tiết câu hỏi hoặc vấn đề của bạn..." />
          </div>

          {status && (
            <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${
              statusType === 'success' ? 'bg-success-light text-success-dark border border-success/20' : 'bg-info-light text-info-dark border border-info/20'
            }`}>
              {status}
            </div>
          )}

          <button disabled={loading} className="btn-dark py-3.5 px-8 font-bold disabled:opacity-60">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Đang gửi...
              </span>
            ) : 'Gửi phản hồi →'}
          </button>
        </form>

        {/* ── Store info ── */}
        <div className="space-y-4">
          <div className="form-section space-y-5">
            <h2 className="form-section-title">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Thông tin cửa hàng
            </h2>
            <div className="space-y-4">
              {storeInfo.map(info => (
                <div key={info.label} className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{info.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-brand-muted">{info.label}</p>
                    <p className="text-sm font-medium text-brand-black mt-0.5">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="overflow-hidden rounded-xl border border-brand-light">
            <iframe
              title="Bản đồ BigSport Store"
              src="https://www.google.com/maps?q=Nguyen%20Hue%20Ho%20Chi%20Minh%20City&output=embed"
              className="h-60 w-full"
              loading="lazy"
            />
          </div>

          {/* Quick contact cards */}
          <div className="grid grid-cols-2 gap-3">
            <a href="tel:0901234567" className="form-section text-center hover:border-accent transition-colors">
              <p className="text-2xl mb-1">📞</p>
              <p className="text-xs font-bold text-brand-black">Gọi ngay</p>
              <p className="text-xs text-brand-muted mt-0.5">0901 234 567</p>
            </a>
            <a href="mailto:support@bigsport.demo" className="form-section text-center hover:border-accent transition-colors">
              <p className="text-2xl mb-1">✉️</p>
              <p className="text-xs font-bold text-brand-black">Email</p>
              <p className="text-xs text-brand-muted mt-0.5">support@...</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
