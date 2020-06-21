import { updateClock, secondsToString, elapsedTime } from './clock.js';
import { Colors } from './quizColors.js';
import { fillValue } from './quiz.js';

interface Question {
    nr: number,
    question: string,
    penalty: number
}

interface Quiz {
    id: number,
    questions: Question[],
    isSolved: boolean
}

let quiz: Quiz;

function changeDisplayedQuestion(nr: number) {
    const info = document.querySelector('.confirmInfo') as HTMLParagraphElement;
    if(info !== null)
        info.remove();

    (document.querySelector('.question h1') as HTMLElement).innerText = 'Pytanie nr: ' + (nr + 1).toString();
    (document.querySelector('#penalty') as HTMLElement).innerText = 'Kara za błędną odpowiedź: ' + secondsToString(quiz.questions[nr].penalty);
    (document.querySelector('#equation') as HTMLElement).innerText = quiz.questions[nr].question + ' = ';
    sessionStorage.setItem('currentQuestion', nr.toString());
    setAnswerField();
}

function setAnswerField() {
    const currentQuestion = parseInt(sessionStorage.getItem('currentQuestion'), 10);
    const status = sessionStorage.getItem('Q' + currentQuestion);
    const input = document.querySelector('#answer') as HTMLInputElement;
    const submitted = document.querySelector('#submittedAnswer') as HTMLParagraphElement;
    const confirm = document.querySelector('#confirm') as HTMLInputElement;

    if(status === null) {
        input.style.display = 'initial';
        confirm.removeEventListener('click', findNext);
        confirm.addEventListener('click', confirmButton);
        confirm.textContent = 'Potwierdź';
        input.value = '';
        submitted.style.display = 'none';
    }
    else {
        input.style.display = 'none';
        if(sessionStorage.getItem('remainingQuestions') !== '0') {
            confirm.removeEventListener('click', confirmButton);
            confirm.addEventListener('click', findNext);
            confirm.textContent = 'Następne pytanie';
        }
        else
            confirm.style.display = 'none';

        submitted.style.display = 'inline';
        submitted.style.color = 'blue';
        submitted.textContent = status;
    }
}

function decrementRemaining() {
    const remaining = parseInt(sessionStorage.getItem('remainingQuestions'), 10);
    sessionStorage.setItem('remainingQuestions', (remaining - 1).toString());

    (document.querySelector('.remaining p') as HTMLParagraphElement).textContent = sessionStorage.getItem('remainingQuestions');

    if(remaining - 1 === 0) {
        sessionStorage.setItem('endTime', new Date().getTime().toString());
        const answers = [];
        const quizTime = elapsedTime(parseInt(sessionStorage.getItem('lastAnswer'), 10));

        for (let i = 0; i < quiz.questions.length; i++) {
            const answer = sessionStorage.getItem('Q' + i.toString());
            const answerTime = parseInt(sessionStorage.getItem('Time' + i.toString()), 10);
            answers.push({
                id: i + 1,
                answer: answer,
                time: answerTime / quizTime
            });
        }

        fetch('/quiz/saveQuiz', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ answers: answers, _csrf: document.cookie.match('CSRF=([^;]*)')[1] })
        });
    }
}

function findNext() {
    const currentQuestion = parseInt(sessionStorage.getItem('currentQuestion'), 10);

    for(let i = currentQuestion; i < quiz.questions.length; i++)
        if(sessionStorage.getItem('Q' + i) === null) {
            changeDisplayedQuestion(i);
            return;
        }

    for(let i = 0; i < currentQuestion; i++)
        if(sessionStorage.getItem('Q' + i) === null) {
            changeDisplayedQuestion(i);
            return;
        }
}

function saveQuestionTime(questionNr: number, penalty: number) {
    const lastAnswer = elapsedTime(parseInt(sessionStorage.getItem('lastAnswer'), 10));
    const time = new Date().getTime();
    const currentTime = elapsedTime(time);

    sessionStorage.setItem('Time' + questionNr, (currentTime - lastAnswer + penalty).toString());
    sessionStorage.setItem('lastAnswer', time.toString());
}

function confirmButton(ev: MouseEvent) {
    const elem = ev.target as HTMLButtonElement;
    const input = document.querySelector('#answer') as HTMLInputElement;
    const info = document.querySelector('.confirmInfo') as HTMLParagraphElement;

    if(info !== null)
        info.remove();

    const newNode = document.createElement('p');
    newNode.className = 'confirmInfo';
    newNode.style.marginBottom = '3px';
    newNode.style.marginTop = '10px';
    const currentQuestion = parseInt(sessionStorage.getItem('currentQuestion'), 10);

    if(input.value === '') {
        newNode.textContent = 'Odpowiedź nie może być pusta.';
        newNode.style.color = Colors.warningColor;
    }
    else {
        newNode.textContent = 'Zapisano.';
        newNode.style.color = 'blue';
        sessionStorage.setItem('Q' + currentQuestion, input.value);
        (document.querySelector(`p[data-question-nr='${(currentQuestion + 1)}']`) as HTMLElement).className = 'questionNum ok';
        saveQuestionTime(currentQuestion, 0);
        decrementRemaining();
        setAnswerField();
    }

    (document.querySelector('.question') as HTMLElement).insertBefore(newNode, elem);
}

function questionNav(ev: MouseEvent) {
    const elem = ev.target as HTMLElement;
    const nr = elem.getAttribute('data-question-nr');
    changeDisplayedQuestion(parseInt(nr, 10) - 1);
}

async function endQuiz(ev: MouseEvent) {
    if(sessionStorage.getItem('remainingQuestions') === '0') {
        window.location.href = `/raport/${window.location.href.match('quiz/(\\d)+')[1]}`;
    }
    else {
        const elem = ev.target as HTMLElement;
        const warning = document.querySelector('.endingWarning') as HTMLParagraphElement;
        if(warning !== null)
            return;
        const newNode = document.createElement('p');
        newNode.className = 'endingWarning';
        newNode.textContent = 'Musisz wypełnić wszystkie pytania, aby zakończyć quiz.';
        newNode.style.color = Colors.warningColor;

        (document.querySelector('nav') as HTMLElement).insertBefore(newNode, elem);
        setTimeout(() => {
            newNode.remove();
        }, 2000);
    }
}

async function startQuiz() {
    const data = await fetch('/quiz/getQuiz');
    const received = await data.json();
    quiz = received.quiz;

    if (sessionStorage.getItem('time') === null) {
        sessionStorage.clear();
        sessionStorage.setItem('time', received.time);
        sessionStorage.setItem('lastAnswer', sessionStorage.getItem('time'));
        sessionStorage.setItem('currentQuestion', '0');
        sessionStorage.setItem('remainingQuestions', quiz.questions.length.toString());
    }

    fillValue('#nrOfQuestions', '$x', quiz.questions.length.toString());
    fillValue('.remaining p', '$x', sessionStorage.getItem('remainingQuestions'));
    updateClock();
    setInterval(updateClock, 1000);

    const questionElem: HTMLElement[] = [];
    const questionHolder = document.querySelector('.questionHolder') as HTMLElement;
    for(let i = 0; i < quiz.questions.length; i++) {
        const newNode = document.createElement('p');
        newNode.className = 'questionNum';
        const status = sessionStorage.getItem('Q' + i.toString());
        if (status !== null)
            newNode.className += ' ok';
        else
            newNode.className += ' unsolved';

        newNode.textContent = (i + 1).toString();
        newNode.setAttribute('data-question-nr', (i + 1).toString());
        questionHolder.appendChild(newNode);
        questionElem.push(newNode);
        newNode.addEventListener('click', questionNav);
    }

    changeDisplayedQuestion(parseInt(sessionStorage.getItem('currentQuestion'), 10));

    (document.querySelector('#confirm') as HTMLButtonElement).addEventListener('click', confirmButton);
    (document.querySelector('#previous') as HTMLInputElement).addEventListener('click', (ev: MouseEvent) => {
        const currentQuestion = parseInt(sessionStorage.getItem('currentQuestion'), 10);
        if(currentQuestion !== 0)
            changeDisplayedQuestion(currentQuestion - 1);
    });

    (document.querySelector('#next') as HTMLInputElement).addEventListener('click', (ev: MouseEvent) => {
        const currentQuestion = parseInt(sessionStorage.getItem('currentQuestion'), 10);
        if(currentQuestion !== quiz.questions.length - 1)
            changeDisplayedQuestion(currentQuestion + 1);
    });

    (document.querySelector('#stop') as HTMLElement).addEventListener('click', endQuiz);

    (document.querySelector('#cancel') as HTMLInputElement).addEventListener('click', (ev: MouseEvent) => {
        fetch('/quiz/cancel', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({ _csrf: document.cookie.match('CSRF=([^;]*)')[1] })
        }).then(() => {
            sessionStorage.clear();
            window.location.href = '/intro';
        });
    });
}

startQuiz();