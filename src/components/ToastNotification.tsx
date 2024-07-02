import { Alert, Snackbar } from '@mui/material';

export type Notification = {
  message?: string;
  isError: boolean;
};

type ToastNotificationProps = {
  onClose?: () => void;
  notification: Notification;
};

export const ToastNotification = (props: ToastNotificationProps) => {
  const { notification, onClose } = props;
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={Boolean(notification.message)}
      autoHideDuration={2000}
      onClose={onClose}
    >
      <Alert severity={notification.isError ? 'error' : 'success'}>{notification.message}</Alert>
    </Snackbar>
  );
};
