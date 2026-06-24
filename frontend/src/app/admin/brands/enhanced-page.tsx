'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminModal, AdminNotice, EmptyState, LoadingTable, StatusBadge, TableActionButton } from '@/components/admin-ui';
import { ApiError, apiFetch, apiUpload } from '@/lib/api';
import type { Brand } from '@/lib/mock-data';

type AdminBrand = Brand & {
  isActive?: boolean;
};

type BrandForm = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  isActive: boolean;
};

type MediaUpload = {
  url: string;
};

const emptyForm: BrandForm = { id: '', name: '', slug: '', description: '', logoUrl: '', isActive: true };

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function EnhancedAdminBrandsPage() {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState<BrandForm>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      setBrands(await apiFetch<AdminBrand[]>('/brands'));
    } catch {
      setBrands([]);
      setError('Không tải được thương hiệu từ API. Vui lòng kiểm tra đăng nhập admin, backend hoặc database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const displayed = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return brands.filter((brand) => !q || `${brand.name} ${brand.slug} ${brand.description ?? ''}`.toLowerCase().includes(q));
  }, [brands, filter]);

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
    setMessage('');
  };

  const openEdit = (brand: AdminBrand) => {
    setForm({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description ?? '',
      logoUrl: brand.logoUrl ?? '',
      isActive: brand.isActive ?? true,
    });
    setModalOpen(true);
    setMessage('');
  };

  const uploadLogo = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setMessage('');

    try {
      const uploaded = await apiUpload<MediaUpload>('/media/upload/brands', file);
      setForm((current) => ({ ...current, logoUrl: uploaded.url }));
      setMessage('Đã upload logo thương hiệu.');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không upload được logo thương hiệu.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage('Tên thương hiệu không được rỗng.');
      return;
    }

    if (!form.slug.trim()) {
      setMessage('Slug thương hiệu không được rỗng.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await apiFetch<AdminBrand>(form.id ? `/brands/${form.id}` : '/brands', {
        method: form.id ? 'PATCH' : 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || undefined,
          logoUrl: form.logoUrl || undefined,
          isActive: form.isActive,
        }),
      });
      setModalOpen(false);
      setForm(emptyForm);
      setMessage(form.id ? 'Đã cập nhật thương hiệu.' : 'Đã thêm thương hiệu.');
      await loadData();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không thể lưu thương hiệu.');
    } finally {
      setSaving(false);
    }
  };

  const removeBrand = async (brand: AdminBrand) => {
    if (!window.confirm(`Xóa thương hiệu "${brand.name}"?`)) return;

    try {
      await apiFetch(`/brands/${brand.id}`, { method: 'DELETE' });
      setMessage('Đã xóa thương hiệu.');
      await loadData();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không thể xóa thương hiệu.');
    }
  };

  return (
    <AdminShell title="Quản lý thương hiệu" description="Quản lý tên, slug, mô tả, logo upload và trạng thái của nhà sản xuất.">
      <div className="flex flex-col gap-[12px] rounded-card border border-neutral-border bg-white p-[16px] md:flex-row">
        <input value={filter} onChange={(event) => setFilter(event.target.value)} className="input-search flex-1" placeholder="Tìm thương hiệu..." />
        <button onClick={openCreate} className="btn-primary h-[45px]">Thêm thương hiệu</button>
      </div>

      {error ? <AdminNotice type="error">{error}</AdminNotice> : null}
      {message ? <AdminNotice type={message.startsWith('Đã') ? 'success' : 'error'}>{message}</AdminNotice> : null}

      {loading ? (
        <LoadingTable columns={7} />
      ) : displayed.length ? (
        <div className="overflow-x-auto rounded-card border border-neutral-light bg-white">
          <table className="w-full min-w-[900px] text-left text-[14px]">
            <thead className="bg-neutral-offwhite text-[12px] uppercase text-neutral-medium tracking-wide">
              <tr>
                <th className="px-[16px] py-[12px] font-bold">Logo</th>
                <th className="px-[16px] py-[12px] font-bold">Tên</th>
                <th className="px-[16px] py-[12px] font-bold">Slug</th>
                <th className="px-[16px] py-[12px] font-bold">Mô tả</th>
                <th className="px-[16px] py-[12px] font-bold">Sản phẩm</th>
                <th className="px-[16px] py-[12px] font-bold">Trạng thái</th>
                <th className="px-[16px] py-[12px] font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {displayed.map((brand) => (
                <tr key={brand.id} className="text-neutral-dark hover:bg-neutral-offwhite">
                  <td className="px-[16px] py-[16px]">
                    {brand.logoUrl ? <img src={brand.logoUrl} alt={brand.name} className="h-[44px] w-[64px] rounded-card object-contain bg-neutral-offwhite" /> : <div className="h-[44px] w-[64px] rounded-card bg-neutral-offwhite" />}
                  </td>
                  <td className="px-[16px] py-[16px] font-bold text-neutral-black">{brand.name}</td>
                  <td className="px-[16px] py-[16px]">{brand.slug}</td>
                  <td className="px-[16px] py-[16px] max-w-[320px] truncate">{brand.description ?? 'Chưa có mô tả'}</td>
                  <td className="px-[16px] py-[16px]">{brand._count?.products ?? 0}</td>
                  <td className="px-[16px] py-[16px]"><StatusBadge status={brand.isActive === false ? 'inactive' : 'active'}>{brand.isActive === false ? 'Tạm ẩn' : 'Đang hoạt động'}</StatusBadge></td>
                  <td className="px-[16px] py-[16px]">
                    <div className="flex gap-[8px]">
                      <TableActionButton onClick={() => openEdit(brand)} tone="primary">Sửa</TableActionButton>
                      <TableActionButton onClick={() => removeBrand(brand)} tone="danger">Xóa</TableActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Không có thương hiệu" description="Hãy thêm thương hiệu đầu tiên cho catalog." />
      )}

      {modalOpen ? (
        <AdminModal title={form.id ? 'Cập nhật thương hiệu' : 'Thêm thương hiệu'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="grid gap-[16px]">
            <div className="grid gap-[16px] md:grid-cols-2">
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Tên thương hiệu
                <input value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value, slug: value.slug || slugify(event.target.value) }))} className="input-form w-full" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Slug
                <input value={form.slug} onChange={(event) => setForm((value) => ({ ...value, slug: slugify(event.target.value) }))} className="input-form w-full" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Upload logo
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadLogo(event.target.files?.[0])} className="input-form w-full bg-white" />
                <span className="text-[12px] font-normal text-neutral-medium">{uploading ? 'Đang upload...' : 'Hỗ trợ JPG, PNG, WebP, tối đa 5MB.'}</span>
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Trạng thái
                <select value={form.isActive ? 'active' : 'inactive'} onChange={(event) => setForm((value) => ({ ...value, isActive: event.target.value === 'active' }))} className="input-form w-full bg-white">
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm ẩn</option>
                </select>
              </label>
            </div>
            {form.logoUrl ? <img src={form.logoUrl} alt={form.name || 'Thương hiệu'} className="h-[120px] w-full rounded-card object-contain bg-neutral-offwhite" /> : null}
            <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Mô tả
              <textarea value={form.description} onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))} className="min-h-[120px] rounded-none border border-neutral-inputLight px-[12px] py-[10px] text-[14px]" />
            </label>
            <div className="flex justify-end gap-[12px]">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-btn border border-neutral-input px-[16px] py-[10px] font-bold text-neutral-black">Hủy</button>
              <button disabled={saving || uploading} className="btn-primary h-[44px] px-[24px] disabled:opacity-60">{saving ? 'Đang lưu...' : 'Lưu thương hiệu'}</button>
            </div>
          </form>
        </AdminModal>
      ) : null}
    </AdminShell>
  );
}
