import express from 'express';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { loginRouter } from './routes/login.js';
import session from 'express-session';
import { database } from './src/db.js';
import { introRouter } from './routes/intro.js';
import { quizRouter } from './routes/quiz.js';
import { raportRouter } from './routes/raport.js';
import connectSqlite from 'connect-sqlite3';

const app = express();

const SQLiteStore = connectSqlite(session);

const csrfProtection = csurf({ cookie: true });

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'uewfscvxzn',
    store: new SQLiteStore()
}));
app.use(express.static('static'));
app.use(express.static('public'));
app.use(csrfProtection);
app.use((req, res, next) => {
    if (req.originalUrl === '/') {
        next();
        return;
    }

    if (req.session.login === undefined) {
        res.redirect('/');
        return;
    }

    database.get(`SELECT lastChange FROM users WHERE login=?;`, [req.session.login], (err, row) => {
        if (row === undefined || err || row.lastChange > req.session.lastChange) {
            delete(req.session.login);
            delete(req.session.lastChange);
            delete(req.session.userID);
            delete(req.session.currentQuiz);
            res.redirect('/');
            return;
        }

        next();
    });
});

app.set('view engine', 'pug');

app.use('/intro', introRouter);
app.use('/quiz', quizRouter);
app.use('/raport', raportRouter);
app.use('/', loginRouter);

app.use((req, res) => {
    res.status(404);
    res.render('404');
});

app.listen(3000, () => {
    console.log(`App is running at http://localhost:3000/ in ${app.get('env')} mode`);
    console.log('Press Ctrl+C to stop.');
});