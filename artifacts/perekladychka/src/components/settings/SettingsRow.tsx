import type { ReactNode } from 'react';

export function SettingsRow(props: {
  icon: ReactNode;
  title: string;
  subtitle: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  last?: boolean;
}) {
  const { icon, title, subtitle, onClick, disabled, destructive, last } = props;

  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 p-4 active-elevate text-left touch-manipulation disabled:opacity-60 disabled:pointer-events-none ${last ? '' : 'border-b border-border'}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${destructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
        {icon}
      </div>
      <div className='flex-1 min-w-0'>
        <div className={`font-semibold ${destructive ? 'text-destructive' : ''}`}>{title}</div>
        <div className='text-sm text-muted-foreground mt-0.5'>{subtitle}</div>
      </div>
    </button>
  );
}
