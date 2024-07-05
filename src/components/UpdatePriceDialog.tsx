import { Box, Stack, TextField, Typography } from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import styled from '@emotion/styled';
import { type Product } from '../pages/ProductsPage';
import { type RemoteProduct, StoreApi } from '../api/StoreApi';
import { useAppContext } from '../context/useAppContext';
import { type Notification } from '../components/ToastNotification';

interface ConfirmationDialogProps {
  editingProductId: number;
  onClose: () => void;
  reload: () => void;
  setNotification: (notification: Notification) => void;
  storeApi: StoreApi;
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

const priceRegex = /^\d+(\.\d{1,2})?$/;

const ProductImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: contain;
`;

export const UpdatePriceDialog: React.FC<ConfirmationDialogProps> = props => {
  const { editingProductId, onClose, setNotification, reload, storeApi } = props;
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [priceError, setPriceError] = useState<string | undefined>(undefined);

  const { currentUser } = useAppContext();

  const onError = useCallback(() => {
    setNotification({
      message: `Product with id ${editingProductId} not found`,
      isError: true,
    });
  }, [editingProductId, setNotification]);

  const onCancel = useCallback(() => {
    setEditingProduct(undefined);
    onClose();
  }, [onClose]);

  const onNonAdminUserError = useCallback(() => {
    setNotification({
      message: 'Only admin users can edit the price of a product',
      isError: true,
    });
  }, [setNotification]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const remoteProduct = await storeApi.get(editingProductId);
        const product = buildProduct(remoteProduct);
        setEditingProduct(product);
      } catch {
        onError();
      }
    };
    if (!currentUser.isAdmin) return onNonAdminUserError();
    if (editingProduct === undefined) fetchProduct();
  }, [editingProductId]);

  function onSuccess() {
    setNotification({
      message: `Price ${editingProduct?.price} for '${editingProduct?.title}' updated`,
      isError: false,
    });
    setEditingProduct(undefined);
    onClose();
    reload();
  }

  function onFailure() {
    setNotification({
      message: `An error has ocurred updating the price ${editingProduct?.price} for '${editingProduct?.title}'`,
      isError: true,
    });
    setEditingProduct(undefined);
    onClose();
    reload();
  }

  function handleChangePrice(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    if (!editingProduct) return;

    const isValidNumber = !isNaN(+event.target.value);
    setEditingProduct({ ...editingProduct, price: event.target.value });

    if (!isValidNumber) {
      setPriceError('Only numbers are allowed');
    } else {
      if (!priceRegex.test(event.target.value)) {
        setPriceError('Invalid price format');
      } else if (+event.target.value > 999.99) {
        setPriceError('The max possible price is 999.99');
      } else {
        setPriceError(undefined);
      }
    }
  }

  async function saveEditPrice(): Promise<void> {
    if (editingProduct) {
      const remoteProduct = await storeApi.get(editingProduct.id);

      if (!remoteProduct) return;

      const editedRemoteProduct = {
        ...remoteProduct,
        price: Number(editingProduct.price),
      };

      try {
        await storeApi.post(editedRemoteProduct);
        onSuccess();
      } catch (error) {
        onFailure();
      }
    }
  }

  return (
    <Dialog
      open={Boolean(editingProduct)}
      maxWidth="sm"
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{'Update price'}</DialogTitle>
      <DialogContent>
        <Stack direction="row">
          <Box width={250}>
            <ProductImage src={editingProduct?.image} />
          </Box>

          <Stack direction="column" justifyContent="space-evenly">
            <Typography variant="body1">{editingProduct?.title}</Typography>
            <TextField
              label={'Price'}
              value={editingProduct?.price || ''}
              onChange={handleChangePrice}
              error={priceError !== undefined}
              helperText={priceError}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={saveEditPrice}>Save</Button>
        <Button onClick={onCancel} autoFocus>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
