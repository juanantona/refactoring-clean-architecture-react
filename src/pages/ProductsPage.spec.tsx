import '@testing-library/jest-dom';
import { describe, it } from '@jest/globals';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';

import { AppProvider } from '../context/AppProvider';
import { ProductsPage } from './ProductsPage';
import { RemoteProduct } from '../api/StoreApi';

const product: RemoteProduct = {
  id: 1001,
  title: 'Mens Cotton Jacket',
  price: 55.99,
  description:
    'great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling or other outdoors. Good gift choice for you or your family member. A warm hearted love to Father, husband or son in this thanksgiving or Christmas Day.',
  category: "men's clothing",
  image: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
  rating: {
    rate: 4.7,
    count: 500,
  },
};

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

describe('#ProductsPage', () => {
  const mockFetch = jest.fn();
  const mockJsonResult = jest.fn();
  global.fetch = mockFetch.mockResolvedValue({ json: mockJsonResult });

  it('Should showcase product id, title, price, image and status regarding the price', async () => {
    const builtProduct = buildProduct(product);
    const promise = Promise.resolve([builtProduct]);
    mockJsonResult.mockResolvedValue(promise);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await promise);

    expect(screen.getByText(/Mens Cotton Jacket/i)).toBeInTheDocument();
    expect(screen.getByText(/1001/i)).toBeInTheDocument();
    expect(screen.getByText(/55.99/i)).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it('Should showcase the Update price modal when click in the actions button', async () => {
    const builtProduct = buildProduct(product);
    const promise = Promise.resolve([builtProduct]);
    mockJsonResult.mockResolvedValue(promise);

    render(<ProductsPage />, { wrapper: AppProvider });
    await act(async () => await promise);

    expect(mockFetch).toHaveBeenCalledWith('https://fakestoreapi.com/products');

    const actionsButton = screen.getByTestId('MoreVertIcon');
    fireEvent.click(actionsButton);
    await waitFor(() => screen.getByText(/Update price/i));
  });
});
