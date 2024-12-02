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
  return {
    user: userEvent.setup(),
    ...render(component, { wrapper: AppProvider }),
  };
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

      const { user } = wrappedRender(<ProductsPage />);

      expect(screen.queryByText('User: Non admin user')).not.toBeInTheDocument();
      await setNonAdminUser(user);
      expect(screen.getByText('User: Non admin user')).toBeInTheDocument();
    });
  });

  describe('When the user is a Non admin user', () => {
    it('Should display an error message if tries to update the product price', async () => {
      const product = oneProduct();
      getProductsMock.mockResolvedValue([product]);

      const { user } = wrappedRender(<ProductsPage />);

      await setNonAdminUser(user);
      await waitForTableRowsLoaded();
      const productRowIndex = 0;
      const modal = await openUpdatePriceModal(user, productRowIndex);
      expect(modal).not.toBeInTheDocument();
      expect(
        screen.getByText('Only admin users can edit the price of a product')
      ).toBeInTheDocument();
    });
  });

  describe('When the user is an Admin user (default user)', () => {
    it('Should display the update price modal if tries to update the product price', async () => {
      const product = oneProduct();
      getProductsMock.mockResolvedValue([product]);

      const { user } = wrappedRender(<ProductsPage />);

      await waitForTableRowsLoaded();
      const productRowIndex = 0;
      const modal = await openUpdatePriceModal(user, productRowIndex);
      verifyModal(modal, product);
    });

    it('Should display an error message if tries to use letters in the price input', async () => {
      const product = oneProduct();
      getProductsMock.mockResolvedValue([product]);

      const { user } = wrappedRender(<ProductsPage />);

      await waitForTableRowsLoaded();
      const productRowIndex = 0;
      const modal = (await openUpdatePriceModal(user, productRowIndex)) as HTMLElement;
      await typePrice(user, modal, 'non-numeric');
      await verifySaveButtonIsDisabled(modal);
      expect(await within(modal).findByText('Only numbers are allowed')).toBeInTheDocument();
    });

    it('Should display an error message if tries to type a point without decimal places', async () => {
      const product = oneProduct();
      getProductsMock.mockResolvedValue([product]);

      const { user } = wrappedRender(<ProductsPage />);

      await waitForTableRowsLoaded();
      const productRowIndex = 0;
      const modal = (await openUpdatePriceModal(user, productRowIndex)) as HTMLElement;
      await typePrice(user, modal, '1.');
      await verifySaveButtonIsDisabled(modal);
      expect(await within(modal).findByText('Invalid price format')).toBeInTheDocument();
    });

    it('Should display an error message if tries to type a number bigger than 999.99', async () => {
      const product = oneProduct();
      getProductsMock.mockResolvedValue([product]);

      const { user } = wrappedRender(<ProductsPage />);

      await waitForTableRowsLoaded();
      const productRowIndex = 0;
      const modal = (await openUpdatePriceModal(user, productRowIndex)) as HTMLElement;
      await typePrice(user, modal, '1000');
      await verifySaveButtonIsDisabled(modal);
      expect(
        await within(modal).findByText('The max possible price is 999.99')
      ).toBeInTheDocument();
    });

    it('Should update the price if the input value is correct and display a success message', async () => {
      const product = oneProduct();
      getProductsMock.mockResolvedValue([product]);

      const { user } = wrappedRender(<ProductsPage />);

      await waitForTableRowsLoaded();
      const productRowIndex = 0;
      const modal = (await openUpdatePriceModal(user, productRowIndex)) as HTMLElement;
      const newPrice = '123';
      await typePrice(user, modal, newPrice);
      await savePrice(user, modal);

      expect(
        await screen.findByText(`Price ${newPrice} for '${product.title}' updated`)
      ).toBeInTheDocument();

      await verifyRowPrice(productRowIndex, newPrice);
    });

    it('Should update the status tag to inactive if the new price is 0', async () => {
      const product = oneProduct();
      getProductsMock.mockResolvedValue([product]);

      const { user } = wrappedRender(<ProductsPage />);

      await waitForTableRowsLoaded();
      const productRowIndex = 0;
      const modal = (await openUpdatePriceModal(user, productRowIndex)) as HTMLElement;
      await typePrice(user, modal, '0');
      await savePrice(user, modal);

      await verifyRowStatus(productRowIndex, 'inactive');
    });
  });
});

async function verifySaveButtonIsDisabled(modal: HTMLElement) {
  const saveButton = within(modal).getByRole('button', { name: /save/i });
  expect(saveButton).toBeDisabled();
}

async function verifyRowStatus(rowIndex: number, status: string) {
  const [, ...rows] = await screen.findAllByRole('row');
  const rowCells = within(rows[rowIndex]).getAllByRole('cell');
  const priceCell = rowCells[4];
  expect(within(priceCell).getByText(status)).toBeInTheDocument();
}

async function verifyRowPrice(rowIndex: number, price: string) {
  const [, ...rows] = await screen.findAllByRole('row');
  const rowCells = within(rows[rowIndex]).getAllByRole('cell');
  const priceCell = rowCells[3];
  expect(within(priceCell).getByText(`$${Number(price).toFixed(2)}`)).toBeInTheDocument();
}

async function savePrice(user: UserEvent, modal: HTMLElement) {
  await user.click(within(modal).getByRole('button', { name: /save/i }));
}

async function typePrice(user: UserEvent, modal: HTMLElement, price: string) {
  const priceInput = within(modal).getByRole('textbox', { name: /price/i });
  await user.clear(priceInput);
  await user.type(priceInput, price);
}

async function clickUpdatePrice(row: HTMLElement, user: UserEvent) {
  const actionsControl = within(row).getByLabelText('more');
  await user.click(actionsControl);
  const updatePriceButton = screen.getByText('Update price');
  expect(updatePriceButton).toBeInTheDocument();
  await user.click(updatePriceButton);
}

async function openUpdatePriceModal(
  user: UserEvent,
  rowIndex: number
): Promise<HTMLElement | null> {
  const [, ...rows] = screen.getAllByRole('row');
  const rowActionControl = within(rows[rowIndex]).getByRole('menuitem');
  await user.click(rowActionControl);
  const updatePriceButton = await screen.findByRole('menuitem', { name: /update price/i });
  await user.click(updatePriceButton);
  let modal: HTMLElement | null;
  try {
    modal = await screen.findByRole('dialog');
  } catch {
    modal = null;
  }
  return modal;
}

async function verifyModal(modal: HTMLElement | null, product: Product) {
  expect(modal).toBeInTheDocument();
  if (modal) {
    expect(within(modal).getByText(product.title)).toBeInTheDocument();
    const img = within(modal).getByRole('img') as HTMLImageElement;
    expect(img.src).toBe(product.image);
    expect(within(modal).getByDisplayValue(product.price)).toBeInTheDocument();
  }
}

async function setNonAdminUser(user: UserEvent) {
  const userButton = screen.getByRole('button', { name: /user:/i });
  await user.click(userButton);
  const nonAdminUserButton = await screen.findByRole('menuitem', { name: /non admin user/i });
  await user.click(nonAdminUserButton);
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
  const image: HTMLImageElement = within(productOneCells[2]).getByRole('img');
  expect(image.src).toBe(product.image);
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
