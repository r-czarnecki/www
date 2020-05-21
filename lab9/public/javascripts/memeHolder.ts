import { Meme } from "meme.js";

export class MemeHolder {
    private memes: Meme[];

    public constructor() {
        this.memes = [];
    }

    public add_meme(newMeme: Meme) {
        this.memes.push(newMeme);
    }

    public get_most_expensive() {
        return this.memes.sort((a: Meme, b: Meme) => {
            return b.price - a.price;
        }).slice(0, 3);
    }

    public get_meme(id: number) {
        for (const meme of this.memes)
            if (meme.id == id)
                return meme;

        return null;
    }
}