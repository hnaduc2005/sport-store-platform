type AdminSectionProps = {
  title: string;
  description: string;
  columns: string[];
  rows: string[][];
};

export function AdminSection({ title, description, columns, rows }: AdminSectionProps) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-court">Admin</p>
          <h1 className="mt-2 text-3xl font-black text-ink">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">{description}</p>
        </div>
        <button className="w-fit rounded bg-ink px-4 py-2 text-sm font-bold text-white">Them moi</button>
      </div>

      <div className="overflow-hidden rounded border border-zinc-200 bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-bold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row) => (
              <tr key={row.join('-')} className="text-zinc-700">
                {row.map((cell) => (
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

