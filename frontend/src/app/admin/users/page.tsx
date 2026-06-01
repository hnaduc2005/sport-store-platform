import { AdminSection } from '@/components/admin-section';

export default function AdminUsersPage() {
  return (
    <AdminSection
      title="Quan ly nguoi dung"
      description="Danh sach khach hang va tai khoan quan tri."
      columns={['Ten', 'Email', 'Vai tro', 'Ngay tao']}
      rows={[
        ['Demo Customer', 'customer@sportstore.dev', 'CUSTOMER', '2026-06-01'],
        ['Demo Admin', 'admin@sportstore.dev', 'ADMIN', '2026-06-01'],
      ]}
    />
  );
}

