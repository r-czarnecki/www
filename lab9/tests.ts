import { expect } from "chai";
import { Meme } from "./public/javascripts/meme.js";
import { MemeHolder } from "./public/javascripts/memeHolder.js";

function checkMeme(meme: Meme, id: number, name: string, price: number, url: string, priceHistory: number[]) {
    expect(meme.get_id()).equal(id);
    expect(meme.get_name()).equal(name);
    expect(meme.get_price()).equal(price);
    expect(meme.get_url()).equal(url);
    expect(meme.get_price_history()).eql(priceHistory);
}

describe("Meme", () => {
    it("Getters", async () => {
        const meme = new Meme(3, "name", 123, "url");
        checkMeme(meme, 3, "name", 123, "url", [123]);
    });

    it("Change price", async () => {
        const meme = new Meme(3, "name", 123, "url");
        meme.change_price(42);
        expect(meme.get_price_history()).eql([123, 42]);
        expect(meme.get_price()).equal(42);

        meme.change_price(123);
        expect(meme.get_price_history()).eql([123, 42, 123]);
        expect(meme.get_price()).equal(123);
    });
});

describe("MemeHolder", () => {
    it("Add meme", async () => {
        const meme1 = new Meme(2, "eman", 90, "lru");
        const meme2 = new Meme(10, "abc", 400, "def");
        const memeHolder = new MemeHolder();

        expect(memeHolder.get_meme(2)).equal(null);

        memeHolder.add_meme(meme1);
        expect(memeHolder.get_meme(2)).equal(meme1);

        memeHolder.add_meme(meme2);
        expect(memeHolder.get_meme(2)).equal(meme1);
        expect(memeHolder.get_meme(10)).equal(meme2);
    });

    it("Most expensive", async () => {
        const memes = [];
        memes.push(new Meme(1, "name1", 90, "url1"));
        memes.push(new Meme(2, "name2", 0, "url2"));
        memes.push(new Meme(3, "name3", 10, "url3"));
        memes.push(new Meme(4, "name4", 1000, "url4"));
        memes.push(new Meme(5, "name5", 42, "url5"));
        memes.push(new Meme(6, "name6", 24, "url6"));

        const memeHolder = new MemeHolder();
        expect(memeHolder.get_most_expensive()).eql([]);

        memeHolder.add_meme(memes[0]);
        expect(memeHolder.get_most_expensive()).eql([memes[0]]);

        memeHolder.add_meme(memes[1]);
        memeHolder.add_meme(memes[2]);
        expect(memeHolder.get_most_expensive()).eql([memes[0], memes[2], memes[1]]);

        for (const m of memes.slice(2))
            memeHolder.add_meme(m);

        expect(memeHolder.get_most_expensive()).eql([memes[3], memes[0], memes[4]]);
    });
});
