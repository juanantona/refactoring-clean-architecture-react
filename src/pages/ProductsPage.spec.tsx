import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProductsPage } from './ProductsPage';
import { AppProvider } from '../context/AppProvider';
import { type Product, StoreApi } from '../api/StoreApi';

const oneProduct = (productData?: { price?: string; status?: Product['status'] }): Product => {
  return {
    id: 1,
    title: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',
    price: productData?.price ?? '109.95',
    image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
    status: productData?.status ?? 'active',
  };
};

// Requisitos funcionales
//
// Mostrar los datos relativos a un producto: title, image, price, status
// Si clicko en el selector de usuario puedo cambiar el tipo de usuario
// Para usuarios NO administradores:
//  - Si trata de actualizar un precio aparece un mensaje de error
// Para usuarios administradores:
//  - Si trata de actualizar un precio aparece una ventana modal
//  - Si escribe un precio en el text box:
//    - Si intenta meter letras sale un mensaje de error
//    - Si intenta escribir un punto añadir cifras decmales sale un mensaje de error
//    - Si intenta escribir un número mayor de 999.99 sale un mensaje de error
//    - Si escribe un numero valido y click en salvar el precio del artículo se actuaiza
//  Existen dos estado para los productos en el interfaz:
//  - Si el precio es cero se muestra la etiqueta inactive en rojo
//  - Si el precio es mayor que cero se muestra la etiqueta active en verde

describe('Products Page', () => {
  const getAllProductsSpy = jest.spyOn(StoreApi.prototype, 'getAll');
  const getProductSpy = jest.spyOn(StoreApi.prototype, 'get');
  const postProductSpy = jest.spyOn(StoreApi.prototype, 'post');

  afterEach(() => {
    getAllProductsSpy.mockReset();
  });

  describe('When load the page', () => {
    it('Should showcase the page title', async () => {
      getAllProductsSpy.mockResolvedValue([]);

      await act(async () => render(<ProductsPage />, { wrapper: AppProvider }));

      expect(screen.getByText('Refactoring a Clean Architecture in React')).toBeInTheDocument();
    });
  });

  describe('When there is one product available ', () => {
    it('Should display the title and the price of the product', async () => {
      const product = oneProduct();
      getAllProductsSpy.mockResolvedValue([product]);

      await act(async () => render(<ProductsPage />, { wrapper: AppProvider }));

      expect(screen.getByText(product.title)).toBeInTheDocument();
      expect(screen.getByText(`$${product.price}`)).toBeInTheDocument();
    });
  });

  describe('When click on users button', () => {
    it('Should be able to change the user type', async () => {
      const product = oneProduct();
      getAllProductsSpy.mockResolvedValue([product]);
      const user = userEvent.setup();

      await act(async () => render(<ProductsPage />, { wrapper: AppProvider }));

      expect(screen.queryByText('User: Non admin user')).not.toBeInTheDocument();

      const userButton = screen.getByText('User:', { exact: false });
      await user.click(userButton);
      expect(screen.getByText('Non admin user')).toBeVisible();
      await user.click(screen.getByText('Non admin user'));

      expect(screen.getByText('User: Non admin user')).toBeInTheDocument();
    });
  });

  describe('When the user is a Non admin user', () => {
    it('Should display an error message if tries to update the product price', async () => {
      const product = oneProduct();
      getAllProductsSpy.mockResolvedValue([product]);
      const user = userEvent.setup();

      await act(async () => render(<ProductsPage />, { wrapper: AppProvider }));

      const userButton = screen.getByText('User:', { exact: false });
      await user.click(userButton);
      await user.click(screen.getByText('Non admin user'));

      const actionsControl = screen.getByLabelText('more');
      await user.click(actionsControl);
      const updatePriceButton = screen.getByText('Update price');
      expect(updatePriceButton).toBeInTheDocument();
      await user.click(updatePriceButton);

      expect(
        screen.getByText('Only admin users can edit the price of a product')
      ).toBeInTheDocument();
    });
  });

  describe('When the user is an Admin user', () => {
    it('Should display the update price modal if tries to update the product price', async () => {
      const product = oneProduct();
      getAllProductsSpy.mockResolvedValue([product]);
      getProductSpy.mockResolvedValue(product);

      const user = userEvent.setup();

      await act(async () => render(<ProductsPage />, { wrapper: AppProvider }));

      expect(screen.getByText('User: Admin user')).toBeInTheDocument();

      const actionsControl = screen.getByLabelText('more');
      await user.click(actionsControl);
      const updatePriceButton = screen.getByText('Update price');
      expect(updatePriceButton).toBeInTheDocument();
      await user.click(updatePriceButton);

      const priceInput = screen.queryByDisplayValue(product.price);
      expect(priceInput).toBeInTheDocument();
    });

    it('Should display an error message if tries to use letters in the price input', async () => {
      const product = oneProduct();
      getAllProductsSpy.mockResolvedValue([product]);
      getProductSpy.mockResolvedValue(product);
      const user = userEvent.setup();

      await act(async () => render(<ProductsPage />, { wrapper: AppProvider }));

      expect(screen.getByText('User: Admin user')).toBeInTheDocument();

      const actionsControl = screen.getByLabelText('more');
      await user.click(actionsControl);
      const updatePriceButton = screen.getByText('Update price');
      expect(updatePriceButton).toBeInTheDocument();
      await user.click(updatePriceButton);

      const priceInput = screen.getByDisplayValue(product.price);
      await user.clear(priceInput);
      await user.type(priceInput, 'kkk');

      expect(screen.getByText('Only numbers are allowed')).toBeInTheDocument();
    });

    it('Should display an error message if tries to type a point without decimal places', async () => {
      const product = oneProduct();
      getAllProductsSpy.mockResolvedValue([product]);
      getProductSpy.mockResolvedValue(product);
      const user = userEvent.setup();

      await act(async () => render(<ProductsPage />, { wrapper: AppProvider }));

      expect(screen.getByText('User: Admin user')).toBeInTheDocument();

      const actionsControl = screen.getByLabelText('more');
      await user.click(actionsControl);
      const updatePriceButton = screen.getByText('Update price');
      expect(updatePriceButton).toBeInTheDocument();
      await user.click(updatePriceButton);

      const priceInput = screen.getByDisplayValue(product.price);
      await user.clear(priceInput);
      await user.type(priceInput, '1.');

      expect(screen.getByText('Invalid price format')).toBeInTheDocument();
    });

    it('Should display an error message if tries to type a number bigger than 999.99', async () => {
      const product = oneProduct();
      getAllProductsSpy.mockResolvedValue([product]);
      getProductSpy.mockResolvedValue(product);
      const user = userEvent.setup();

      await act(async () => render(<ProductsPage />, { wrapper: AppProvider }));

      expect(screen.getByText('User: Admin user')).toBeInTheDocument();

      const actionsControl = screen.getByLabelText('more');
      await user.click(actionsControl);
      const updatePriceButton = screen.getByText('Update price');
      expect(updatePriceButton).toBeInTheDocument();
      await user.click(updatePriceButton);

      const priceInput = screen.getByDisplayValue(product.price);
      await user.clear(priceInput);
      await user.type(priceInput, '1000');

      expect(screen.getByText('The max possible price is 999.99')).toBeInTheDocument();
    });

    it('Should update the price if the input value is correct', async () => {
      const user = userEvent.setup();
      const product = oneProduct();
      const newPrice = '123';
      const updatedProduct = oneProduct({ price: `${newPrice}.00` });
      getAllProductsSpy.mockResolvedValueOnce([product]).mockResolvedValueOnce([updatedProduct]);
      getProductSpy.mockResolvedValue(product);
      postProductSpy.mockImplementationOnce(() => Promise.resolve());

      await act(async () => {
        render(<ProductsPage />, { wrapper: AppProvider });
      });

      expect(screen.getByText('User: Admin user')).toBeInTheDocument();

      const actionsControl = screen.getByLabelText('more');
      await user.click(actionsControl);
      const updatePriceButton = screen.getByText('Update price');
      expect(updatePriceButton).toBeInTheDocument();
      await user.click(updatePriceButton);

      const priceInput = screen.getByDisplayValue(product.price);
      await user.clear(priceInput);
      await user.type(priceInput, newPrice);
      await user.click(screen.getByText('Save'));

      expect(
        screen.getByText(`Price ${newPrice} for '${updatedProduct.title}' updated`)
      ).toBeInTheDocument();

      await waitFor(() => screen.getByText('$123.00'));
      expect(screen.queryByText(`$${product.price}`)).not.toBeInTheDocument();
    });

    it('Should update the status tag to inactive if the updated price is 0', async () => {
      const user = userEvent.setup();
      const product = oneProduct();
      const newPrice = '0';
      const updatedProduct = oneProduct({ price: `${newPrice}.00`, status: 'inactive' });
      getAllProductsSpy.mockResolvedValueOnce([product]).mockResolvedValueOnce([updatedProduct]);
      getProductSpy.mockResolvedValue(product);
      postProductSpy.mockImplementationOnce(() => Promise.resolve());

      await act(async () => {
        render(<ProductsPage />, { wrapper: AppProvider });
      });

      expect(screen.getByText('User: Admin user')).toBeInTheDocument();

      const actionsControl = screen.getByLabelText('more');
      await user.click(actionsControl);
      const updatePriceButton = screen.getByText('Update price');
      expect(updatePriceButton).toBeInTheDocument();
      await user.click(updatePriceButton);

      const priceInput = screen.getByDisplayValue(product.price);
      await user.clear(priceInput);
      await user.type(priceInput, newPrice);
      await user.click(screen.getByText('Save'));

      expect(
        screen.getByText(`Price ${newPrice} for '${updatedProduct.title}' updated`)
      ).toBeInTheDocument();

      await waitFor(() => screen.getByText('inactive'));
      expect(screen.queryByText('active')).not.toBeInTheDocument();
    }, 100000);
  });
});
