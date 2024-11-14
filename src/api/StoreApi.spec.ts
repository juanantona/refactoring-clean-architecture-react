import { StoreApi, parseRemoteProduct } from './StoreApi';

const oneProduct = (productData: { id: number; price?: number }) => {
  return {
    id: productData.id,
    title: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',
    price: productData.price ?? 109.95,
    description:
      'Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday',
    category: "men's clothing",
    image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
    rating: {
      rate: 3.9,
      count: 120,
    },
  };
};

describe('StoreAPi', () => {
  const mockedFetch = jest.fn();
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: mockedFetch,
    })
  );

  afterEach(() => {
    mockedFetch.mockReset();
  });

  describe('When call getAll', () => {
    it('Should return and empty array if the API returned 0 products', async () => {
      const api = new StoreApi();
      mockedFetch.mockResolvedValue([]);

      const products = await api.getAll();

      expect(products).toEqual([]);
    });

    it('Should return the products from the API', async () => {
      const productOne = oneProduct({ id: 1 });
      const productTwo = oneProduct({ id: 2, price: 10 });
      const api = new StoreApi();
      mockedFetch.mockResolvedValue([productOne, productTwo]);

      const products = await api.getAll();

      expect(products).toEqual([parseRemoteProduct(productOne), parseRemoteProduct(productTwo)]);
    });

    it('Should populate the cache', async () => {
      const productOne = oneProduct({ id: 1 });
      const api = new StoreApi();
      mockedFetch.mockResolvedValueOnce([productOne]);

      const firstCallProducts = await api.getAll();
      const secondCallProducts = await api.getAll();

      expect(firstCallProducts).toEqual([parseRemoteProduct(productOne)]);
      expect(secondCallProducts).toEqual([parseRemoteProduct(productOne)]);
      expect(mockedFetch).toHaveBeenCalledTimes(1);
    });

    it('Should parse properly the remote product', async () => {
      const productOne = oneProduct({ id: 1, price: 2 });
      const productTwo = oneProduct({ id: 1, price: 0 });
      const api = new StoreApi();
      mockedFetch.mockResolvedValueOnce([productOne, productTwo]);

      const products = await api.getAll();

      expect(products[0].price).toEqual('2.00');
      expect(products[0].status).toEqual('active');
      expect(products[1].price).toEqual('0.00');
      expect(products[1].status).toEqual('inactive');
    });
  });

  describe('When call get', () => {
    it('Should return the proper product acording the id provided', async () => {
      const productOne = oneProduct({ id: 1 });
      const productTwo = oneProduct({ id: 2, price: 10 });
      const api = new StoreApi();
      mockedFetch.mockResolvedValue([productOne, productTwo]);

      const product = await api.get(2);

      expect(product).toEqual(parseRemoteProduct(productTwo));
    });
  });
});
