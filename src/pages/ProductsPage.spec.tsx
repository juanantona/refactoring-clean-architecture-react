import '@testing-library/jest-dom';
import { describe, it } from '@jest/globals';
import { act, render, screen } from '@testing-library/react';

import { AppProvider } from '../context/AppProvider';
import { ProductsPage } from './ProductsPage';

const mockFetch = jest.fn();
const mockJsonResult = jest.fn();
global.fetch = mockFetch.mockResolvedValue({ json: mockJsonResult });

describe('#ProductsPage', () => {
  it('Should render the MainAppBar', async () => {
    mockJsonResult.mockResolvedValue([]);

    await act(async () =>
      render(
        <AppProvider>
          <ProductsPage />
        </AppProvider>
      )
    );

    expect(screen.getByText('Refactoring a Clean Architecture in React')).toBeInTheDocument();
  });
});
