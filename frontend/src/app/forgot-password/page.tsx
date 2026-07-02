'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    
    try {
      const response = await apiFetch<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMessage(response.message || 'Link đặt lại mật khẩu đã được gửi đến email của bạn.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-brand-offwhite">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-brand-light bg-white p-8 shadow-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-black font-black text-sm text-white">T3</div>
            <div>
              <p className="font-black text-brand-black leading-none">T3<span className="text-accent">Sport</span></p>
              <p className="text-xs text-brand-muted mt-0.5">Cửa hàng thể thao</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-brand-black">Quên mật khẩu</h1>
          <p className="text-sm text-brand-muted mt-1">
            Nhập email của bạn và chúng tôi sẽ gửi cho bạn link để đặt lại mật khẩu.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                required
                className="input-form w-full mt-1.5"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-accent-bg border border-accent/20 px-3 py-2.5 text-sm text-accent-dark">
                {error}
              </div>
            )}
            
            {message && (
              <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-sm text-green-700">
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
                  Đang gửi...
                </span>
              ) : 'Gửi link đặt lại mật khẩu'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-muted">
            Nhớ mật khẩu?{' '}
            <Link href="/login" className="font-bold text-brand-black hover:text-accent transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
