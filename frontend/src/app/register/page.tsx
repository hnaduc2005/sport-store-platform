'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { saveSession, type Session } from '@/lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [modal, setModal] = useState<'terms' | 'privacy' | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm(c => ({ ...c, [k]: v }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const session = await apiFetch<Session>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      saveSession(session);
      router.push('/profile');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể đăng ký. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-brand-offwhite">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-brand-light bg-white p-8 shadow-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-black font-black text-sm text-white">T3</div>
            <div>
              <p className="font-black text-brand-black leading-none">T3<span className="text-accent">Sport</span></p>
              <p className="text-xs text-brand-muted mt-0.5">Cửa hàng thể thao</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-brand-black">Tạo tài khoản</h1>
          <p className="text-sm text-brand-muted mt-1">Đăng ký để theo dõi đơn hàng và nhận ưu đãi.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="form-label" htmlFor="name">Họ và tên</label>
              <input
                id="name"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                className="input-form w-full mt-1.5"
                placeholder="Nguyễn Văn A"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="email">Email *</label>
              <input
                id="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                type="email"
                required
                className="input-form w-full mt-1.5"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="password">Mật khẩu *</label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="input-form w-full pr-10"
                  placeholder="Tối thiểu 6 ký tự"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-subtle hover:text-brand-dark transition-colors"
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-brand-subtle">Mật khẩu phải có ít nhất 6 ký tự.</p>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-brand-light accent-brand-black cursor-pointer flex-shrink-0"
              />
              <span className="text-sm text-brand-muted leading-snug">
                Tôi đồng ý với{' '}
                <button
                  type="button"
                  onClick={() => setModal('terms')}
                  className="font-semibold text-accent hover:underline"
                >
                  Điều khoản sử dụng
                </button>
                {' '}và{' '}
                <button
                  type="button"
                  onClick={() => setModal('privacy')}
                  className="font-semibold text-accent hover:underline"
                >
                  Chính sách bảo mật
                </button>
                {' '}của T3Sport
              </span>
            </label>

            {message && (
              <div className="rounded-lg bg-danger-light border border-danger/20 px-3 py-2.5 text-sm text-danger-dark">
                {message}
              </div>
            )}

            <button disabled={loading || !agreed} className="btn-dark w-full py-3.5 text-base font-bold mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang tạo tài khoản...
                </span>
              ) : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-muted">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-bold text-accent hover:text-accent-hover transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setModal(null)}
        >
          <div
            className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-brand-black">
                {modal === 'terms' ? 'Điều khoản sử dụng' : 'Chính sách bảo mật'}
              </h2>
              <button
                onClick={() => setModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-offwhite text-brand-muted hover:bg-brand-light transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal content */}
            <div className="text-sm text-brand-muted space-y-3 leading-relaxed">
              {modal === 'terms' ? (
                <>
                  <p><strong className="text-brand-black">1. Chấp nhận điều khoản</strong><br/>Khi sử dụng dịch vụ của T3Sport, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này.</p>
                  <p><strong className="text-brand-black">2. Tài khoản người dùng</strong><br/>Bạn có trách nhiệm bảo mật thông tin đăng nhập và chịu trách nhiệm cho mọi hoạt động xảy ra dưới tài khoản của mình.</p>
                  <p><strong className="text-brand-black">3. Sử dụng dịch vụ</strong><br/>Bạn cam kết sử dụng dịch vụ đúng mục đích, không thực hiện các hành vi gian lận, lừa đảo hoặc vi phạm pháp luật.</p>
                  <p><strong className="text-brand-black">4. Đặt hàng & thanh toán</strong><br/>Mọi đơn hàng đặt qua T3Sport đều được xác nhận qua email. Chúng tôi có quyền từ chối hoặc hủy đơn hàng trong trường hợp có dấu hiệu gian lận.</p>
                  <p><strong className="text-brand-black">5. Thay đổi điều khoản</strong><br/>T3Sport có quyền cập nhật điều khoản này bất kỳ lúc nào. Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc bạn chấp nhận các điều khoản mới.</p>
                </>
              ) : (
                <>
                  <p><strong className="text-brand-black">1. Thu thập thông tin</strong><br/>Chúng tôi thu thập họ tên, email và thông tin đơn hàng nhằm mục đích cung cấp và cải thiện dịch vụ cho bạn.</p>
                  <p><strong className="text-brand-black">2. Sử dụng thông tin</strong><br/>Thông tin của bạn được sử dụng để xử lý đơn hàng, gửi thông báo liên quan và hỗ trợ khách hàng. Chúng tôi không bán thông tin cá nhân cho bên thứ ba.</p>
                  <p><strong className="text-brand-black">3. Bảo mật dữ liệu</strong><br/>Dữ liệu của bạn được mã hóa và lưu trữ an toàn. Chúng tôi áp dụng các biện pháp kỹ thuật tiêu chuẩn để bảo vệ thông tin khỏi truy cập trái phép.</p>
                  <p><strong className="text-brand-black">4. Cookie</strong><br/>Chúng tôi sử dụng cookie để duy trì phiên đăng nhập và cải thiện trải nghiệm người dùng. Bạn có thể tắt cookie trong cài đặt trình duyệt.</p>
                  <p><strong className="text-brand-black">5. Quyền của bạn</strong><br/>Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân bằng cách liên hệ với chúng tôi qua trang Liên hệ.</p>
                </>
              )}
            </div>

            <button
              onClick={() => { setAgreed(true); setModal(null); }}
              className="mt-6 btn-dark w-full py-2.5 text-sm font-bold"
            >
              Tôi đã đọc và đồng ý
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
