import React from 'react';
import { Alert, Snackbar } from '@mui/material';

export type Notification =
  | {
      message: string;
      type: 'error' | 'success';
    }
  | undefined;

type Props = {
  notification: Notification;
  resetNotification: () => void;
};

export const ToastNotification = (props: Props): React.ReactElement => {
  const { notification, resetNotification } = props;

  const isOpen = notification !== undefined;
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={isOpen}
      autoHideDuration={2000}
      onClose={() => resetNotification()}
    >
      <Alert severity={notification?.type}>{notification?.message}</Alert>
    </Snackbar>
  );
};
