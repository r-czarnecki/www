export class Meme {
    private id: number;
    private name: string;
    private price: number;
    private url: string;
    private priceHistory: number[];

    public get_price(): number {
        return this.price;
    }

    public get_id(): number {
        return this.id;
    }

    public get_price_history(): number[] {
        return [...this.priceHistory];
    }

    public get_url(): string {
        return this.url;
    }

    public get_name(): string {
        return this.name;
    }

    public constructor(id: number, name: string, price: number, url: string) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.url = url;
        this.priceHistory = [price];
    }

    public change_price(newPrice: number): void {
        this.price = newPrice;
        this.priceHistory.push(newPrice);
    }
}