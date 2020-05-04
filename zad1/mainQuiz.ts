import { updateClock, secondsToString } from "./clock.js";
import { quiz, Colors } from "./quizQuestions.js";
import { restartQuiz, fillValue } from "./quiz.js";

function changeDisplayedQuestion(nr: number) {
    const info = document.querySelector(".confirmInfo") as HTMLParagraphElement;
    if(info !== null)
        info.remove();

    (document.querySelector(".question h1") as HTMLElement).innerText = "Pytanie nr: " + (nr + 1).toString();
    (document.querySelector("#penalty") as HTMLElement).innerText = "Kara za błędną odpowiedź: " + secondsToString(parseInt(quiz.questions[nr].penalty, 10));
    (document.querySelector("#equation") as HTMLElement).innerText = quiz.questions[nr].question + " = ";
    sessionStorage.setItem("currentQuestion", nr.toString());
    setAnswerField();
}

function setAnswerField() {
    const currentQuestion = parseInt(sessionStorage.getItem("currentQuestion"), 10);
    const status = sessionStorage.getItem("Q" + currentQuestion);
    const input = document.querySelector("#answer") as HTMLInputElement;
    const submitted = document.querySelector("#submittedAnswer") as HTMLParagraphElement;
    const confirm = document.querySelector("#confirm") as HTMLInputElement;

    if(status === null) {
        input.style.display = "initial";
        confirm.removeEventListener("click", findNext);
        confirm.addEventListener("click", confirmButton);
        confirm.textContent = "Potwierdź";
        input.value = "";
        submitted.style.display = "none";
    }
    else {
        input.style.display = "none";
        if(sessionStorage.getItem("remainingQuestions") !== "0") {
            confirm.removeEventListener("click", confirmButton);
            confirm.addEventListener("click", findNext);
            confirm.textContent = "Następne pytanie";
        }
        else
            confirm.style.display = "none";

        submitted.style.display = "inline";
        if(status === "ok") {
            submitted.style.color = Colors.infoColor;
            submitted.textContent = quiz.questions[currentQuestion].answer;
        }
        else {
            submitted.style.color = Colors.errorColor;
            submitted.textContent = status.substr(5);
        }
    }
}

function decrementRemaining() {
    const remaining = parseInt(sessionStorage.getItem("remainingQuestions"), 10);
    sessionStorage.setItem("remainingQuestions", (remaining - 1).toString());

    (document.querySelector(".remaining p") as HTMLParagraphElement).textContent = sessionStorage.getItem("remainingQuestions");

    if(remaining - 1 === 0)
        sessionStorage.setItem("endTime", new Date().getTime().toString());
}

function findNext() {
    const currentQuestion = parseInt(sessionStorage.getItem("currentQuestion"), 10);

    for(let i = currentQuestion; i < quiz.questions.length; i++)
        if(sessionStorage.getItem("Q" + i) === null) {
            changeDisplayedQuestion(i);
            return;
        }

    for(let i = 0; i < currentQuestion; i++)
        if(sessionStorage.getItem("Q" + i) === null) {
            changeDisplayedQuestion(i);
            return;
        }
}

function confirmButton(ev: MouseEvent) {
    const elem = ev.target as HTMLButtonElement;
    const input = document.querySelector("#answer") as HTMLInputElement;
    const info = document.querySelector(".confirmInfo") as HTMLParagraphElement;

    if(info !== null)
        info.remove();

    const newNode = document.createElement("p");
    newNode.className = "confirmInfo";
    newNode.style.marginBottom = "3px";
    newNode.style.marginTop = "10px";
    const currentQuestion = parseInt(sessionStorage.getItem("currentQuestion"), 10);

    if(input.value === "") {
        newNode.textContent = "Odpowiedź nie może być pusta.";
        newNode.style.color = Colors.warningColor;
    }
    else if(input.value === quiz.questions[currentQuestion].answer.toString()) {
        newNode.textContent = "To jest poprawna odpowiedź!";
        newNode.style.color = Colors.infoColor;
        sessionStorage.setItem("Q" + currentQuestion, "ok");
        (document.querySelector("p[data-question-nr='" + (currentQuestion + 1) + "']") as HTMLElement).className = "questionNum ok";

        decrementRemaining();
        setAnswerField();
    }
    else {
        newNode.textContent = "To jest zła odpowiedź!";
        newNode.style.color = Colors.errorColor;
        sessionStorage.setItem("Q" + currentQuestion, "wrong" + input.value);
        (document.querySelector("p[data-question-nr='" + (currentQuestion + 1) + "']") as HTMLElement).className = "questionNum wrong";

        const time = parseInt(sessionStorage.getItem("time"), 10);
        sessionStorage.setItem("time", (time - quiz.questions[currentQuestion].penalty * 1000).toString());
        updateClock();

        decrementRemaining();
        setAnswerField();
    }

    (document.querySelector(".question") as HTMLElement).insertBefore(newNode, elem);
}

function questionNav(ev: MouseEvent) {
    const elem = ev.target as HTMLElement;
    const nr = elem.getAttribute("data-question-nr");
    changeDisplayedQuestion(parseInt(nr, 10) - 1);
}

function endQuiz(ev: MouseEvent) {
    if(sessionStorage.getItem("remainingQuestions") === "0") {
        sessionStorage.setItem("view", "raport");
        window.location.reload();
    }
    else {
        const elem = ev.target as HTMLElement;
        const warning = document.querySelector(".endingWarning") as HTMLParagraphElement;
        if(warning !== null)
            return;
        const newNode = document.createElement("p");
        newNode.className = "endingWarning";
        newNode.textContent = "Musisz wypełnić wszystkie pytania, aby zakończyć quiz.";
        newNode.style.color = Colors.warningColor;

        (document.querySelector("nav") as HTMLElement).insertBefore(newNode, elem);
        setTimeout(() => {
            newNode.remove();
        }, 2000);
    }
}

export function startQuiz() {
    (document.querySelector(".introduction") as HTMLElement).className += " introGrid";
    (document.querySelector("body") as HTMLElement).className += " bodyGrid";
    (document.querySelector(".test") as HTMLElement).style.display = "contents";
    (document.querySelector(".highscores") as HTMLElement).style.display = "none";
    (document.querySelector("#start") as HTMLElement).style.display = "none";
    fillValue("#nrOfQuestions", "$x", quiz.questions.length);
    fillValue(".remaining p", "$x", sessionStorage.getItem("remainingQuestions"));
    updateClock();
    setInterval(updateClock, 1000);

    const questionElem: HTMLElement[] = [];
    const questionHolder = document.querySelector(".questionHolder") as HTMLElement;
    for(let i = 0; i < quiz.questions.length; i++) {
        const newNode = document.createElement("p");
        newNode.className = "questionNum";
        const status = sessionStorage.getItem("Q" + i.toString());
        if(status === "ok")
            newNode.className += " ok";
        else if(status !== null && status.substr(0, 5) === "wrong")
            newNode.className += " wrong";
        else
            newNode.className += " unsolved";

        newNode.textContent = (i + 1).toString();
        newNode.setAttribute("data-question-nr", (i + 1).toString());
        questionHolder.appendChild(newNode);
        questionElem.push(newNode);
        newNode.addEventListener("click", questionNav);
    }

    changeDisplayedQuestion(parseInt(sessionStorage.getItem("currentQuestion"), 10));

    (document.querySelector("#confirm") as HTMLButtonElement).addEventListener("click", confirmButton);
    (document.querySelector("#previous") as HTMLInputElement).addEventListener("click", (ev: MouseEvent) => {
        const currentQuestion = parseInt(sessionStorage.getItem("currentQuestion"), 10);
        if(currentQuestion !== 0)
            changeDisplayedQuestion(currentQuestion - 1);
    });

    (document.querySelector("#next") as HTMLInputElement).addEventListener("click", (ev: MouseEvent) => {
        const currentQuestion = parseInt(sessionStorage.getItem("currentQuestion"), 10);
        if(currentQuestion !== quiz.questions.length - 1)
            changeDisplayedQuestion(currentQuestion + 1);
    });

    (document.querySelector("#stop") as HTMLElement).addEventListener("click", endQuiz);

    (document.querySelector("#cancel") as HTMLInputElement).addEventListener("click", (ev: MouseEvent) => {
        restartQuiz();
    });
}