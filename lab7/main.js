function submit(ev) {
    ev.preventDefault();
    var form = document.querySelector(".rezerwacja form");
    for (var i = 0; i <= 4; i++)
        if (form.elements[i].value === "")
            return;
    if (new Date(document.querySelector("#data").value) < new Date())
        return;
    document.querySelector("#wholePopup").style.display = "contents";
    var firstButton = document.querySelector(".popup a");
    var setInfo = function (id, text) {
        var info = document.querySelector("#" + id);
        info.textContent = text;
    };
    setInfo("infoImię", "Imię: " + form.elements[0].value);
    setInfo("infoNazwisko", "Nazwisko: " + form.elements[1].value);
    setInfo("infoZDo", "Z: " + form.elements[2].value + " Do: " + form.elements[3].value);
    setInfo("infoData", "Data: " + form.elements[4].value);
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
}
document.querySelector("#wyczyść").addEventListener("click", clear);
document.querySelector("#prześlij").addEventListener("click", submit);
document.querySelector("#anuluj").addEventListener("click", function (ev) {
    ev.preventDefault();
    document.querySelector("#wholePopup").style.display = "none";
});
