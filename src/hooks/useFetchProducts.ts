import { useEffect, useState } from 'react';
import { Product, StoreApi } from '../api/StoreApi';

export const useFetchProducts = (storeApi: StoreApi, reloadKey: string) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const products = await storeApi.getAll();
      console.debug('Reloading', reloadKey);
      setProducts(products);
    }
    fetchProducts();
  }, [reloadKey, storeApi]);

  return products;
};
