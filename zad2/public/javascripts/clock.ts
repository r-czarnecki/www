export function secondsToString(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor(time % 1 * 1000);

    let result = "";

    if(time === 0)
        return "0s";

    if(minutes !== 0)
        result = result + minutes.toString() + "min";

    if(seconds !== 0) {
        if(minutes !== 0)
            result = result + " ";

        result = result + seconds.toString() + "s";
    }

    if (ms !== 0) {
        if (seconds !== 0)
            result = result + " ";

        result = result + ms.toString() + "ms";
    }

    return result;
}

export function elapsedTime(currentTime: number) {
    const startTime = parseInt(sessionStorage.getItem("time"), 10);
    return Math.floor((currentTime - startTime) / 1000);
}

export function updateClock() {
    const newTime = elapsedTime(new Date().getTime());

    if(sessionStorage.getItem("remainingQuestions") !== "0")
        (document.querySelector(".time p") as HTMLElement).textContent = secondsToString(newTime);
}