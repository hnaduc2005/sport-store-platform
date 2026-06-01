import { AdminSection } from '@/components/admin-section';

export default function AdminCategoriesPage() {
  return (
    <AdminSection
      title="Quan ly danh muc"
      description="To chuc danh muc cha con cho catalog san pham."
      columns={['Ten', 'Slug', 'So san pham', 'Trang thai']}
      rows={[
        ['Running', 'running', '12', 'Hien thi'],
        ['Training', 'training', '18', 'Hien thi'],
      ]}
    />
  );
}

