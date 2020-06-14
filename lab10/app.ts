import express from 'express';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { MemeHolder } from './src/memeHolder.js';
import { Meme } from './src/meme.js';
// import { indexRouter } from './routes/index.js';
import * as sqlite from 'sqlite3';
import { init_db } from './src/db.js';
import session from 'express-session';
import * as crypto from 'crypto';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'fsdwoemcmdfl',
    cookie: {
        maxAge: 15 * 60 * 1000
    }
}));

app.set('view engine', 'pug');

const db = new sqlite.Database('data.db');
const memes = new MemeHolder(db);

const csrfProtection = csurf({ cookie: true });

function get_meme(id: number): Promise<Meme> {
  return memes.get_meme(id);
}

app.get('/', (req, res) => {
    memes.get_most_expensive().then((mostExpensive) => {
        res.render('index', { title: 'Meme market', message: 'Hello there!', memes: mostExpensive, user: req.session.username });
    });
});

app.post('/', (req, res) => {
    const hash = crypto.createHash("sha256").update(req.body.password).digest("hex");
    db.get(`SELECT * FROM users WHERE username='${req.body.username}' AND password='${hash}'`, (err, row) => {
        if (!err && row != undefined)
            req.session.username = req.body.username;
        res.redirect('/');
    });
});

app.get('/logout', (req, res) => {
    delete(req.session.username);
    res.redirect('/');
});

app.get('/meme/:memeId', csrfProtection, function (req, res) {
    get_meme(parseInt(req.params.memeId, 10)).then((meme) => {
        if (meme == null) {
            res.render('404');
            return;
        }
        res.render('meme', {meme: meme, csrfToken: req.csrfToken(), user: req.session.username });
    });
});

app.post('/meme/:memeId', csrfProtection, async function (req, res) {
    get_meme(parseInt(req.params.memeId, 10)).then(async (meme) => {
        const price = parseInt(req.body.price, 10);

        if (meme == null) {
            res.render('404');
            return;
        }

        if (!isNaN(price) && price >= 0 && req.session.username != undefined)
            await meme.change_price(price, true, req.session.username);

        res.render('meme', { meme: meme, csrfToken: req.csrfToken(), user: req.session.username });
    });
});

app.use((req, res) => {
    res.status(404);
    res.render('404');
});

init_db(db, memes).then(() => {
    app.listen(3000, () => {
        console.log(`App is running at http://localhost:3000/ in ${app.get('env')} mode`);
        console.log('Press Ctrl+C to stop.');
    });
});