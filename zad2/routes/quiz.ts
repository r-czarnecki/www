import express from 'express';
import { getQuizzes, database, make_transaction, isSolved, Solution, Quiz, isCorrectNumber } from '../src/db';

export const quizRouter = express.Router();

quizRouter.get('/:id(\\d+)', async (req, res) => {
    if (req.session.currentQuiz !== undefined &&
        req.session.currentQuiz !== req.params.id) {
        res.redirect(`/quiz/${req.session.currentQuiz}`);
        return;
    }

    if (req.session.currentQuiz === undefined) {
        res.redirect('/');
        return;
    }

    res.cookie('CSRF', req.csrfToken(), { secure: true });
    res.sendFile(`${process.cwd()}/static/quiz.html`);
});

quizRouter.post('/:id(\\d)+', async (req, res) => {
    if (req.session.currentQuiz !== undefined ||
        !await isCorrectNumber(parseInt(req.params.id, 10)) ||
        await isSolved(req.session.userID, parseInt(req.params.id, 10))) {
        res.end()
        return;
    }

    req.session.currentQuiz = req.params.id;
    req.session.startTime = Date.now();
    res.end();
});

quizRouter.post('/cancel', (req, res) => {
    delete(req.session.currentQuiz);
    res.end();
});

quizRouter.get('/getQuiz', async (req, res) => {
    const quizzes = await getQuizzes(req.session.userID);
    const current = parseInt(req.session.currentQuiz, 10);
    res.json({ quiz: quizzes[0][current - 1], time: req.session.startTime });
});

interface Answer {
    id: number,
    answer: string,
    time: number
}

quizRouter.post('/saveQuiz', async (req, res) => {
    const quizTime = Date.now() - req.session.startTime;
    const quizID = req.session.currentQuiz;
    const quizzesInfo = await getQuizzes(req.session.userID);
    const quizInfo: [Quiz, Solution] = [quizzesInfo[0][quizID - 1], quizzesInfo[1][quizID - 1]];

    if (quizID === undefined || req.body.answers === undefined) {
        res.end();
        return;
    }

    for (const answer of req.body.answers)
        if (answer.id === undefined || answer.time === undefined || answer.answer === undefined) {
            res.end();
            return;
        }

    delete(req.session.currentQuiz);
    delete(req.session.startTime);

    const saveAnswers = () => {
        return new Promise<void>((resolve, reject) => {
            database.get(`SELECT * FROM quizStatus WHERE userID=? AND quizID=?;`, [req.session.userID, quizID], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (row !== undefined) {
                    resolve();
                    return;
                }

                let wholeTime = quizTime;

                database.serialize(async () => {
                    for (let i = 0; i < req.body.answers.length; i++) {
                        const answer: Answer = req.body.answers[i];
                        let penalty = 0;
                        if (answer.answer !== quizInfo[1].answers[i].toString())
                            penalty = quizInfo[0].questions[i].penalty * 1000;

                        wholeTime += penalty;
                        database.run(`INSERT OR REPLACE INTO questionStatus (userID, quizID, questionNr, time, userAnswer) VALUES (?, ?, ?, ?, ?)`,
                                        [req.session.userID, quizID, answer.id, answer.time * quizTime + penalty, answer.answer], (err) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                        });
                    }

                    database.run(`INSERT INTO quizStatus (userID, quizID, time) VALUES (?, ?, ?);`, [req.session.userID, quizID, wholeTime], (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve();
                    });
                });
            });
        });
    };

    make_transaction(saveAnswers);
    res.end();
});