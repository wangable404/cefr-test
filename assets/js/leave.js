const overlay = document.getElementById("overlay");
const leaveBtn = document.querySelector(".leave");
const continueBtn = document.querySelector(".continue");

continueBtn.onclick = () => {
    overlay.style.display = "none";
};

leaveBtn.onclick = () => {
    alert("You left the test");
    overlay.style.display = "none";
};