export function restartQuiz() {
    sessionStorage.clear();
    window.location.href = '/';
}

export function fillValue(selector: string, regex: string, newValue: string) {
    const elem = document.querySelector(selector) as HTMLElement;
    elem.innerText = elem.innerText.replace(regex, newValue);
}