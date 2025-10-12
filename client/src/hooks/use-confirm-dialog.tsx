import { create } from 'zustand';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: (() => void) | null;
  onCancel?: (() => void) | null;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

interface ConfirmDialogStore extends ConfirmDialogState {
  open: (config: Omit<ConfirmDialogState, 'isOpen'>) => void;
  close: () => void;
}

const useConfirmDialogStore = create<ConfirmDialogStore>((set) => ({
  isOpen: false,
  title: '',
  description: '',
  onConfirm: null,
  onCancel: null,
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'default',
  open: (config) => set({ isOpen: true, ...config }),
  close: () => set({ 
    isOpen: false, 
    onConfirm: null, 
    onCancel: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default'
  }),
}));

export const useConfirmDialog = () => {
  const store = useConfirmDialogStore();

  const confirm = (config: Omit<ConfirmDialogState, 'isOpen' | 'onConfirm'> & { 
    onConfirm: () => void | Promise<void> 
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      store.open({
        ...config,
        onConfirm: async () => {
          await config.onConfirm();
          store.close();
          resolve(true);
        },
        onCancel: () => {
          config.onCancel?.();
          store.close();
          resolve(false);
        }
      });
    });
  };

  return { confirm };
};

export const ConfirmDialogProvider = () => {
  const { isOpen, title, description, onConfirm, onCancel, confirmText, cancelText, variant } = useConfirmDialogStore();

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onCancel?.();
        useConfirmDialogStore.getState().close();
      }
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {
            onCancel?.();
            useConfirmDialogStore.getState().close();
          }}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm?.()}
            className={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
