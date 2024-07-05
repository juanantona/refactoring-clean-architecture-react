import { Container, Stack, Typography } from '@mui/material';

import { Footer } from '../components/Footer';
import { MainAppBar } from '../components/MainAppBar';
import styled from '@emotion/styled';
import { useEffect, useState, useCallback } from 'react';

import { type Notification, ToastNotification } from '../components/ToastNotification';
import { UpdatePriceDialog } from '../components/UpdatePriceDialog';
import { ProductList } from '../components/ProductList';
import { useReload } from '../hooks/useReload';
import { RemoteProduct } from '../api/StoreApi';
import { useAppContext } from '../context/useAppContext';

export const ProductsPage: React.FC = () => {
  const [reloadKey, reload] = useReload();

  const [products, setProducts] = useState<Product[]>([]);
  const [notification, setNotification] = useState<Notification>({ isError: false });
  const [editingProductId, setEditingProductId] = useState<number | undefined>(undefined);

  const { storeApi } = useAppContext();

  useEffect(() => {
    storeApi.getAll().then(response => {
      console.debug('Reloading', reloadKey);

      const remoteProducts = response as RemoteProduct[];

      const products = remoteProducts.map(buildProduct);

      setProducts(products);
    });
  }, [reloadKey, storeApi]);

  const openUpdatePriceDialogForProductId = useCallback((id: number) => {
    setEditingProductId(id);
  }, []);

  return (
    <Stack direction="column" sx={{ minHeight: '100vh', overflow: 'scroll' }}>
      <MainAppBar />

      <MainContainer maxWidth="xl" sx={{ flex: 1 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {'Product price updater'}
        </Typography>
        <ProductList
          products={products}
          openUpdatePriceDialogForProductId={openUpdatePriceDialogForProductId}
        />
      </MainContainer>
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
          onClose={() => setEditingProductId(undefined)}
        />
      )}
    </Stack>
  );
};

const MainContainer = styled(Container)`
  padding: 32px 0px;
  flex: 1;
`;

export interface Product {
  id: number;
  title: string;
  image: string;
  price: string;
}

function buildProduct(remoteProduct: RemoteProduct): Product {
  return {
    id: remoteProduct.id,
    title: remoteProduct.title,
    image: remoteProduct.image,
    price: remoteProduct.price.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }),
  };
}
