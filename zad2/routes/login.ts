import express from 'express';
import { database } from '../src/db';
import * as crypto from 'crypto';
import { changePassword } from '../src/db.js';

export const loginRouter = express.Router();

loginRouter.get('/', (req, res) => {
    if (req.session.login !== undefined) {
        res.redirect('/intro');
        return;
    }

    if (req.session.error !== undefined) {
        const error = req.session.error;
        delete(req.session.error);
        res.render('login', { error: error, csrfToken: req.csrfToken() });
    }
    else
        res.render('login', { csrfToken: req.csrfToken() });
});

loginRouter.post('/', (req, res) => {
    const hash = crypto.createHash('sha256').update(req.body.password).digest('hex');

    database.get(`SELECT * FROM users WHERE login=? AND password=?;`, [req.body.login, hash], (err, row) => {
        if (err || row === undefined) {
            req.session.error = 'Błędny login lub hasło.';
            res.redirect('/');
            return;
        }

        req.session.login = req.body.login;
        req.session.lastChange = row.lastChange;
        req.session.userID = row.id;
        res.redirect('/intro');
    });
});

loginRouter.get('/loginInfo', (req, res) => {
    res.json({login: req.session.login});
});

loginRouter.post('/logout', (req, res) => {
    delete(req.session.login);
    delete(req.session.lastChange);
    delete(req.session.userID);
    delete(req.session.currentQuiz);
    res.end();
});

loginRouter.get('/changePassword', (req, res) => {
    res.render('change', { csrfToken: req.csrfToken() });
});

loginRouter.post('/changePassword', (req, res) => {
    if (req.body.newPassword === '') {
        res.render('change', {
            error: 'Hasło nie może być puste.',
            csrfToken: req.csrfToken()
        });
        return;
    }

    changePassword(req.session.login, req.body.newPassword);
    res.redirect('/');
});