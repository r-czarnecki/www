export class Meme {
    constructor(id, name, price, url) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.url = url;
        this.price_history = [price];
    }
    change_price(new_price) {
        this.price = new_price;
        this.price_history.push(new_price);
    }
}
