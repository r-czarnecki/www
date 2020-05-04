import { quiz } from "./quizQuestions.js";

export function saveResults(result: number) {
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

        interface Answer {
            questionNum: number,
            status: string,
            answer: string
        }

        const answers: Answer[] = [];
        for(let i = 0; i < quiz.questions.length; i++) {
            const statusVal = sessionStorage.getItem("Q" + i).substr(0, 5);
            let answerVal = quiz.questions[i].answer;
            if(status === "wrong")
                answerVal = sessionStorage.getItem("Q" + i).substr(5);

            answers.push({
                questionNum: i,
                status: statusVal,
                answer: answerVal
            });
        }

        store.put({
            score: result,
            statistics: answers
        });

        transaction.oncomplete = () => {
            db.close();
        };
    };
}