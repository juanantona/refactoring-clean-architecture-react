import { Box, Stack, TextField, Typography } from '@mui/material';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import styled from '@emotion/styled';
import { useAppContext } from '../context/useAppContext';
import { type Notification } from '../components/ToastNotification';
import { Product } from '../domain/product';

interface ConfirmationDialogProps {
  editingProductId: number;
  resetEditingProductId: () => void;
  reload: () => void;
  setNotification: (notification: Notification) => void;
}

const ProductImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: contain;
`;

export const UpdatePriceDialog: React.FC<ConfirmationDialogProps> = props => {
  const { editingProductId, resetEditingProductId, setNotification, reload } = props;
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [priceError, setPriceError] = useState<string | undefined>(undefined);

  const { currentUser, storeApi } = useAppContext();

  const onError = useCallback(() => {
    setNotification({
      message: `Product with id ${editingProductId} not found`,
      isError: true,
    });
  }, [editingProductId, setNotification]);

  const onCancel = useCallback(() => {
    setEditingProduct(undefined);
    resetEditingProductId();
  }, [resetEditingProductId]);

  const onNonAdminUserError = useCallback(() => {
    setNotification({
      message: 'Only admin users can edit the price of a product',
      isError: true,
    });
    resetEditingProductId();
  }, [resetEditingProductId, setNotification]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const remoteProduct = await storeApi.get(editingProductId);
        const product = Product.create(remoteProduct);
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
    resetEditingProductId();
    reload();
  }

  function onFailure() {
    setNotification({
      message: `An error has ocurred updating the price ${editingProduct?.price} for '${editingProduct?.title}'`,
      isError: true,
    });
    setEditingProduct(undefined);
    resetEditingProductId();
    reload();
  }

  function handleChangePrice(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    if (!editingProduct) return;

    try {
      editingProduct.updatePrice(event.target.value);
      setPriceError(undefined);
      setEditingProduct(editingProduct);
    } catch (error) {
      if (error instanceof Error) setPriceError(error.message);
    }
  }

  async function saveEditPrice(): Promise<void> {
    if (!editingProduct) return;

    const remoteProduct = await storeApi.get(editingProduct.id);
    if (!remoteProduct) return;

    try {
      await storeApi.post({ ...remoteProduct, price: Number(editingProduct.price) });
      onSuccess();
    } catch {
      onFailure();
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
