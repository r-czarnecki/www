import { startIntroduction } from "./intro.js";
import { quiz } from "./quizQuestions.js";
import { startQuiz } from "./mainQuiz.js";
import { startRaport } from "./raport.js";

export function restartQuiz() {
    sessionStorage.clear();
    window.location.reload();
}

export function fillValue(selector: string, regex: string, newValue: string) {
    const elem = document.querySelector(selector) as HTMLElement;
    elem.innerText = elem.innerText.replace(regex, newValue);
}

if(sessionStorage.getItem("view") === null)
    sessionStorage.setItem("view", "intro");

if(sessionStorage.getItem("view") === "intro")
    startIntroduction();
else if(sessionStorage.getItem("view") === "start")
    startQuiz();
else if(sessionStorage.getItem("view") === "raport")
    startRaport();