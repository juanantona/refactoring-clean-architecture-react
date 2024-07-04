import { Box, Stack, TextField, Typography } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import styled from '@emotion/styled';
import { type Product } from '../pages/ProductsPage';
import { StoreApi } from '../api/StoreApi';

interface ConfirmationDialogProps {
  editingProduct: Product | undefined;
  onSuccess: () => void;
  onFailure: () => void;
  onCancel: () => void;
  storeApi: StoreApi;
  onPriceChange: (price: string) => void;
}

const priceRegex = /^\d+(\.\d{1,2})?$/;

const ProductImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: contain;
`;

export const UpdatePriceDialog: React.FC<ConfirmationDialogProps> = props => {
  const { editingProduct, storeApi, onSuccess, onFailure, onCancel, onPriceChange } = props;
  const [priceError, setPriceError] = useState<string | undefined>(undefined);

  function handleChangePrice(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    if (!editingProduct) return;

    const isValidNumber = !isNaN(+event.target.value);
    onPriceChange(event.target.value);

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
              value={editingProduct?.price}
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
