document.addEventListener("DOMContentLoaded", function () {

    // ======================
    // BACK BUTTON
    // ======================
    const backBtn = document.querySelector(".ielts-back");

    if (backBtn) {
        backBtn.addEventListener("click", function () {
            window.location.href = "index.html";
        });
    }

    // ======================
    // FORM SUBMIT
    // ======================
    const form = document.getElementById("ieltsForm");
    const errorMsg = document.getElementById("errorMessage");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const name = document.getElementById("fullName").value.trim();
            const passcode = document.getElementById("passcode").value.trim();

            // Очищаем предыдущую ошибку
            errorMsg.textContent = "";

            // Проверка passcode (замени "1234" на свой код)
            if (passcode !== "1234") {
                errorMsg.textContent = "Invalid or expired passcode. Please try again.";
                return;
            }

            // Если passcode верный
            window.location.href = "index.html";
        });
    }

});