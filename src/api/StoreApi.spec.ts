import { StoreApi } from './StoreApi';

const oneProduct = ({ id = 1, price = 1 }) => ({
  id,
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

describe('#StoreApi', () => {
  const mockResult = jest.fn();
  const mockFetch = jest.fn();
  global.fetch = mockFetch.mockResolvedValue({
    json: mockResult,
  });

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should retrieve all products from API when cache is empty', async () => {
    const storeApi = new StoreApi();
    const product1 = oneProduct({ id: 1, price: 10 });
    const product2 = oneProduct({ id: 2, price: 20 });
    const mockProducts = [product1, product2];
    mockResult.mockResolvedValueOnce([product1, product2]);

    const products = await storeApi.getAll();

    expect(mockFetch).toHaveBeenCalledWith('https://fakestoreapi.com/products');
    expect(products).toEqual(mockProducts);
    expect(storeApi.cache).toEqual(mockProducts);
  });

  it('should retrieve products from cache when cache is not empty', async () => {
    const storeApi = new StoreApi();
    const product1 = oneProduct({ id: 1, price: 10 });
    const product2 = oneProduct({ id: 2, price: 20 });

    storeApi.cache = [product1, product2];

    const products = await storeApi.getAll();

    expect(mockFetch).not.toHaveBeenCalled();
    expect(products).toEqual([product1, product2]);
  });
});
