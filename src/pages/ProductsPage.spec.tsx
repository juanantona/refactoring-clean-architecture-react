import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProductsPage } from './ProductsPage';
import { AppProvider } from '../context/AppProvider';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
);

it('Should showcase the page title', async () => {
  await act(async () => render(<ProductsPage />, { wrapper: AppProvider }));

  expect(screen.getByText('Refactoring a Clean Architecture in React')).toBeInTheDocument();
});
