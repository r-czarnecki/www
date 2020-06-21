import * as sqlite from 'sqlite3';
import { initialUsers } from './initialUsers.js';
import * as crypto from 'crypto';
import { quizzes } from './quizzes.js';

export const database = new sqlite.Database('data.db');

function createIfNeeded(table: string, fun: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
        database.all(`SELECT COUNT(*) AS cnt FROM sqlite_master WHERE type='table' AND name=?;`, [table], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            if (rows[0].cnt === 1) {
                resolve();
                return;
            }

            fun().then(() => {
                resolve();
            })
        });
    });
}

export function changePassword(login: string, newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
        database.get(`SELECT * FROM users WHERE login=?;`, [login], (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            const hash = crypto.createHash('sha256').update(newPassword).digest('hex');
            database.run(`UPDATE users SET password=?, lastChange=? WHERE id=?;`, [hash, Date.now(), row.id], (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    });
}

const transactionQueue: [() => Promise<void>, boolean][] = [];
let isWorking = false;

function transaction(): Promise<void> | void {
    if (isWorking)
        return;

    return new Promise(async (resolve) => {
        while (transactionQueue.length !== 0 && transactionQueue[0][1]) {
            isWorking = true;
            let done = false;
            const fun = transactionQueue.shift()[0];
            while (!done) {
                await new Promise((resolve2, reject) => {
                    database.exec(`BEGIN TRANSACTION`, async (err) => {
                        if (err) {
                            if (err.message.match('^([^ ]+):')[1] === 'SQLITE_ERROR') {
                                await new Promise(res => setTimeout(res, 10));
                                resolve2();
                            }
                            else
                                reject(err);
                            return;
                        }

                        fun().then(() => {
                            database.exec(`COMMIT`, () => {
                                done = true;
                                resolve2();
                            });
                        });
                    });
                });
            }
        }

        isWorking = false;
        resolve();
    });
}

export function make_transaction(fun: () => Promise<void>): Promise<void> {
    let res: () => void;
    const done = () => {
        return new Promise<void>((resolve) => {
            fun().then(() => {
                res();
                resolve();
            });
        });
    }

    const tr: [() => Promise<void>, boolean] = [done, false];
    transactionQueue.push(tr);

    return new Promise((resolve) => {
        res = resolve;
        tr[1] = true;
        transaction();
    });
}

export function isSolved(userID: number, quizID: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        database.get(`SELECT time FROM quizStatus WHERE userID=? AND quizID=?;`,
                      [userID, quizID], (err, time) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(time !== undefined);
        });
    });
}

export function isCorrectNumber(quizID: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
        database.get('SELECT MAX(id) AS id FROM quiz', (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (quizID < 1 || quizID > row.id)
                resolve(false);
            else
                resolve(true);
        });
    });
}

export interface Question {
    nr: number,
    question: string,
    penalty: number
}

export interface Quiz {
    id: number,
    questions: Question[],
    isSolved: boolean
}

export interface Solution {
    id: number,
    answers: number[]
}

export function getQuizzes(userID: number): Promise<[Quiz[], Solution[]]> {
    return new Promise<[Quiz[], Solution[]]>((resolve, reject) => {
        const quiz: Quiz[] = [];
        const solution: Solution[] = [];
        let currentQuiz: Quiz = {
            id: 0,
            questions: [],
            isSolved: false
        };
        let currentSolution: Solution = {
            id: 0,
            answers: []
        }

        database.all(`SELECT * FROM quiz ORDER BY id ASC, questionNr ASC;`, async (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            for (const row of rows) {
                if (row.id !== currentQuiz.id) {
                    const solved = await isSolved(userID, row.id);

                    currentQuiz = {
                        id: row.id,
                        questions: [],
                        isSolved: solved
                    };

                    currentSolution = {
                        id: row.id,
                        answers: []
                    };

                    quiz.push(currentQuiz);
                    solution.push(currentSolution);
                }

                currentQuiz.questions.push({
                    nr: row.questionNr,
                    question: row.question,
                    penalty: row.penalty
                });

                currentSolution.answers.push(row.answer);
            }

            resolve([quiz, solution]);
        });
    });
}

async function initDatabase() {
    await createIfNeeded('users', async () => {
        return new Promise((resolve, reject) => {
            database.run(`CREATE TABLE users (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          login TEXT,
                          password TEXT,
                          lastChange NUMBER);`, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                database.serialize(() => {
                    for (const user of initialUsers) {
                        database.run(`INSERT OR REPLACE INTO users (login, password, lastChange) VALUES (?, NULL, NULL);`,
                                      [user.login], async (err) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            await changePassword(user.login, user.password);
                        });
                    }

                    resolve();
                });
            });
        });
    });

    await createIfNeeded('quiz', () => {
        return new Promise((resolve, reject) => {
            database.run(`CREATE TABLE quiz (
                          id INTEGER,
                          questionNr INTEGER,
                          question TEXT,
                          answer INTEGER,
                          penalty INTEGER,
                          PRIMARY KEY(id, questionNr));`, (err) => {
                if (err) {
                    reject();
                    return;
                }

                database.serialize(() => {
                    for (let i = 0; i < quizzes.length; i++) {
                        const quiz = quizzes[i];

                        for (let j = 0; j < quiz.length; j++) {
                            database.run(`INSERT OR REPLACE INTO quiz (id, questionNr, question, answer, penalty) VALUES (?, ?, ?, ?, ?);`,
                                        [i + 1, j + 1, quiz[j].question, quiz[j].answer, quiz[j].penalty], (err) => {
                                if (err) {
                                    reject();
                                    return;
                                }

                                if (j === quiz.length - 1 && i === quizzes.length - 1)
                                    resolve();
                            });
                        }
                    }
                });
            });
        });
    });

    await createIfNeeded('quizStatus', () => {
        return new Promise((resolve, reject) => {
            database.run(`CREATE TABLE quizStatus (
                          userID INTEGER,
                          quizID INTEGER,
                          time INTEGER,
                          PRIMARY KEY(userID, quizID));`, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    });

    await createIfNeeded('questionStatus', () => {
        return new Promise((resolve, reject) => {
            database.run(`CREATE TABLE questionStatus (
                          userID INTEGER,
                          quizID INTEGER,
                          questionNr INTEGER,
                          time INTEGER,
                          userAnswer TEXT);`, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    });
}

initDatabase();