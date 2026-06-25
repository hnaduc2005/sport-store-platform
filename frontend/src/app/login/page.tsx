'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { saveSession, type Session } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const session = await apiFetch<Session>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      saveSession(session);
      router.push(session.user.role === 'ADMIN' ? '/admin/dashboard' : '/profile');
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        const fallback: Session = {
          user: {
            id: email.includes('admin') ? 'demo-admin' : 'demo-customer',
            name: email.includes('admin') ? 'Demo Admin' : 'Demo Customer',
            email,
            role: email.includes('admin') ? 'ADMIN' : 'CUSTOMER',
          },
          accessToken: 'offline-demo-token',
        };
        saveSession(fallback);
        setMessage('API chưa phản hồi — đăng nhập bằng session demo.');
        router.push(fallback.user.role === 'ADMIN' ? '/admin/dashboard' : '/profile');
        return;
      }
      setMessage(error instanceof Error ? error.message : 'Không thể đăng nhập. Kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-brand-offwhite">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-brand-light bg-white p-8 shadow-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-black font-black text-sm text-white">BS</div>
            <div>
              <p className="font-black text-brand-black leading-none">Big<span className="text-accent">Sport</span></p>
              <p className="text-xs text-brand-muted mt-0.5">Cửa hàng thể thao</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-brand-black">Đăng nhập</h1>
          <p className="text-sm text-brand-muted mt-1">Chào mừng trở lại! Vui lòng điền thông tin bên dưới.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                required
                autoComplete="email"
                className="input-form w-full mt-1.5"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0" htmlFor="password">Mật khẩu</label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="input-form w-full pr-10"
                  placeholder="••••••••"
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
            </div>

            {/* Message */}
            {message && (
              <div className="rounded-lg bg-accent-bg border border-accent/20 px-3 py-2.5 text-sm text-accent-dark">
                {message}
              </div>
            )}

            <button
              disabled={loading}
              className="btn-dark w-full py-3.5 text-base font-bold mt-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : 'Đăng nhập'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-muted">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-bold text-accent hover:text-accent-hover transition-colors">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Dev hint */}
        {process.env.NODE_ENV !== 'production' && (
          <p className="mt-4 text-center text-xs text-brand-subtle">
            Dev: dùng <code className="bg-brand-light px-1 py-0.5 rounded font-mono">admin@...</code> để login với quyền admin
          </p>
        )}
      </div>
    </div>
  );
}
