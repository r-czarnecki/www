import express from 'express';
import { getQuizzes, make_transaction, database, Quiz, Solution, isCorrectNumber, isSolved } from '../src/db';

export const raportRouter = express.Router();

raportRouter.get('/:id(\\d)+', async (req, res) => {
    if (await isCorrectNumber(parseInt(req.params.id, 10)) &&
        await isSolved(req.session.userID, parseInt(req.params.id, 10)) &&
        req.session.currentQuiz === undefined)
        res.sendFile(`${process.cwd()}/static/raport.html`);
    else
        res.redirect('/');
});

interface AnswerStatus {
    nr: number,
    question: string,
    penalty: number,
    userAnswer: string
    correctAnswer: string,
    time: number,
    averageTime: number
}

interface Status {
    answers: AnswerStatus[],
    time: number
}

raportRouter.get('/status/:id(\\d+)', async (req, res) => {
    const quizID = parseInt(req.params.id, 10);
    const quizzes = await getQuizzes(parseInt(req.session.userID, 10));
    const quiz: [Quiz, Solution] = [quizzes[0][quizID - 1], quizzes[1][quizID - 1]];
    const answers: AnswerStatus[] = [];
    let quizTime = 0;
    let doesExist = true;

    await make_transaction(() => {
        return new Promise((resolve, reject) => {
            database.all(`SELECT * FROM questionStatus WHERE userID=? AND quizID=? ORDER BY questionNr ASC;`,
                          [req.session.userID, quizID], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (rows.length === 0) {
                    doesExist = false;
                    res.redirect('/');
                    resolve();
                    return;
                }

                database.serialize(() => {
                    for (const row of rows) {
                        const nr = parseInt(row.questionNr, 10);

                        database.get(`SELECT AVG(time) AS avg FROM questionStatus WHERE quizID=? AND questionNr=?;`,
                                      [quizID, nr], (err, avg) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            const answer: AnswerStatus = {
                                nr: nr,
                                question: quiz[0].questions[nr - 1].question,
                                penalty: quiz[0].questions[nr - 1].penalty,
                                userAnswer: row.userAnswer,
                                correctAnswer: quiz[1].answers[nr - 1].toString(),
                                time: row.time,
                                averageTime: avg.avg
                            };

                            answers.push(answer);
                        });
                    }

                    database.get(`SELECT time FROM quizStatus WHERE userID=? AND quizID=?;`,
                                [req.session.userID, quizID], (err, row) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        quizTime = row.time;
                        resolve();
                    });
                });
            });
        });
    });

    if (!doesExist)
        return;

    const status: Status = {
        answers: answers,
        time: quizTime
    };
    res.json(status);
});

interface Highscore {
    username: string,
    time: number,
    correctAnswers: number,
    wrongAnswers: number
}

raportRouter.get('/highscores/:id(\\d)+', async (req, res) => {
    const highscores: Highscore[] = [];
    const quizID = parseInt(req.params.id, 10);

    await make_transaction(() => {
        return new Promise<void>((resolve, reject) => {
            database.all(`SELECT * FROM quizStatus WHERE quizID=? ORDER BY time ASC LIMIT 5;`, [quizID], (err, quizzes) => {
                if (err) {
                    reject(err);
                    return;
                }

                database.serialize(async () => {
                    for (const quiz of quizzes) {
                        const highscore: Highscore = {
                            username: null,
                            time: quiz.time,
                            correctAnswers: 0,
                            wrongAnswers: 0
                        };

                        const quizzesInfo = (await getQuizzes(quiz.userID));
                        const solutions: Solution = quizzesInfo[1][quizID - 1];
                        database.all(`SELECT userAnswer FROM questionStatus WHERE userID=? AND quizID=? ORDER BY questionNr ASC;`,
                                      [quiz.userID, quizID], (err, answers) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            for (let i = 0; i < answers.length; i++) {
                                if (answers[i].userAnswer === solutions.answers[i].toString())
                                    highscore.correctAnswers++;
                                else
                                    highscore.wrongAnswers++;
                            }

                            database.get(`SELECT login FROM users WHERE id=?;`, [quiz.userID], (err, login) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                highscore.username = login.login;
                                highscores.push(highscore);

                                if (highscores.length === quizzes.length)
                                    resolve();
                            });
                        });
                    }
                });
            });
        });
    });

    res.json(highscores);
});