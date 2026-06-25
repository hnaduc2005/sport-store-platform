'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminModal, AdminNotice, AdminTable, AdminToolbar, EmptyState, LoadingTable, ModalFormActions, ModalFormRow, StatusBadge, TableActionButton } from '@/components/admin-ui';
import { ApiError, apiFetch } from '@/lib/api';
import { brands as fallbackBrands, type Brand } from '@/lib/mock-data';

type AdminBrand = Brand & { isActive?: boolean };

type BrandForm = {
  id: string; name: string; slug: string; description: string; logoUrl: string; isActive: boolean;
};

const emptyForm: BrandForm = { id: '', name: '', slug: '', description: '', logoUrl: '', isActive: true };

function slugify(v: string) {
  return v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<AdminBrand[]>(fallbackBrands);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState<BrandForm>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true); setError('');
    try { setBrands(await apiFetch<AdminBrand[]>('/brands')); }
    catch { setBrands(fallbackBrands); setError('Không tải được thương hiệu. Đang hiển thị dữ liệu demo.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const displayed = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return brands.filter(b => !q || `${b.name} ${b.slug} ${b.description ?? ''}`.toLowerCase().includes(q));
  }, [brands, filter]);

  const openCreate = () => { setForm(emptyForm); setModalOpen(true); setMessage(''); };
  const openEdit = (b: AdminBrand) => {
    setForm({ id: b.id, name: b.name, slug: b.slug, description: b.description ?? '', logoUrl: b.logoUrl ?? '', isActive: b.isActive ?? true });
    setModalOpen(true); setMessage('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) { setMessage('Tên và slug không được rỗng.'); return; }
    setSaving(true); setMessage('');
    try {
      await apiFetch<AdminBrand>(form.id ? `/brands/${form.id}` : '/brands', {
        method: form.id ? 'PATCH' : 'POST',
        body: JSON.stringify({ name: form.name.trim(), slug: form.slug.trim(), description: form.description.trim() || undefined, logoUrl: form.logoUrl.trim() || undefined, isActive: form.isActive }),
      });
      setModalOpen(false); setForm(emptyForm); setMessage(form.id ? 'Đã cập nhật thương hiệu.' : 'Đã thêm thương hiệu.'); await loadData();
    } catch (err) { setMessage(err instanceof ApiError ? err.message : 'Không thể lưu thương hiệu.'); }
    finally { setSaving(false); }
  };

  const removeBrand = async (b: AdminBrand) => {
    if (!window.confirm(`Xóa thương hiệu "${b.name}"?`)) return;
    try { await apiFetch(`/brands/${b.id}`, { method: 'DELETE' }); setMessage('Đã xóa thương hiệu.'); await loadData(); }
    catch (err) { setMessage(err instanceof ApiError ? err.message : 'Không thể xóa thương hiệu.'); }
  };

  return (
    <AdminShell
      title="Quản lý thương hiệu"
      description="Quản lý tên, slug, mô tả, logo và trạng thái của nhà sản xuất."
      actions={<button onClick={openCreate} className="btn-dark px-5 py-2.5 font-semibold text-sm">+ Thêm thương hiệu</button>}
    >
      <AdminToolbar>
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={filter} onChange={e => setFilter(e.target.value)} className="input-form pl-10 w-full" placeholder="Tìm thương hiệu..." />
        </div>
      </AdminToolbar>

      {error && <AdminNotice type="error">{error}</AdminNotice>}
      {message && <AdminNotice type={message.startsWith('Đã') ? 'success' : 'error'}>{message}</AdminNotice>}

      {loading ? (
        <LoadingTable columns={5} />
      ) : displayed.length ? (
        <AdminTable minWidth={820}>
          <thead>
            <tr>
              {['Thương hiệu', 'Slug', 'Sản phẩm', 'Trạng thái', 'Thao tác'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map(b => (
              <tr key={b.id}>
                <td>
                  <div className="flex items-center gap-3">
                    {b.logoUrl ? (
                      <img src={b.logoUrl} alt={b.name} className="h-8 w-8 rounded object-contain bg-brand-offwhite p-1" />
                    ) : (
                      <div className="h-8 w-8 rounded bg-brand-offwhite flex items-center justify-center text-xs font-bold text-brand-muted">
                        {b.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-brand-black">{b.name}</p>
                      {b.description && <p className="text-xs text-brand-muted mt-0.5 max-w-xs truncate">{b.description}</p>}
                    </div>
                  </div>
                </td>
                <td><code className="text-xs bg-brand-offwhite px-1.5 py-0.5 rounded">{b.slug}</code></td>
                <td><span className="font-semibold">{b._count?.products ?? 0}</span></td>
                <td><StatusBadge status={b.isActive === false ? 'inactive' : 'active'} /></td>
                <td>
                  <div className="flex gap-2">
                    <TableActionButton onClick={() => openEdit(b)} tone="primary">Sửa</TableActionButton>
                    <TableActionButton onClick={() => removeBrand(b)} tone="danger">Xóa</TableActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      ) : (
        <EmptyState title="Không có thương hiệu" description="Hãy thêm thương hiệu đầu tiên." />
      )}

      {modalOpen && (
        <AdminModal title={form.id ? 'Cập nhật thương hiệu' : 'Thêm thương hiệu'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ModalFormRow label="Tên thương hiệu *">
                <input value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value, slug: v.slug || slugify(e.target.value) }))} className="input-form w-full" required />
              </ModalFormRow>
              <ModalFormRow label="Slug *">
                <input value={form.slug} onChange={e => setForm(v => ({ ...v, slug: slugify(e.target.value) }))} className="input-form w-full" required />
              </ModalFormRow>
              <ModalFormRow label="Logo URL">
                <input value={form.logoUrl} onChange={e => setForm(v => ({ ...v, logoUrl: e.target.value }))} className="input-form w-full" placeholder="https://..." />
              </ModalFormRow>
              <ModalFormRow label="Trạng thái">
                <select value={form.isActive ? 'active' : 'inactive'} onChange={e => setForm(v => ({ ...v, isActive: e.target.value === 'active' }))} className="select-form w-full">
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Tạm ẩn</option>
                </select>
              </ModalFormRow>
            </div>
            {form.logoUrl && (
              <div className="flex items-center gap-3 rounded-lg bg-brand-offwhite p-3">
                <img src={form.logoUrl} alt="preview" className="h-10 w-10 object-contain rounded" />
                <span className="text-xs text-brand-muted">Preview logo</span>
              </div>
            )}
            <ModalFormRow label="Mô tả">
              <textarea value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} className="textarea-form w-full" rows={3} />
            </ModalFormRow>
            {message && <AdminNotice type="error">{message}</AdminNotice>}
            <ModalFormActions onClose={() => setModalOpen(false)} saving={saving} saveLabel={form.id ? 'Cập nhật' : 'Thêm thương hiệu'} />
          </form>
        </AdminModal>
      )}
    </AdminShell>
  );
}
