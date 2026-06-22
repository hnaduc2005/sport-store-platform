'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSession, type Session } from '@/lib/store';

export default function ProfilePage() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  if (!session) {
    return (
      <section className="mx-auto max-w-xl rounded-card border border-neutral-border bg-white p-[24px] text-center">
        <p className="text-[12px] font-bold uppercase text-primary">Tài khoản</p>
        <h1 className="mt-[8px] text-[32px] font-bold leading-[32px] text-neutral-black">Bạn chưa đăng nhập</h1>
        <Link href="/login" className="btn-primary mt-[20px] inline-flex">
          Đăng nhập
        </Link>
      </section>
    );
  }

  const initials = (session.user.name ?? session.user.email).slice(0, 2).toUpperCase();

  return (
    <div className="grid gap-[32px] lg:grid-cols-[280px_1fr]">
      <aside className="rounded-card border border-neutral-border bg-white p-[20px] h-fit">
        <div className="flex h-[80px] w-[80px] items-center justify-center rounded-full bg-neutral-black text-[20px] font-bold text-white">{initials}</div>
        <h1 className="mt-[16px] text-[24px] font-medium leading-[28.8px] text-neutral-black">{session.user.name ?? 'Khách hàng'}</h1>
        <p className="text-[14px] text-neutral-medium mt-[4px]">{session.user.email}</p>
        <p className="mt-[12px] rounded-btn bg-neutral-offwhite px-[12px] py-[8px] text-[14px] font-bold text-neutral-black inline-block">{session.user.role}</p>
      </aside>
      <section className="rounded-card border border-neutral-border bg-white p-[20px]">
        <h2 className="text-[20px] font-medium leading-[24px] text-neutral-black">Hồ sơ</h2>
        <form className="mt-[20px] grid gap-[16px] md:grid-cols-2">
          <input className="input-form w-full" placeholder="Họ tên" defaultValue={session.user.name ?? ''} />
          <input className="input-form w-full" placeholder="Email" defaultValue={session.user.email} />
          <input className="input-form w-full" placeholder="Số điện thoại" />
          <input className="input-form w-full" placeholder="Địa chỉ mặc định" />
        </form>
      </section>
    </div>
  );
}
