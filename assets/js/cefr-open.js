const container = document.getElementById("cards");

// Функция для открытия модального окна верификации
function openVerification(mockNumber) {
    if (window.opener && window.opener.openVerifyModal) {
        // Если страница открыта из родительского окна
        window.opener.openVerifyModal(mockNumber);
    } else {
        // Если открыта напрямую
        alert(`CEFR Writing Mock ${mockNumber} requires an access code`);
    }
}

for (let i = 1; i <= 99; i++) {
    let num = i.toString().padStart(2, "0");

    let card = document.createElement("div");
    card.className = "cefr-card";

    // Добавляем data-атрибут с номером мока
    card.setAttribute("data-mock", i);

    card.innerHTML = `<div class="cefr-icon">✍️</div>
        <div>CEFR Writing Mock ${num}</div>`;

    // Добавляем обработчик клика на карточку
    card.addEventListener("click", function () {
        const mockNumber = this.getAttribute("data-mock").padStart(2, "0");
        openVerification(mockNumber);
    });

    container.appendChild(card);
}

// Кнопка Back
const backButton = document.querySelector(".cefr-back");
if (backButton) {
    backButton.addEventListener("click", function () {
        window.location.href = "index.html";
    });
}