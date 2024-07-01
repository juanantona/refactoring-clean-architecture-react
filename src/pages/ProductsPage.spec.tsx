import '@testing-library/jest-dom';
import { describe, it } from '@jest/globals';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';

import { AppProvider } from '../context/AppProvider';
import { ProductsPage } from './ProductsPage';
import { StoreApi } from '../api/StoreApi';

const oneProduct = ({ price = 1 }) => ({
  id: 1001,
  title: 'Mens Cotton Jacket',
  price,
  description:
    'great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling or other outdoors. Good gift choice for you or your family member. A warm hearted love to Father, husband or son in this thanksgiving or Christmas Day.',
  category: "men's clothing",
  image: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
  rating: {
    rate: 4.7,
    count: 500,
  },
});

describe('#ProductsPage', () => {
  const getAllProductsSpy = jest.spyOn(StoreApi.prototype, 'getAll');
  const postProductSpy = jest.spyOn(StoreApi.prototype, 'post');

  it('Should retrieve products from API when the oponent loads', async () => {
    getAllProductsSpy.mockResolvedValueOnce([]);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await getAllProductsSpy.mock.results[0].value);

    expect(getAllProductsSpy).toHaveBeenCalledTimes(1);
  });

  it('Should showcase product id, title, and image attributes', async () => {
    const product = oneProduct({});
    getAllProductsSpy.mockResolvedValueOnce([product]);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await getAllProductsSpy.mock.results[0].value);

    expect(screen.getByText(new RegExp(`${product.id}`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${product.title}`, 'i'))).toBeInTheDocument();
    const images = screen.queryAllByRole('img');
    const productImage = images.find(img => img.src === product.image);
    expect(productImage).toBeInTheDocument();
  });

  it('Should showcase price formatted with 2 fraction digits', async () => {
    const product = oneProduct({ price: 40.1 });
    getAllProductsSpy.mockResolvedValueOnce([product]);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await getAllProductsSpy.mock.results[0].value);

    expect(screen.getByText(/40.10/i)).toBeInTheDocument();
  });

  it('Should showcase status active if the price is bigger than 0', async () => {
    const product = oneProduct({ price: 1 });
    getAllProductsSpy.mockResolvedValueOnce([product]);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await getAllProductsSpy.mock.results[0].value);

    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('active').closest('div')).toHaveStyle({ background: 'green' });
  });

  it('Should showcase status inactive if the price is 0', async () => {
    const product = oneProduct({ price: 0 });
    getAllProductsSpy.mockResolvedValueOnce([product]);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await getAllProductsSpy.mock.results[0].value);

    expect(screen.getByText('inactive')).toBeInTheDocument();
    expect(screen.getByText('inactive').closest('div')).toHaveStyle({ background: 'red' });
  });

  it('Should showcase user modal when clicking in the User button', async () => {
    getAllProductsSpy.mockResolvedValueOnce([]);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await getAllProductsSpy.mock.results[0].value);

    expect(screen.queryByText('Admin user')).not.toBeVisible();
    expect(screen.queryByText('Non admin user')).not.toBeVisible();

    const buttons = screen.getAllByRole('button');
    const usersButton = buttons.find(btn => btn.id === 'users');
    if (usersButton) fireEvent.click(usersButton);
    expect(screen.queryByText('Admin user')).toBeVisible();
    expect(screen.queryByText('Non admin user')).toBeVisible();
  });

  it('Should showcase the Update price modal when click in the actions button', async () => {
    const product = oneProduct({});
    getAllProductsSpy.mockResolvedValueOnce([product]);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await getAllProductsSpy.mock.results[0].value);

    const actionsButton = screen.getByTestId('MoreVertIcon');
    fireEvent.click(actionsButton);
    expect(screen.getByText(/Update price/i)).toBeVisible();
  });

  it("Shouldn't allow to update the product price if the user is Non Admin", async () => {
    const product = oneProduct({});
    getAllProductsSpy.mockResolvedValueOnce([product]);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await getAllProductsSpy.mock.results[0].value);

    const buttons = screen.getAllByRole('button');
    const usersButton = buttons.find(btn => btn.id === 'users');
    if (usersButton) fireEvent.click(usersButton);
    expect(screen.getByText('Non admin user')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Non admin user'));
    expect(screen.getByText('User: Non admin user')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('MoreVertIcon'));
    expect(screen.getByText('Update price')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Update price'));
    expect(
      screen.getByText('Only admin users can edit the price of a product')
    ).toBeInTheDocument();
  });

  it("Shouldn't allow to update the product price with no numbers", async () => {
    const product = oneProduct({ price: 55.99 });
    getAllProductsSpy.mockResolvedValueOnce([product]);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await getAllProductsSpy.mock.results[0].value);

    fireEvent.click(screen.getByTestId('MoreVertIcon'));
    expect(screen.getByText('Update price')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Update price'));
    waitFor(() => {
      expect(screen.getByText('Save')).toBeVisible();
      fireEvent.change(screen.getByDisplayValue('55.99'), { target: { value: 'AA' } });
      fireEvent.click(screen.getByText('Save'));
      expect(postProductSpy).not.toHaveBeenCalled();
      expect(screen.getByText('Only numbers are allowed')).toBeInTheDocument();
    });
  });

  it("Shouldn't allow to update the product price with number avobe 999.99", async () => {
    const product = oneProduct({ price: 55.99 });
    getAllProductsSpy.mockResolvedValueOnce([product]);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await getAllProductsSpy.mock.results[0].value);

    fireEvent.click(screen.getByTestId('MoreVertIcon'));
    expect(screen.getByText('Update price')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Update price'));
    waitFor(() => {
      expect(screen.getByText('Save')).toBeVisible();
      fireEvent.change(screen.getByDisplayValue('55.99'), { target: { value: '1000' } });
      fireEvent.click(screen.getByText('Save'));
      expect(postProductSpy).not.toHaveBeenCalled();
      expect(screen.getByText('The max possible price is 999.99')).toBeInTheDocument();
    });
  });

  it('Should allow to update the product price if the user is Admin', async () => {
    const product = oneProduct({ price: 55.99 });
    getAllProductsSpy.mockResolvedValueOnce([product]);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await getAllProductsSpy.mock.results[0].value);

    expect(screen.queryByText('10.00')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('MoreVertIcon'));
    expect(screen.getByText('Update price')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Update price'));
    waitFor(() => {
      expect(screen.getByText('Save')).toBeVisible();
      fireEvent.change(screen.getByDisplayValue('55.99'), { target: { value: '10' } });
      fireEvent.click(screen.getByText('Save'));
      expect(postProductSpy).toHaveBeenCalledWith({ ...product, price: 10 });
      expect(screen.getByText(`Price 10 for '${product.title}' updated`)).toBeInTheDocument();
      expect(screen.getByText('10.00')).toBeInTheDocument();
    });
  });
});
