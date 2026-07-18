import { RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';

import { applyPwaUpdate, usePwaUpdate } from '@/pwaUpdate';

export function PwaUpdatePrompt() {
  const [location] = useLocation();
  const { updateAvailable, isUpdating } = usePwaUpdate();

  if (!location.startsWith('/settings') || !updateAvailable) return null;

  return (
    <div className='fixed left-4 right-4 bottom-20 z-40 mx-auto max-w-md rounded-2xl border border-primary/30 bg-card p-4 shadow-xl'>
      <div className='flex items-start gap-3'>
        <div className='w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0'>
          <RefreshCw className={`w-5 h-5 ${isUpdating ? 'animate-spin' : ''}`} />
        </div>
        <div className='flex-1 min-w-0'>
          <div className='font-bold'>Доступна нова версія</div>
          <p className='text-sm text-muted-foreground mt-1'>Оновлення вже завантажене. Додаток перезапуститься після встановлення.</p>
          <button
            type='button'
            onClick={applyPwaUpdate}
            disabled={isUpdating}
            className='mt-3 w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold active-elevate touch-manipulation disabled:opacity-60 disabled:pointer-events-none'
          >
            {isUpdating ? 'Оновлення…' : 'Оновити й перезапустити'}
          </button>
        </div>
      </div>
    </div>
  );
}
