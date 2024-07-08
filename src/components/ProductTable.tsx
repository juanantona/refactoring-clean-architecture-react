import { useMemo } from 'react';
import { Typography } from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridValueFormatterParams,
} from '@mui/x-data-grid';
import styled from '@emotion/styled';
import { type Product } from '../pages/ProductsPage';

type Props = {
  products: Product[];
  openUpdatePriceDialogForProductId: (id: number) => vooid;
};

type ProductStatus = 'active' | 'inactive';

const baseColumn: Partial<GridColDef<Product>> = {
  disableColumnMenu: true,
  sortable: false,
};

export const ProductTable: React.FC<Props> = props => {
  const { products, openUpdatePriceDialogForProductId } = props;

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
  );
};

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

const ProductImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: contain;
`;
