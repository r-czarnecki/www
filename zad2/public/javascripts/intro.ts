import { fillValue } from './quiz.js';

async function generateQuizzes() {
    const section = document.querySelector('.quizzes') as HTMLElement;
    const data = await fetch('/intro/quizzes');
    const quizzes = await data.json();
    let isFirst = true;

    for (const quiz of quizzes) {
        const div = document.createElement('div');

        if (!isFirst)
            div.innerHTML += `<hr class="dashedhr">`;

        isFirst = false;

        div.innerHTML += `<h2>Quiz ${quiz.id}</h2>`;
        div.innerHTML += `<p>Ilość pytań: ${quiz.questions.length}</p>`;
        let status = 'Zrobione';
        if (!quiz.isSolved)
            status = 'Niezrobione';
        div.innerHTML += `<p>Status: ${status}</p>`;

        if (quiz.isSolved)
            div.innerHTML += `<button type="button" id="quiz${quiz.id}" value="quiz${quiz.id}">Wyniki</button>`;
        else
            div.innerHTML += `<button type="button" id="quiz${quiz.id}" value="quiz${quiz.id}">Rozwiąż</button>`;

        section.appendChild(div);

        if (!quiz.isSolved) {
            (document.querySelector(`#quiz${quiz.id}`) as HTMLButtonElement).addEventListener('click', (ev: MouseEvent) => {
                fetch(`/quiz/${quiz.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({ _csrf: document.cookie.match('CSRF=([^;]*)')[1] })
                }).then(() => {
                    window.location.href = `/quiz/${quiz.id}`;
                });
            });
        }
        else {
            (document.querySelector(`#quiz${quiz.id}`) as HTMLButtonElement).addEventListener('click', (ev: MouseEvent) => {
                window.location.href = `/raport/${quiz.id}`;
            });
        }
    }
}

sessionStorage.clear();

fetch('loginInfo').then(async (data) => {
    const info = await data.json();
    fillValue('.loginInfo h1', '$x', info.login);
});

(document.querySelector('#logout') as HTMLButtonElement).addEventListener('click', (ev: MouseEvent) => {
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({ _csrf: document.cookie.match('CSRF=([^;]*)')[1] })
    }).then(() => {
        window.location.href = '/';
    });
});

(document.querySelector('#changePass') as HTMLButtonElement).addEventListener('click', (ev: MouseEvent) => {
    window.location.href = '/changePassword';
});

generateQuizzes();