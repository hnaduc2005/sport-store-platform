const orders = [
  ['SS-1001', 'Dang xu ly', '$188', '2 san pham'],
  ['SS-1000', 'Da giao', '$109', '1 san pham'],
];

export default function OrdersPage() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-court">Don hang</p>
        <h1 className="mt-2 text-3xl font-black text-ink">Lich su mua hang</h1>
      </div>
      <div className="overflow-hidden rounded border border-zinc-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Ma don</th>
              <th className="px-4 py-3">Trang thai</th>
              <th className="px-4 py-3">Tong tien</th>
              <th className="px-4 py-3">San pham</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {orders.map((order) => (
              <tr key={order[0]}>
                {order.map((cell) => (
                  <td key={cell} className="px-4 py-4">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

