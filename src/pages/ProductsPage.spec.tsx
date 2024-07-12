import { test } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';

import App from '../App';

test('Loads and displays title', async () => {
  render(<App />);

  await screen.findAllByRole('heading', { name: 'Product price updater' });
});
