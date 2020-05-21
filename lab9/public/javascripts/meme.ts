export class Meme {
    public id: number;
    public name: string;
    public price: number;
    public url: string;
    public price_history: number[];

    public constructor(id: number, name: string, price: number, url: string) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.url = url;
        this.price_history = [price];
    }

    public change_price(new_price: number) {
        this.price = new_price;
        this.price_history.push(new_price);
    }
}