'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSession, type Session } from '@/lib/store';

export default function ProfilePage() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => { setSession(getSession()); }, []);

  if (!session) {
    return (
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mx-auto max-w-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-offwhite text-5xl mx-auto mb-6">🔐</div>
          <h1 className="text-2xl font-bold text-brand-black">Bạn chưa đăng nhập</h1>
          <p className="mt-2 text-brand-muted">Đăng nhập để xem thông tin tài khoản và lịch sử đơn hàng.</p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/login" className="btn-dark px-6 py-3 font-bold">Đăng nhập</Link>
            <Link href="/register" className="btn-outline px-6 py-3 font-bold">Đăng ký</Link>
          </div>
        </div>
      </div>
    );
  }

  const initials = (session.user.name ?? session.user.email).slice(0, 2).toUpperCase();
  const isAdmin = session.user.role === 'ADMIN';

  return (
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <span className="section-label">Tài khoản</span>
        <h1 className="section-title">Hồ sơ cá nhân</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* ── Profile card ── */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-brand-light bg-white p-6 text-center">
            {/* Avatar */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-black text-2xl font-black text-white mb-4">
              {initials}
            </div>
            <h2 className="font-bold text-brand-black text-lg">{session.user.name ?? 'Khách hàng'}</h2>
            <p className="text-sm text-brand-muted mt-1">{session.user.email}</p>
            <div className="mt-3 flex justify-center">
              {isAdmin ? (
                <span className="badge-orange">⚙️ Quản trị viên</span>
              ) : (
                <span className="badge-blue">👤 Khách hàng</span>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-xl border border-brand-light bg-white overflow-hidden">
            {[
              { href: '/orders', label: 'Lịch sử đơn hàng', icon: '📦' },
              { href: '/contact', label: 'Liên hệ hỗ trợ', icon: '💬' },
              ...(isAdmin ? [{ href: '/admin/dashboard', label: 'Trang quản trị', icon: '⚙️' }] : []),
            ].map((item, i, arr) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-brand-dark hover:bg-brand-offwhite hover:text-accent transition-colors ${
                  i < arr.length - 1 ? 'border-b border-brand-light' : ''
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
                <svg className="ml-auto w-4 h-4 text-brand-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            ))}
          </div>
        </aside>

        {/* ── Edit profile ── */}
        <div className="space-y-6">
          <div className="form-section">
            <h2 className="form-section-title">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Thông tin cá nhân
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Họ và tên', value: session.user.name ?? '', placeholder: 'Nguyễn Văn A' },
                { label: 'Email', value: session.user.email, placeholder: 'you@example.com', readOnly: true },
                { label: 'Số điện thoại', value: '', placeholder: '0901 234 567' },
                { label: 'Địa chỉ mặc định', value: '', placeholder: 'Số nhà, đường, quận, tỉnh...' },
              ].map(f => (
                <div key={f.label}>
                  <label className="form-label">{f.label}</label>
                  <input
                    className={`input-form w-full mt-1.5 ${f.readOnly ? 'bg-brand-offwhite cursor-not-allowed' : ''}`}
                    defaultValue={f.value}
                    placeholder={f.placeholder}
                    readOnly={f.readOnly}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button className="btn-dark px-6 py-2.5 font-semibold text-sm">Lưu thay đổi</button>
            </div>
          </div>

          {/* Account info */}
          <div className="form-section">
            <h2 className="form-section-title">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Thông tin tài khoản
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              {[
                ['ID tài khoản', session.user.id],
                ['Vai trò', isAdmin ? 'Quản trị viên' : 'Khách hàng'],
                ['Trạng thái', 'Đang hoạt động'],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1">
                  <span className="text-brand-muted text-xs font-medium">{k}</span>
                  <span className="font-semibold text-brand-black font-mono text-xs truncate">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
