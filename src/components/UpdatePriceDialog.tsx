import { Box, Stack, TextField, Typography } from '@mui/material';
import { ChangeEvent, useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import styled from '@emotion/styled';
import { type Product } from '../pages/ProductsPage';

interface ConfirmationDialogProps {
  isOpen: boolean;
  editingProduct: Product | undefined;
  onSave?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  setEditingProduct: (product: Product | undefined) => void;
}

const priceRegex = /^\d+(\.\d{1,2})?$/;

const ProductImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: contain;
`;

export const UpdatePriceDialog: React.FC<ConfirmationDialogProps> = props => {
  const { isOpen, editingProduct, setEditingProduct, onSave } = props;
  const [priceError, setPriceError] = useState<string | undefined>(undefined);

  const cancelEditPrice = useCallback(() => {
    setEditingProduct(undefined);
  }, [setEditingProduct]);

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

  return (
    <Dialog
      open={isOpen}
      maxWidth="sm"
      onClose={cancelEditPrice}
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
        <Button onClick={onSave}>Save</Button>
        <Button onClick={cancelEditPrice} autoFocus>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};
