import { Meme } from "meme.js";

export class MemeHolder {
    private memes: Meme[];

    public constructor() {
        this.memes = [];
    }

    public add_meme(new_meme: Meme) {
        this.memes.push(new_meme);
    }

    public get_most_expensive() {
        return this.memes.sort((a: Meme, b: Meme) => {
            return b.price - a.price;
        }).slice(0, 3);
    }

    public get_meme(id: number) {
        for (let meme of this.memes)
            if (meme.id == id)
                return meme;

        return null;
    }
}