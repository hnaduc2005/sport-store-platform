'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminModal, AdminNotice, EmptyState, LoadingTable, StatusBadge, TableActionButton } from '@/components/admin-ui';
import { ApiError, apiFetch } from '@/lib/api';
import { categories as fallbackCategories, type Category } from '@/lib/mock-data';
import { EnhancedAdminCategoriesPage } from './enhanced-page';

type AdminCategory = Category & {
  isActive?: boolean;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  _count?: { products: number; children?: number };
};

type CategoryForm = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId: string;
  isActive: boolean;
};

const emptyForm: CategoryForm = { id: '', name: '', slug: '', description: '', imageUrl: '', parentId: '', isActive: true };

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminCategoriesPage() {
  return <EnhancedAdminCategoriesPage />;

  const [categories, setCategories] = useState<AdminCategory[]>(fallbackCategories);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      setCategories(await apiFetch<AdminCategory[]>('/categories'));
    } catch {
      setCategories(fallbackCategories);
      setError('Không tải được danh mục từ API. Đang hiển thị dữ liệu demo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const displayed = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return categories.filter((category) => !q || `${category.name} ${category.slug} ${category.description ?? ''}`.toLowerCase().includes(q));
  }, [categories, filter]);

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
    setMessage('');
  };

  const openEdit = (category: AdminCategory) => {
    setForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      imageUrl: category.imageUrl ?? '',
      parentId: category.parentId ?? category.parent?.id ?? '',
      isActive: category.isActive ?? true,
    });
    setModalOpen(true);
    setMessage('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.slug.trim()) {
      setMessage('Tên và slug danh mục không được rỗng.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await apiFetch<AdminCategory>(form.id ? `/categories/${form.id}` : '/categories', {
        method: form.id ? 'PATCH' : 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || undefined,
          imageUrl: form.imageUrl.trim() || undefined,
          parentId: form.parentId || null,
          isActive: form.isActive,
        }),
      });
      setModalOpen(false);
      setForm(emptyForm);
      setMessage(form.id ? 'Đã cập nhật danh mục.' : 'Đã thêm danh mục.');
      await loadData();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không thể lưu danh mục.');
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (category: AdminCategory) => {
    if (!window.confirm(`Xóa danh mục "${category.name}"?`)) return;

    try {
      await apiFetch(`/categories/${category.id}`, { method: 'DELETE' });
      setMessage('Đã xóa danh mục.');
      await loadData();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không thể xóa danh mục.');
    }
  };

  return (
    <AdminShell title="Quản lý danh mục" description="Tổ chức danh mục sản phẩm, hỗ trợ danh mục cha/con theo schema hiện có.">
      <div className="flex flex-col gap-[12px] rounded-card border border-neutral-border bg-white p-[16px] md:flex-row">
        <input value={filter} onChange={(event) => setFilter(event.target.value)} className="input-search flex-1" placeholder="Tìm danh mục..." />
        <button onClick={openCreate} className="btn-primary h-[45px]">Thêm danh mục</button>
      </div>

      {error ? <AdminNotice type="error">{error}</AdminNotice> : null}
      {message ? <AdminNotice type={message.startsWith('Đã') ? 'success' : 'error'}>{message}</AdminNotice> : null}

      {loading ? (
        <LoadingTable columns={6} />
      ) : displayed.length ? (
        <div className="overflow-x-auto rounded-card border border-neutral-light bg-white">
          <table className="w-full min-w-[860px] text-left text-[14px]">
            <thead className="bg-neutral-offwhite text-[12px] uppercase text-neutral-medium tracking-wide">
              <tr>
                <th className="px-[16px] py-[12px] font-bold">Tên</th>
                <th className="px-[16px] py-[12px] font-bold">Slug</th>
                <th className="px-[16px] py-[12px] font-bold">Danh mục cha</th>
                <th className="px-[16px] py-[12px] font-bold">Sản phẩm</th>
                <th className="px-[16px] py-[12px] font-bold">Trạng thái</th>
                <th className="px-[16px] py-[12px] font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {displayed.map((category) => (
                <tr key={category.id} className="text-neutral-dark hover:bg-neutral-offwhite">
                  <td className="px-[16px] py-[16px]">
                    <p className="font-bold text-neutral-black">{category.name}</p>
                    {category.description ? <p className="mt-[4px] max-w-[320px] truncate text-[12px] text-neutral-medium">{category.description}</p> : null}
                  </td>
                  <td className="px-[16px] py-[16px]">{category.slug}</td>
                  <td className="px-[16px] py-[16px]">{category.parent?.name ?? 'Không có'}</td>
                  <td className="px-[16px] py-[16px]">{category._count?.products ?? 0}</td>
                  <td className="px-[16px] py-[16px]"><StatusBadge status={category.isActive === false ? 'inactive' : 'active'}>{category.isActive === false ? 'Tạm ẩn' : 'Đang hoạt động'}</StatusBadge></td>
                  <td className="px-[16px] py-[16px]">
                    <div className="flex gap-[8px]">
                      <TableActionButton onClick={() => openEdit(category)} tone="primary">Sửa</TableActionButton>
                      <TableActionButton onClick={() => removeCategory(category)} tone="danger">Xóa</TableActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Không có danh mục" description="Hãy thêm danh mục đầu tiên cho catalog." />
      )}

      {modalOpen ? (
        <AdminModal title={form.id ? 'Cập nhật danh mục' : 'Thêm danh mục'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="grid gap-[16px]">
            <div className="grid gap-[16px] md:grid-cols-2">
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Tên danh mục
                <input value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value, slug: value.slug || slugify(event.target.value) }))} className="input-form w-full" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Slug
                <input value={form.slug} onChange={(event) => setForm((value) => ({ ...value, slug: slugify(event.target.value) }))} className="input-form w-full" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Danh mục cha
                <select value={form.parentId} onChange={(event) => setForm((value) => ({ ...value, parentId: event.target.value }))} className="input-form w-full bg-white">
                  <option value="">Không có</option>
                  {categories.filter((category) => category.id !== form.id).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Trạng thái
                <select value={form.isActive ? 'active' : 'inactive'} onChange={(event) => setForm((value) => ({ ...value, isActive: event.target.value === 'active' }))} className="input-form w-full bg-white">
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm ẩn</option>
                </select>
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black md:col-span-2">URL ảnh
                <input value={form.imageUrl} onChange={(event) => setForm((value) => ({ ...value, imageUrl: event.target.value }))} className="input-form w-full" />
              </label>
            </div>
            <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Mô tả
              <textarea value={form.description} onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))} className="min-h-[120px] rounded-none border border-neutral-inputLight px-[12px] py-[10px] text-[14px]" />
            </label>
            <div className="flex justify-end gap-[12px]">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-btn border border-neutral-input px-[16px] py-[10px] font-bold text-neutral-black">Hủy</button>
              <button disabled={saving} className="btn-primary h-[44px] px-[24px] disabled:opacity-60">{saving ? 'Đang lưu...' : 'Lưu danh mục'}</button>
            </div>
          </form>
        </AdminModal>
      ) : null}
    </AdminShell>
  );
}
