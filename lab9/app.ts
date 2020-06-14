import express from 'express';
import cookieParser from 'cookie-parser';
import { MemeHolder } from './src/memeHolder.js';
import { Meme } from './src/meme.js';

const memes = new MemeHolder();

memes.add_meme(new Meme(1, 'Meme1', 950, 'images/meme1.png'));
memes.add_meme(new Meme(2, 'Meme2', 800, 'images/meme2.jpg'));
memes.add_meme(new Meme(3, 'Meme3', 600, 'images/meme3.jpg'));
memes.add_meme(new Meme(4, 'Meme4', 780, 'images/meme4.jpg'));
memes.add_meme(new Meme(5, 'Meme5', 900, 'images/meme5.jpg'));
memes.add_meme(new Meme(6, 'Elite', 1200, 'images/meme6.jpg'));
memes.add_meme(new Meme(7, 'Platinum', 1100, 'images/meme7.jpg'));
memes.add_meme(new Meme(8, 'Gold', 1000, 'images/meme8.png'));

function get_meme(id: number) {
  return memes.get_meme(id);
}

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug');

app.get('/', (req, res) => {
    const mostExpensive = memes.get_most_expensive();
    res.render('index', { title: 'Meme market', message: 'Hello there!', memes: mostExpensive });
});

app.get('/meme/:memeId', function (req, res) {
    const meme = get_meme(parseInt(req.params.memeId, 10));

    if (meme == null) {
        res.render('404');
        return;
    }
    res.render('meme', {meme: meme});
});

app.post('/meme/:memeId', function (req, res) {
    const meme = get_meme(parseInt(req.params.memeId, 10));
    const price = parseInt(req.body.price, 10);

    if (meme == null) {
        res.render('404');
        return;
    }

    if (!isNaN(price) && price >= 0)
        meme.change_price(price);

    res.render('meme', { meme: meme });
});

app.use((req, res) => {
    res.status(404);
    res.render('404');
});

const server = app.listen(3000, () => {
    console.log(`App is running at http://localhost:3000/ in ${app.get('env')} mode`);
    console.log('Press Ctrl+C to stop.');
});