export default function CheckoutPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <p className="text-sm font-bold uppercase tracking-wide text-court">Thanh toan</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Thong tin giao hang</h1>
        <form className="mt-6 grid gap-4 rounded border border-zinc-200 bg-white p-5">
          <input className="rounded border border-zinc-300 px-3 py-3" placeholder="Ho ten" />
          <input className="rounded border border-zinc-300 px-3 py-3" placeholder="So dien thoai" />
          <input className="rounded border border-zinc-300 px-3 py-3" placeholder="Dia chi" />
          <textarea className="min-h-28 rounded border border-zinc-300 px-3 py-3" placeholder="Ghi chu" />
        </form>
      </section>
      <aside className="h-fit rounded border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-black text-ink">Xac nhan don hang</h2>
        <p className="mt-3 text-sm text-zinc-600">Ket noi endpoint /orders de tao don hang sau khi hoan thien logic.</p>
        <button className="mt-5 w-full rounded bg-court px-5 py-3 font-black text-white">Dat hang</button>
      </aside>
    </div>
  );
}

