export default function ProfilePage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="rounded border border-zinc-200 bg-white p-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ink text-xl font-black text-white">DC</div>
        <h1 className="mt-4 text-2xl font-black text-ink">Demo Customer</h1>
        <p className="text-sm text-zinc-500">customer@sportstore.dev</p>
      </aside>
      <section className="rounded border border-zinc-200 bg-white p-5">
        <h2 className="text-xl font-black text-ink">Ho so</h2>
        <form className="mt-5 grid gap-4 md:grid-cols-2">
          <input className="rounded border border-zinc-300 px-3 py-3" placeholder="Ho ten" defaultValue="Demo Customer" />
          <input className="rounded border border-zinc-300 px-3 py-3" placeholder="Email" defaultValue="customer@sportstore.dev" />
          <input className="rounded border border-zinc-300 px-3 py-3" placeholder="So dien thoai" />
          <input className="rounded border border-zinc-300 px-3 py-3" placeholder="Dia chi mac dinh" />
        </form>
      </section>
    </div>
  );
}

