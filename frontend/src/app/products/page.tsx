'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import { apiFetch, queryString } from '@/lib/api';
import { brands as fallbackBrands, categories as fallbackCategories, products as fallbackProducts, type Brand, type Category, type Product } from '@/lib/mock-data';
import { effectivePrice, entitySlug } from '@/lib/format';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [brands, setBrands] = useState<Brand[]>(fallbackBrands);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    onSale: false,
    sort: 'newest',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const [apiProducts, apiCategories, apiBrands] = await Promise.all([
          apiFetch<Product[]>(`/products${queryString(filters)}`),
          apiFetch<Category[]>('/categories'),
          apiFetch<Brand[]>('/brands'),
        ]);

        if (active) {
          setProducts(apiProducts);
          setCategories(apiCategories);
          setBrands(apiBrands);
        }
      } catch (err) {
        if (active) {
          setProducts(fallbackProducts);
          setCategories(fallbackCategories);
          setBrands(fallbackBrands);
          setError('Đang hiển thị dữ liệu demo vì chưa kết nối được API.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [filters]);

  const displayedProducts = useMemo(() => {
    const q = filters.q.trim().toLowerCase();

    return products
      .filter((product) => {
        const price = effectivePrice(product);
        const matchesSearch = !q || `${product.name} ${product.sku} ${product.description ?? ''}`.toLowerCase().includes(q);
        const matchesCategory = !filters.category || entitySlug(product.category) === filters.category;
        const matchesBrand = !filters.brand || entitySlug(product.brand) === filters.brand;
        const matchesSale = !filters.onSale || Boolean(product.salePrice);
        const matchesMin = !filters.minPrice || price >= Number(filters.minPrice);
        const matchesMax = !filters.maxPrice || price <= Number(filters.maxPrice);

        return matchesSearch && matchesCategory && matchesBrand && matchesSale && matchesMin && matchesMax;
      })
      .sort((first, second) => {
        if (filters.sort === 'price-asc') return effectivePrice(first) - effectivePrice(second);
        if (filters.sort === 'price-desc') return effectivePrice(second) - effectivePrice(first);
        if (filters.sort === 'best-selling') return (second.sold ?? 0) - (first.sold ?? 0);
        if (filters.sort === 'relevant') return first.name.localeCompare(second.name, 'vi');
        return (second.createdAt ?? '').localeCompare(first.createdAt ?? '');
      });
  }, [filters, products]);

  return (
    <div className="grid gap-[32px] lg:grid-cols-[260px_1fr]">
      {/* Overlay background for mobile drawer */}
      {isFilterOpen ? (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsFilterOpen(false)}
        />
      ) : null}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[300px] overflow-y-auto bg-neutral-offwhite p-[20px] transition-transform lg:static lg:w-auto lg:translate-x-0 lg:bg-transparent lg:p-0 ${
          isFilterOpen ? 'translate-x-0 shadow-lifted' : '-translate-x-full'
        } space-y-[20px]`}
      >
        <div className="flex items-center justify-between lg:hidden mb-[16px]">
          <h2 className="text-[20px] font-bold text-neutral-black">Bộ lọc sản phẩm</h2>
          <button onClick={() => setIsFilterOpen(false)} className="p-[8px] text-neutral-medium hover:text-neutral-black">
            <svg className="w-[24px] h-[24px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="hidden lg:block">
          <p className="text-[12px] font-bold uppercase text-primary">Bộ lọc</p>
          <h1 className="mt-[8px] text-[32px] font-bold leading-[32px] text-neutral-black">Sản phẩm</h1>
        </div>
        <label className="block rounded-card border border-neutral-border bg-white p-[16px]">
          <span className="text-[14px] font-bold text-neutral-black">Tìm kiếm</span>
          <input
            value={filters.q}
            onChange={(event) => setFilters((value) => ({ ...value, q: event.target.value }))}
            className="input-search w-full mt-[12px]"
            placeholder="Tên sản phẩm, SKU..."
          />
        </label>
        <div className="rounded-card border border-neutral-border bg-white p-[16px]">
          <h2 className="text-[14px] font-bold text-neutral-black">Danh mục</h2>
          <div className="mt-[12px] grid gap-[8px] text-[14px] text-neutral-medium">
            <label className="flex items-center gap-[8px]">
              <input
                checked={!filters.category}
                onChange={() => setFilters((value) => ({ ...value, category: '' }))}
                type="radio"
                name="category"
              />
              Tất cả
            </label>
            {categories.map((category) => (
              <label key={category.slug} className="flex items-center gap-[8px]">
                <input
                  checked={filters.category === category.slug}
                  onChange={() => setFilters((value) => ({ ...value, category: category.slug }))}
                  type="radio"
                  name="category"
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-card border border-neutral-border bg-white p-[16px]">
          <h2 className="text-[14px] font-bold text-neutral-black">Thương hiệu</h2>
          <select
            value={filters.brand}
            onChange={(event) => setFilters((value) => ({ ...value, brand: event.target.value }))}
            className="input-form w-full mt-[12px]"
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((brand) => (
              <option key={brand.slug} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-card border border-neutral-border bg-white p-[16px]">
          <h2 className="text-[14px] font-bold text-neutral-black">Khoảng giá</h2>
          <div className="mt-[12px] grid gap-[8px]">
            <input
              value={filters.minPrice}
              onChange={(event) => setFilters((value) => ({ ...value, minPrice: event.target.value }))}
              className="input-form"
              inputMode="numeric"
              placeholder="Từ"
            />
            <input
              value={filters.maxPrice}
              onChange={(event) => setFilters((value) => ({ ...value, maxPrice: event.target.value }))}
              className="input-form"
              inputMode="numeric"
              placeholder="Đến"
            />
          </div>
          <label className="mt-[12px] flex items-center gap-[8px] text-[14px] text-neutral-medium">
            <input
              checked={filters.onSale}
              onChange={(event) => setFilters((value) => ({ ...value, onSale: event.target.checked }))}
              type="checkbox"
            />
            Chỉ sản phẩm khuyến mãi
          </label>
        </div>
      </aside>
      <section className="space-y-[20px]">
        <div className="flex flex-col justify-between gap-[12px] border-b border-neutral-light pb-[20px] md:flex-row md:items-end">
          <div>
            <p className="text-[14px] text-neutral-medium">
              {loading ? 'Đang tải sản phẩm...' : `Hiển thị ${displayedProducts.length} sản phẩm`}
            </p>
            <h2 className="mt-[4px] text-[24px] font-bold leading-[28.8px] text-neutral-black">Tất cả sản phẩm</h2>
            {error ? <p className="mt-[8px] text-[14px] text-alert-dark">{error}</p> : null}
          </div>
          <div className="flex gap-[12px]">
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden rounded-btn border border-neutral-light px-[16px] py-[8px] text-[14px] font-bold text-neutral-black hover:border-primary hover:text-primary transition-colors flex items-center gap-[8px]"
            >
              <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Lọc
            </button>
            <select
              value={filters.sort}
              onChange={(event) => setFilters((value) => ({ ...value, sort: event.target.value }))}
              className="input-form w-auto"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
              <option value="best-selling">Bán chạy</option>
              <option value="relevant">Liên quan</option>
            </select>
          </div>
        </div>
        {loading ? (
          <div className="grid gap-[20px] sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-card bg-neutral-offwhite" />
            ))}
          </div>
        ) : displayedProducts.length ? (
          <div className="grid gap-[20px] sm:grid-cols-2 xl:grid-cols-3">
            {displayedProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-neutral-light bg-white p-[32px] text-center">
            <p className="font-bold text-neutral-black">Không tìm thấy sản phẩm phù hợp.</p>
            <p className="mt-[8px] text-[14px] text-neutral-medium">Hãy thử bỏ bớt bộ lọc hoặc tìm từ khóa khác.</p>
          </div>
        )}
      </section>
    </div>
  );
}
