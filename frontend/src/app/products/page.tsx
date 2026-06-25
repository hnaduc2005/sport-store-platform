'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import { apiFetch, queryString } from '@/lib/api';
import type { Brand, Category, Product } from '@/lib/mock-data';
import { effectivePrice, entitySlug } from '@/lib/format';

function ProductSkeleton() {
  return (
    <div className="rounded-card border border-brand-light bg-white overflow-hidden">
      <div className="skeleton" style={{ aspectRatio: '3/4' }} />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded-full" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-5 w-1/2 rounded mt-2" />
      </div>
    </div>
  );
}

const sortOptions = [
  { value: 'newest',     label: 'Mới nhất' },
  { value: 'price-asc',  label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'best-selling', label: 'Bán chạy nhất' },
  { value: 'relevant',   label: 'Liên quan' },
];

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    q: '', category: '', brand: '', minPrice: '', maxPrice: '', onSale: false, sort: 'newest',
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError('');
      try {
        const [apiProducts, apiCategories, apiBrands] = await Promise.all([
          apiFetch<Product[]>(`/products${queryString(filters)}`),
          apiFetch<Category[]>('/categories'),
          apiFetch<Brand[]>('/brands'),
        ]);
        if (active) {
          setProducts(apiProducts);
          setCategories(apiCategories.filter(c => c.isActive !== false));
          setBrands(apiBrands.filter(b => b.isActive !== false));
        }
      } catch {
        if (active) { setProducts([]); setCategories([]); setBrands([]); setError('Không tải được sản phẩm từ API.'); }
      } finally { if (active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [filters]);

  const displayedProducts = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return products
      .filter(p => {
        const price = effectivePrice(p);
        return (
          (!q || `${p.name} ${p.sku} ${p.description ?? ''}`.toLowerCase().includes(q)) &&
          (!filters.category || entitySlug(p.category) === filters.category) &&
          (!filters.brand || entitySlug(p.brand) === filters.brand) &&
          (!filters.onSale || Boolean(p.salePrice)) &&
          (!filters.minPrice || price >= Number(filters.minPrice)) &&
          (!filters.maxPrice || price <= Number(filters.maxPrice))
        );
      })
      .sort((a, b) => {
        if (filters.sort === 'price-asc') return effectivePrice(a) - effectivePrice(b);
        if (filters.sort === 'price-desc') return effectivePrice(b) - effectivePrice(a);
        if (filters.sort === 'best-selling') return (b.sold ?? 0) - (a.sold ?? 0);
        if (filters.sort === 'relevant') return a.name.localeCompare(b.name, 'vi');
        return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
      });
  }, [filters, products]);

  const activeFiltersCount = [
    filters.category, filters.brand, filters.minPrice, filters.maxPrice, filters.onSale ? '1' : '',
  ].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="form-label">Tìm kiếm</label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={filters.q}
            onChange={e => setFilters(v => ({ ...v, q: e.target.value }))}
            className="input-form pl-10 w-full"
            placeholder="Tên sản phẩm, SKU..."
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <p className="form-label">Danh mục</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            onClick={() => setFilters(v => ({ ...v, category: '' }))}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              !filters.category
                ? 'bg-accent text-white border-accent'
                : 'bg-white text-brand-muted border-brand-light hover:border-accent hover:text-accent'
            }`}
          >
            Tất cả
          </button>
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setFilters(v => ({ ...v, category: v.category === cat.slug ? '' : cat.slug }))}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filters.category === cat.slug
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-brand-muted border-brand-light hover:border-accent hover:text-accent'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <label className="form-label">Thương hiệu</label>
        <select
          value={filters.brand}
          onChange={e => setFilters(v => ({ ...v, brand: e.target.value }))}
          className="select-form w-full mt-1"
        >
          <option value="">Tất cả thương hiệu</option>
          {brands.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
        </select>
      </div>

      {/* Price range */}
      <div>
        <p className="form-label">Khoảng giá (VNĐ)</p>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <input
            value={filters.minPrice}
            onChange={e => setFilters(v => ({ ...v, minPrice: e.target.value }))}
            className="input-form"
            inputMode="numeric"
            placeholder="Từ"
          />
          <input
            value={filters.maxPrice}
            onChange={e => setFilters(v => ({ ...v, maxPrice: e.target.value }))}
            className="input-form"
            inputMode="numeric"
            placeholder="Đến"
          />
        </div>
        <label className="mt-3 flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onSale}
            onChange={e => setFilters(v => ({ ...v, onSale: e.target.checked }))}
            className="w-4 h-4 accent-accent rounded"
          />
          <span className="text-sm text-brand-dark font-medium">Chỉ sản phẩm khuyến mãi</span>
        </label>
      </div>

      {/* Reset */}
      {activeFiltersCount > 0 && (
        <button
          onClick={() => setFilters(v => ({ ...v, category: '', brand: '', minPrice: '', maxPrice: '', onSale: false }))}
          className="w-full rounded-btn border border-danger/30 bg-danger-light py-2.5 text-sm font-semibold text-danger-dark hover:bg-danger/10 transition-colors"
        >
          Xóa bộ lọc ({activeFiltersCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6">
        <span className="section-label">Cửa hàng</span>
        <h1 className="section-title">Tất cả sản phẩm</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* ── Mobile overlay ── */}
        {isFilterOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsFilterOpen(false)}
          />
        )}

        {/* ── Sidebar / Drawer ── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[300px] overflow-y-auto bg-white p-6 shadow-lg transition-transform duration-300
            lg:static lg:w-auto lg:translate-x-0 lg:shadow-none lg:bg-transparent lg:p-0 lg:overflow-visible
            ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Drawer header (mobile only) */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="text-lg font-bold text-brand-black">Bộ lọc</h2>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="rounded-btn p-2 text-brand-muted hover:bg-brand-offwhite transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="lg:sticky lg:top-24">
            <p className="hidden lg:block font-bold text-brand-black mb-4 text-base">Bộ lọc sản phẩm</p>
            <div className="rounded-xl border border-brand-light bg-white p-5 shadow-sm">
              <FilterPanel />
            </div>
          </div>
        </aside>

        {/* ── Product area ── */}
        <section className="min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden btn-outline px-4 py-2 text-sm flex items-center gap-2"
              >
                <FilterIcon />
                Lọc
                {activeFiltersCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <p className="text-sm text-brand-muted">
                {loading ? 'Đang tải...' : `${displayedProducts.length} sản phẩm`}
              </p>
            </div>
            <select
              value={filters.sort}
              onChange={e => setFilters(v => ({ ...v, sort: e.target.value }))}
              className="select-form w-auto min-w-[180px]"
            >
              {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-card border border-danger/30 bg-danger-light px-4 py-3 text-sm text-danger-dark">
              {error}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : displayedProducts.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {displayedProducts.map(p => <ProductCard key={p.slug} product={p} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-offwhite text-4xl">
                🔍
              </div>
              <h3 className="text-lg font-bold text-brand-black">Không tìm thấy sản phẩm</h3>
              <p className="mt-2 text-sm text-brand-muted max-w-xs">Thử bỏ bớt bộ lọc hoặc tìm từ khóa khác.</p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => setFilters(v => ({ ...v, category: '', brand: '', minPrice: '', maxPrice: '', onSale: false, q: '' }))}
                  className="btn-outline mt-4 px-5 py-2 text-sm"
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
