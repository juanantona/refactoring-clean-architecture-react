import { Alert, Snackbar } from '@mui/material';

type ToastNotificationProps = {
  message: string;
  onClose?: () => void;
  severity: 'success' | 'error';
};

export const ToastNotification = (props: ToastNotificationProps) => {
  const { message, onClose, severity } = props;
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={Boolean(message)}
      autoHideDuration={2000}
      onClose={onClose}
    >
      <Alert severity={severity}>{message}</Alert>
    </Snackbar>
  );
};
