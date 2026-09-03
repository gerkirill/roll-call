import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getPwaInstallInstructions } from '@/pwaInstall';

type PwaInstallDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PwaInstallDialog({ open, onOpenChange }: PwaInstallDialogProps) {
  const instructions = getPwaInstallInstructions();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader className='pr-6 text-left'>
          <DialogTitle>Як встановити додаток</DialogTitle>
          <DialogDescription>{instructions.intro}</DialogDescription>
        </DialogHeader>

        <ol className='flex list-decimal flex-col gap-3 pl-5 text-sm leading-relaxed text-foreground'>
          {instructions.steps.map(step => <li key={step}>{step}</li>)}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
