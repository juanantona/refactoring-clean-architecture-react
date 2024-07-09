import { Stack } from '@mui/material';

import { Footer } from '../components/Footer';
import { MainAppBar } from '../components/MainAppBar';
import { useState, useCallback } from 'react';

import { type Notification, ToastNotification } from '../components/ToastNotification';
import { UpdatePriceDialog } from '../components/UpdatePriceDialog';
import { ProductList } from '../components/ProductList';
import { useReload } from '../hooks/useReload';

export const ProductsPage: React.FC = () => {
  const [reloadKey, reload] = useReload();

  const [notification, setNotification] = useState<Notification>({ isError: false });
  const [editingProductId, setEditingProductId] = useState<number | undefined>(undefined);

  const openUpdatePriceDialogForProductId = useCallback((id: number) => {
    setEditingProductId(id);
  }, []);

  return (
    <Stack direction="column" sx={{ minHeight: '100vh', overflow: 'scroll' }}>
      <MainAppBar />
      <ProductList
        reloadKey={reloadKey}
        openUpdatePriceDialogForProductId={openUpdatePriceDialogForProductId}
      />
      <Footer />

      <ToastNotification
        onClose={() => setNotification({ message: '', isError: false })}
        notification={notification}
      />

      {editingProductId && (
        <UpdatePriceDialog
          editingProductId={editingProductId}
          setNotification={setNotification}
          reload={reload}
          resetEditingProductId={() => setEditingProductId(undefined)}
        />
      )}
    </Stack>
  );
};
