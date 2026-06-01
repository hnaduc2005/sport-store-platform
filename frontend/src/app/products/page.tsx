import { ProductCard } from '@/components/product-card';
import { brands, categories, products } from '@/lib/mock-data';

export default function ProductsPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-court">Bo loc</p>
          <h1 className="mt-2 text-3xl font-black text-ink">San pham</h1>
        </div>
        <div className="rounded border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-bold text-ink">Danh muc</h2>
          <div className="mt-3 space-y-2 text-sm text-zinc-600">
            {categories.map((category) => (
              <label key={category} className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-zinc-300" />
                {category}
              </label>
            ))}
          </div>
        </div>
        <div className="rounded border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-bold text-ink">Thuong hieu</h2>
          <div className="mt-3 space-y-2 text-sm text-zinc-600">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-zinc-300" />
                {brand}
              </label>
            ))}
          </div>
        </div>
      </aside>
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-3 border-b border-zinc-200 pb-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm text-zinc-500">Hien thi {products.length} san pham mau</p>
            <h2 className="mt-1 text-2xl font-black text-ink">Tat ca san pham</h2>
          </div>
          <select className="w-fit rounded border border-zinc-300 bg-white px-3 py-2 text-sm">
            <option>Moi nhat</option>
            <option>Gia thap den cao</option>
            <option>Gia cao den thap</option>
          </select>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

