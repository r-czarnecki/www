import { quiz, Colors } from "./quizQuestions.js";
import { secondsToString } from "./clock.js";
import { fillValue } from "./quiz.js";
import { getTopResults } from "./storage.js";

function generateHighScores() {
    let noScores = true;
    let count = 0;
    getTopResults(10).then( topResults => {
    const highscores = document.querySelector(".highscores") as HTMLElement;

    for (const res of topResults) {
        count++;
        if(!noScores) {
            const hr = document.createElement("hr");
            hr.className = "dashedhr";
            highscores.appendChild(hr);
        }
        else
            noScores = false;

        const position = document.createElement("p");
        position.className = "position";
        position.textContent = "#" + count + ": ";
        highscores.appendChild(position);

        const result = document.createElement("p");
        result.textContent = "Wynik: " + secondsToString(res.score);
        result.style.display = "inline-block";
        highscores.appendChild(result);

        if (res.statistics[0].status !== null) {
            highscores.appendChild(document.createElement("br"));
            let ok = 0;
            for(const i of res.statistics)
                if(i.status === "ok")
                    ok++;

            const correctText = document.createElement("p");
            correctText.className = "scoreInfo";
            correctText.textContent = "Poprawne odpowiedzi: ";
            highscores.appendChild(correctText);
            const correct = document.createElement("p");
            correct.className = "scoreInfo";
            correct.textContent = ok.toString();
            correct.style.marginLeft = "0px";
            correct.style.color = Colors.infoColor;
            highscores.appendChild(correct);

            const wrongText = document.createElement("p");
            wrongText.className = "scoreInfo";
            wrongText.textContent = "Niepoprawne odpowiedzi: ";
            highscores.appendChild(wrongText);
            const wrong = document.createElement("p");
            wrong.className = "scoreInfo";
            wrong.textContent = (res.statistics.length - ok).toString();
            wrong.style.color = Colors.errorColor;
            wrong.style.marginLeft = "0px";
            highscores.appendChild(wrong);
        }
    }

    if(noScores) {
        const info = document.createElement("p");
        info.textContent = "Brak wyników";
        highscores.appendChild(info);
    }
    });
}

export function startIntroduction() {
    fillValue("#nrOfQuestions", "$x", quiz.questions.length);
    (document.querySelector("button") as HTMLButtonElement).addEventListener("click", (ev: MouseEvent) => {
        sessionStorage.clear();
        sessionStorage.setItem("view", "start");
        sessionStorage.setItem("time", new Date().getTime().toString());
        sessionStorage.setItem("lastAnswer", sessionStorage.getItem("time"));
        sessionStorage.setItem("currentQuestion", "0");
        sessionStorage.setItem("remainingQuestions", quiz.questions.length.toString());
        window.location.reload();
    });

    generateHighScores();
}