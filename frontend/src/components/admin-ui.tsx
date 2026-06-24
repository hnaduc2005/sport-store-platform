import { ReactNode } from 'react';
import { statusLabel } from '@/lib/format';

type NoticeType = 'success' | 'error' | 'info';

const noticeClasses: Record<NoticeType, string> = {
  success: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]',
  error: 'border-[#fecaca] bg-[#fef2f2] text-[#991b1b]',
  info: 'border-[#bfdbfe] bg-[#eff6ff] text-[#1e40af]',
};

const statusClasses: Record<string, string> = {
  PENDING: 'border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]',
  CONFIRMED: 'border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]',
  PROCESSING: 'border-[#ddd6fe] bg-[#f5f3ff] text-[#6d28d9]',
  SHIPPED: 'border-[#99f6e4] bg-[#f0fdfa] text-[#0f766e]',
  DELIVERED: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]',
  CANCELLED: 'border-[#fecaca] bg-[#fef2f2] text-[#991b1b]',
  UNPAID: 'border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]',
  PAID: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]',
  REFUNDED: 'border-[#e9d5ff] bg-[#faf5ff] text-[#7e22ce]',
  NEW: 'border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]',
  READ: 'border-[#e5e7eb] bg-[#f9fafb] text-[#374151]',
  RESOLVED: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]',
  ADMIN: 'border-[#ddd6fe] bg-[#f5f3ff] text-[#6d28d9]',
  CUSTOMER: 'border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]',
  active: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]',
  inactive: 'border-[#e5e7eb] bg-[#f9fafb] text-[#374151]',
  low: 'border-[#fed7aa] bg-[#fff7ed] text-[#9a3412]',
  danger: 'border-[#fecaca] bg-[#fef2f2] text-[#991b1b]',
};

export function AdminNotice({ type = 'info', children }: { type?: NoticeType; children: ReactNode }) {
  return <div className={`rounded-card border px-[16px] py-[12px] text-[14px] font-bold ${noticeClasses[type]}`}>{children}</div>;
}

export function StatusBadge({ status, children }: { status: string; children?: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-[10px] py-[4px] text-[12px] font-bold ${statusClasses[status] ?? statusClasses.READ}`}>
      {children ?? statusLabel(status)}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-card border border-dashed border-neutral-light bg-white p-[32px] text-center">
      <p className="text-[16px] font-bold text-neutral-black">{title}</p>
      {description ? <p className="mt-[8px] text-[14px] text-neutral-medium">{description}</p> : null}
    </div>
  );
}

export function LoadingBlocks({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-[16px]">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-[92px] animate-pulse rounded-card bg-neutral-offwhite" />
      ))}
    </div>
  );
}

export function LoadingTable({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-card border border-neutral-light bg-white">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-[12px] border-b border-neutral-light p-[16px] last:border-b-0" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <div key={columnIndex} className="h-[18px] animate-pulse rounded-full bg-neutral-offwhite" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function AdminModal({ title, description, children, onClose }: { title: string; description?: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-[12px] py-[24px]">
      <div className="w-full max-w-4xl rounded-card border border-neutral-border bg-white shadow-modal">
        <div className="flex items-start justify-between gap-[16px] border-b border-neutral-light p-[20px]">
          <div>
            <h2 className="text-[24px] font-bold leading-[28.8px] text-neutral-black">{title}</h2>
            {description ? <p className="mt-[4px] text-[14px] text-neutral-medium">{description}</p> : null}
          </div>
          <button onClick={onClose} className="rounded-btn border border-neutral-light px-[12px] py-[8px] text-[14px] font-bold text-neutral-black hover:border-primary hover:text-primary">
            Đóng
          </button>
        </div>
        <div className="p-[20px]">{children}</div>
      </div>
    </div>
  );
}

export function TableActionButton({ children, tone = 'neutral', onClick }: { children: ReactNode; tone?: 'neutral' | 'danger' | 'primary'; onClick: () => void }) {
  const classes = {
    neutral: 'border-neutral-light text-neutral-black hover:border-primary hover:text-primary',
    danger: 'border-neutral-light text-alert-dark hover:border-alert-dark',
    primary: 'border-primary text-primary hover:bg-primary hover:text-white',
  }[tone];

  return (
    <button onClick={onClick} className={`rounded-btn border bg-white px-[12px] py-[7px] text-[12px] font-bold transition-colors ${classes}`}>
      {children}
    </button>
  );
}
