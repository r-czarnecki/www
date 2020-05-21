import { MemeHolder } from '../public/javascripts/memeHolder.js';
import { Meme } from '../public/javascripts/meme';

var express = require('express');
var router = express.Router();

const memes = new MemeHolder();

memes.add_meme(new Meme(1, 'Meme1', 950, 'images/meme1.png'));
memes.add_meme(new Meme(2, 'Meme2', 800, 'images/meme2.jpg'));
memes.add_meme(new Meme(3, 'Meme3', 600, 'images/meme3.jpg'));
memes.add_meme(new Meme(4, 'Meme4', 780, 'images/meme4.jpg'));
memes.add_meme(new Meme(5, 'Meme5', 900, 'images/meme5.jpg'));
memes.add_meme(new Meme(6, 'Elite', 1200, 'images/meme6.jpg'));
memes.add_meme(new Meme(7, 'Platinum', 1100, 'images/meme7.jpg'));
memes.add_meme(new Meme(8, 'Gold', 1000, 'images/meme8.png'));

function get_meme(id) {
  return memes.get_meme(id);
}

/* GET home page. */
router.get('/', function(req, res, next) {
  const mostExpensive = memes.get_most_expensive();
  res.render('index', { title: 'Meme market', message: 'Hello there!', memes: mostExpensive });
});

router.get('/meme/:memeId', function (req, res) {
  let meme = get_meme(req.params.memeId);
  res.render('meme', {meme: meme});
});

router.post('/meme/:memeId', function (req, res) {
  let meme = get_meme(req.params.memeId);
  let price = req.body.price;

  meme.change_price(price);
  console.log(req.body.price);
  res.render('meme', { meme: meme })
});

module.exports = router;
