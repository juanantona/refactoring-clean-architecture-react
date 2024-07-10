import { type RemoteProduct } from '../api/StoreApi';

export class Product {
  id: number;
  title: string;
  image: string;
  price: string;

  constructor(remoteProduct: RemoteProduct) {
    this.id = remoteProduct.id;
    this.title = remoteProduct.title;
    this.image = remoteProduct.image;
    this.price = this.formatPrice(remoteProduct.price);
  }

  static create(remoteProduct: RemoteProduct) {
    return new Product(remoteProduct);
  }

  private formatPrice(price: number) {
    return price.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }

  updatePrice(newPrice: string): void {
    this.price = newPrice;
  }
}
