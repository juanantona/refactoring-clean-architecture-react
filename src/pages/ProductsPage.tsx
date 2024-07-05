import { Container, Stack, Typography } from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridValueFormatterParams,
} from '@mui/x-data-grid';
import { Footer } from '../components/Footer';
import { MainAppBar } from '../components/MainAppBar';
import styled from '@emotion/styled';
import { useEffect, useMemo, useState, useCallback } from 'react';

import { type Notification, ToastNotification } from '../components/ToastNotification';
import { UpdatePriceDialog } from '../components/UpdatePriceDialog';
import { useReload } from '../hooks/useReload';
import { RemoteProduct, StoreApi } from '../api/StoreApi';

const baseColumn: Partial<GridColDef<Product>> = {
  disableColumnMenu: true,
  sortable: false,
};

const storeApi = new StoreApi();

export const ProductsPage: React.FC = () => {
  const [reloadKey, reload] = useReload();

  const [products, setProducts] = useState<Product[]>([]);
  const [notification, setNotification] = useState<Notification>({ isError: false });
  const [editingProductId, setEditingProductId] = useState<number | undefined>(undefined);

  useEffect(() => {
    storeApi.getAll().then(response => {
      console.debug('Reloading', reloadKey);

      const remoteProducts = response as RemoteProduct[];

      const products = remoteProducts.map(buildProduct);

      setProducts(products);
    });
  }, [reloadKey]);

  const openUpdatePriceDialogForProductId = useCallback((id: number) => {
    setEditingProductId(id);
  }, []);

  const columns: GridColDef<Product>[] = useMemo(
    () => [
      { ...baseColumn, field: 'id', headerName: 'ID', width: 70 },
      { ...baseColumn, field: 'title', headerName: 'Title', width: 600 },
      {
        ...baseColumn,
        field: 'image',
        headerName: 'Image',
        width: 300,
        headerAlign: 'center',
        align: 'center',
        renderCell: params => {
          return <ProductImage src={params.row.image} />;
        },
      },
      {
        ...baseColumn,
        field: 'price',
        headerName: 'Price',
        type: 'number',
        width: 180,
        headerAlign: 'center',
        align: 'center',
        valueFormatter: (params: GridValueFormatterParams<number>) => {
          if (params.value == null) {
            return '';
          }
          return `$${params.value}`;
        },
      },
      {
        ...baseColumn,
        field: 'status',
        headerName: 'Status',
        width: 120,
        headerAlign: 'center',
        align: 'center',
        renderCell: params => {
          const status = +params.row.price === 0 ? 'inactive' : 'active';

          return (
            <StatusContainer status={status}>
              <Typography variant="body1">{status}</Typography>
            </StatusContainer>
          );
        },
      },
      {
        ...baseColumn,

        field: 'actions',
        type: 'actions',
        width: 100,
        getActions: cell => [
          <GridActionsCellItem
            label="Update price"
            onClick={() => openUpdatePriceDialogForProductId(cell.row.id)}
            showInMenu
          />,
        ],
      },
    ],
    [openUpdatePriceDialogForProductId]
  );

  return (
    <Stack direction="column" sx={{ minHeight: '100vh', overflow: 'scroll' }}>
      <MainAppBar />

      <MainContainer maxWidth="xl" sx={{ flex: 1 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {'Product price updater'}
        </Typography>
        <DataGrid<Product>
          rowHeight={300}
          rows={products}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          columnBuffer={6}
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
          storeApi={storeApi}
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

const ProductImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: contain;
`;

type ProductStatus = 'active' | 'inactive';

export interface Product {
  id: number;
  title: string;
  image: string;
  price: string;
}

const StatusContainer = styled.div<{ status: ProductStatus }>`
  background: ${props => (props.status === 'inactive' ? 'red' : 'green')};
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  padding: 8px;
  border-radius: 20px;
  width: 100px;
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
