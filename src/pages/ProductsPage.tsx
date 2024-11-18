import { Stack } from '@mui/material';
import { Footer } from '../components/Footer';
import { MainAppBar } from '../components/MainAppBar';

import { useCallback, useState } from 'react';
import { useAppContext } from '../context/useAppContext';
import { useReload } from '../hooks/useReload';
import { type Product, StoreApi } from '../api/StoreApi';
import { type Notification, ToastNotification } from '../components/ToastNotification';

import { UpdatePriceModal } from '../components/UpdatePriceModal';
import { ProductsList } from '../components/ProductsList';

type ProductsPageProps = {
  storeApi: StoreApi;
};

export const ProductsPage: React.FC<ProductsPageProps> = ({ storeApi }: { storeApi: StoreApi }) => {
  const { currentUser } = useAppContext();
  const [reloadKey, reload] = useReload();

  const [notification, setNotification] = useState<Notification>();
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  const displayError = (message: string) => {
    setNotification({ message, type: 'error' });
  };

  const displaySucess = (message: string) => {
    setNotification({ message, type: 'success' });
  };

  const updatingQuantity = useCallback(
    async (id: number) => {
      if (!id) return;
      if (currentUser.isAdmin) {
        try {
          const product = await storeApi.get(id);
          setEditingProduct(product);
        } catch (error) {
          displayError(`Product with id ${id} not found`);
        }
      } else {
        displayError('Only admin users can edit the price of a product');
      }
    },
    [currentUser, storeApi]
  );

  async function saveEditPrice(): Promise<void> {
    if (editingProduct) {
      const product = await storeApi.get(editingProduct.id);
      if (!product) return;

      const editedRemoteProduct = { ...product, price: editingProduct.price };

      try {
        await storeApi.post(editedRemoteProduct);
        displaySucess(`Price ${editingProduct.price} for '${editingProduct.title}' updated`);
      } catch (error) {
        displayError(
          `An error has ocurred updating the price ${editingProduct.price} for '${editingProduct.title}'`
        );
      } finally {
        setEditingProduct(undefined);
        reload();
      }
    }
  }

  return (
    <Stack direction="column" sx={{ minHeight: '100vh', overflow: 'scroll' }}>
      <MainAppBar />
      <ProductsList storeApi={storeApi} updatingQuantity={updatingQuantity} reloadKey={reloadKey} />
      <Footer />

      <ToastNotification
        notification={notification}
        resetNotification={() => setNotification(undefined)}
      />

      {editingProduct && (
        <UpdatePriceModal
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          saveEditPrice={saveEditPrice}
        />
      )}
    </Stack>
  );
};
