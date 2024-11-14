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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../context/useAppContext';
import { useReload } from '../hooks/useReload';
import { type Product, StoreApi } from '../api/StoreApi';
import { type Notification, ToastNotification } from '../components/ToastNotification';
import { ProductImage } from '../components/ProductImage';
import { UpdatePriceModal } from '../components/UpdatePriceModal';

const baseColumn: Partial<GridColDef<Product>> = {
  disableColumnMenu: true,
  sortable: false,
};

const storeApi = new StoreApi();

export const ProductsPage: React.FC = () => {
  const { currentUser } = useAppContext();
  const [reloadKey, reload] = useReload();

  const [products, setProducts] = useState<Product[]>([]);
  const [notification, setNotification] = useState<Notification>();
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    storeApi.getAll().then(response => {
      console.debug('Reloading', reloadKey);

      const products = response as Product[];
      setProducts(products);
    });
  }, [reloadKey]);

  const updatingQuantity = useCallback(
    async (id: number) => {
      if (id) {
        if (!currentUser.isAdmin) {
          setNotification({
            message: 'Only admin users can edit the price of a product',
            type: 'error',
          });
          return;
        }

        storeApi
          .get(id)
          .then(product => {
            setEditingProduct(product);
          })
          .catch(() => {
            setNotification({
              message: `Product with id ${id} not found`,
              type: 'error',
            });
          });
      }
    },
    [currentUser]
  );

  async function saveEditPrice(): Promise<void> {
    if (editingProduct) {
      const product = await storeApi.get(editingProduct.id);
      if (!product) return;

      const editedRemoteProduct = { ...product, price: editingProduct.price };

      try {
        await storeApi.post(editedRemoteProduct);

        setNotification({
          message: `Price ${editingProduct.price} for '${editingProduct.title}' updated`,
          type: 'success',
        });
        setEditingProduct(undefined);
        reload();
      } catch (error) {
        setNotification({
          message: `An error has ocurred updating the price ${editingProduct.price} for '${editingProduct.title}'`,
          type: 'error',
        });
        setEditingProduct(undefined);
        reload();
      }
    }
  }

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
        renderCell: params => (
          <StatusContainer status={params.row.status}>
            <Typography variant="body1">{params.row.status}</Typography>
          </StatusContainer>
        ),
      },
      {
        ...baseColumn,

        field: 'actions',
        type: 'actions',
        width: 100,
        getActions: cell => [
          <GridActionsCellItem
            label="Update price"
            onClick={() => updatingQuantity(cell.row.id)} // openAddModal(cell.row)}
            showInMenu
          />,
        ],
      },
    ],
    [updatingQuantity]
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

const StatusContainer = styled.div<{ status: Product['status'] }>`
  background: ${props => (props.status === 'inactive' ? 'red' : 'green')};
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  padding: 8px;
  border-radius: 20px;
  width: 100px;
`;
