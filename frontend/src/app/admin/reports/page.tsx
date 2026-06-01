import { AdminSection } from '@/components/admin-section';

export default function AdminReportsPage() {
  return (
    <AdminSection
      title="Bao cao"
      description="Khung bao cao doanh thu, san pham ban chay va hieu suat catalog."
      columns={['Chi so', 'Gia tri', 'So voi ky truoc']}
      rows={[
        ['Doanh thu', '$24,800', '+12%'],
        ['San pham ban chay', 'Air Zoom Runner', '+8%'],
        ['Ty le huy don', '2.1%', '-0.4%'],
      ]}
    />
  );
}

