import Link from 'next/link';
import { products } from '@/lib/mock-data';

export default function CartPage() {
  const cartItems = products.slice(0, 2);
  const subtotal = cartItems.reduce((sum, product) => sum + (product.salePrice ?? product.price), 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-court">Gio hang</p>
          <h1 className="mt-2 text-3xl font-black text-ink">San pham da chon</h1>
        </div>
        {cartItems.map((product) => (
          <div key={product.slug} className="grid gap-4 rounded border border-zinc-200 bg-white p-4 md:grid-cols-[120px_1fr_auto]">
            <img src={product.image} alt={product.name} className="aspect-square rounded object-cover" />
            <div>
              <h2 className="font-black text-ink">{product.name}</h2>
              <p className="text-sm text-zinc-500">{product.brand}</p>
              <p className="mt-2 text-sm text-zinc-600">So luong: 1</p>
            </div>
            <p className="font-black text-ink">${product.salePrice ?? product.price}</p>
          </div>
        ))}
      </section>
      <aside className="h-fit rounded border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-black text-ink">Tong don</h2>
        <div className="mt-4 space-y-3 text-sm text-zinc-600">
          <div className="flex justify-between">
            <span>Tam tinh</span>
            <span>${subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Van chuyen</span>
            <span>$10</span>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-black text-ink">
            <span>Tong</span>
            <span>${subtotal + 10}</span>
          </div>
        </div>
        <Link href="/checkout" className="mt-5 block rounded bg-ink px-5 py-3 text-center font-black text-white">
          Thanh toan
        </Link>
      </aside>
    </div>
  );
}

