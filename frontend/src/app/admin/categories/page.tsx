'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { apiFetch } from '@/lib/api';
import { categories as fallbackCategories, type Category } from '@/lib/mock-data';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiFetch<Category[]>('/categories').then(setCategories).catch(() => setMessage('Đang dùng dữ liệu demo.'));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    try {
      const category = await apiFetch<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify({ name, slug }),
      });
      setCategories((items) => [category, ...items]);
      setMessage('Đã thêm danh mục.');
    } catch {
      setCategories((items) => [{ id: `local-${Date.now()}`, name, slug, _count: { products: 0 } }, ...items]);
      setMessage('Đã thêm danh mục ở chế độ demo.');
    }
    setName('');
  };

  return (
    <AdminShell title="Quản lý danh mục" description="Tổ chức danh mục cho catalog sản phẩm.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-[12px] rounded-card border border-neutral-border bg-white p-[20px] sm:flex-row">
        <input value={name} onChange={(event) => setName(event.target.value)} required className="input-form flex-1" placeholder="Tên danh mục mới" />
        <button className="btn-primary w-full sm:w-auto">Thêm</button>
      </form>
      {message ? <p className="text-[14px] font-bold text-primary">{message}</p> : null}
      <div className="overflow-x-auto rounded-card border border-neutral-light bg-white">
        <table className="w-full min-w-[620px] text-left text-[14px]">
          <thead className="bg-neutral-offwhite text-[12px] uppercase text-neutral-medium tracking-wide">
            <tr>
              <th className="px-[16px] py-[12px] font-bold">Tên</th>
              <th className="px-[16px] py-[12px] font-bold">Slug</th>
              <th className="px-[16px] py-[12px] font-bold">Số sản phẩm</th>
              <th className="px-[16px] py-[12px] font-bold">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-light">
            {categories.map((category) => (
              <tr key={category.id} className="text-neutral-dark hover:bg-neutral-offwhite transition-colors">
                <td className="px-[16px] py-[16px] font-bold text-neutral-black">{category.name}</td>
                <td className="px-[16px] py-[16px]">{category.slug}</td>
                <td className="px-[16px] py-[16px]">{category._count?.products ?? 0}</td>
                <td className="px-[16px] py-[16px]">Hiển thị</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
