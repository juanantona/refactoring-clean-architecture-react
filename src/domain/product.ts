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
    const isInValidNumber = isNaN(+newPrice);
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    const isInvalidFormat = !priceRegex.test(newPrice);
    const maximunValidAmount = 999.99;
    const isHigherThanMaximun = +newPrice > maximunValidAmount;

    if (isInValidNumber) throw new Error('Only numbers are allowed');
    if (isInvalidFormat) throw new Error('Invalid price format');
    if (isHigherThanMaximun) throw new Error('The max possible price is 999.99');

    this.price = newPrice;
  }
}
