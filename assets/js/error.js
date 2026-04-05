const homeBtn = document.querySelector(".grammar-test-home");
const modal = document.getElementById("leaveModal");
const continueBtn = document.getElementById("continueBtn");
const leaveBtn = document.getElementById("leaveBtn");

homeBtn.addEventListener("click", () => {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
});

continueBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
});

leaveBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});