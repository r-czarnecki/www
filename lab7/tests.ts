import {Builder, Capabilities, Key, error} from "selenium-webdriver";
import {expect} from "chai";
import {driver} from "mocha-webdriver";
import { SeleniumServer } from "selenium-webdriver/remote";
import { fstat } from "fs";
import { cwd } from "process";

const filepath = `file://${process.cwd()}/index.html`;
const currentDate = new Date();

async function checkIfEmpty() {
    expect(await driver.find("#imię").getAttribute("value")).equal("");
    expect(await driver.find("#nazwisko").getAttribute("value")).equal("");
    expect(await driver.find("#skąd").getAttribute("value")).equal("A1");
    expect(await driver.find("#dokąd").getAttribute("value")).equal("B1");
    expect(await driver.find("#data").getAttribute("value")).equal("");
}

async function inputData(name: string, surname: string, from: string, to: string, date: string) {
    await driver.find("#imię").sendKeys(name);
    await driver.find("#nazwisko").sendKeys(surname);
    await driver.find(`#skąd option[value=${from}]`).doClick();
    await driver.find(`#dokąd option[value=${to}]`).doClick();
    await driver.find("#data").sendKeys(date);
}

async function checkPopup(name: string, surname: string, from: string, to: string, date: string) {
    expect(await driver.find("#wholePopup").getCssValue("display")).equal("block");
    expect(await driver.find("#infoImię").getText()).equal(`Imię: ${name}`);
    expect(await driver.find("#infoNazwisko").getText()).equal(`Nazwisko: ${surname}`);
    expect(await driver.find("#infoZDo").getText()).equal(`Z: ${from} Do: ${to}`);
    expect(await driver.find("#infoData").getText()).equal(`Data: ${date}`);
}

describe("Empty data", () => {
    it("No data entered", async function () {
        this.timeout(20000);
        await driver.get(filepath)

        await checkIfEmpty();
    });

    it("Data cleared", async function () {
        this.timeout(20000);
        await driver.get(filepath);

        await inputData("AAAA", "BBBB", "A3", "B2", `${currentDate.getFullYear() + 10}-03-14`);
        await driver.find("#wyczyść").doClick();
        await checkIfEmpty();
    });

    it("Submit button off", async function () {
        this.timeout(20000);
        await driver.get(filepath);
        currentDate.toLocaleDateString()

        await driver.find("#prześlij").doClick();
        expect(await driver.find("#wholePopup").getCssValue("display")).equal("none");
    });
});

describe("Submit data", async () => {
    it("Correct submit", async function () {
        this.timeout(20000);
        await driver.get(filepath);

        await inputData("ImIę", "NazwiSKO", "A2", "B1", `${currentDate.getFullYear() + 3}-01-01`);
        await driver.find("#prześlij").doClick();
        await checkPopup("ImIę", "NazwiSKO", "A2", "B1", `${currentDate.getFullYear() + 3}-01-01`);
    });

    it("Wrong date", async function () {
        this.timeout(20000);
        await driver.get(filepath);

        await inputData("VA", "N", "A1", "B3", `${currentDate.getFullYear() - 10}-01-01`);
        await driver.find("#prześlij").doClick();
        expect(await driver.find("#wholePopup").getCssValue("display")).equal("none");
    });

    it("Cancel", async function () {
        this.timeout(20000);
        await driver.get(filepath);

        const date = `${currentDate.getFullYear() + 30}-12-06`;
        await inputData("MEIDNC", "WOFGRE", "A1", "B2", date);
        await driver.find("#prześlij").doClick();
        await checkPopup("MEIDNC", "WOFGRE", "A1", "B2", date);
        await driver.find("#anuluj").doClick();
        expect(await driver.find("#wholePopup").getCssValue("display")).equal("none");
        expect(await driver.find("#imię").getAttribute("value")).equal("MEIDNC");
        expect(await driver.find("#nazwisko").getAttribute("value")).equal("WOFGRE");
        expect(await driver.find("#skąd").getAttribute("value")).equal("A1");
        expect(await driver.find("#dokąd").getAttribute("value")).equal("B2");
        expect(await driver.find("#data").getAttribute("value")).equal(date);
    });

    it("Non-clickable links", async function () {
        this.timeout(20000);
        await driver.get(filepath);

        await inputData("UQIE", "RAXCA", "A3", "B3", `${currentDate.getFullYear() + 1000}-05-24`);
        await driver.find("#prześlij").doClick();

        try {
            await driver.find(".loty a").doClick().then(() => { expect.fail(); });
        } catch(e) {
            if (e instanceof error.ElementClickInterceptedError)
                return;
            expect.fail();
        }
    });
});