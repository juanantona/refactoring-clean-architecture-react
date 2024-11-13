import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProductsPage } from './ProductsPage';
import { AppProvider } from '../context/AppProvider';

const product = {
  id: 1,
  title: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',
  price: 109.95,
  description:
    'Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday',
  category: "men's clothing",
  image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
  rating: {
    rate: 3.9,
    count: 120,
  },
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
  const getProductsMock = jest.fn();
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: getProductsMock,
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('When load the page', () => {
    it('Should showcase the page title', async () => {
      getProductsMock.mockResolvedValue([]);

      await act(async () => render(<ProductsPage />, { wrapper: AppProvider }));

      expect(screen.getByText('Refactoring a Clean Architecture in React')).toBeInTheDocument();
    });
  });

  it('Should display the title and the price of the product', async () => {
    getProductsMock.mockResolvedValue([product]);

    await act(async () => render(<ProductsPage />, { wrapper: AppProvider }));

    expect(
      screen.getByText('Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops')
    ).toBeInTheDocument();
    expect(screen.getByText('$109.95')).toBeInTheDocument();
  });

  describe('When click on users button', () => {
    it('Should be able to change the user type', async () => {
      getProductsMock.mockResolvedValue([product]);
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
      getProductsMock.mockResolvedValue([product]);
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
      getProductsMock.mockResolvedValue([product]);
      const user = userEvent.setup();

      await act(async () => render(<ProductsPage />, { wrapper: AppProvider }));

      expect(screen.getByText('User: Admin user')).toBeInTheDocument();

      const actionsControl = screen.getByLabelText('more');
      await user.click(actionsControl);
      const updatePriceButton = screen.getByText('Update price');
      expect(updatePriceButton).toBeInTheDocument();
      await user.click(updatePriceButton);

      const priceInput = screen.getByDisplayValue(`${product.price}`);
      expect(priceInput).toBeInTheDocument();
    });
  });
});
