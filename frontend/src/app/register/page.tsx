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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    try {
      const session = await apiFetch<Session>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      saveSession(session);
      router.push('/profile');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể đăng ký.');
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-card border border-neutral-border bg-white p-[24px]">
      <p className="text-[12px] font-bold uppercase text-primary">Tài khoản</p>
      <h1 className="mt-[8px] text-[32px] font-bold leading-[32px] text-neutral-black">Đăng ký</h1>
      <form onSubmit={handleSubmit} className="mt-[24px] grid gap-[16px]">
        <input
          value={form.name}
          onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
          className="input-form w-full"
          placeholder="Họ tên"
        />
        <input
          value={form.email}
          onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))}
          className="input-form w-full"
          placeholder="Email"
          type="email"
          required
        />
        <input
          value={form.password}
          onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
          className="input-form w-full"
          placeholder="Mật khẩu"
          type="password"
          minLength={6}
          required
        />
        {message ? <p className="text-[14px] text-alert-dark">{message}</p> : null}
        <button className="btn-primary w-full mt-[8px]">Tạo tài khoản</button>
      </form>
      <p className="mt-[16px] text-[14px] text-neutral-medium">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-bold text-primary hover:text-primary-hover transition-colors">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
