import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md rounded border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-wide text-court">Tai khoan</p>
      <h1 className="mt-2 text-3xl font-black text-ink">Dang nhap</h1>
      <form className="mt-6 grid gap-4">
        <input className="rounded border border-zinc-300 px-3 py-3" placeholder="Email" type="email" />
        <input className="rounded border border-zinc-300 px-3 py-3" placeholder="Mat khau" type="password" />
        <button className="rounded bg-ink px-5 py-3 font-black text-white">Dang nhap</button>
      </form>
      <p className="mt-4 text-sm text-zinc-600">
        Chua co tai khoan?{' '}
        <Link href="/register" className="font-bold text-court">
          Dang ky
        </Link>
      </p>
    </div>
  );
}

