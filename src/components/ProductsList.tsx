import { Container, Typography } from '@mui/material';
import { useMemo } from 'react';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridValueFormatterParams,
} from '@mui/x-data-grid';
import styled from '@emotion/styled';
import { type Product } from '../api/StoreApi';
import { ProductImage } from '../components/ProductImage';

const baseColumn: Partial<GridColDef<Product>> = {
  disableColumnMenu: true,
  sortable: false,
};

type Props = {
  products: Product[];
  updatingQuantity: (productId: number) => void;
};

export const ProductsList = (props: Props): React.ReactElement | null => {
  const { products, updatingQuantity } = props;

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
