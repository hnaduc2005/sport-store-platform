'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminModal, AdminNotice, AdminTable, AdminToolbar, EmptyState, LoadingTable, StatusBadge, TableActionButton } from '@/components/admin-ui';
import { ApiError, apiFetch, apiUpload, type PaginatedResponse, queryString } from '@/lib/api';
import { entityName, money, productImage } from '@/lib/format';
import type { Brand, Category, Product } from '@/lib/mock-data';

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

type MediaUpload = {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
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
  images: string[];
  categoryId: string;
  brandId: string;
  isActive: boolean;
  variants: ProductVariant[];
};

type ProductFormMode = 'create' | 'edit';

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
  images: [],
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

function productList(payload: AdminProduct[] | PaginatedResponse<AdminProduct>) {
  return Array.isArray(payload) ? payload : payload.data;
}

function productMeta(payload: AdminProduct[] | PaginatedResponse<AdminProduct>, page: number, limit: number) {
  if (!Array.isArray(payload)) return payload.meta;
  return { total: payload.length, page, limit, pageCount: 1 };
}

export function EnhancedAdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filters, setFilters] = useState({ q: '', category: '', brand: '', status: 'all', stockStatus: 'all', page: 1, limit: 10 });
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, pageCount: 1 });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [mode, setMode] = useState<ProductFormMode>('create');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingEditId, setLoadingEditId] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      const [productData, categoryData, brandData] = await Promise.all([
        apiFetch<AdminProduct[] | PaginatedResponse<AdminProduct>>(`/products/admin/list${queryString(filters)}`),
        apiFetch<Category[]>('/categories'),
        apiFetch<Brand[]>('/brands'),
      ]);
      setProducts(productList(productData));
      setMeta(productMeta(productData, filters.page, filters.limit));
      setCategories(categoryData);
      setBrands(brandData);
      setSelectedIds([]);
    } catch {
      setProducts([]);
      setMeta({ total: 0, page: filters.page, limit: filters.limit, pageCount: 1 });
      setCategories([]);
      setBrands([]);
      setError('Không tải được dữ liệu sản phẩm từ API. Vui lòng kiểm tra đăng nhập admin, backend hoặc database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const selectedProducts = useMemo(() => products.filter((product) => selectedIds.includes(product.id)), [products, selectedIds]);
  const allSelected = products.length > 0 && selectedIds.length === products.length;

  const setFilter = (patch: Partial<typeof filters>) => {
    setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  };

  const productToForm = (product: AdminProduct): ProductForm => {
    const category = typeof product.category === 'string' ? categories.find((item) => item.name === product.category) : product.category;
    const brand = typeof product.brand === 'string' ? brands.find((item) => item.name === product.brand) : product.brand;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      shortDescription: product.shortDescription ?? '',
      description: product.description ?? '',
      price: String(product.price),
      salePrice: product.salePrice ? String(product.salePrice) : '',
      stock: String(product.stock),
      images: product.images?.length ? product.images : [],
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
    };
  };

  const openCreate = () => {
    setMode('create');
    setForm({
      ...emptyForm,
      categoryId: categories[0]?.id ?? '',
      brandId: brands[0]?.id ?? '',
    });
    setModalOpen(true);
    setMessage('');
  };

  const openEdit = async (product: AdminProduct) => {
    setMode('edit');
    setForm(productToForm(product));
    setModalOpen(true);
    setMessage('');
    setLoadingEditId(product.id);

    try {
      const latestProduct = await apiFetch<AdminProduct>(`/products/admin/${product.id}`);
      setForm(productToForm(latestProduct));
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không tải được chi tiết sản phẩm để chỉnh sửa.');
    } finally {
      setLoadingEditId('');
    }
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Tên sản phẩm không được rỗng.';
    if (!form.slug.trim()) return 'Slug không được rỗng.';
    if (!form.sku.trim()) return 'SKU không được rỗng.';
    if (!form.categoryId) return 'Vui lòng chọn danh mục.';
    if (!form.brandId) return 'Vui lòng chọn thương hiệu.';
    if (Number(form.price) < 0 || Number.isNaN(Number(form.price))) return 'Giá sản phẩm không hợp lệ.';
    if (form.salePrice && Number(form.salePrice) < 0) return 'Giá khuyến mãi không hợp lệ.';
    if (form.salePrice && Number(form.salePrice) > Number(form.price)) return 'Giá khuyến mãi không được lớn hơn giá gốc.';
    if (Number(form.stock) < 0 || Number.isNaN(Number(form.stock))) return 'Tồn kho không hợp lệ.';
    if (!form.images.length) return 'Vui lòng upload ít nhất một ảnh sản phẩm.';

    for (const variant of form.variants) {
      if (!variant.name.trim() || !variant.sku.trim()) return 'Biến thể phải có tên và SKU.';
      if (Number(variant.stock) < 0 || Number.isNaN(Number(variant.stock))) return 'Tồn kho biến thể không hợp lệ.';
      if (Number(variant.priceAdjustment ?? 0) < 0 || Number.isNaN(Number(variant.priceAdjustment ?? 0))) return 'Giá cộng thêm của biến thể không hợp lệ.';
    }

    return '';
  };

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;

    setUploading(true);
    setMessage('');

    try {
      const uploaded = await Promise.all(Array.from(files).map((file) => apiUpload<MediaUpload>('/media/upload/products', file)));
      setForm((current) => ({ ...current, images: [...current.images, ...uploaded.map((item) => item.url)] }));
      setMessage('Đã upload ảnh sản phẩm.');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không upload được ảnh sản phẩm.');
    } finally {
      setUploading(false);
    }
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
      images: form.images,
      categoryId: form.categoryId,
      brandId: form.brandId,
      isActive: form.isActive,
      variants: form.variants.map((variant) => ({
        ...(variant.id ? { id: variant.id } : {}),
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
      await apiFetch<AdminProduct>(mode === 'edit' ? `/products/${form.id}` : '/products', {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      setModalOpen(false);
      setForm(emptyForm);
      setMode('create');
      setMessage(mode === 'edit' ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm.');
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

  const updateSelectedStatus = async (isActive: boolean) => {
    if (!selectedIds.length) return;
    const label = isActive ? 'hiện' : 'ẩn';
    if (!window.confirm(`Bạn muốn ${label} ${selectedIds.length} sản phẩm đã chọn?`)) return;

    try {
      await apiFetch('/products/admin/bulk-status', {
        method: 'PATCH',
        body: JSON.stringify({ ids: selectedIds, isActive }),
      });
      setMessage(`Đã ${label} ${selectedIds.length} sản phẩm.`);
      await loadData();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không thể cập nhật hàng loạt.');
    }
  };

  const updateVariant = (index: number, patch: Partial<ProductVariant>) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) => (variantIndex === index ? { ...variant, ...patch } : variant)),
    }));
  };

  const moveImageToFront = (index: number) => {
    setForm((current) => {
      const images = [...current.images];
      const [selected] = images.splice(index, 1);
      return { ...current, images: [selected, ...images] };
    });
  };

  return (
    <AdminShell title="Quản lý sản phẩm" description="Quản lý catalog, giá, tồn kho, ảnh upload, trạng thái và biến thể sản phẩm.">
      <AdminToolbar>
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={filters.q} onChange={(event) => setFilter({ q: event.target.value })} className="input-form pl-10 w-full" placeholder="Tìm tên, SKU, mô tả..." />
        </div>
        <select value={filters.category} onChange={(event) => setFilter({ category: event.target.value })} className="select-form w-full md:w-auto">
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <select value={filters.brand} onChange={(event) => setFilter({ brand: event.target.value })} className="select-form w-full md:w-auto">
          <option value="">Tất cả thương hiệu</option>
          {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
        </select>
        <select value={filters.status} onChange={(event) => setFilter({ status: event.target.value })} className="select-form w-full md:w-auto">
          <option value="all">Mọi trạng thái</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Ẩn</option>
        </select>
        <select value={filters.stockStatus} onChange={(event) => setFilter({ stockStatus: event.target.value })} className="select-form w-full md:w-auto">
          <option value="all">Mọi tồn kho</option>
          <option value="in-stock">Còn nhiều</option>
          <option value="low-stock">Sắp hết</option>
          <option value="out-of-stock">Hết hàng</option>
        </select>
        <button onClick={openCreate} className="btn-primary shrink-0">Thêm</button>
      </AdminToolbar>

      {selectedIds.length > 0 && (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-brand-light bg-brand-offwhite/50 p-4 md:flex-row md:items-center mt-4">
          <div className="text-sm text-brand-muted">
            Đã chọn <b className="text-brand-black">{selectedIds.length}</b> sản phẩm
            {selectedProducts.length ? <span> ({selectedProducts.slice(0, 2).map((item) => item.name).join(', ')}{selectedProducts.length > 2 ? '...' : ''})</span> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button disabled={!selectedIds.length} onClick={() => updateSelectedStatus(false)} className="btn-outline px-3 py-1.5 text-xs bg-white">Ẩn đã chọn</button>
            <button disabled={!selectedIds.length} onClick={() => updateSelectedStatus(true)} className="btn-primary px-3 py-1.5 text-xs">Hiện đã chọn</button>
          </div>
        </div>
      )}

      {error ? <AdminNotice type="error">{error}</AdminNotice> : null}
      {message ? <AdminNotice type={message.startsWith('Đã') ? 'success' : 'error'}>{message}</AdminNotice> : null}

      {loading ? (
        <LoadingTable columns={9} />
      ) : products.length ? (
        <AdminTable minWidth={1180}>
          <thead>
            <tr>
              <th className="w-12"><input type="checkbox" checked={allSelected} onChange={(event) => setSelectedIds(event.target.checked ? products.map((product) => product.id) : [])} className="rounded border-brand-light text-accent focus:ring-accent" /></th>
              {['Sản phẩm', 'SKU', 'Danh mục', 'Thương hiệu', 'Giá', 'Tồn kho', 'Trạng thái', 'Thao tác'].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, product.id] : current.filter((id) => id !== product.id))} className="rounded border-brand-light text-accent focus:ring-accent" />
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <img src={productImage(product)} alt={product.name} className="h-12 w-12 rounded object-cover bg-brand-offwhite" />
                    <div className="min-w-0">
                      <p className="max-w-[260px] truncate font-bold text-brand-black">{product.name}</p>
                      <p className="text-xs text-brand-muted">{product.variants?.length ?? 0} biến thể</p>
                    </div>
                  </div>
                </td>
                <td><span className="font-mono text-xs">{product.sku}</span></td>
                <td>{entityName(product.category)}</td>
                <td>{entityName(product.brand)}</td>
                <td className="font-bold text-brand-black">{money(product.salePrice ?? product.price)}</td>
                <td><StatusBadge status={product.stock <= 0 ? 'danger' : product.stock <= 10 ? 'warning' : 'active'}>{product.stock}</StatusBadge></td>
                <td><StatusBadge status={product.isActive === false ? 'inactive' : 'active'}>{product.isActive === false ? 'Ẩn' : 'Đang bán'}</StatusBadge></td>
                <td>
                  <div className="flex gap-2">
                    <TableActionButton onClick={() => openEdit(product)} tone="primary">{loadingEditId === product.id ? 'Đang tải...' : 'Sửa'}</TableActionButton>
                    <TableActionButton onClick={() => removeProduct(product)} tone="danger">Xóa</TableActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : (
        <EmptyState title="Không có sản phẩm" description="Thử đổi bộ lọc hoặc thêm sản phẩm mới." />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-brand-muted">
        <span>Trang {meta.page}/{meta.pageCount} · Tổng {meta.total} sản phẩm</span>
        <div className="flex gap-2">
          <button disabled={meta.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">← Trước</button>
          <button disabled={meta.page >= meta.pageCount} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} className="btn-outline px-4 py-2 text-sm disabled:opacity-40">Sau →</button>
        </div>
      </div>

      {modalOpen ? (
        <AdminModal title={mode === 'edit' ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'} description="Thông tin sản phẩm sẽ được lưu qua API quản trị." onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-bold text-brand-black">Tên sản phẩm<input value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value, slug: value.slug || slugify(event.target.value) }))} className="input-form w-full" /></label>
              <label className="grid gap-1.5 text-sm font-bold text-brand-black">Slug<input value={form.slug} onChange={(event) => setForm((value) => ({ ...value, slug: slugify(event.target.value) }))} className="input-form w-full" /></label>
              <label className="grid gap-1.5 text-sm font-bold text-brand-black">SKU<input value={form.sku} onChange={(event) => setForm((value) => ({ ...value, sku: event.target.value }))} className="input-form w-full" /></label>
              <label className="grid gap-1.5 text-sm font-bold text-brand-black">Upload ảnh<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadImages(event.target.files)} className="input-form w-full bg-white pt-2" /><span className="text-xs font-normal text-brand-muted">{uploading ? 'Đang upload...' : 'Hỗ trợ JPG, PNG, WebP, tối đa 5MB/ảnh.'}</span></label>
              <label className="grid gap-1.5 text-sm font-bold text-brand-black">Mô tả ngắn<textarea value={form.shortDescription} onChange={(event) => setForm((value) => ({ ...value, shortDescription: event.target.value }))} className="textarea-form" /></label>
              <label className="grid gap-1.5 text-sm font-bold text-brand-black">Mô tả chi tiết<textarea value={form.description} onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))} className="textarea-form" /></label>
              <label className="grid gap-1.5 text-sm font-bold text-brand-black">Giá<input value={form.price} onChange={(event) => setForm((value) => ({ ...value, price: event.target.value }))} className="input-form w-full" inputMode="numeric" /></label>
              <label className="grid gap-1.5 text-sm font-bold text-brand-black">Giá khuyến mãi<input value={form.salePrice} onChange={(event) => setForm((value) => ({ ...value, salePrice: event.target.value }))} className="input-form w-full" inputMode="numeric" /></label>
              <label className="grid gap-1.5 text-sm font-bold text-brand-black">Tồn kho tổng<input value={form.stock} onChange={(event) => setForm((value) => ({ ...value, stock: event.target.value }))} className="input-form w-full" inputMode="numeric" /></label>
              <label className="grid gap-1.5 text-sm font-bold text-brand-black">Trạng thái<select value={form.isActive ? 'active' : 'inactive'} onChange={(event) => setForm((value) => ({ ...value, isActive: event.target.value === 'active' }))} className="select-form w-full"><option value="active">Đang bán</option><option value="inactive">Ẩn</option></select></label>
              <label className="grid gap-1.5 text-sm font-bold text-brand-black">Danh mục<select value={form.categoryId} onChange={(event) => setForm((value) => ({ ...value, categoryId: event.target.value }))} className="select-form w-full"><option value="">Chọn danh mục</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label className="grid gap-1.5 text-sm font-bold text-brand-black">Thương hiệu<select value={form.brandId} onChange={(event) => setForm((value) => ({ ...value, brandId: event.target.value }))} className="select-form w-full"><option value="">Chọn thương hiệu</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label>
            </div>

            <div className="rounded-xl border border-brand-light p-4">
              <h3 className="text-lg font-bold text-brand-black">Ảnh sản phẩm</h3>
              {form.images.length ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {form.images.map((image, index) => (
                    <div key={image} className="rounded-xl border border-brand-light p-2">
                      <img src={image} alt={`${form.name || 'Sản phẩm'} ${index + 1}`} className="aspect-[4/3] w-full rounded-lg object-cover bg-brand-offwhite" />
                      <div className="mt-2 flex gap-2">
                        <button type="button" onClick={() => moveImageToFront(index)} className="flex-1 btn-outline px-2 py-1.5 text-xs text-brand-black">{index === 0 ? 'Đại diện' : 'Đặt đại diện'}</button>
                        <button type="button" onClick={() => setForm((value) => ({ ...value, images: value.images.filter((item) => item !== image) }))} className="btn-outline px-2 py-1.5 text-xs text-danger border-danger">Xóa</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="mt-2 text-sm text-brand-muted">Chưa có ảnh. Hãy upload ít nhất một ảnh sản phẩm.</p>}
            </div>

            <div className="rounded-xl border border-brand-light p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-brand-black">Biến thể</h3>
                <button type="button" onClick={() => setForm((value) => ({ ...value, variants: [...value.variants, { name: '', sku: '', size: '', color: '', priceAdjustment: 0, stock: 0 }] }))} className="btn-outline px-3 py-1.5 text-sm text-primary border-primary">Thêm biến thể</button>
              </div>
              <div className="mt-3 grid gap-3">
                {form.variants.length ? form.variants.map((variant, index) => (
                  <div key={index} className="grid gap-2 rounded-xl bg-brand-offwhite p-3 md:grid-cols-[1fr_1fr_0.7fr_0.7fr_0.7fr_0.7fr_auto]">
                    <input value={variant.name} onChange={(event) => updateVariant(index, { name: event.target.value })} className="input-form w-full h-9 text-sm" placeholder="Tên" />
                    <input value={variant.sku} onChange={(event) => updateVariant(index, { sku: event.target.value })} className="input-form w-full h-9 text-sm" placeholder="SKU" />
                    <input value={variant.size ?? ''} onChange={(event) => updateVariant(index, { size: event.target.value })} className="input-form w-full h-9 text-sm" placeholder="Size" />
                    <input value={variant.color ?? ''} onChange={(event) => updateVariant(index, { color: event.target.value })} className="input-form w-full h-9 text-sm" placeholder="Màu" />
                    <input value={String(variant.priceAdjustment ?? 0)} onChange={(event) => updateVariant(index, { priceAdjustment: Number(event.target.value) })} className="input-form w-full h-9 text-sm" inputMode="numeric" placeholder="Giá +" />
                    <input value={String(variant.stock)} onChange={(event) => updateVariant(index, { stock: Number(event.target.value) })} className="input-form w-full h-9 text-sm" inputMode="numeric" placeholder="Tồn" />
                    <button type="button" onClick={() => setForm((value) => ({ ...value, variants: value.variants.filter((_, variantIndex) => variantIndex !== index) }))} className="btn-outline px-3 py-1.5 text-xs text-danger border-danger">Xóa</button>
                  </div>
                )) : <p className="text-sm text-brand-muted">Chưa có biến thể. Sản phẩm sẽ dùng tồn kho tổng.</p>}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-outline px-4 py-2">Hủy</button>
              <button disabled={saving || uploading || Boolean(loadingEditId)} className="btn-primary px-6 py-2 disabled:opacity-60">{saving ? 'Đang lưu...' : mode === 'edit' ? 'Cập nhật' : 'Thêm sản phẩm'}</button>
            </div>
          </form>
        </AdminModal>
      ) : null}
    </AdminShell>
  );
}
