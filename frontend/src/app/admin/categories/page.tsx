'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminModal, AdminNotice, AdminTable, AdminToolbar, EmptyState, LoadingTable, ModalFormActions, ModalFormRow, StatusBadge, TableActionButton } from '@/components/admin-ui';
import { ApiError, apiFetch } from '@/lib/api';
import { categories as fallbackCategories, type Category } from '@/lib/mock-data';

type AdminCategory = Category & {
  isActive?: boolean;
  parentId?: string | null;
  parent?: Category | null;
  children?: Category[];
  _count?: { products: number; children?: number };
};

type CategoryForm = {
  id: string; name: string; slug: string; description: string;
  imageUrl: string; parentId: string; isActive: boolean;
};

const emptyForm: CategoryForm = { id: '', name: '', slug: '', description: '', imageUrl: '', parentId: '', isActive: true };

function slugify(v: string) {
  return v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>(fallbackCategories);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true); setError('');
    try { setCategories(await apiFetch<AdminCategory[]>('/categories')); }
    catch { setCategories(fallbackCategories); setError('Không tải được danh mục. Đang hiển thị dữ liệu demo.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const displayed = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return categories.filter(c => !q || `${c.name} ${c.slug} ${c.description ?? ''}`.toLowerCase().includes(q));
  }, [categories, filter]);

  const openCreate = () => { setForm(emptyForm); setModalOpen(true); setMessage(''); };
  const openEdit = (cat: AdminCategory) => {
    setForm({ id: cat.id, name: cat.name, slug: cat.slug, description: cat.description ?? '', imageUrl: cat.imageUrl ?? '', parentId: cat.parentId ?? cat.parent?.id ?? '', isActive: cat.isActive ?? true });
    setModalOpen(true); setMessage('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) { setMessage('Tên và slug không được rỗng.'); return; }
    setSaving(true); setMessage('');
    try {
      await apiFetch<AdminCategory>(form.id ? `/categories/${form.id}` : '/categories', {
        method: form.id ? 'PATCH' : 'POST',
        body: JSON.stringify({ name: form.name.trim(), slug: form.slug.trim(), description: form.description.trim() || undefined, imageUrl: form.imageUrl.trim() || undefined, parentId: form.parentId || null, isActive: form.isActive }),
      });
      setModalOpen(false); setForm(emptyForm); setMessage(form.id ? 'Đã cập nhật danh mục.' : 'Đã thêm danh mục.'); await loadData();
    } catch (err) { setMessage(err instanceof ApiError ? err.message : 'Không thể lưu danh mục.'); }
    finally { setSaving(false); }
  };

  const removeCategory = async (cat: AdminCategory) => {
    if (!window.confirm(`Xóa danh mục "${cat.name}"?`)) return;
    try { await apiFetch(`/categories/${cat.id}`, { method: 'DELETE' }); setMessage('Đã xóa danh mục.'); await loadData(); }
    catch (err) { setMessage(err instanceof ApiError ? err.message : 'Không thể xóa danh mục.'); }
  };

  return (
    <AdminShell
      title="Quản lý danh mục"
      description="Tổ chức danh mục sản phẩm, hỗ trợ danh mục cha/con."
      actions={<button onClick={openCreate} className="btn-dark px-5 py-2.5 font-semibold text-sm">+ Thêm danh mục</button>}
    >
      <AdminToolbar>
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={filter} onChange={e => setFilter(e.target.value)} className="input-form pl-10 w-full" placeholder="Tìm danh mục..." />
        </div>
      </AdminToolbar>

      {error && <AdminNotice type="error">{error}</AdminNotice>}
      {message && <AdminNotice type={message.startsWith('Đã') ? 'success' : 'error'}>{message}</AdminNotice>}

      {loading ? (
        <LoadingTable columns={6} />
      ) : displayed.length ? (
        <AdminTable minWidth={860}>
          <thead>
            <tr>
              {['Tên danh mục', 'Slug', 'Danh mục cha', 'Sản phẩm', 'Trạng thái', 'Thao tác'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map(cat => (
              <tr key={cat.id}>
                <td>
                  <p className="font-semibold text-brand-black">{cat.name}</p>
                  {cat.description && <p className="text-xs text-brand-muted mt-0.5 max-w-xs truncate">{cat.description}</p>}
                </td>
                <td><code className="text-xs bg-brand-offwhite px-1.5 py-0.5 rounded">{cat.slug}</code></td>
                <td>{cat.parent?.name ?? <span className="text-brand-subtle">—</span>}</td>
                <td><span className="font-semibold">{cat._count?.products ?? 0}</span></td>
                <td><StatusBadge status={cat.isActive === false ? 'inactive' : 'active'} /></td>
                <td>
                  <div className="flex gap-2">
                    <TableActionButton onClick={() => openEdit(cat)} tone="primary">Sửa</TableActionButton>
                    <TableActionButton onClick={() => removeCategory(cat)} tone="danger">Xóa</TableActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : (
        <EmptyState title="Không có danh mục" description="Hãy thêm danh mục đầu tiên cho catalog." />
      )}

      {modalOpen && (
        <AdminModal title={form.id ? 'Cập nhật danh mục' : 'Thêm danh mục'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ModalFormRow label="Tên danh mục *">
                <input value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value, slug: v.slug || slugify(e.target.value) }))} className="input-form w-full" required />
              </ModalFormRow>
              <ModalFormRow label="Slug *">
                <input value={form.slug} onChange={e => setForm(v => ({ ...v, slug: slugify(e.target.value) }))} className="input-form w-full" required />
              </ModalFormRow>
              <ModalFormRow label="Danh mục cha">
                <select value={form.parentId} onChange={e => setForm(v => ({ ...v, parentId: e.target.value }))} className="select-form w-full">
                  <option value="">Không có (danh mục gốc)</option>
                  {categories.filter(c => c.id !== form.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </ModalFormRow>
              <ModalFormRow label="Trạng thái">
                <select value={form.isActive ? 'active' : 'inactive'} onChange={e => setForm(v => ({ ...v, isActive: e.target.value === 'active' }))} className="select-form w-full">
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm ẩn</option>
                </select>
              </ModalFormRow>
              <div className="sm:col-span-2">
                <ModalFormRow label="URL ảnh">
                  <input value={form.imageUrl} onChange={e => setForm(v => ({ ...v, imageUrl: e.target.value }))} className="input-form w-full" placeholder="https://..." />
                </ModalFormRow>
              </div>
            </div>
            <ModalFormRow label="Mô tả">
              <textarea value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} className="textarea-form w-full" rows={3} />
            </ModalFormRow>
            {message && <AdminNotice type="error">{message}</AdminNotice>}
            <ModalFormActions onClose={() => setModalOpen(false)} saving={saving} saveLabel={form.id ? 'Cập nhật' : 'Thêm danh mục'} />
          </form>
        </AdminModal>
      )}
    </AdminShell>
  );
}
