'use client';

import Link from 'next/link';
import { FormEvent, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Suspense } from 'react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token không hợp lệ hoặc đã hết hạn.');
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!token) {
      setError('Token không hợp lệ hoặc đã hết hạn.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password }),
      });
      setMessage(response.message || 'Mật khẩu đã được đặt lại thành công.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-brand-light bg-white p-8 shadow-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-black font-black text-sm text-white">T3</div>
          <div>
            <p className="font-black text-brand-black leading-none">T3<span className="text-accent">Sport</span></p>
            <p className="text-xs text-brand-muted mt-0.5">Cửa hàng thể thao</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-brand-black">Đặt lại mật khẩu</h1>
        <p className="text-sm text-brand-muted mt-1">Nhập mật khẩu mới của bạn bên dưới.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="form-label mb-1.5 block" htmlFor="password">Mật khẩu mới</label>
            <div className="relative">
              <input
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPass ? 'text' : 'password'}
                required
                className="input-form w-full pr-10"
                placeholder="••••••••"
                disabled={!token || !!message}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-subtle hover:text-brand-dark transition-colors"
                disabled={!token || !!message}
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

          <div>
            <label className="form-label mb-1.5 block" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <div className="relative">
              <input
                id="confirmPassword"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                type={showPass ? 'text' : 'password'}
                required
                className="input-form w-full pr-10"
                placeholder="••••••••"
                disabled={!token || !!message}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-accent-bg border border-accent/20 px-3 py-2.5 text-sm text-accent-dark">
              {error}
            </div>
          )}
          
          {message && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-sm text-green-700">
              {message}
              <div className="mt-2 text-xs">Đang chuyển hướng về trang đăng nhập...</div>
            </div>
          )}

          <button
            disabled={loading || !token || !!message}
            className="btn-dark w-full py-3.5 text-base font-bold mt-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Đang xử lý...
              </span>
            ) : 'Đặt lại mật khẩu'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-muted">
          Quay lại trang{' '}
          <Link href="/login" className="font-bold text-brand-black hover:text-accent transition-colors">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-brand-offwhite">
      <Suspense fallback={<div className="text-center p-4">Đang tải...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
