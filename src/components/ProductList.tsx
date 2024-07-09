import { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import styled from '@emotion/styled';

import { useAppContext } from '../context/useAppContext';
import { ProductTable } from '../components/ProductTable';
import { RemoteProduct } from '../api/StoreApi';

export interface Product {
  id: number;
  title: string;
  image: string;
  price: string;
}

type ProductListProps = {
  reloadKey: string;
  openUpdatePriceDialogForProductId: (id: number) => void;
};

export const ProductList = (props: ProductListProps) => {
  const { reloadKey, openUpdatePriceDialogForProductId } = props;
  const [products, setProducts] = useState<Product[]>([]);

  const { storeApi } = useAppContext();

  useEffect(() => {
    async function fetchProducts() {
      console.debug('Reloading', reloadKey);
      const remoteProducts = await storeApi.getAll();
      const products = remoteProducts.map(buildProduct);
      setProducts(products);
    }

    fetchProducts();
  }, [reloadKey, storeApi]);

  return (
    <MainContainer maxWidth="xl" sx={{ flex: 1 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {'Product price updater'}
      </Typography>
      <ProductTable
        products={products}
        openUpdatePriceDialogForProductId={openUpdatePriceDialogForProductId}
      />
    </MainContainer>
  );
};

const MainContainer = styled(Container)`
  padding: 32px 0px;
  flex: 1;
`;

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
