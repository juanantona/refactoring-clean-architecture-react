export class StoreApi {
  cache: Product[] = [];

  async getAll(): Promise<Product[]> {
    return this.getProducts();
  }

  async get(id: number): Promise<Product> {
    const remoteProduct = await this.getProduct(id);

    return remoteProduct;
  }

  async post(productToUpdate: Product): Promise<void> {
    const existedProduct = await this.getProduct(productToUpdate.id);

    if (existedProduct) {
      this.cache = this.cache.map(product => {
        return product.id === productToUpdate.id ? productToUpdate : product;
      });
    } else {
      this.cache = [...this.cache, productToUpdate];
    }
  }

  private async getProducts(): Promise<Product[]> {
    //fakestoreapi is a not real database then we update the cache
    if (this.cache.length === 0) {
      const products: RemoteProduct[] = await fetch('https://fakestoreapi.com/products').then(res =>
        res.json()
      );
      const parsedRemoteProducts = products.map(parseRemoteProduct);
      this.cache = parsedRemoteProducts;
      return parsedRemoteProducts;
    } else {
      return this.cache;
    }
  }

  private async getProduct(id: number): Promise<Product> {
    //fakestoreapi is a not real database then we update the cache
    if (this.cache.length === 0) {
      await this.getAll();
    }

    const product = this.cache.find(product => product.id === id);

    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }

    return product;
  }
}

export interface RemoteProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  price: number;
  rating: { rate: number; count: number };
}

export interface Product {
  id: number;
  title: string;
  image: string;
  price: string;
  status: 'active' | 'inactive';
}

export function parseRemoteProduct(remoteProduct: RemoteProduct): Product {
  return {
    id: remoteProduct.id,
    title: remoteProduct.title,
    image: remoteProduct.image,
    price: remoteProduct.price.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }),
    status: remoteProduct.price === 0 ? 'inactive' : 'active',
  };
}
