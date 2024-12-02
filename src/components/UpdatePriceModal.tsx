import { ChangeEvent, useState, useCallback } from 'react';
import { Box, Stack, TextField, Typography } from '@mui/material';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { ProductImage } from '../components/ProductImage';
import { type Product } from '../api/StoreApi';

type Props = {
  editingProduct: Product;
  setEditingProduct: (product: Product | undefined) => void;
  saveEditPrice: () => Promise<void>;
};

export const UpdatePriceModal = (props: Props): React.ReactElement => {
  const [priceError, setPriceError] = useState<string | undefined>(undefined);

  const { editingProduct, setEditingProduct, saveEditPrice } = props;

  const cancelEditPrice = useCallback(() => {
    setEditingProduct(undefined);
  }, [setEditingProduct]);

  function handleChangePrice(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    if (!editingProduct) return;

    const isValidNumber = !isNaN(+event.target.value);
    setEditingProduct({ ...editingProduct, price: event.target.value });

    const priceRegex = /^\d+(\.\d{1,2})?$/;

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
    <ConfirmationDialog
      isOpen={true}
      title={'Update price'}
      onSave={saveEditPrice}
      onCancel={cancelEditPrice}
      disableSave={Boolean(priceError)}
    >
      <Stack direction="row">
        <Box width={250}>
          <ProductImage src={editingProduct.image} />
        </Box>

        <Stack direction="column" justifyContent="space-evenly">
          <Typography variant="body1">{editingProduct.title}</Typography>
          <TextField
            label={'Price'}
            value={editingProduct.price}
            onChange={handleChangePrice}
            error={priceError !== undefined}
            helperText={priceError}
          />
        </Stack>
      </Stack>
    </ConfirmationDialog>
  );
};
