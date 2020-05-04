import { quiz, Colors } from "./quizQuestions.js";
import { secondsToString } from "./clock.js";
import { fillValue } from "./quiz.js";

function generateHighScores() {
    let noScores = true;
    const request = window.indexedDB.open("statistics", 1);
    const highscores = document.querySelector(".highscores") as HTMLElement;

    request.onupgradeneeded = (ev: IDBVersionChangeEvent) => {
        const db = request.result;
        const store = db.createObjectStore("statisticsStore", { autoIncrement: true });
        const index = store.createIndex("score", "score", { unique: false });
    };

    request.onerror = (ev: Event) => {
        console.log("Błąd indexedDB.");
    };

    interface CursorEventTarget extends EventTarget {
        result: IDBCursorWithValue;
    }

    interface CursorEvent extends Event {
        target: CursorEventTarget;
    }

    request.onsuccess = (ev: Event) => {
        const db = request.result;
        let count = 0;
        const transaction = db.transaction("statisticsStore", "readwrite");
        const store = transaction.objectStore("statisticsStore");
        const index = store.index("score");

        index.openCursor().onsuccess = (event: CursorEvent) => {
            const cursor = event.target.result;
            if(cursor) {
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
                result.textContent = "Wynik: " + secondsToString(cursor.value.score);
                result.style.display = "inline-block";
                highscores.appendChild(result);

                highscores.appendChild(document.createElement("br"));
                let ok = 0;
                for(const i of cursor.value.statistics)
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
                wrong.textContent = (cursor.value.statistics.length - ok).toString();
                wrong.style.color = Colors.errorColor;
                wrong.style.marginLeft = "0px";
                highscores.appendChild(wrong);

                if(count < 10)
                    cursor.continue();
            }
        }

        transaction.oncomplete = () => {
            if(noScores) {
                const info = document.createElement("p");
                info.textContent = "Brak wyników";
                highscores.appendChild(info);
            }
            db.close();
        }
    };
}

export function startIntroduction() {
    fillValue("#nrOfQuestions", "$x", quiz.questions.length);
    (document.querySelector("button") as HTMLButtonElement).addEventListener("click", (ev: MouseEvent) => {
        sessionStorage.clear();
        sessionStorage.setItem("view", "start");
        sessionStorage.setItem("time", new Date().getTime().toString());
        sessionStorage.setItem("currentQuestion", "0");
        sessionStorage.setItem("remainingQuestions", quiz.questions.length.toString());
        window.location.reload();
    });

    generateHighScores();
}