'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminModal, AdminNotice, EmptyState, LoadingTable, StatusBadge, TableActionButton } from '@/components/admin-ui';
import { ApiError, apiFetch, queryString } from '@/lib/api';
import { entityName, money, productImage } from '@/lib/format';
import { brands as fallbackBrands, categories as fallbackCategories, products as fallbackProducts, type Brand, type Category, type Product } from '@/lib/mock-data';
import { EnhancedAdminProductsPage } from './enhanced-page';

type ProductVariant = {
  id?: string;
  name: string;
  sku: string;
  size?: string | null;
  color?: string | null;
  priceAdjustment?: number | string | null;
  stock: number;
};

type AdminProduct = Product & {
  shortDescription?: string;
  variants?: ProductVariant[];
};

type ProductForm = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  price: string;
  salePrice: string;
  stock: string;
  images: string;
  categoryId: string;
  brandId: string;
  isActive: boolean;
  variants: ProductVariant[];
};

const emptyForm: ProductForm = {
  id: '',
  name: '',
  slug: '',
  sku: '',
  shortDescription: '',
  description: '',
  price: '',
  salePrice: '',
  stock: '0',
  images: '',
  categoryId: '',
  brandId: '',
  isActive: true,
  variants: [],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function splitImages(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}


export default function AdminProductsPage() {
  return <EnhancedAdminProductsPage />;

  const [products, setProducts] = useState<AdminProduct[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [brands, setBrands] = useState<Brand[]>(fallbackBrands);
  const [filters, setFilters] = useState({ q: '', category: '', brand: '', status: 'all', stockStatus: 'all' });
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [productData, categoryData, brandData] = await Promise.all([
        apiFetch<AdminProduct[]>(`/products/admin/list${queryString(filters)}`),
        apiFetch<Category[]>('/categories'),
        apiFetch<Brand[]>('/brands'),
      ]);
      setProducts(productData);
      setCategories(categoryData);
      setBrands(brandData);
    } catch {
      setProducts(fallbackProducts);
      setCategories(fallbackCategories);
      setBrands(fallbackBrands);
      setError('Không tải được dữ liệu sản phẩm từ API. Đang hiển thị dữ liệu demo để tham khảo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const filteredProducts = useMemo(() => products, [products]);

  const openCreate = () => {
    setForm({
      ...emptyForm,
      categoryId: categories[0]?.id ?? '',
      brandId: brands[0]?.id ?? '',
    });
    setModalOpen(true);
    setMessage('');
  };

  const openEdit = (product: AdminProduct) => {
    const category = typeof product.category === 'string' ? categories.find((item) => item.name === product.category) : product.category;
    const brand = typeof product.brand === 'string' ? brands.find((item) => item.name === product.brand) : product.brand;

    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      shortDescription: product.shortDescription ?? '',
      description: product.description ?? '',
      price: String(product.price),
      salePrice: product.salePrice ? String(product.salePrice) : '',
      stock: String(product.stock),
      images: product.images?.join('\n') || productImage(product),
      categoryId: product.categoryId ?? category?.id ?? categories[0]?.id ?? '',
      brandId: product.brandId ?? brand?.id ?? brands[0]?.id ?? '',
      isActive: product.isActive ?? true,
      variants: (product.variants ?? []).map((variant) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        size: variant.size ?? '',
        color: variant.color ?? '',
        priceAdjustment: Number(variant.priceAdjustment ?? 0),
        stock: variant.stock,
      })),
    });
    setModalOpen(true);
    setMessage('');
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Tên sản phẩm không được rỗng.';
    if (!form.slug.trim()) return 'Slug không được rỗng.';
    if (!form.sku.trim()) return 'SKU không được rỗng.';
    if (!form.categoryId) return 'Vui lòng chọn danh mục.';
    if (!form.brandId) return 'Vui lòng chọn thương hiệu.';
    if (Number(form.price) < 0 || Number.isNaN(Number(form.price))) return 'Giá sản phẩm không hợp lệ.';
    if (form.salePrice && Number(form.salePrice) < 0) return 'Giá khuyến mãi không hợp lệ.';
    if (Number(form.stock) < 0 || Number.isNaN(Number(form.stock))) return 'Tồn kho không hợp lệ.';
    if (!splitImages(form.images).length) return 'Vui lòng nhập ít nhất một URL ảnh.';

    for (const variant of form.variants) {
      if (!variant.name.trim() || !variant.sku.trim()) return 'Biến thể phải có tên và SKU.';
      if (Number(variant.stock) < 0 || Number.isNaN(Number(variant.stock))) return 'Tồn kho biến thể không hợp lệ.';
    }

    return '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      sku: form.sku.trim(),
      shortDescription: form.shortDescription.trim() || undefined,
      description: form.description.trim() || undefined,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      stock: Number(form.stock),
      images: splitImages(form.images),
      categoryId: form.categoryId,
      brandId: form.brandId,
      isActive: form.isActive,
      variants: form.variants.map((variant) => ({
        name: variant.name.trim(),
        sku: variant.sku.trim(),
        size: variant.size?.trim() || undefined,
        color: variant.color?.trim() || undefined,
        priceAdjustment: Number(variant.priceAdjustment ?? 0),
        stock: Number(variant.stock),
      })),
    };

    setSaving(true);
    setMessage('');

    try {
      await apiFetch<AdminProduct>(form.id ? `/products/${form.id}` : '/products', {
        method: form.id ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      setModalOpen(false);
      setForm(emptyForm);
      setMessage(form.id ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm.');
      await loadData();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không thể lưu sản phẩm.');
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (product: AdminProduct) => {
    if (!window.confirm(`Xóa sản phẩm "${product.name}"?`)) return;

    setMessage('');

    try {
      await apiFetch(`/products/${product.id}`, { method: 'DELETE' });
      setMessage('Đã xóa sản phẩm.');
      await loadData();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không thể xóa sản phẩm.');
    }
  };

  const updateVariant = (index: number, patch: Partial<ProductVariant>) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) => (variantIndex === index ? { ...variant, ...patch } : variant)),
    }));
  };

  return (
    <AdminShell title="Quản lý sản phẩm" description="Quản lý catalog, giá, tồn kho, ảnh, trạng thái và biến thể sản phẩm.">
      <div className="grid gap-[16px] rounded-card border border-neutral-border bg-white p-[16px] lg:grid-cols-[1.5fr_repeat(4,minmax(140px,1fr))_auto]">
        <input value={filters.q} onChange={(event) => setFilters((value) => ({ ...value, q: event.target.value }))} className="input-search w-full" placeholder="Tìm tên, SKU, mô tả..." />
        <select value={filters.category} onChange={(event) => setFilters((value) => ({ ...value, category: event.target.value }))} className="input-form bg-white">
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <select value={filters.brand} onChange={(event) => setFilters((value) => ({ ...value, brand: event.target.value }))} className="input-form bg-white">
          <option value="">Tất cả thương hiệu</option>
          {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
        </select>
        <select value={filters.status} onChange={(event) => setFilters((value) => ({ ...value, status: event.target.value }))} className="input-form bg-white">
          <option value="all">Mọi trạng thái</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Ẩn</option>
        </select>
        <select value={filters.stockStatus} onChange={(event) => setFilters((value) => ({ ...value, stockStatus: event.target.value }))} className="input-form bg-white">
          <option value="all">Mọi tồn kho</option>
          <option value="in-stock">Còn nhiều</option>
          <option value="low-stock">Sắp hết</option>
          <option value="out-of-stock">Hết hàng</option>
        </select>
        <button onClick={openCreate} className="btn-primary h-[46px]">Thêm</button>
      </div>

      {error ? <AdminNotice type="error">{error}</AdminNotice> : null}
      {message ? <AdminNotice type={message.startsWith('Đã') ? 'success' : 'error'}>{message}</AdminNotice> : null}

      {loading ? (
        <LoadingTable columns={8} />
      ) : filteredProducts.length ? (
        <div className="overflow-x-auto rounded-card border border-neutral-light bg-white">
          <table className="w-full min-w-[1120px] text-left text-[14px]">
            <thead className="bg-neutral-offwhite text-[12px] uppercase text-neutral-medium tracking-wide">
              <tr>
                <th className="px-[16px] py-[12px] font-bold">Sản phẩm</th>
                <th className="px-[16px] py-[12px] font-bold">SKU</th>
                <th className="px-[16px] py-[12px] font-bold">Danh mục</th>
                <th className="px-[16px] py-[12px] font-bold">Thương hiệu</th>
                <th className="px-[16px] py-[12px] font-bold">Giá</th>
                <th className="px-[16px] py-[12px] font-bold">Tồn kho</th>
                <th className="px-[16px] py-[12px] font-bold">Trạng thái</th>
                <th className="px-[16px] py-[12px] font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="text-neutral-dark hover:bg-neutral-offwhite transition-colors">
                  <td className="px-[16px] py-[16px]">
                    <div className="flex items-center gap-[12px]">
                      <img src={productImage(product)} alt={product.name} className="h-[52px] w-[52px] rounded-card object-cover bg-neutral-offwhite" />
                      <div className="min-w-0">
                        <p className="max-w-[260px] truncate font-bold text-neutral-black">{product.name}</p>
                        <p className="text-[12px] text-neutral-medium">{product.variants?.length ?? 0} biến thể</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-[16px] py-[16px]">{product.sku}</td>
                  <td className="px-[16px] py-[16px]">{entityName(product.category)}</td>
                  <td className="px-[16px] py-[16px]">{entityName(product.brand)}</td>
                  <td className="px-[16px] py-[16px] font-bold text-neutral-black">{money(product.salePrice ?? product.price)}</td>
                  <td className="px-[16px] py-[16px]"><StatusBadge status={product.stock <= 0 ? 'danger' : product.stock <= 10 ? 'low' : 'active'}>{product.stock}</StatusBadge></td>
                  <td className="px-[16px] py-[16px]"><StatusBadge status={product.isActive === false ? 'inactive' : 'active'}>{product.isActive === false ? 'Ẩn' : 'Đang bán'}</StatusBadge></td>
                  <td className="px-[16px] py-[16px]">
                    <div className="flex gap-[8px]">
                      <TableActionButton onClick={() => openEdit(product)} tone="primary">Sửa</TableActionButton>
                      <TableActionButton onClick={() => removeProduct(product)} tone="danger">Xóa</TableActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Không có sản phẩm" description="Thử đổi bộ lọc hoặc thêm sản phẩm mới." />
      )}

      {modalOpen ? (
        <AdminModal title={form.id ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'} description="Thông tin sản phẩm sẽ được lưu qua API quản trị." onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="grid gap-[20px]">
            <div className="grid gap-[16px] md:grid-cols-2">
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Tên sản phẩm
                <input value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value, slug: value.slug || slugify(event.target.value) }))} className="input-form w-full" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Slug
                <input value={form.slug} onChange={(event) => setForm((value) => ({ ...value, slug: slugify(event.target.value) }))} className="input-form w-full" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">SKU
                <input value={form.sku} onChange={(event) => setForm((value) => ({ ...value, sku: event.target.value }))} className="input-form w-full" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Ảnh (mỗi dòng một URL)
                <textarea value={form.images} onChange={(event) => setForm((value) => ({ ...value, images: event.target.value }))} className="min-h-[92px] rounded-none border border-neutral-inputLight px-[12px] py-[10px] text-[14px]" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Mô tả ngắn
                <textarea value={form.shortDescription} onChange={(event) => setForm((value) => ({ ...value, shortDescription: event.target.value }))} className="min-h-[92px] rounded-none border border-neutral-inputLight px-[12px] py-[10px] text-[14px]" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Mô tả chi tiết
                <textarea value={form.description} onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))} className="min-h-[92px] rounded-none border border-neutral-inputLight px-[12px] py-[10px] text-[14px]" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Giá
                <input value={form.price} onChange={(event) => setForm((value) => ({ ...value, price: event.target.value }))} className="input-form w-full" inputMode="numeric" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Giá khuyến mãi
                <input value={form.salePrice} onChange={(event) => setForm((value) => ({ ...value, salePrice: event.target.value }))} className="input-form w-full" inputMode="numeric" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Tồn kho
                <input value={form.stock} onChange={(event) => setForm((value) => ({ ...value, stock: event.target.value }))} className="input-form w-full" inputMode="numeric" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Trạng thái
                <select value={form.isActive ? 'active' : 'inactive'} onChange={(event) => setForm((value) => ({ ...value, isActive: event.target.value === 'active' }))} className="input-form w-full bg-white">
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ẩn</option>
                </select>
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Danh mục
                <select value={form.categoryId} onChange={(event) => setForm((value) => ({ ...value, categoryId: event.target.value }))} className="input-form w-full bg-white">
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Thương hiệu
                <select value={form.brandId} onChange={(event) => setForm((value) => ({ ...value, brandId: event.target.value }))} className="input-form w-full bg-white">
                  <option value="">Chọn thương hiệu</option>
                  {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
              </label>
            </div>

            <div className="rounded-card border border-neutral-light p-[16px]">
              <div className="flex items-center justify-between gap-[12px]">
                <h3 className="text-[18px] font-bold text-neutral-black">Biến thể</h3>
                <button type="button" onClick={() => setForm((value) => ({ ...value, variants: [...value.variants, { name: '', sku: '', size: '', color: '', priceAdjustment: 0, stock: 0 }] }))} className="rounded-btn border border-primary px-[12px] py-[8px] text-[14px] font-bold text-primary hover:bg-primary hover:text-white">
                  Thêm biến thể
                </button>
              </div>
              <div className="mt-[12px] grid gap-[12px]">
                {form.variants.length ? form.variants.map((variant, index) => (
                  <div key={index} className="grid gap-[8px] rounded-card bg-neutral-offwhite p-[12px] md:grid-cols-[1fr_1fr_0.7fr_0.7fr_0.7fr_auto]">
                    <input value={variant.name} onChange={(event) => updateVariant(index, { name: event.target.value })} className="input-form w-full" placeholder="Tên" />
                    <input value={variant.sku} onChange={(event) => updateVariant(index, { sku: event.target.value })} className="input-form w-full" placeholder="SKU" />
                    <input value={variant.size ?? ''} onChange={(event) => updateVariant(index, { size: event.target.value })} className="input-form w-full" placeholder="Size" />
                    <input value={variant.color ?? ''} onChange={(event) => updateVariant(index, { color: event.target.value })} className="input-form w-full" placeholder="Màu" />
                    <input value={String(variant.stock)} onChange={(event) => updateVariant(index, { stock: Number(event.target.value) })} className="input-form w-full" inputMode="numeric" placeholder="Tồn" />
                    <button type="button" onClick={() => setForm((value) => ({ ...value, variants: value.variants.filter((_, variantIndex) => variantIndex !== index) }))} className="rounded-btn border border-neutral-light px-[12px] py-[8px] text-[13px] font-bold text-alert-dark">
                      Xóa
                    </button>
                  </div>
                )) : <p className="text-[14px] text-neutral-medium">Chưa có biến thể. Sản phẩm sẽ dùng tồn kho tổng.</p>}
              </div>
            </div>

            <div className="flex flex-col gap-[12px] sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-btn border border-neutral-input px-[16px] py-[10px] font-bold text-neutral-black">Hủy</button>
              <button disabled={saving} className="btn-primary h-[44px] px-[24px] disabled:opacity-60">{saving ? 'Đang lưu...' : form.id ? 'Cập nhật' : 'Thêm sản phẩm'}</button>
            </div>
          </form>
        </AdminModal>
      ) : null}
    </AdminShell>
  );
}
