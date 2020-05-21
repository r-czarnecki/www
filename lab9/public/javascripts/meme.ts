export class Meme {
    public id: number;
    public name: string;
    public price: number;
    public url: string;
    public priceHistory: number[];

    public constructor(id: number, name: string, price: number, url: string) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.url = url;
        this.priceHistory = [price];
    }

    public change_price(newPrice: number) {
        this.price = newPrice;
        this.priceHistory.push(newPrice);
    }
}