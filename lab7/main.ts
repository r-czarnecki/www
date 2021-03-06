function submit(ev: MouseEvent) {
    ev.preventDefault();
    const form = document.querySelector(".rezerwacja form") as HTMLFormElement;

    for (let i = 0; i <= 4; i++)
        if ((form.elements[i] as HTMLInputElement).value.trim() === "")
            return;

    if (!isDateOk())
        return;

    const firstButton = document.querySelector(".popup a") as HTMLElement;

    const setInfo = (id: string, text: string) => {
        const info = document.querySelector("#" + id) as HTMLElement;
        info.textContent = text;
    }

    setInfo("infoImię", `Imię: ${(form.elements[0] as HTMLInputElement).value.trim()}`);
    setInfo("infoNazwisko", `Nazwisko: ${(form.elements[1] as HTMLInputElement).value.trim()}`);
    setInfo("infoZDo", `Z: ${(form.elements[2] as HTMLInputElement).value} Do: ${(form.elements[3] as HTMLInputElement).value}`);
    setInfo("infoData", `Data: ${(form.elements[4] as HTMLInputElement).value}`);
    (document.querySelector("#wholePopup") as HTMLElement).style.display = "block";
}

function clear(ev: MouseEvent) {
    ev.preventDefault();
    const form = document.querySelector(".rezerwacja form") as HTMLFormElement;

    for (let i = 0; i <= 4; i++) {
        const elem = form.elements[i] as HTMLInputElement;
        if (i === 2 || i === 3)
            elem.value = ((form.elements[i] as HTMLSelectElement)[0] as HTMLOptionElement).text;
        else
            elem.value = "";
    }

    (document.querySelector("#prześlij") as HTMLButtonElement).setAttribute("disabled", "");
}

function isNameOk(text: HTMLInputElement) {
    return (text.value !== null && text.value.trim() !== "");
}

function isDateOk() {
    const selected = new Date((document.querySelector("#data") as HTMLInputElement).value);
    const current = new Date();
    selected.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);
    return selected >= current;
}

function updateSubmitButton(ev: Event) {
    if(isNameOk(document.querySelector("#imię") as HTMLInputElement) &&
       isNameOk(document.querySelector("#nazwisko") as HTMLInputElement) &&
       isDateOk())
       (document.querySelector("#prześlij") as HTMLButtonElement).removeAttribute("disabled");
    else
        (document.querySelector("#prześlij") as HTMLButtonElement).setAttribute("disabled", "");
}

(document.querySelector("#wyczyść") as HTMLElement).addEventListener("click", clear);
(document.querySelector("#prześlij") as HTMLElement).addEventListener("click", submit);
(document.querySelector("#anuluj") as HTMLElement).addEventListener("click", (ev: MouseEvent) => {
    ev.preventDefault();
    (document.querySelector("#wholePopup") as HTMLElement).style.display = "none";
});


(document.querySelector("#imię") as HTMLInputElement).addEventListener("input", updateSubmitButton);
(document.querySelector("#nazwisko") as HTMLInputElement).addEventListener("input", updateSubmitButton);
(document.querySelector("#data") as HTMLInputElement).addEventListener("input", updateSubmitButton);