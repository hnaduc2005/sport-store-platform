import { AdminSection } from '@/components/admin-section';

export default function AdminBrandsPage() {
  return (
    <AdminSection
      title="Quan ly thuong hieu"
      description="Quan ly brand, mo ta va logo cua nha san xuat."
      columns={['Ten', 'Slug', 'So san pham', 'Trang thai']}
      rows={[
        ['Nike', 'nike', '24', 'Hien thi'],
        ['Adidas', 'adidas', '19', 'Hien thi'],
      ]}
    />
  );
}

