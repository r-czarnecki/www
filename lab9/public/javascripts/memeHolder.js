export class MemeHolder {
    constructor() {
        this.memes = [];
    }
    add_meme(newMeme) {
        this.memes.push(newMeme);
    }
    get_most_expensive() {
        return this.memes.sort((a, b) => {
            return b.price - a.price;
        }).slice(0, 3);
    }
    get_meme(id) {
        for (const meme of this.memes)
            if (meme.id == id)
                return meme;
        return null;
    }
}
