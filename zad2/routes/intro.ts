import express from 'express';
import { getQuizzes } from '../src/db';

export const introRouter = express.Router();

introRouter.get('/', (req, res) => {
    if (req.session.currentQuiz !== undefined) {
        res.redirect(`/quiz/${req.session.currentQuiz}`);
        return;
    }

    res.cookie('CSRF', req.csrfToken(), { secure: true });
    res.sendFile(`${process.cwd()}/static/introduction.html`);
});

introRouter.get('/quizzes', async (req, res) => {
    const quizzes = await getQuizzes(parseInt(req.session.userID, 10));
    res.json(quizzes[0]);
});