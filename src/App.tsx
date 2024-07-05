import { AppProvider } from './context/AppProvider';
import { ProductsPage } from './pages/ProductsPage';

import { StoreApi } from './api/StoreApi';

function App() {
  const storeApi = new StoreApi();

  return (
    <AppProvider storeApi={storeApi}>
      <ProductsPage />
    </AppProvider>
  );
}

export default App;
