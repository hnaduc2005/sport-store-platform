import { AdminSection } from '@/components/admin-section';

export default function AdminProductsPage() {
  return (
    <AdminSection
      title="Quan ly san pham"
      description="Danh sach san pham, ton kho, gia ban va trang thai hien thi."
      columns={['Ten', 'SKU', 'Gia', 'Ton kho', 'Trang thai']}
      rows={[
        ['Air Zoom Runner', 'SHOE-NIKE-AZR', '$129', '42', 'Dang ban'],
        ['Training Hoodie Pro', 'APP-ADI-HOODIE-PRO', '$79', '60', 'Dang ban'],
      ]}
    />
  );
}

