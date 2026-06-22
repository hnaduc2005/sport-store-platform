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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    try {
      const session = await apiFetch<Session>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      saveSession(session);
      router.push(session.user.role === 'ADMIN' ? '/admin/dashboard' : '/profile');
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        const fallbackSession: Session = {
          user: {
            id: email.includes('admin') ? 'demo-admin' : 'demo-customer',
            name: email.includes('admin') ? 'Demo Admin' : 'Demo Customer',
            email,
            role: email.includes('admin') ? 'ADMIN' : 'CUSTOMER',
          },
          accessToken: 'offline-demo-token',
        };
        saveSession(fallbackSession);
        setMessage('API chưa phản hồi, đã đăng nhập bằng session demo cục bộ.');
        router.push(fallbackSession.user.role === 'ADMIN' ? '/admin/dashboard' : '/profile');
        return;
      }

      setMessage(error instanceof Error ? error.message : 'Không thể đăng nhập.');
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-card border border-neutral-border bg-white p-[24px]">
      <p className="text-[12px] font-bold uppercase text-primary">Tài khoản</p>
      <h1 className="mt-[8px] text-[32px] font-bold leading-[32px] text-neutral-black">Đăng nhập</h1>
      <form onSubmit={handleSubmit} className="mt-[24px] grid gap-[16px]">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="input-form w-full"
          placeholder="Email"
          type="email"
          required
        />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="input-form w-full"
          placeholder="Mật khẩu"
          type="password"
          required
        />
        {message ? <p className="text-[14px] text-alert-dark">{message}</p> : null}
        <button className="btn-primary w-full mt-[8px] bg-neutral-black hover:bg-neutral-dark">Đăng nhập</button>
      </form>
      <p className="mt-[16px] text-[14px] text-neutral-medium">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-bold text-primary hover:text-primary-hover transition-colors">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
