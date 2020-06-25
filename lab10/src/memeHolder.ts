import { Meme } from "./meme.js";
import * as sqlite from 'sqlite3';
import { make_transaction, get_max_id } from './db.js';

export class MemeHolder {
    public add_meme(newMeme: Meme): Promise<void> {
        const add: (db: sqlite.Database) => Promise<void> = (db) => {
            return new Promise(async (resolve, reject) => {
                const nextID = await get_max_id(db) + 1;

                db.exec(`INSERT OR REPLACE INTO memes (id, name, url, price, priceHistory) VALUES (${newMeme.get_id()}, '${newMeme.get_name()}', '${newMeme.get_url()}', ${newMeme.get_price()}, ${nextID});`, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    db.exec(`INSERT OR REPLACE INTO prices (id, memeID, price, who) VALUES (${nextID}, ${newMeme.get_id()}, ${newMeme.get_price()}, 'admin');`, (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve();
                    });
                });
            });
        };

        return make_transaction(add);
    }

    public get_most_expensive(): Promise<Meme[]> {
        return new Promise(async (res) => {
            const memes: Meme[] = [];
            await make_transaction((db) => {
                return new Promise((resolve, reject) => {
                    db.all(`SELECT id, name, url, price, priceHistory FROM memes ORDER BY price DESC LIMIT 3;`, (err, rows) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        db.serialize(() => {
                            for (const row of rows) {
                                const meme = new Meme(row.id, row.name, row.price, row.url, row.who);

                                meme.fill_price_history(db);
                                memes.push(meme);
                            }
                        });
                        resolve();
                    });
                });
            });
            res(memes);
        });
    }

    public get_meme(id: number): Promise<Meme> {
        return new Promise(async (res) => {
            let meme: Meme = null;
            await make_transaction((db) => {
                return new Promise((resolve, reject) => {
                    db.get(`SELECT * FROM memes WHERE id = ${id};`, async (err, row) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        meme = new Meme(row.id, row.name, row.price, row.url, row.who);
                        await meme.fill_price_history(db);
                        resolve();
                    });
                });
            });
            res(meme);
        });
    }
}