import * as sqlite from 'sqlite3';
import { MemeHolder } from './memeHolder.js';
import { Meme } from './meme.js';
import * as crypto from 'crypto';


const initialMemes = [
    {
        'id': 1,
        'name': 'Meme1',
        'price': 950,
        'url': 'images/meme1.png'
    },
    {
        'id': 2,
        'name': 'Meme2',
        'price': 800,
        'url': 'images/meme2.jpg'
    },
    {
        'id': 3,
        'name': 'Meme3',
        'price': 600,
        'url': 'images/meme3.jpg'
    },
    {
        'id': 4,
        'name': 'Meme4',
        'price': 780,
        'url': 'images/meme4.jpg'
    },
    {
        'id': 5,
        'name': 'Meme5',
        'price': 900,
        'url': 'images/meme5.jpg'
    },
    {
        'id': 6,
        'name': 'Elite',
        'price': 1200,
        'url': 'images/meme6.jpg'
    },
    {
        'id': 7,
        'name': 'Platinum',
        'price': 1100,
        'url': 'images/meme7.jpg'
    },
    {
        'id': 8,
        'name': 'Gold',
        'price': 1000,
        'url': 'images/meme8.png'
    }
];

const initialUsers = [
    {
        'username': 'user',
        'password': 'user'
    },
    {
        'username': 'admin',
        'password': 'admin'
    }
]

export async function make_transaction(fun: (db: sqlite.Database) => Promise<void>): Promise<void> {
    return new Promise(async (resolve) => {
        let done = false;
        while (!done) {
            await new Promise((resolve2, reject) => {
                const database = new sqlite.Database('data.db');
                database.exec(`BEGIN EXCLUSIVE TRANSACTION`, async (err) => {
                    if (err) {
                        await new Promise(res => setTimeout(res, 1000));
                        if (err.message.match("^([^ ]+):")[1] === "SQLITE_BUSY") {
                            await new Promise(res => setTimeout(res, 10));
                            resolve2();
                        }
                        else
                            reject(err);

                        return;
                    }

                    fun(database).then(() => {
                        database.exec(`COMMIT`, () => {
                            done = true;
                            resolve2();
                        });
                    });
                });
            });
        }

        resolve();
    });
}

export async function init_db(db: sqlite.Database, memeHolder: MemeHolder): Promise<void> {
    return new Promise((resolve, reject) => {
        db.all(`SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type='table' AND name='memes';`, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            if (rows[0].cnt === 1) {
                resolve();
                return;
            }

            db.run(`CREATE TABLE memes (
                id INTEGER PRIMARY KEY,
                name TEXT,
                url TEXT,
                price INTEGER,
                priceHistory INTEGER);`, [], (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                db.run(`CREATE TABLE prices (
                    id INTEGER PRIMARY KEY,
                    memeID INTEGER,
                    price INTEGER,
                    who TEXT);`, [], async (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    for (const meme of initialMemes)
                        await memeHolder.add_meme(new Meme(meme.id, meme.name, meme.price, meme.url, 'admin'));

                    resolve();
                });
            });
        });

        db.all(`SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type='table' AND name='users';`, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            if (rows[0].cnt === 1) {
                resolve();
                return;
            }

            db.run(`CREATE TABLE users (
                username TEXT PRIMARY KEY,
                password TEXT);`, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                for (const user of initialUsers) {
                    const hash = crypto.createHash("sha256").update(user.password).digest("hex");
                    db.exec(`INSERT OR REPLACE INTO users (username, password) VALUES ('${user.username}', '${hash}');`, (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                    });
                }
            });
        });
    });
}

export function get_max_id(db: sqlite.Database): Promise<number> {
    return new Promise((resolve, reject) => {
        db.get(`SELECT MAX(id) AS id FROM prices;`, (err, row) => {
            if(err)
                reject(err);

            if (row === undefined)
                resolve(1);

            resolve(row.id);
        });
    })
};