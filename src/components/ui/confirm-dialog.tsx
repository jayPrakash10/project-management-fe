import type { ReactNode } from 'react';
import { Button } from './button';
import { FormAlert } from './form-alert';
import { Modal } from './modal';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  /** Error from the last attempt, shown inside the dialog. */
  error?: string | null;
  tone?: 'danger' | 'primary';
}

/** Used before every destructive action. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  loading = false,
  error,
  tone = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onCancel}
      title={title}
      size="sm"
      alert
      footer={
        <>
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-base text-fg-muted">
        <div>{description}</div>
        {error && <FormAlert>{error}</FormAlert>}
      </div>
    </Modal>
  );
}
