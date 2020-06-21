import { expect } from 'chai';
import { driver } from 'mocha-webdriver';

const url = 'http://localhost:3000';

async function login(user: string, password: string) {
    await driver.get(url);

    await driver.find('form input[type="text"]').sendKeys(user);
    await driver.find('form input[type="password"]').sendKeys(password);
    await (await driver.find('form input[type="submit"]')).doClick();

    await wait(400);
    expect(await (await driver.find('.loginInfo h1')).getText()).equal(`Zalogowany jako: ${user}`);
}

async function logout() {
    await driver.get(url + '/intro');

    await (await driver.find('#logout')).doClick();

    await wait(400);
    expect(await (await driver.find('h1')).getText()).equal('Zaloguj się');
}

function wait(ms: number) {
    return new Promise(res => setTimeout(res, ms));
}

async function answerQuestion(question: number, answer: string) {
    await (await driver.find(`p[data-question-nr="${question}"]`)).doClick();
    await driver.find('input[type="text"]').sendKeys(answer);
    await (await driver.find('#confirm')).doClick();
}

function stringToSeconds(time: string) {
    let seconds = 0;

    let m = time.match('(\\d+)min');
    if (m !== null)
        seconds += 60 * parseInt(m[1], 10);

    m = time.match('(\\d+)s');
    if (m !== null)
        seconds += parseInt(m[1], 10);

    m = time.match('(\\d+)ms');
    if (m !== null)
        seconds += parseInt(m[1], 10) / 1000;

    return seconds;
}

describe('Logowanie', () => {
    it('Logowanie test1', async function () {
        this.timeout(20000);
        await login('test1', 'test1');
    });

    it('Wylogowanie', async function () {
        this.timeout(20000);
        await logout();
    });

    it('Złe hasło', async function () {
        this.timeout(20000);
        await driver.get(url);

        await driver.find('form input[type="text"]').sendKeys('test2');
        await driver.find('form input[type="password"]').sendKeys('eee');
        await (await driver.find('form input[type="submit"]')).doClick();

        expect(await (await driver.find('.error')).getText()).equal('Błędny login lub hasło.');
    });
});

describe('Zmiana hasła', () => {
    it('Puste hasło', async function () {
        this.timeout(20000);
        await login('test1', 'test1');

        await driver.find('#changePass').doClick();
        await wait(400);

        await driver.find('input[type="submit"]').doClick();
        await wait(400);
        expect(await driver.find('.error').getText()).equal('Hasło nie może być puste.');
    });

    it('Poprawna zmiana hasła', async function () {
        this.timeout(20000);
        await driver.find('input[type="password"]').sendKeys('nowe');
        await driver.find('input[type="submit"]').doClick();
        await wait(400);

        expect(await (await driver.find('h1')).getText()).equal('Zaloguj się');
        await login('test1', 'nowe');
    });

    it("Wiele sesji", async function () {
        this.timeout(20000);
        const cookies = await driver.manage().getCookies();
        await driver.manage().deleteAllCookies();
        await driver.navigate().refresh();
        await wait(400);

        await login('test1', 'nowe');
        await driver.find('#changePass').doClick();
        await wait(400);
        await driver.find('input[type="password"]').sendKeys('test1');
        await driver.find('input[type="submit"]').doClick();
        await driver.navigate().refresh();
        await wait(400);

        expect(await (await driver.find('h1')).getText()).equal('Zaloguj się');
        await driver.manage().deleteAllCookies();
        for (const cookie of cookies)
            await driver.manage().addCookie({ name: cookie.name, value: cookie.value});

        await driver.navigate().refresh();
        await wait(400);
        expect(await (await driver.find('h1')).getText()).equal('Zaloguj się');
    });
});

describe('Quiz', () => {
    it('Próba zakończenia', async function () {
        this.timeout(20000);
        await login('test1', 'test1');
        await (await driver.find('#quiz1')).doClick();
        await wait(400);

        await (await driver.find('#stop')).doClick();
        expect(await (await driver.find('.endingWarning')).getText()).equal('Musisz wypełnić wszystkie pytania, aby zakończyć quiz.');
    });

    it('Anulowanie', async function () {
        this.timeout(20000);
        await answerQuestion(1, '1');
        await answerQuestion(2, '2');
        await (await driver.find('#cancel')).doClick();
        await wait(400);
        expect(await (await driver.find('.loginInfo h1')).getText()).equal('Zalogowany jako: test1');

        await (await driver.find('#quiz1')).doClick();
        await wait(400);
        expect(await (await driver.find('.remaining p')).getText()).equal('8');
    });

    it('Nawigacja', async function () {
        await (await driver.find('p[data-question-nr="3"]')).doClick();
        expect(await (await driver.find('.question h1')).getText()).equal('Pytanie nr: 3');

        await (await driver.find('#previous')).doClick();
        expect(await (await driver.find('.question h1')).getText()).equal('Pytanie nr: 2');

        await (await driver.find('#next')).doClick();
        expect(await (await driver.find('.question h1')).getText()).equal('Pytanie nr: 3');
    });

    it('Rozwiązanie quizu', async function () {
        this.timeout(20000);
        for (let i = 1; i <= 8; i++)
            await answerQuestion(i, i.toString());

        await (await driver.find('#stop')).doClick();
        await wait(400);
        expect(await (await driver.find('.raport h1')).getText()).equal('Wyniki quizu');
    });

    it('Próba ponownego rozwiązania', async function () {
        this.timeout(20000);
        driver.get(url + '/quiz/1');
        await wait(400);

        expect(await (await driver.find('.loginInfo h1')).getText()).equal('Zalogowany jako: test1');
    });
});

describe('Raport', () => {
    let highscores = 0; 
    it('Wyniki test1', async function () {
        this.timeout(20000);
        await (await driver.find('#quiz1')).doClick();
        await wait(400);

        expect(await (await driver.find('.raport h1')).getText()).equal('Wyniki quizu');
        expect((await driver.findAll('.answers div')).length).equal(8);
        highscores = (await driver.findAll('.position')).length;
        expect(highscores).greaterThan(0);
    });

    it('Wyniki test2', async function () {
        this.timeout(40000);
        await logout();
        await login('test2', 'test2');

        await (await driver.find('#quiz1')).doClick();
        await wait(400);

        const answers = [5, 8, 54, 16, 36, 16, 56, 256];
        const times = [1, 2, 3, 4, 4, 3, 2, 1];
        for (let i = 1; i <= 8; i++) {
            await wait(times[i - 1] * 1000);
            await answerQuestion(i, answers[i - 1].toString());
        }

        await (await driver.find('#stop')).doClick();
        await wait(400);

        expect(await (await driver.find('.raport h1')).getText()).equal('Wyniki quizu');
        expect((await driver.findAll('.answers div')).length).equal(8);
        expect((await driver.findAll('.position')).length).greaterThan(highscores);

        const receivedTimes = await driver.findAll('#time');
        for (let i = 0; i < receivedTimes.length; i++) {
            const seconds = stringToSeconds(await receivedTimes[i].getText());
            const diff = Math.abs(times[i] - seconds);
            expect(diff).lessThan(1.5);
        }
    });

    it('Wyjście ze statystyk', async function () {
        await (await driver.find('button')).doClick();
        await wait(400);

        expect(await (await driver.find('.loginInfo h1')).getText()).equal('Zalogowany jako: test2');
    });
});