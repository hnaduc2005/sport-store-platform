'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin-shell';
import { apiFetch } from '@/lib/api';
import { entityName, money, productImage } from '@/lib/format';
import { brands as fallbackBrands, categories as fallbackCategories, products as fallbackProducts, type Brand, type Category, type Product } from '@/lib/mock-data';

const emptyForm = {
  id: '',
  name: '',
  slug: '',
  sku: '',
  description: '',
  price: '',
  salePrice: '',
  stock: '0',
  images: '',
  categoryId: '',
  brandId: '',
  isActive: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [brands, setBrands] = useState<Brand[]>(fallbackBrands);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([apiFetch<Product[]>('/products'), apiFetch<Category[]>('/categories'), apiFetch<Brand[]>('/brands')])
      .then(([productData, categoryData, brandData]) => {
        setProducts(productData);
        setCategories(categoryData);
        setBrands(brandData);
      })
      .catch(() => setMessage('Đang dùng dữ liệu demo vì chưa kết nối được API.'));
  }, []);

  const editProduct = (product: Product) => {
    const category = typeof product.category === 'string' ? categories.find((item) => item.name === product.category) : product.category;
    const brand = typeof product.brand === 'string' ? brands.find((item) => item.name === product.brand) : product.brand;

    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description ?? '',
      price: String(product.price),
      salePrice: product.salePrice ? String(product.salePrice) : '',
      stock: String(product.stock),
      images: productImage(product),
      categoryId: product.categoryId ?? category?.id ?? categories[0]?.id ?? '',
      brandId: product.brandId ?? brand?.id ?? brands[0]?.id ?? '',
      isActive: product.isActive ?? true,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const category = categories.find((item) => item.id === form.categoryId) ?? categories[0];
    const brand = brands.find((item) => item.id === form.brandId) ?? brands[0];
    const payload = {
      name: form.name,
      slug: form.slug,
      sku: form.sku,
      description: form.description,
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      stock: Number(form.stock),
      images: [form.images],
      categoryId: category.id,
      brandId: brand.id,
      isActive: form.isActive,
    };

    try {
      const saved = await apiFetch<Product>(form.id ? `/products/${form.id}` : '/products', {
        method: form.id ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      setProducts((items) => (form.id ? items.map((item) => (item.id === form.id ? saved : item)) : [saved, ...items]));
      setMessage('Đã lưu sản phẩm.');
    } catch {
      const localProduct: Product = {
        id: form.id || `local-${Date.now()}`,
        ...payload,
        salePrice: payload.salePrice,
        sold: 0,
        category,
        brand,
      };
      setProducts((items) => (form.id ? items.map((item) => (item.id === form.id ? localProduct : item)) : [localProduct, ...items]));
      setMessage('Đã lưu sản phẩm ở chế độ demo.');
    }

    setForm(emptyForm);
  };

  const removeProduct = async (id: string) => {
    setProducts((items) => items.filter((item) => item.id !== id));
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      setMessage('Đã xóa sản phẩm.');
    } catch {
      setMessage('Đã xóa sản phẩm khỏi danh sách demo.');
    }
  };

  return (
    <AdminShell title="Quản lý sản phẩm" description="Thêm, sửa, xóa sản phẩm, ảnh, giá, khuyến mãi, tồn kho và danh mục.">
      <form onSubmit={handleSubmit} className="grid gap-[24px]">
        {/* Block: Thông tin cơ bản */}
        <div className="rounded-card border border-neutral-border bg-white p-[24px] space-y-[16px]">
          <h3 className="text-[18px] font-bold text-neutral-black mb-[8px]">Thông tin cơ bản</h3>
          <div className="grid gap-[16px] md:grid-cols-2">
            <div>
              <label className="block text-[14px] font-bold text-neutral-black mb-[4px]">Tên sản phẩm</label>
              <input value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} required className="input-form w-full" placeholder="Nhập tên sản phẩm" />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-neutral-black mb-[4px]">Đường dẫn (Slug)</label>
              <input value={form.slug} onChange={(event) => setForm((value) => ({ ...value, slug: event.target.value }))} required className="input-form w-full" placeholder="nhap-ten-san-pham" />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-neutral-black mb-[4px]">Mã SKU</label>
              <input value={form.sku} onChange={(event) => setForm((value) => ({ ...value, sku: event.target.value }))} required className="input-form w-full" placeholder="VD: BS-SHOE-001" />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-neutral-black mb-[4px]">URL Hình ảnh</label>
              <input value={form.images} onChange={(event) => setForm((value) => ({ ...value, images: event.target.value }))} required className="input-form w-full" placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="block text-[14px] font-bold text-neutral-black mb-[4px]">Mô tả chi tiết</label>
            <textarea value={form.description} onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))} className="input-form w-full min-h-[120px]" placeholder="Nhập mô tả sản phẩm..." />
          </div>
        </div>

        {/* Block: Phân loại & Tồn kho */}
        <div className="rounded-card border border-neutral-border bg-white p-[24px] space-y-[16px]">
          <h3 className="text-[18px] font-bold text-neutral-black mb-[8px]">Phân loại & Giá</h3>
          <div className="grid gap-[16px] md:grid-cols-2">
            <div>
              <label className="block text-[14px] font-bold text-neutral-black mb-[4px]">Giá gốc</label>
              <input value={form.price} onChange={(event) => setForm((value) => ({ ...value, price: event.target.value }))} required className="input-form w-full" placeholder="VNĐ" inputMode="numeric" />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-neutral-black mb-[4px]">Giá khuyến mãi</label>
              <input value={form.salePrice} onChange={(event) => setForm((value) => ({ ...value, salePrice: event.target.value }))} className="input-form w-full" placeholder="VNĐ (tùy chọn)" inputMode="numeric" />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-neutral-black mb-[4px]">Tồn kho</label>
              <input value={form.stock} onChange={(event) => setForm((value) => ({ ...value, stock: event.target.value }))} required className="input-form w-full" placeholder="Số lượng" inputMode="numeric" />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-neutral-black mb-[4px]">Trạng thái</label>
              <label className="flex h-[44px] items-center gap-[8px] text-[14px] font-bold text-neutral-black cursor-pointer">
                <input checked={form.isActive} onChange={(event) => setForm((value) => ({ ...value, isActive: event.target.checked }))} type="checkbox" className="w-[16px] h-[16px]" />
                Đang bán (Hiển thị)
              </label>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-neutral-black mb-[4px]">Danh mục</label>
              <select value={form.categoryId} onChange={(event) => setForm((value) => ({ ...value, categoryId: event.target.value }))} className="input-form w-full bg-white">
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-neutral-black mb-[4px]">Thương hiệu</label>
              <select value={form.brandId} onChange={(event) => setForm((value) => ({ ...value, brandId: event.target.value }))} className="input-form w-full bg-white">
                <option value="">Chọn thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-[12px] md:justify-end">
          <button type="button" onClick={() => setForm(emptyForm)} className="rounded-btn border border-neutral-black px-[16px] py-[10px] font-bold text-neutral-black hover:bg-neutral-offwhite transition-colors">Làm mới</button>
          <button className="btn-primary py-[10px] px-[24px]">{form.id ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</button>
        </div>
      </form>
      {message ? <p className="text-[14px] font-bold text-primary mt-[16px]">{message}</p> : null}
      <div className="overflow-x-auto rounded-card border border-neutral-light bg-white mt-[24px]">
        <table className="w-full min-w-[900px] text-left text-[14px]">
          <thead className="bg-neutral-offwhite text-[12px] uppercase text-neutral-medium tracking-wide">
            <tr>
              <th className="px-[16px] py-[12px] font-bold">Sản phẩm</th>
              <th className="px-[16px] py-[12px] font-bold">SKU</th>
              <th className="px-[16px] py-[12px] font-bold">Danh mục</th>
              <th className="px-[16px] py-[12px] font-bold">Giá</th>
              <th className="px-[16px] py-[12px] font-bold">Tồn kho</th>
              <th className="px-[16px] py-[12px] font-bold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-light">
            {products.map((product) => (
              <tr key={product.id} className="text-neutral-dark hover:bg-neutral-offwhite transition-colors">
                <td className="px-[16px] py-[16px]">
                  <div className="flex items-center gap-[12px]">
                    <img src={productImage(product)} alt={product.name} className="h-[48px] w-[48px] rounded-card object-cover bg-neutral-offwhite" />
                    <div>
                      <p className="font-bold text-neutral-black">{product.name}</p>
                      <p className="text-[12px] text-neutral-medium">{entityName(product.brand)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-[16px] py-[16px]">{product.sku}</td>
                <td className="px-[16px] py-[16px]">{entityName(product.category)}</td>
                <td className="px-[16px] py-[16px] font-bold text-neutral-black">{money(product.salePrice ?? product.price)}</td>
                <td className="px-[16px] py-[16px]">{product.stock}</td>
                <td className="px-[16px] py-[16px]">
                  <div className="flex gap-[8px]">
                    <button onClick={() => editProduct(product)} className="rounded-btn border border-neutral-light bg-white px-[12px] py-[6px] text-[12px] font-bold hover:border-primary hover:text-primary transition-colors">Sửa</button>
                    <button onClick={() => removeProduct(product.id)} className="rounded-btn border border-neutral-light bg-white px-[12px] py-[6px] text-[12px] font-bold text-alert-dark hover:border-alert-dark transition-colors">Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
