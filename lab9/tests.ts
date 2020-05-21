import { Builder, Capabilities, Key, error } from "selenium-webdriver";
import { expect } from "chai";
import { driver } from "mocha-webdriver";
import { SeleniumServer } from "selenium-webdriver/remote";
import { fstat } from "fs";
import { cwd } from "process";

const url = 'http://localhost:3000';

async function checkList() {
    const list = await driver.findAll("li");
    expect(list.length).equal(3);

    let lastprice = null;
    for (const elem of list) {
        const priceText = await elem.find("p").getText();
        expect(priceText.slice(0, 7)).equal("Price: ");
        const price = parseInt(priceText.slice(7), 10);

        if (lastprice != null)
            expect(price).lte(lastprice);

        lastprice = price;
    }
}

async function checkTable(values: number[]) {
    const table = await driver.findAll("table td");

    for (let i = 0; i < values.length; i++)
        expect(parseInt(await table[i].getText(), 10)).equal(values[i]);
}

async function getCurrentPrice() {
    const table = await driver.findAll("table td");
    return parseInt(await table[0].getText(), 10);
}

describe("No changes", () => {
    it("Check main page", async function () {
        this.timeout(20000);
        await driver.get(url);

        await checkList();
    });

    it("Return to main page", async function () {
        this.timeout(20000);
        await driver.get(url);

        await (await driver.find("a")).doClick();
        await (await driver.find("a")).doClick();
        await checkList();
    });
});

describe("Wrong input", () => {
    it("No input", async function () {
        this.timeout(20000);
        await driver.get(url);

        await driver.find("a").doClick();
        const currentPrice = await getCurrentPrice();
        await (await driver.find("input[type=submit]")).doClick();
        await checkTable([currentPrice]);
    });

    it("Wrong input", async function () {
        this.timeout(20000);
        await driver.get(url);

        await driver.find("a").doClick();
        const currentPrice = await getCurrentPrice();
        await (await driver.find("input[type=number]")).sendKeys("IHGASDG");
        await (await driver.find("input[type=submit]")).doClick();
        await checkTable([currentPrice]);
    });

    it("Negative price", async function () {
        this.timeout(20000);
        await driver.get(url);

        await driver.find("a").doClick();
        const currentPrice = await getCurrentPrice();
        await (await driver.find("input[type=number]")).sendKeys("-20");
        await (await driver.find("input[type=submit]")).doClick();
        await checkTable([currentPrice]);
    });
});

describe("Correct change", () => {
    it("Change price", async function () {
        this.timeout(20000);
        await driver.get(url);

        await (await driver.findAll("a"))[1].doClick();
        const currentPrice = await getCurrentPrice();
        await (await driver.find("input[type=number]")).sendKeys("100");
        await (await driver.find("input[type=submit]")).doClick();
        await checkTable([100, currentPrice]);

        await (await driver.find("a")).doClick();
        await checkList();
    });

    it("Change and restore", async function () {
        this.timeout(20000);
        await driver.get(url);

        const originalList = [];
        for (const elem of await driver.findAll("li"))
            originalList.push(await (await elem.find("p")).getText());

        await (await driver.findAll("a"))[1].doClick();
        const currentPrice = await getCurrentPrice();
        await (await driver.find("input[type=number]")).sendKeys("200");
        await (await driver.find("input[type=submit]")).doClick();
        await checkTable([200, currentPrice]);

        await (await driver.find("input[type=number]")).sendKeys(currentPrice.toString());
        await (await driver.find("input[type=submit]")).doClick();
        await checkTable([currentPrice, 200, currentPrice]);

        await (await driver.find("a")).doClick();
        await checkList();

        const newList = await driver.findAll("li");
        for (let i = 0; i < newList.length; i++)
            expect(await (await newList[i].find("p")).getText()).equal(originalList[i]);
    });
});