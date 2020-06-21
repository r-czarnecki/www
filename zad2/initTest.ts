import { database, changePassword } from './src/db.js';

function init() {
    return new Promise((resolve, reject) => {
        database.run(`INSERT OR REPLACE INTO users (login, password, lastChange) VALUES (?, NULL, NULL);`, ['test1'], async (err) => {
            if (err) {
                reject(err);
                return;
            }

            await changePassword('test1', 'test1');

            database.run(`INSERT OR REPLACE INTO users (login, password, lastChange) VALUES (?, NULL, NULL);`, ['test2'], async (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                await changePassword('test2', 'test2');
                resolve();
            });
        });
    });
}

init();