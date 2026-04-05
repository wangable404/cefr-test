// flashcard.js - замените полностью содержимое файла
document.addEventListener("DOMContentLoaded", () => {
  let flashcards = [];
  let currentCard = 0;
  let isFlipped = false;

  // DOM Elements
  const flashcard = document.getElementById("flashcard");
  const cardNum = document.getElementById("cardNum");
  const totalCards = document.getElementById("totalCards");
  const progress = document.getElementById("progress");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const flipBtn = document.getElementById("flipBtn");

  const backBtn = document.querySelector('.home-btn')

  if (backBtn) {
    backBtn.addEventListener("click", function () {
      window.location.href = "index.html";
    });
  }

  // Получаем тип теста из localStorage
  const type = localStorage.getItem("currentTest");

  // Загружаем данные через axios
  axios
    .get(`${API_URL}/test/${type}/flashcards`)
    .then((response) => {
      flashcards = response.data;
      totalCards.textContent = flashcards.length;
      updateCard();
      setupEventListeners();
    })
    .catch((error) => {
      console.error("Ошибка загрузки карточек:", error);
      document.querySelector(".flashcard-front").innerHTML = `
      <div class="flashcard-content">
        <div class="flashcard-icon">❌</div>
        <div class="flashcard-question">Ошибка загрузки данных</div>
      </div>
    `;
    });

  // Setup Event Listeners
  function setupEventListeners() {
    flashcard.addEventListener("click", flipCard);
    flipBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      flipCard();
    });
    prevBtn.addEventListener("click", () => navigateCard(-1));
    nextBtn.addEventListener("click", () => navigateCard(1));

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") navigateCard(-1);
      else if (e.key === "ArrowRight") navigateCard(1);
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        flipCard();
      }
    });
  }

  function flipCard() {
    isFlipped = !isFlipped;
    if (isFlipped) {
      flashcard.classList.add("flipped");
    } else {
      flashcard.classList.remove("flipped");
    }
  }

  function navigateCard(direction) {
    currentCard += direction;
    if (currentCard < 0) currentCard = 0;
    if (currentCard >= flashcards.length) currentCard = flashcards.length - 1;

    isFlipped = false;
    flashcard.classList.remove("flipped");
    updateCard();
  }

  function updateCard() {
    if (flashcards.length === 0) return;

    const card = flashcards[currentCard];

    // Update progress
    cardNum.textContent = currentCard + 1;
    const progressPercent = ((currentCard + 1) / flashcards.length) * 100;
    progress.style.width = progressPercent + "%";

    // Update front
    document.querySelector(".flashcard-front").innerHTML = `
    <div class="flashcard-content">
      <div class="flashcard-icon">💬</div>
      <div class="flashcard-question">
        <span class="label">A:</span> ${card.questionA || ""}
        <br>
        <span class="label">B:</span> ${card.questionB || ""}
      </div>
      <div class="flip-hint">Click to reveal answer</div>
    </div>
  `;

    // Update back
    document.querySelector(".flashcard-back").innerHTML = `
    <div class="flashcard-content">
      <div class="flashcard-answer-row">
        <div class="flashcard-check">✅</div>
        <div class="flashcard-answer">${card.correctAnswer || ""}</div>
      </div>
      <div class="flashcard-translation">${card.translation || ""}</div>
      <div class="flashcard-explanation">
        <div><b>${card.explanation || ""}</b></div>
      </div>
    </div>
  `;

    // Update button states
    prevBtn.disabled = currentCard === 0;
    nextBtn.disabled = currentCard === flashcards.length - 1;
    prevBtn.style.opacity = currentCard === 0 ? "0.5" : "1";
    nextBtn.style.opacity = currentCard === flashcards.length - 1 ? "0.5" : "1";
  }
});
