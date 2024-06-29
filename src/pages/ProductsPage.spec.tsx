import '@testing-library/jest-dom';
import { describe, it } from '@jest/globals';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';

import { AppProvider } from '../context/AppProvider';
import { ProductsPage } from './ProductsPage';
import { StoreApi } from '../api/StoreApi';

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

const oneProduct = ({ price = 1 }) => {
  const remoteProduct = {
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
  };

  return buildProduct(remoteProduct);
};

describe('#ProductsPage', () => {
  const getAllSpy = jest.spyOn(StoreApi.prototype, 'getAll');

  it('Should showcase product id, title, price and image attributes', async () => {
    const product = oneProduct({ price: 55.99 });
    getAllSpy.mockResolvedValueOnce([product]);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await getAllSpy.mock.results[0].value);

    expect(getAllSpy).toHaveBeenCalled();

    expect(screen.getByText(new RegExp(`${product.id}`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${product.title}`, 'i'))).toBeInTheDocument();
    const images = screen.queryAllByRole('img');
    const productImage = images.find(img => img.src === product.image);
    expect(productImage).toBeInTheDocument();
    expect(screen.getByText(/55.99/i)).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it('Should showcase status inactive if the price is 0', async () => {
    const product = oneProduct({ price: 0 });
    getAllSpy.mockResolvedValueOnce([product]);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await getAllSpy.mock.results[0].value);

    expect(screen.getByText(/inactive/i)).toBeInTheDocument();
  });

  it('Should showcase the Update price modal when click in the actions button', async () => {
    const product = oneProduct({});
    getAllSpy.mockResolvedValueOnce([product]);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await getAllSpy.mock.results[0].value);

    expect(getAllSpy).toHaveBeenCalled();

    const actionsButton = screen.getByTestId('MoreVertIcon');
    fireEvent.click(actionsButton);
    expect(screen.getByText(/Update price/i)).toBeInTheDocument();
  });

  it('Should showcase user modal when clicking in the User button', async () => {
    getAllSpy.mockResolvedValueOnce([]);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await getAllSpy.mock.results[0].value);

    expect(screen.queryByText('Admin user')).not.toBeVisible();
    expect(screen.queryByText('Non admin user')).not.toBeVisible();

    const buttons = screen.getAllByRole('button');
    const usersButton = buttons.find(btn => btn.id === 'users');
    if (usersButton) fireEvent.click(usersButton);
    expect(screen.queryByText('Admin user')).toBeVisible();
    expect(screen.queryByText('Non admin user')).toBeVisible();
  });
});
