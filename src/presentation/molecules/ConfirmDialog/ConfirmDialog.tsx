import { Modal } from '../Modal/Modal';
import { Button } from '@presentation/atoms';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
}: ConfirmDialogProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      width="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {cancelText}
          </Button>
          {/* <Button variant={variant} onClick={onConfirm}>
            {confirmText}
          </Button> */}
        </>
      }
    >
      <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
};