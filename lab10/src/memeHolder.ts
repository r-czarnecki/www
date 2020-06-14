import { Meme } from "./meme.js";
import * as sqlite from 'sqlite3';
import { make_transaction, get_max_id } from './db.js';

export class MemeHolder {
    private db: sqlite.Database;

    public constructor(db: sqlite.Database) {
        this.db = db;
    }

    public add_meme(newMeme: Meme): Promise<void> {
        const add: () => Promise<void> = () => {
            return new Promise(async (resolve, reject) => {
                const nextID = await get_max_id(this.db) + 1;
                newMeme.set_db(this.db);

                this.db.exec(`INSERT OR REPLACE INTO memes (id, name, url, price, priceHistory) VALUES (${newMeme.get_id()}, '${newMeme.get_name()}', '${newMeme.get_url()}', ${newMeme.get_price()}, ${nextID});`, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    this.db.exec(`INSERT OR REPLACE INTO prices (id, memeID, price, who) VALUES (${nextID}, ${newMeme.get_id()}, ${newMeme.get_price()}, 'admin');`, (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve();
                    });
                });
            });
        };

        return make_transaction(this.db, add);
    }

    public get_most_expensive(): Promise<Meme[]> {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT id, name, url, price, priceHistory FROM memes ORDER BY price DESC LIMIT 3;`, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                const memes: Meme[] = [];
                this.db.serialize(() => {
                    for (const row of rows) {
                        const meme = new Meme(row.id, row.name, row.price, row.url, row.who);
                        meme.set_db(this.db);

                        meme.fill_price_history();
                        memes.push(meme);
                    }
                });

                resolve(memes);
            });
        });
    }

    public get_meme(id: number): Promise<Meme> {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM memes WHERE id = ${id};`, async (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                const meme = new Meme(row.id, row.name, row.price, row.url, row.who);
                meme.set_db(this.db);
                await meme.fill_price_history();
                resolve(meme);
            });
        });
    }

    public get_db(): sqlite.Database {
        return this.db;
    }
}