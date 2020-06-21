import { Colors } from './quizColors.js';
import { secondsToString } from './clock.js';
import { restartQuiz } from './quiz.js';

interface AnswerStatus {
    nr: number,
    question: string,
    penalty: number,
    userAnswer: string
    correctAnswer: string,
    time: number,
    averageTime: number
}

function generateRaport(answer: AnswerStatus) {
    const mainDiv = document.createElement('div');
    const status = (answer.userAnswer === answer.correctAnswer);

    (document.querySelector('.answers') as HTMLElement).appendChild(mainDiv);

    const hr = document.createElement('hr');
    hr.className = 'dashedhr';
    mainDiv.appendChild(hr);

    const h3 = document.createElement('h3');
    h3.className = 'questionNumRaport';
    h3.textContent = 'Pytanie nr: ' + answer.nr;
    if(status)
        h3.style.backgroundColor = 'yellowgreen';
    else
        h3.style.backgroundColor = 'crimson';
    mainDiv.appendChild(h3);

    const equation = document.createElement('p');
    equation.className = 'questionRaport';
    equation.textContent = answer.question;
    equation.style.marginTop = '5px';
    mainDiv.appendChild(equation);

    const br1 = document.createElement('br');
    mainDiv.appendChild(br1);

    if(!status) {
        const penaltyText = document.createElement('p');
        penaltyText.textContent = 'Kara: ';
        mainDiv.appendChild(penaltyText);
        const penalty = document.createElement('p');
        penalty.style.color = Colors.errorColor;
        const penaltyTime = answer.penalty;
        penalty.textContent = '+' + secondsToString(penaltyTime);
        penalty.style.marginLeft = '0px';
        mainDiv.appendChild(penalty);
        const br2 = document.createElement('br');
        mainDiv.appendChild(br2);
    }

    const questionTime = document.createElement('p');
    questionTime.textContent = 'Czas: ' + secondsToString(answer.time / 1000);
    questionTime.id = 'time';
    mainDiv.appendChild(questionTime);
    mainDiv.innerHTML += '<br>';

    mainDiv.innerHTML += `<p>Średni czas wśród użytkowników: ${secondsToString(answer.averageTime / 1000)}</p><br>`;

    const submittedAnswerText = document.createElement('p');
    submittedAnswerText.textContent = 'Twoja odpowiedź: ';
    mainDiv.appendChild(submittedAnswerText);
    const submittedAnswer = document.createElement('p');
    submittedAnswer.style.marginLeft = '0px';
    if(status)
        submittedAnswer.style.color = Colors.infoColor;

    else
        submittedAnswer.style.color = Colors.errorColor;

    submittedAnswer.textContent = answer.userAnswer;
    mainDiv.appendChild(submittedAnswer);

    const br3 = document.createElement('br2');
    mainDiv.appendChild(br3);

    const correctAnswerText = document.createElement('p');
    correctAnswerText.textContent = 'Poprawna odpowiedź: ';
    mainDiv.appendChild(correctAnswerText);
    const correctAnswer = document.createElement('p');
    correctAnswer.style.marginLeft = '0px';
    correctAnswer.textContent = answer.correctAnswer;
    correctAnswer.style.color = Colors.infoColor;
    mainDiv.appendChild(correctAnswer);
}

interface Highscore {
    username: string,
    time: number,
    correctAnswers: number,
    wrongAnswers: number
}

async function generateHighScores() {
    const data = await fetch(`/raport/highscores/${quizID}`);
    const highscores: Highscore[] = await data.json();
    let noScores = true;
    let count = 0;
    const section = document.querySelector('.highscores') as HTMLElement;

    for (const highscore of highscores) {
        count++;
        if(!noScores) {
            const hr = document.createElement('hr');
            hr.className = 'dashedhr';
            section.appendChild(hr);
        }
        else
            noScores = false;

        const position = document.createElement('p');
        position.className = 'position';
        position.textContent = '#' + count + ': ';
        section.appendChild(position);

        section.innerHTML += `<p>Użytkownik: ${highscore.username}</p>`;

        const result = document.createElement('p');
        result.textContent = 'Wynik: ' + secondsToString(highscore.time / 1000);
        result.style.display = 'inline-block';
        section.appendChild(result);

        section.appendChild(document.createElement('br'));

        const correctText = document.createElement('p');
        correctText.className = 'scoreInfo';
        correctText.textContent = 'Poprawne odpowiedzi: ';
        section.appendChild(correctText);
        const correct = document.createElement('p');
        correct.className = 'scoreInfo';
        correct.textContent = highscore.correctAnswers.toString();
        correct.style.marginLeft = '0px';
        correct.style.color = Colors.infoColor;
        section.appendChild(correct);

        const wrongText = document.createElement('p');
        wrongText.className = 'scoreInfo';
        wrongText.textContent = 'Niepoprawne odpowiedzi: ';
        section.appendChild(wrongText);
        const wrong = document.createElement('p');
        wrong.className = 'scoreInfo';
        wrong.textContent = highscore.wrongAnswers.toString();
        wrong.style.color = Colors.errorColor;
        wrong.style.marginLeft = '0px';
        section.appendChild(wrong);
    }

    if(noScores) {
        const info = document.createElement('p');
        info.textContent = 'Brak wyników';
        section.appendChild(info);
    }
}

(document.querySelector('.raport') as HTMLElement).style.display = 'block';

(document.querySelector('.raport button') as HTMLButtonElement).addEventListener('click', (ev: MouseEvent) => {
    restartQuiz();
});

const quizID = window.location.href.match('raport/(\\d)+')[1];
fetch(`/raport/status/${quizID}`).then((data) => {
    data.json().then((answers) => {
        const time = answers.time;
        const score = secondsToString(time / 1000);
        (document.querySelector('.result p') as HTMLElement).textContent = score;

        for(const answer of answers.answers)
            generateRaport(answer);

        generateHighScores();
    });
});

