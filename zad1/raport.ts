import { quiz, Colors } from "./quizQuestions.js";
import { secondsToString, elapsedTime } from "./clock.js";
import { restartQuiz } from "./quiz.js";
import { saveResults } from "./storage.js";

function generateRaport(question: number) {
    const status = sessionStorage.getItem("Q" + question);
    const mainDiv = document.createElement("div");

    (document.querySelector(".answers") as HTMLElement).appendChild(mainDiv);

    const hr = document.createElement("hr");
    hr.className = "dashedhr";
    mainDiv.appendChild(hr);

    const h3 = document.createElement("h3");
    h3.className = "questionNumRaport";
    h3.textContent = "Pytanie nr: " + (question + 1);
    if(status === "ok")
        h3.style.backgroundColor = "yellowgreen";
    else
        h3.style.backgroundColor = "crimson";
    mainDiv.appendChild(h3);

    const equation = document.createElement("p");
    equation.className = "questionRaport";
    equation.textContent = quiz.questions[question].question;
    equation.style.marginTop = "5px";
    mainDiv.appendChild(equation);

    const br1 = document.createElement("br");
    mainDiv.appendChild(br1);

    if(status !== "ok") {
        const penaltyText = document.createElement("p");
        penaltyText.textContent = "Kara: ";
        mainDiv.appendChild(penaltyText);
        const penalty = document.createElement("p");
        penalty.style.color = Colors.errorColor;
        const penaltyTime = parseInt(quiz.questions[question].penalty, 10);
        penalty.textContent = "+" + secondsToString(penaltyTime);
        penalty.style.marginLeft = "0px";
        mainDiv.appendChild(penalty);
        const br2 = document.createElement("br");
        mainDiv.appendChild(br2);
    }

    const submittedAnswerText = document.createElement("p");
    submittedAnswerText.textContent = "Twoja odpowiedź: ";
    mainDiv.appendChild(submittedAnswerText);
    const submittedAnswer = document.createElement("p");
    submittedAnswer.style.marginLeft = "0px";
    if(status === "ok") {
        submittedAnswer.style.color = Colors.infoColor;
        submittedAnswer.textContent = quiz.questions[question].answer;
    }
    else {
        submittedAnswer.style.color = Colors.errorColor;
        submittedAnswer.textContent = status.substr(5);
    }
    mainDiv.appendChild(submittedAnswer);

    const br3 = document.createElement("br2");
    mainDiv.appendChild(br3);

    const correctAnswerText = document.createElement("p");
    correctAnswerText.textContent = "Poprawna odpowiedź: ";
    mainDiv.appendChild(correctAnswerText);
    const correctAnswer = document.createElement("p");
    correctAnswer.style.marginLeft = "0px";
    correctAnswer.textContent = quiz.questions[question].answer;
    correctAnswer.style.color = Colors.infoColor;
    mainDiv.appendChild(correctAnswer);
}

export function startRaport() {
    (document.querySelector(".introduction") as HTMLElement).style.display = "none";
    (document.querySelector(".test") as HTMLElement).style.display = "none";
    (document.querySelector(".highscores") as HTMLElement).style.display = "none";
    (document.querySelector(".raport") as HTMLElement).style.display = "block";

    const endTime = parseInt(sessionStorage.getItem("endTime"), 10);
    const score = secondsToString(elapsedTime(endTime));
    (document.querySelector(".result p") as HTMLElement).textContent = score;

    for(let i = 0; i < quiz.questions.length; i++)
        generateRaport(i);

    (document.querySelector(".raport button") as HTMLButtonElement).addEventListener("click", (ev: MouseEvent) => {
        saveResults(elapsedTime(endTime));
    });
}