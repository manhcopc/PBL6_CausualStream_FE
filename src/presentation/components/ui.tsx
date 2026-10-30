import type { ReactNode } from 'react';
import { Activity, Home } from 'lucide-react';
import type { Decision } from '@/domain/entities/analysis';

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="page-shell">{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        {eyebrow ? (
          <div className="breadcrumb">
            <Home size={17} />
            <span>{eyebrow}</span>
          </div>
        ) : null}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action ? <div className="page-actions">{action}</div> : null}
    </div>
  );
}

export function Card({
  children,
  className = '',
  tone = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'default' | 'accent' | 'mint';
}) {
  return <section className={`card ${tone} ${className}`}>{children}</section>;
}

export function CardTitle({ icon: Icon, title, action }: { icon?: typeof Activity; title: string; action?: React.ReactNode }) {
  return (
    <div className="card-title">
      <div>
        {Icon ? <Icon size={22} /> : null}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  icon: Icon,
  onClick,
  type = 'button',
  disabled,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: typeof Activity;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button className={`btn ${variant}`} onClick={onClick} type={type} disabled={disabled}>
      {Icon ? <Icon size={18} /> : null}
      {children}
    </button>
  );
}

export function StatusBadge({ decision }: { decision: Decision }) {
  return <span className={`decision-badge ${decision.toLowerCase()}`}>{decision}</span>;
}

export function Pill({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' | 'red' | 'gray' }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  meta,
  tone = 'blue',
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  meta?: string;
  tone?: 'blue' | 'green' | 'amber' | 'purple' | 'red';
}) {
  return (
    <Card className="stat-card">
      <div className={`icon-disc ${tone}`}>
        <Icon size={28} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {meta ? <small>{meta}</small> : null}
      </div>
    </Card>
  );
}

export function ChartCard({ title, icon: Icon, children }: { title: string; icon: typeof Activity; children: React.ReactNode }) {
  return (
    <Card className="chart-card">
      <CardTitle icon={Icon} title={title} />
      {children}
    </Card>
  );
}

export function InfoRows({ rows }: { rows: [string, string][] }) {
  return (
    <div className="info-rows">
      {rows.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}
