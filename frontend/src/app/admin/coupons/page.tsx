'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { AdminModal, AdminNotice, EmptyState, LoadingTable, StatusBadge, TableActionButton } from '@/components/admin-ui';
import { ApiError, apiFetch } from '@/lib/api';
import { formatDate, money } from '@/lib/format';

type Coupon = {
  id: string;
  code: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number | string;
  startsAt?: string | null;
  endsAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
};

type CouponForm = {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: string;
  startsAt: string;
  endsAt: string;
  usageLimit: string;
  isActive: boolean;
};

const emptyForm: CouponForm = {
  id: '',
  code: '',
  description: '',
  discountType: 'PERCENTAGE',
  value: '',
  startsAt: '',
  endsAt: '',
  usageLimit: '',
  isActive: true,
};

function dateInput(value?: string | null) {
  return value ? value.slice(0, 10) : '';
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      setCoupons(await apiFetch<Coupon[]>('/coupons'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không tải được danh sách coupon.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const displayed = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return coupons.filter((coupon) => !q || `${coupon.code} ${coupon.description ?? ''}`.toLowerCase().includes(q));
  }, [coupons, filter]);

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
    setMessage('');
  };

  const openEdit = (coupon: Coupon) => {
    setForm({
      id: coupon.id,
      code: coupon.code,
      description: coupon.description ?? '',
      discountType: coupon.discountType,
      value: String(coupon.value),
      startsAt: dateInput(coupon.startsAt),
      endsAt: dateInput(coupon.endsAt),
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
      isActive: coupon.isActive,
    });
    setModalOpen(true);
    setMessage('');
  };

  const validateForm = () => {
    if (!form.code.trim()) return 'Mã coupon không được rỗng.';
    if (Number.isNaN(Number(form.value)) || Number(form.value) <= 0) return 'Giá trị giảm giá không hợp lệ.';
    if (form.discountType === 'PERCENTAGE' && Number(form.value) > 100) return 'Giảm theo phần trăm không được vượt quá 100%.';
    if (form.usageLimit && Number(form.usageLimit) < 1) return 'Giới hạn sử dụng không hợp lệ.';
    if (form.startsAt && form.endsAt && form.startsAt > form.endsAt) return 'Ngày bắt đầu phải trước ngày kết thúc.';
    return '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await apiFetch<Coupon>(form.id ? `/coupons/${form.id}` : '/coupons', {
        method: form.id ? 'PATCH' : 'POST',
        body: JSON.stringify({
          code: form.code.trim(),
          description: form.description.trim() || undefined,
          discountType: form.discountType,
          value: Number(form.value),
          startsAt: form.startsAt || null,
          endsAt: form.endsAt || null,
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
          isActive: form.isActive,
        }),
      });
      setModalOpen(false);
      setForm(emptyForm);
      setMessage(form.id ? 'Đã cập nhật coupon.' : 'Đã thêm coupon.');
      await loadData();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không thể lưu coupon.');
    } finally {
      setSaving(false);
    }
  };

  const removeCoupon = async (coupon: Coupon) => {
    if (!window.confirm(`Xóa coupon "${coupon.code}"?`)) return;

    try {
      await apiFetch(`/coupons/${coupon.id}`, { method: 'DELETE' });
      setMessage('Đã xóa coupon.');
      await loadData();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Không thể xóa coupon.');
    }
  };

  return (
    <AdminShell title="Quản lý coupon" description="Tạo và cập nhật mã giảm giá, giới hạn sử dụng, thời gian hiệu lực và trạng thái.">
      <div className="flex flex-col gap-[12px] rounded-card border border-neutral-border bg-white p-[16px] md:flex-row">
        <input value={filter} onChange={(event) => setFilter(event.target.value)} className="input-search flex-1" placeholder="Tìm mã hoặc mô tả coupon..." />
        <button onClick={openCreate} className="btn-primary h-[45px]">Thêm coupon</button>
      </div>

      {error ? <AdminNotice type="error">{error}</AdminNotice> : null}
      {message ? <AdminNotice type={message.startsWith('Đã') ? 'success' : 'error'}>{message}</AdminNotice> : null}

      {loading ? (
        <LoadingTable columns={7} />
      ) : displayed.length ? (
        <div className="overflow-x-auto rounded-card border border-neutral-light bg-white">
          <table className="w-full min-w-[980px] text-left text-[14px]">
            <thead className="bg-neutral-offwhite text-[12px] uppercase text-neutral-medium tracking-wide">
              <tr>
                <th className="px-[16px] py-[12px] font-bold">Mã</th>
                <th className="px-[16px] py-[12px] font-bold">Loại</th>
                <th className="px-[16px] py-[12px] font-bold">Giá trị</th>
                <th className="px-[16px] py-[12px] font-bold">Đã dùng</th>
                <th className="px-[16px] py-[12px] font-bold">Hiệu lực</th>
                <th className="px-[16px] py-[12px] font-bold">Trạng thái</th>
                <th className="px-[16px] py-[12px] font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light">
              {displayed.map((coupon) => (
                <tr key={coupon.id} className="text-neutral-dark hover:bg-neutral-offwhite">
                  <td className="px-[16px] py-[16px]">
                    <p className="font-bold text-neutral-black">{coupon.code}</p>
                    <p className="mt-[4px] max-w-[260px] truncate text-[12px] text-neutral-medium">{coupon.description ?? 'Chưa có mô tả'}</p>
                  </td>
                  <td className="px-[16px] py-[16px]">{coupon.discountType === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền'}</td>
                  <td className="px-[16px] py-[16px] font-bold">{coupon.discountType === 'PERCENTAGE' ? `${Number(coupon.value)}%` : money(coupon.value)}</td>
                  <td className="px-[16px] py-[16px]">{coupon.usedCount}/{coupon.usageLimit ?? 'không giới hạn'}</td>
                  <td className="px-[16px] py-[16px] text-[13px]">{formatDate(coupon.startsAt)} - {formatDate(coupon.endsAt)}</td>
                  <td className="px-[16px] py-[16px]"><StatusBadge status={coupon.isActive ? 'active' : 'inactive'}>{coupon.isActive ? 'Đang bật' : 'Tạm tắt'}</StatusBadge></td>
                  <td className="px-[16px] py-[16px]">
                    <div className="flex gap-[8px]">
                      <TableActionButton onClick={() => openEdit(coupon)} tone="primary">Sửa</TableActionButton>
                      <TableActionButton onClick={() => removeCoupon(coupon)} tone="danger">Xóa</TableActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Không có coupon" description="Mã giảm giá mới sẽ xuất hiện tại đây." />
      )}

      {modalOpen ? (
        <AdminModal title={form.id ? 'Cập nhật coupon' : 'Thêm coupon'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="grid gap-[16px]">
            <div className="grid gap-[16px] md:grid-cols-2">
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Mã coupon
                <input value={form.code} onChange={(event) => setForm((value) => ({ ...value, code: event.target.value.toUpperCase() }))} className="input-form w-full" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Loại giảm
                <select value={form.discountType} onChange={(event) => setForm((value) => ({ ...value, discountType: event.target.value as CouponForm['discountType'] }))} className="input-form w-full bg-white">
                  <option value="PERCENTAGE">Phần trăm</option>
                  <option value="FIXED">Số tiền cố định</option>
                </select>
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Giá trị
                <input value={form.value} onChange={(event) => setForm((value) => ({ ...value, value: event.target.value }))} className="input-form w-full" inputMode="numeric" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Giới hạn sử dụng
                <input value={form.usageLimit} onChange={(event) => setForm((value) => ({ ...value, usageLimit: event.target.value }))} className="input-form w-full" inputMode="numeric" placeholder="Không giới hạn" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Ngày bắt đầu
                <input type="date" value={form.startsAt} onChange={(event) => setForm((value) => ({ ...value, startsAt: event.target.value }))} className="input-form w-full" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Ngày kết thúc
                <input type="date" value={form.endsAt} onChange={(event) => setForm((value) => ({ ...value, endsAt: event.target.value }))} className="input-form w-full" />
              </label>
              <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Trạng thái
                <select value={form.isActive ? 'active' : 'inactive'} onChange={(event) => setForm((value) => ({ ...value, isActive: event.target.value === 'active' }))} className="input-form w-full bg-white">
                  <option value="active">Đang bật</option>
                  <option value="inactive">Tạm tắt</option>
                </select>
              </label>
            </div>
            <label className="grid gap-[6px] text-[14px] font-bold text-neutral-black">Mô tả
              <textarea value={form.description} onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))} className="min-h-[100px] rounded-none border border-neutral-inputLight px-[12px] py-[10px] text-[14px]" />
            </label>
            <div className="flex justify-end gap-[12px]">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-btn border border-neutral-input px-[16px] py-[10px] font-bold text-neutral-black">Hủy</button>
              <button disabled={saving} className="btn-primary h-[44px] px-[24px] disabled:opacity-60">{saving ? 'Đang lưu...' : 'Lưu coupon'}</button>
            </div>
          </form>
        </AdminModal>
      ) : null}
    </AdminShell>
  );
}
