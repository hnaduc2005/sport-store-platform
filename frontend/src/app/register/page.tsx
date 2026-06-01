import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md rounded border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-wide text-court">Tai khoan</p>
      <h1 className="mt-2 text-3xl font-black text-ink">Dang ky</h1>
      <form className="mt-6 grid gap-4">
        <input className="rounded border border-zinc-300 px-3 py-3" placeholder="Ho ten" />
        <input className="rounded border border-zinc-300 px-3 py-3" placeholder="Email" type="email" />
        <input className="rounded border border-zinc-300 px-3 py-3" placeholder="Mat khau" type="password" />
        <button className="rounded bg-court px-5 py-3 font-black text-white">Tao tai khoan</button>
      </form>
      <p className="mt-4 text-sm text-zinc-600">
        Da co tai khoan?{' '}
        <Link href="/login" className="font-bold text-court">
          Dang nhap
        </Link>
      </p>
    </div>
  );
}

