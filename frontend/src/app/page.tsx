import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { categories, products } from '@/lib/mock-data';

export default function HomePage() {
  const featuredProducts = [...products].sort((first, second) => (second.sold ?? 0) - (first.sold ?? 0)).slice(0, 8);

  return (
    <div className="space-y-[24px]">
      <section className="relative min-h-[520px] overflow-hidden rounded-card bg-primary-deep text-white">
        <img
          src="https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1800&q=80"
          alt="Đồ thể thao BigSport"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-deep/90 via-primary-deep/55 to-transparent" />
        <div className="relative grid min-h-[520px] content-center gap-[32px] px-[20px] py-[104px] md:grid-cols-[1.2fr_0.8fr] lg:px-[32px]">
          <div className="max-w-2xl">
            <p className="text-[14px] font-bold uppercase text-white/85">BigSport Store</p>
            <h1 className="mt-[16px] text-[40px] font-medium leading-[48px]">Đồ thể thao cho mọi buổi tập.</h1>
            <p className="mt-[20px] max-w-xl text-[16px] leading-[24px] text-zinc-100">
              Giày chạy bộ, trang phục tập luyện, bóng đá, bóng rổ và phụ kiện chính hãng với ưu đãi theo mùa.
            </p>
            <div className="mt-[28px] flex flex-wrap gap-[12px]">
              <Link href="/products" className="btn-primary">
                Mua sắm ngay
              </Link>
              <Link href="/contact" className="btn-secondary">
                Tư vấn chọn đồ
              </Link>
            </div>
          </div>
          <div className="grid content-end gap-[12px] text-[14px]">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="rounded-card border border-white/20 bg-white/10 p-[16px] backdrop-blur transition hover:bg-white/20"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-[16px] md:grid-cols-3">
        {[
          ['Freeship', 'Miễn phí vận chuyển cho đơn từ 1,5 triệu'],
          ['Khuyến mãi', 'Nhiều sản phẩm giảm đến 20%'],
          ['Đổi trả', 'Hỗ trợ đổi size trong 7 ngày'],
        ].map(([title, description]) => (
          <div key={title} className="rounded-card border border-neutral-border bg-white p-[20px]">
            <h3 className="text-[24px] font-medium leading-[28.8px] text-neutral-black">{title}</h3>
            <p className="mt-[8px] text-[14px] leading-[21px] text-neutral-medium">{description}</p>
          </div>
        ))}
      </section>

      <section className="space-y-[20px]">
        <div className="flex items-end justify-between gap-[16px]">
          <div>
            <p className="text-[12px] font-bold uppercase text-primary">Danh mục</p>
            <h2 className="mt-[8px] text-[32px] font-bold leading-[32px] text-neutral-black">Mua theo môn thể thao</h2>
          </div>
        </div>
        <div className="grid gap-[16px] sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <Link key={category.slug} href={`/products?category=${category.slug}`} className="group overflow-hidden rounded-standard bg-white transition hover:bg-neutral-offwhite">
              <div className="aspect-[4/3] overflow-hidden bg-neutral-offwhite">
                <img src={category.imageUrl} alt={category.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              </div>
              <div className="p-[15px]">
                <p className="font-bold text-neutral-black">{category.name}</p>
                <p className="mt-[4px] text-[14px] text-neutral-medium">{category._count?.products ?? 0} sản phẩm</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-card bg-neutral-offwhite p-[20px] md:p-[32px]">
        <div className="grid gap-[24px] md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-[12px] font-bold uppercase text-primary">Ưu đãi SPORT10</p>
            <h2 className="mt-[8px] text-[32px] font-bold leading-[32px] text-neutral-black">Giảm 10% cho đơn demo hôm nay</h2>
            <p className="mt-[12px] max-w-2xl text-[14px] leading-[21px] text-neutral-medium">
              Áp dụng mã SPORT10 ở bước thanh toán cho các sản phẩm đang bán. Giá mới, giá cũ và tồn kho được đồng bộ từ catalog.
            </p>
          </div>
          <Link href="/products?onSale=true" className="btn-primary">
            Xem sản phẩm khuyến mãi
          </Link>
        </div>
      </section>

      <section className="space-y-[20px]">
        <div className="flex items-end justify-between gap-[16px]">
          <div>
            <p className="text-[12px] font-bold uppercase text-primary">Nổi bật</p>
            <h2 className="mt-[8px] text-[32px] font-bold leading-[32px] text-neutral-black">Sản phẩm bán chạy</h2>
          </div>
          <Link href="/products" className="text-[16px] font-normal text-primary hover:text-primary-hover transition-colors">
            Xem tất cả
          </Link>
        </div>
        <div className="grid gap-[16px] sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
