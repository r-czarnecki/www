import { quiz } from "./quizQuestions.js";
import { restartQuiz } from "./quiz.js";

interface Answer {
    questionNum: number,
    status: string,
    answer: string,
    time: number
}

interface Info {
    score: number,
    statistics: Answer[]
}

export function saveResults(result: number) {
    const isChecked = (document.querySelector(".raport input") as HTMLInputElement).checked;

    if(sessionStorage.getItem("saved") !== null)
        return;

    sessionStorage.setItem("saved", "true");
    const request = window.indexedDB.open("statistics", 1);

    request.onupgradeneeded = (ev: IDBVersionChangeEvent) => {
        const db = request.result;
        const store = db.createObjectStore("statisticsStore", { autoIncrement: true });
        const index = store.createIndex("score", "score", { unique: false });
    };

    request.onerror = (ev: Event) => {
        console.log("Błąd indexedDB.");
    };

    request.onsuccess = (ev: Event) => {
        const db = request.result;
        const transaction = db.transaction("statisticsStore", "readwrite");
        const store = transaction.objectStore("statisticsStore");

        db.onerror = (event: Event) => {
            console.log("DB error");
        }

        const answers: Answer[] = [];
        for(let i = 0; i < quiz.questions.length; i++) {
            const statusVal = sessionStorage.getItem("Q" + i).substr(0, 5);
            let answerVal = quiz.questions[i].answer;
            if(status === "wrong")
                answerVal = sessionStorage.getItem("Q" + i).substr(5);
            const questionTime = parseInt(sessionStorage.getItem("Time" + i), 10);

            if (isChecked) {
                answers.push({
                    questionNum: i,
                    status: statusVal,
                    answer: answerVal,
                    time: questionTime
                });
            }
            else {
                answers.push({
                    questionNum: i,
                    status: null,
                    answer: null,
                    time: null
                });
            }
        }

        console.log(answers);

        store.put({
            score: result,
            statistics: answers
        });

        transaction.oncomplete = () => {
            db.close();
            restartQuiz();
        };
    };
}

export function getTopResults(howMany: number) {
    return new Promise<Info[]>( resolve => {
        const result = [];
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
                    result.push(cursor.value);

                    if(count < 10)
                        cursor.continue();
                }
            }

            transaction.oncomplete = () => {
                db.close();
                resolve(result);
            }
        };
    });
}