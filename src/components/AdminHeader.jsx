import { Link } from 'react-router-dom';

export default function AdminHeader({ eyebrow, title, subtitle, action, backTo, backLabel = '← Volver' }) {
  return (
    <div>
      {backTo && (
        <Link
          to={backTo}
          className="text-amber-light/70 hover:text-amber-light text-[13px] underline underline-offset-4"
        >
          {backLabel}
        </Link>
      )}
      <div className={`flex items-end justify-between flex-wrap gap-4 ${backTo ? 'mt-6' : ''}`}>
        <div>
          {eyebrow && (
            <span className="font-body text-[12px] tracking-[0.3em] uppercase text-amber">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-2 font-display font-black text-cream text-[36px] md:text-[44px] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 font-body text-amber-light/85 text-[14px]">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}

export function StatusBadge({ children, className = '' }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[11px] tracking-wide border ${className}`}
    >
      {children}
    </span>
  );
}

export function Card({ title, children, className = '', action }) {
  return (
    <div className={`p-6 rounded-xl border border-amber/15 bg-amber/5 ${className}`}>
      {title && (
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display font-bold text-cream text-[18px]">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function KpiCard({ label, value, hint }) {
  return (
    <div className="p-5 rounded-xl border border-amber/15 bg-amber/5">
      <p className="text-[10px] tracking-[0.2em] uppercase text-amber-light/65">{label}</p>
      <p className="mt-3 font-display font-black text-amber text-[28px] leading-none">{value}</p>
      {hint && <p className="mt-2 text-[11px] text-cream/55">{hint}</p>}
    </div>
  );
}

export function EmptyState({ titulo, descripcion, action }) {
  return (
    <div className="p-12 rounded-xl border border-amber/15 text-center">
      <p className="font-display text-cream text-[20px]">{titulo}</p>
      {descripcion && <p className="mt-2 text-amber-light/70 text-[14px]">{descripcion}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
