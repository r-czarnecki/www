function submit(ev: MouseEvent) {
    ev.preventDefault();
    const form = document.querySelector(".rezerwacja form") as HTMLFormElement;

    for (let i = 0; i <= 4; i++)
        if ((form.elements[i] as HTMLInputElement).value === "")
            return;

    if(new Date((document.querySelector("#data") as HTMLInputElement).value) < new Date())
        return;

    (document.querySelector("#wholePopup") as HTMLElement).style.display = "contents";
    const firstButton = document.querySelector(".popup a") as HTMLElement;

    const setInfo = (id: string, text: string) => {
        const info = document.querySelector("#" + id) as HTMLElement;
        info.textContent = text;
    }

    setInfo("infoImię", "Imię: " + (form.elements[0] as HTMLInputElement).value);
    setInfo("infoNazwisko", "Nazwisko: " + (form.elements[1] as HTMLInputElement).value);
    setInfo("infoZDo", "Z: " + (form.elements[2] as HTMLInputElement).value + " Do: " + (form.elements[3] as HTMLInputElement).value);
    setInfo("infoData", "Data: " + (form.elements[4] as HTMLInputElement).value);
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
}

(document.querySelector("#wyczyść") as HTMLElement).addEventListener("click", clear);
(document.querySelector("#prześlij") as HTMLElement).addEventListener("click", submit);
(document.querySelector("#anuluj") as HTMLElement).addEventListener("click", (ev: MouseEvent) => {
    ev.preventDefault();
    (document.querySelector("#wholePopup") as HTMLElement).style.display = "none";
});
