import { AdminSection } from '@/components/admin-section';

export default function AdminOrdersPage() {
  return (
    <AdminSection
      title="Quan ly don hang"
      description="Theo doi trang thai xu ly, thanh toan va giao hang."
      columns={['Ma don', 'Khach hang', 'Tong tien', 'Thanh toan', 'Trang thai']}
      rows={[
        ['SS-1001', 'Demo Customer', '$188', 'Chua thanh toan', 'Dang xu ly'],
        ['SS-1000', 'Demo Customer', '$109', 'Da thanh toan', 'Da giao'],
      ]}
    />
  );
}

