import { LoaderCircle } from 'lucide-react';
import { ChangelogReleaseCard } from '@/components/changelog/ChangelogReleaseCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ReleaseNotesState } from '@/pwaUpdate';

type ReleaseNotesDialogProps = {
  open: boolean;
  releaseNotes: ReleaseNotesState;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
};

export function ReleaseNotesDialog({
  open,
  releaseNotes,
  onOpenChange,
  onRetry,
}: ReleaseNotesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90dvh] max-w-2xl p-0'>
        <DialogHeader className='px-5 pt-5 pr-12 text-left'>
          <DialogTitle>Що нового</DialogTitle>
          <DialogDescription>
            Зміни, які з’являться після оновлення застосунку.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-4 px-5 pb-5'>
          {(releaseNotes.status === 'idle' || releaseNotes.status === 'loading') && (
            <div className='flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground' aria-live='polite'>
              <LoaderCircle className='h-5 w-5 animate-spin' />
              Завантаження опису…
            </div>
          )}

          {releaseNotes.status === 'ready' && releaseNotes.releases.map(release => (
            <ChangelogReleaseCard key={release.version} release={release} />
          ))}

          {releaseNotes.status === 'error' && (
            <div className='rounded-2xl border border-border bg-card p-4'>
              <p className='text-sm text-muted-foreground'>{releaseNotes.message}</p>
              <button
                type='button'
                onClick={onRetry}
                className='mt-4 h-10 rounded-xl bg-secondary px-4 text-sm font-semibold active-elevate'
              >
                Спробувати ще раз
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
