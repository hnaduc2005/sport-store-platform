'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { saveSession, type Session } from '@/lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm(c => ({ ...c, [k]: v }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const session = await apiFetch<Session>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      saveSession(session);
      router.push('/profile');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể đăng ký. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-brand-offwhite">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-brand-light bg-white p-8 shadow-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-black font-black text-sm text-white">BS</div>
            <div>
              <p className="font-black text-brand-black leading-none">Big<span className="text-accent">Sport</span></p>
              <p className="text-xs text-brand-muted mt-0.5">Cửa hàng thể thao</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-brand-black">Tạo tài khoản</h1>
          <p className="text-sm text-brand-muted mt-1">Đăng ký để theo dõi đơn hàng và nhận ưu đãi.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="form-label" htmlFor="name">Họ và tên</label>
              <input
                id="name"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                className="input-form w-full mt-1.5"
                placeholder="Nguyễn Văn A"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="email">Email *</label>
              <input
                id="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                type="email"
                required
                className="input-form w-full mt-1.5"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="password">Mật khẩu *</label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="input-form w-full pr-10"
                  placeholder="Tối thiểu 6 ký tự"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-subtle hover:text-brand-dark transition-colors"
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-brand-subtle">Mật khẩu phải có ít nhất 6 ký tự.</p>
            </div>

            {message && (
              <div className="rounded-lg bg-danger-light border border-danger/20 px-3 py-2.5 text-sm text-danger-dark">
                {message}
              </div>
            )}

            <button disabled={loading} className="btn-dark w-full py-3.5 text-base font-bold mt-2 disabled:opacity-60">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang tạo tài khoản...
                </span>
              ) : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-muted">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-bold text-accent hover:text-accent-hover transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
