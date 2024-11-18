import { Container, Stack, Typography } from '@mui/material';
import { Footer } from '../components/Footer';
import { MainAppBar } from '../components/MainAppBar';
import styled from '@emotion/styled';
import { useCallback, useEffect, useState } from 'react';
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

  const [products, setProducts] = useState<Product[]>([]);
  const [notification, setNotification] = useState<Notification>();
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    async function fetchProducts() {
      const products = await storeApi.getAll();
      console.debug('Reloading', reloadKey);
      setProducts(products);
    }
    fetchProducts();
  }, [reloadKey, storeApi]);

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

      <MainContainer maxWidth="xl" sx={{ flex: 1 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {'Product price updater'}
        </Typography>
        <ProductsList products={products} updatingQuantity={updatingQuantity} />
      </MainContainer>
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

const MainContainer = styled(Container)`
  padding: 32px 0px;
  flex: 1;
`;
