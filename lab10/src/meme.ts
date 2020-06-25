import * as sqlite from 'sqlite3';
import { get_max_id, make_transaction } from './db.js';

export class Meme {
    private id: number;
    private name: string;
    private price: number;
    private url: string;
    private priceHistory: [number, string][];

    public get_price(): number {
        return this.price;
    }

    public get_id(): number {
        return this.id;
    }

    public get_price_history(): [number, string][] {
        return [...this.priceHistory];
    }

    public get_url(): string {
        return this.url;
    }

    public get_name(): string {
        return this.name;
    }

    public constructor(id: number, name: string, price: number, url: string, who: string) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.url = url;
        this.priceHistory = [[price, who]];
    }

    public change_price(newPrice: number, saveInDB: boolean, who: string): Promise<void> | void {
        this.price = newPrice;
        this.priceHistory.push([newPrice, who]);

        if (saveInDB) {
            const add: (db: sqlite.Database) => Promise<void> = (db) => {
                return new Promise(async (resolve, reject) => {
                    const nextID = await get_max_id(db) + 1;
                    db.exec(`UPDATE memes SET price = ${this.price} WHERE id = ${this.id};`, (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        db.exec(`INSERT OR REPLACE INTO prices (id, memeID, price, who) VALUES (${nextID}, ${this.id}, ${newPrice}, '${who}');`, () => resolve());
                    });
                });
            };

            return make_transaction(add);
        }
    }

    public fill_price_history(db: sqlite.Database): Promise<void> {
        return new Promise((resolve, reject) => {
            this.priceHistory = [];
            db.all(`SELECT id, memeID, price, who FROM prices WHERE memeID = ${this.id} ORDER BY id ASC;`, (err, pricesRows) => {
                if (err) {
                    reject(err);
                    return;
                }

                for (const row of pricesRows)
                    this.change_price(row.price, false, row.who);

                resolve();
            });
        });
    }
}