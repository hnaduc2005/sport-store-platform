type AdminSectionProps = {
  title: string;
  description: string;
  columns: string[];
  rows: string[][];
};

export function AdminSection({ title, description, columns, rows }: AdminSectionProps) {
  return (
    <section className="space-y-[20px]">
      <div className="flex flex-col justify-between gap-[16px] border-b border-neutral-light pb-[20px] md:flex-row md:items-end">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wide text-primary">Admin</p>
          <h1 className="mt-[8px] text-[32px] font-bold leading-[32px] text-neutral-black">{title}</h1>
          <p className="mt-[8px] max-w-2xl text-[14px] text-neutral-medium">{description}</p>
        </div>
        <button className="btn-primary w-fit">Them moi</button>
      </div>

      <div className="overflow-hidden rounded-card border border-neutral-light bg-white">
        <table className="w-full min-w-[680px] text-left text-[14px]">
          <thead className="bg-neutral-offwhite text-[12px] uppercase tracking-wide text-neutral-medium">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-[16px] py-[12px] font-bold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-light">
            {rows.map((row) => (
              <tr key={row.join('-')} className="text-neutral-dark hover:bg-neutral-offwhite transition-colors">
                {row.map((cell) => (
                  <td key={cell} className="px-[16px] py-[16px]">
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

