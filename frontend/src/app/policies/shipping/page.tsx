export default function ShippingPolicyPage() {
  return (
    <section className="mx-auto max-w-3xl rounded-card border border-neutral-border bg-white p-[24px]">
      <p className="text-[12px] font-bold uppercase text-primary">Chính sách</p>
      <h1 className="mt-[8px] text-[32px] font-bold leading-[32px] text-neutral-black">Vận chuyển</h1>
      <div className="mt-[24px] grid gap-[16px] text-[16px] leading-[24px] text-neutral-dark">
        <p>Đơn hàng nội thành TP. Hồ Chí Minh thường được giao trong 1-2 ngày làm việc sau khi xác nhận.</p>
        <p>Đơn hàng tỉnh thành khác dự kiến giao trong 2-5 ngày làm việc tùy khu vực và đơn vị vận chuyển.</p>
        <p>Miễn phí vận chuyển cho đơn hàng từ 1,5 triệu đồng. Đơn dưới mức này áp dụng phí vận chuyển 30.000 đồng.</p>
        <p>Khách hàng có thể chọn COD hoặc chuyển khoản. Với đơn chuyển khoản, cửa hàng xử lý sau khi xác nhận thanh toán.</p>
      </div>
    </section>
  );
}
