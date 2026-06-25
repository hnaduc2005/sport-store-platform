import { statusLabel } from '@/lib/format';

/* ============================================================
   NOTICE / ALERT BANNER
   ============================================================ */
type NoticeType = 'success' | 'error' | 'warning' | 'info';

const noticeStyles: Record<NoticeType, string> = {
  success: 'bg-success-light border-success/30 text-success-dark',
  error:   'bg-danger-light border-danger/30 text-danger-dark',
  warning: 'bg-warning-light border-warning/30 text-warning-dark',
  info:    'bg-info-light border-info/30 text-info-dark',
};

const noticeIcons: Record<NoticeType, React.ReactNode> = {
  success: <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  error:   <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  warning: <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
  info:    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
};

export function AdminNotice({ type, children }: { type: NoticeType; children: React.ReactNode }) {
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium animate-fade-in ${noticeStyles[type]}`}>
      {noticeIcons[type]}
      <span>{children}</span>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
   ============================================================ */
const statusMap: Record<string, string> = {
  active:     'badge-green',
  inactive:   'badge-gray',
  PENDING:    'badge-yellow',
  CONFIRMED:  'badge-blue',
  PROCESSING: 'badge-purple',
  SHIPPED:    'badge-blue',
  DELIVERED:  'badge-green',
  CANCELLED:  'badge-red',
  UNPAID:     'badge-yellow',
  PAID:       'badge-green',
  REFUNDED:   'badge-purple',
  CUSTOMER:   'badge-blue',
  ADMIN:      'badge-orange',
  VISIBLE:    'badge-green',
  HIDDEN:     'badge-gray',
  NEW:        'badge-orange',
  READ:       'badge-blue',
  RESOLVED:   'badge-green',
};

export function StatusBadge({ status, children }: { status: string; children?: React.ReactNode }) {
  const cls = statusMap[status] ?? 'badge-gray';
  return <span className={cls}>{children ?? statusLabel(status)}</span>;
}

/* ============================================================
   LOADING TABLE SKELETON
   ============================================================ */
export function LoadingTable({ columns = 5, rows = 8 }: { columns?: number; rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-brand-light bg-white">
      <div className="bg-brand-offwhite px-5 py-3 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="skeleton h-3 flex-1 rounded" />
        ))}
      </div>
      <div className="divide-y divide-brand-light">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 px-5 py-4">
            {Array.from({ length: columns }).map((_, c) => (
              <div key={c} className={`skeleton h-4 rounded ${c === 0 ? 'w-1/4' : 'flex-1'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingBlocks({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-5">
      <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-${count}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-xl" />
        ))}
      </div>
      <div className="skeleton h-72 rounded-xl" />
    </div>
  );
}

/* ============================================================
   EMPTY STATE
   ============================================================ */
export function EmptyState({
  title,
  description,
  icon = '📭',
  action,
}: {
  title: string;
  description?: string;
  icon?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-brand-light bg-white">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-brand-black">{title}</h3>
      {description && <p className="mt-2 text-sm text-brand-muted max-w-xs">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ============================================================
   TABLE ACTION BUTTONS
   ============================================================ */
type Tone = 'primary' | 'danger' | 'success' | 'warning' | 'ghost';

const toneStyles: Record<Tone, string> = {
  primary: 'border-brand-light text-brand-dark hover:border-accent hover:text-accent',
  danger:  'border-danger/30 text-danger-dark hover:bg-danger-light',
  success: 'border-success/30 text-success-dark hover:bg-success-light',
  warning: 'border-warning/30 text-warning-dark hover:bg-warning-light',
  ghost:   'border-transparent text-brand-muted hover:bg-brand-offwhite hover:text-brand-dark',
};

export function TableActionButton({
  onClick,
  tone = 'primary',
  children,
  disabled = false,
}: {
  onClick: () => void;
  tone?: Tone;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40 ${toneStyles[tone]}`}
    >
      {children}
    </button>
  );
}

/* ============================================================
   ADMIN MODAL
   ============================================================ */
export function AdminModal({
  title,
  description,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className={`relative w-full bg-white rounded-2xl shadow-modal flex flex-col max-h-[90vh] animate-scale-in ${
          wide ? 'max-w-4xl' : 'max-w-2xl'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-brand-light flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-brand-black">{title}</h2>
            {description && <p className="mt-1 text-sm text-brand-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-2 text-brand-muted hover:bg-brand-offwhite hover:text-brand-black transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STAT CARD (Dashboard)
   ============================================================ */
export function StatCard({
  title,
  value,
  sub,
  icon,
  color = 'orange',
  trend,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  color?: 'orange' | 'green' | 'blue' | 'purple';
  trend?: { value: string; up: boolean };
}) {
  const colors = {
    orange: 'bg-accent-bg border-accent/20 text-accent',
    green:  'bg-success-light border-success/20 text-success',
    blue:   'bg-info-light border-info/20 text-info',
    purple: 'bg-purple-100 border-purple-200 text-purple-600',
  };

  return (
    <div className="rounded-xl border border-brand-light bg-white p-5 flex items-start gap-4 hover:shadow-card transition-shadow">
      {icon && (
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border ${colors[color]}`}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide">{title}</p>
        <p className="mt-1 text-2xl font-black text-brand-black">{value}</p>
        {sub && <p className="text-xs text-brand-muted mt-0.5">{sub}</p>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold ${trend.up ? 'text-success' : 'text-danger'}`}>
          <svg className={`w-3.5 h-3.5 ${trend.up ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
          </svg>
          {trend.value}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ADMIN PAGE TOOLBAR (search + actions)
   ============================================================ */
export function AdminToolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-xl border border-brand-light bg-white p-4">
      {children}
    </div>
  );
}

/* ============================================================
   ADMIN TABLE WRAPPER
   ============================================================ */
export function AdminTable({ children, minWidth = 800 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-brand-light bg-white shadow-sm">
      <table className="admin-table" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

/* ============================================================
   MODAL FORM ROW
   ============================================================ */
export function ModalFormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/* ============================================================
   MODAL FORM ACTIONS
   ============================================================ */
export function ModalFormActions({
  onClose,
  saving,
  saveLabel = 'Lưu',
}: {
  onClose: () => void;
  saving?: boolean;
  saveLabel?: string;
}) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-brand-light mt-4">
      <button
        type="button"
        onClick={onClose}
        className="btn-outline px-5 py-2.5 font-semibold"
      >
        Hủy
      </button>
      <button
        disabled={saving}
        className="btn-dark px-5 py-2.5 font-semibold disabled:opacity-60"
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Đang lưu...
          </span>
        ) : saveLabel}
      </button>
    </div>
  );
}
