import { Activity } from 'lucide-react';
import { Card } from './ui';

export function SettingCard({ title, icon: Icon }: { title: string; icon: typeof Activity }) {
  return (
    <Card className="setting-mini">
      <Icon size={28} />
      <strong>{title}</strong>
      <Toggle checked />
    </Card>
  );
}



export function SettingField({ icon: Icon, title, desc, control }: { icon: typeof Activity; title: string; desc: string; control: React.ReactNode }) {
  return (
    <div className="setting-field">
      <Icon size={28} />
      <div>
        <strong>{title}</strong>
        <span>{desc}</span>
        {control}
      </div>
    </div>
  );
}

export function Toggle({ checked = false }: { checked?: boolean }) {
  return <span className={`toggle ${checked ? 'checked' : ''}`}><i /></span>;
}

export function ToggleRow({ label }: { label: string }) {
  return <div className="toggle-row"><span>{label}</span><Toggle checked /></div>;
}

export function CheckRow({ label, checked = false }: { label: string; checked?: boolean }) {
  return <label className="check-row"><input type="checkbox" defaultChecked={checked} /> {label}</label>;
}
