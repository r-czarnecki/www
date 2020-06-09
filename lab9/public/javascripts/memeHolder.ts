import { Meme } from "meme.js";

export class MemeHolder {
    private memes: Meme[];

    public constructor() {
        this.memes = [];
    }

    public add_meme(newMeme: Meme): void {
        this.memes.push(newMeme);
    }

    public get_most_expensive(): Meme[] {
        return this.memes.sort((a: Meme, b: Meme) => {
            return b.get_price() - a.get_price();
        }).slice(0, 3);
    }

    public get_meme(id: number): Meme {
        for (const meme of this.memes)
            if (meme.get_id() == id)
                return meme;

        return null;
    }
}