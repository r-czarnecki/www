import { database, changePassword, make_transaction } from './src/db.js';

function removeUser(user: string) {
    return make_transaction(() => {
        return new Promise((resolve, reject) => {
            database.get('SELECT id FROM users WHERE login=?;', [user], (err, id) => {
                if (err) {
                    reject(err);
                    return;
                }

                database.run('DELETE FROM users WHERE login=?;', [user], (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    database.run('DELETE FROM quizStatus WHERE userID=?;', [id.id], (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        database.run('DELETE FROM questionStatus WHERE userID=?;', [id.id], (err) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            resolve();
                        });
                    });
                });
            });
        });
    });
}

async function clear() {
    await removeUser('test1');
    await removeUser('test2');
}

clear();