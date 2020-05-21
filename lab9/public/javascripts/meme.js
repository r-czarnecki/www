export class Meme {
    constructor(id, name, price, url) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.url = url;
        this.priceHistory = [price];
    }
    change_price(newPrice) {
        this.price = newPrice;
        this.priceHistory.push(newPrice);
    }
}