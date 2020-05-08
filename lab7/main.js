function submit(ev) {
    ev.preventDefault();
    var form = document.querySelector(".rezerwacja form");
    for (var i = 0; i <= 4; i++)
        if (form.elements[i].value.trim() === "")
            return;
    if (!isDateOk())
        return;
    var firstButton = document.querySelector(".popup a");
    var setInfo = function (id, text) {
        var info = document.querySelector("#" + id);
        info.textContent = text;
    };
    setInfo("infoImię", "Imi\u0119: " + form.elements[0].value.trim());
    setInfo("infoNazwisko", "Nazwisko: " + form.elements[1].value.trim());
    setInfo("infoZDo", "Z: " + form.elements[2].value + " Do: " + form.elements[3].value);
    setInfo("infoData", "Data: " + form.elements[4].value);
    document.querySelector("#wholePopup").style.display = "block";
}
function clear(ev) {
    ev.preventDefault();
    var form = document.querySelector(".rezerwacja form");
    for (var i = 0; i <= 4; i++) {
        var elem = form.elements[i];
        if (i === 2 || i === 3)
            elem.value = form.elements[i][0].text;
        else
            elem.value = "";
    }
    document.querySelector("#prześlij").setAttribute("disabled", "");
}
function isNameOk(text) {
    return (text.value !== null && text.value.trim() !== "");
}
function isDateOk() {
    var selected = new Date(document.querySelector("#data").value);
    var current = new Date();
    selected.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);
    return selected >= current;
}
function updateSubmitButton(ev) {
    if (isNameOk(document.querySelector("#imię")) &&
        isNameOk(document.querySelector("#nazwisko")) &&
        isDateOk())
        document.querySelector("#prześlij").removeAttribute("disabled");
    else
        document.querySelector("#prześlij").setAttribute("disabled", "");
}
document.querySelector("#wyczyść").addEventListener("click", clear);
document.querySelector("#prześlij").addEventListener("click", submit);
document.querySelector("#anuluj").addEventListener("click", function (ev) {
    ev.preventDefault();
    document.querySelector("#wholePopup").style.display = "none";
});
document.querySelector("#imię").addEventListener("input", updateSubmitButton);
document.querySelector("#nazwisko").addEventListener("input", updateSubmitButton);
document.querySelector("#data").addEventListener("input", updateSubmitButton);
