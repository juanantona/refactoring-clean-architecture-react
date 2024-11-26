import '@testing-library/jest-dom';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';

import { ProductsPage } from './ProductsPage';
import { AppProvider } from '../context/AppProvider';
import { type Product } from '../api/StoreApi';

const oneProduct = (productData?: {
  id?: number;
  price?: string;
  status?: Product['status'];
}): Product => {
  return {
    id: productData?.id ?? 1,
    title: `Product: ${productData?.id ?? 1}`,
    price: productData?.price ?? '100.00',
    image: 'https://api.com/img/1.jpg',
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

const wrappedRender = (component: React.ReactElement) => {
  return render(component, { wrapper: AppProvider });
};

describe('Products Page', () => {
  const getProductsMock = jest.fn();
  const fetchMock = jest.fn(() =>
    Promise.resolve({
      json: getProductsMock,
    })
  );

  beforeEach(() => {
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('When load the page', () => {
    it('Should showcase the page title', async () => {
      getProductsMock.mockResolvedValue([]);

      wrappedRender(<ProductsPage />);

      expect(screen.getByText('Refactoring a Clean Architecture in React')).toBeInTheDocument();
      await act(async () => {
        await getProductsMock();
      });
    });
  });

  describe('When there is no available products', () => {
    it('Should display just the header of the table with the proper column names', async () => {
      getProductsMock.mockResolvedValue([]);

      wrappedRender(<ProductsPage />);

      await waitForTableHeaderLoaded();
      const [header] = screen.getAllByRole('row');
      verifyTableHeader(header);
    });

    it('Should display an amount of products equal to 0', async () => {
      getProductsMock.mockResolvedValue([]);

      wrappedRender(<ProductsPage />);

      await waitForTableHeaderLoaded();
      expect(screen.getByText('0–0 of 0')).toBeInTheDocument();
    });
  });

  describe('When there are products available ', () => {
    it('Should display each row with the proper data', async () => {
      const productOne = oneProduct({ id: 1 });
      const productTwo = oneProduct({ id: 2 });
      getProductsMock.mockResolvedValue([productOne, productTwo]);

      wrappedRender(<ProductsPage />);

      await waitForTableRowsLoaded();
      const [header, ...rows] = screen.getAllByRole('row');
      verifyTableHeader(header);
      expect(rows).toHaveLength(2);
      verifyProductTableRow(productOne, rows[0]);
      verifyProductTableRow(productTwo, rows[1]);
    });

    it('Should display the amount of products', async () => {
      const productOne = oneProduct({ id: 1 });
      const productTwo = oneProduct({ id: 2 });
      getProductsMock.mockResolvedValue([productOne, productTwo]);

      wrappedRender(<ProductsPage />);

      await waitForTableRowsLoaded();
      expect(screen.getByText('1–2 of 2')).toBeInTheDocument();
    });
  });

  describe('When click on users button', () => {
    it('Should be able to change the user type', async () => {
      const product = oneProduct();
      getProductsMock.mockResolvedValue([product]);
      const user = userEvent.setup();

      wrappedRender(<ProductsPage />);

      expect(screen.queryByText('User: Non admin user')).not.toBeInTheDocument();
      await setNonAdminUser(user);
      expect(screen.getByText('User: Non admin user')).toBeInTheDocument();
    });
  });

  describe('When the user is a Non admin user', () => {
    it('Should display an error message if tries to update the product price', async () => {
      const product = oneProduct();
      getProductsMock.mockResolvedValue([product]);
      const user = userEvent.setup();

      wrappedRender(<ProductsPage />);

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
      getProductsMock.mockResolvedValue([product]);
      const user = userEvent.setup();

      wrappedRender(<ProductsPage />);

      expect(screen.getByText('User: Admin user')).toBeInTheDocument();

      await waitForTableRowsLoaded();
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
      getProductsMock.mockResolvedValue([product]);
      const user = userEvent.setup();

      wrappedRender(<ProductsPage />);

      expect(screen.getByText('User: Admin user')).toBeInTheDocument();

      await waitForTableRowsLoaded();
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
      getProductsMock.mockResolvedValue([product]);
      const user = userEvent.setup();

      wrappedRender(<ProductsPage />);

      expect(screen.getByText('User: Admin user')).toBeInTheDocument();

      await waitForTableRowsLoaded();
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
      getProductsMock.mockResolvedValue([product]);
      const user = userEvent.setup();

      wrappedRender(<ProductsPage />);

      expect(screen.getByText('User: Admin user')).toBeInTheDocument();

      await waitForTableRowsLoaded();
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
      getProductsMock.mockResolvedValue([product]);
      const newPrice = '123';

      wrappedRender(<ProductsPage />);

      expect(screen.getByText('User: Admin user')).toBeInTheDocument();

      await waitForTableRowsLoaded();
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
        screen.getByText(`Price ${newPrice} for '${product.title}' updated`)
      ).toBeInTheDocument();

      await waitFor(() => screen.getByText(`$${newPrice}.00`));
      expect(screen.queryByText(`$${product.price}`)).not.toBeInTheDocument();
    });

    it('Should update the status tag to inactive if the updated price is 0', async () => {
      const user = userEvent.setup();
      const product = oneProduct();
      getProductsMock.mockResolvedValue([product]);
      const newPrice = '0';

      wrappedRender(<ProductsPage />);

      expect(screen.getByText('User: Admin user')).toBeInTheDocument();

      await waitForTableRowsLoaded();
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
        screen.getByText(`Price ${newPrice} for '${product.title}' updated`)
      ).toBeInTheDocument();

      await waitFor(() => screen.getByText('inactive'));
      expect(screen.queryByText('active')).not.toBeInTheDocument();
    });
  });
});

async function setNonAdminUser(user: UserEvent) {
  const userButton = screen.getByText('User:', { exact: false });
  await user.click(userButton);
  expect(screen.getByText('Non admin user')).toBeVisible();
  await user.click(screen.getByText('Non admin user'));
}

async function waitForTableRowsLoaded() {
  await waitFor(async () => {
    expect((await screen.findAllByRole('row')).length).toBeGreaterThan(1);
  });
}

async function waitForTableHeaderLoaded() {
  await waitFor(async () => {
    expect(await screen.findAllByRole('row')).toHaveLength(1);
  });
}

function verifyProductTableRow(product: Product, row: HTMLElement) {
  const productOneCells = within(row).getAllByRole('cell');
  within(productOneCells[0]).getByText(product.id);
  within(productOneCells[1]).getByText(product.title);
  within(productOneCells[2]).getByRole('img');
  within(productOneCells[3]).getByText(`$${product.price}`);
  within(productOneCells[4]).getByText(product.status);
}

function verifyTableHeader(header: HTMLElement) {
  const cells = within(header).getAllByRole('columnheader');
  expect(cells).toHaveLength(6);
  within(cells[0]).getByText('ID');
  within(cells[1]).getByText('Title');
  within(cells[2]).getByText('Image');
  within(cells[3]).getByText('Price');
  within(cells[4]).getByText('Status');
}
