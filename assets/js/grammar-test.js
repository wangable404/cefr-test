document.addEventListener("DOMContentLoaded", () => {
  // grammar-test.js

  let questions = [];
  let currentIndex = 0;
  let canSelect = true;
  let correctCount = 0; // Добавляем счетчик правильных ответов

  // Получаем тип теста из localStorage
  const type = localStorage.getItem("currentTest");

  axios
    .get(`${API_URL}/test/${type}/grammar-test`)
    .then((response) => {
      questions = response.data;
      document.querySelector(".grammar-test-loader").style.display = "none";
      document.querySelector(".grammar-test-question-box").style.display =
        "block";
      renderQuestion();
    })
    .catch((error) => {
      console.error("Ошибка загрузки вопросов:", error);
      const box = document.querySelector(".grammar-test-question-box");
      if (box) {
        box.innerHTML = `
        <div style="text-align: center; color: red; padding: 40px;">
          <h3>❌ Ошибка загрузки теста</h3>
          <p>Пожалуйста, обновите страницу</p>
        </div>
      `;
      }
    });

  function renderQuestion() {
    if (!questions.length || currentIndex >= questions.length) return;

    const q = questions[currentIndex];
    const box = document.querySelector(".grammar-test-question-box");

    // Сбрасываем флаг выбора
    canSelect = true;

    // Обновляем заголовок и текст
    document.getElementById("qNum").textContent = currentIndex + 1;
    document.getElementById("qTotal").textContent = questions.length;
    box.querySelector(".grammar-test-q-label").textContent =
      `QUESTION ${currentIndex + 1}`;
    box.querySelector(".grammar-test-question").textContent = q.question;

    // Удаляем старый результат, если есть
    const oldResult = box.querySelector(".grammar-test-result");
    if (oldResult) oldResult.remove();

    // Генерируем кнопки
    const answersContainer = box.querySelector(".grammar-test-answers");
    answersContainer.innerHTML = "";

    q.options.forEach((option) => {
      const btn = document.createElement("button");
      btn.className = "grammar-test-btn";
      btn.textContent = option;

      btn.addEventListener("click", () => {
        if (canSelect) {
          handleSelection(btn, option === q.correct);
        }
      });

      answersContainer.appendChild(btn);
    });
  }

  function handleSelection(selectedBtn, isCorrect) {
    if (!canSelect) return;
    canSelect = false;

    const allButtons = document.querySelectorAll(".grammar-test-btn");
    const currentQ = questions[currentIndex];

    // Если ответ правильный, увеличиваем счетчик
    if (isCorrect) {
      correctCount++;
    }

    // Блокируем все кнопки и подсвечиваем правильные/неправильные ответы
    allButtons.forEach((btn) => {
      btn.disabled = true;

      if (btn.textContent === currentQ.correct) {
        btn.classList.add("right");
      }

      if (btn === selectedBtn && !isCorrect) {
        btn.classList.add("wrong");
      }

      if (btn.textContent !== currentQ.correct && btn !== selectedBtn) {
        btn.classList.add("disabled");
      }
    });

    // Показываем результат
    showStatus(isCorrect);

    // Ждем 2 секунды и переходим к следующему вопросу
    setTimeout(() => {
      currentIndex++;

      if (currentIndex < questions.length) {
        renderQuestion();
      } else {
        // Тест завершен - показываем правильное количество правильных ответов
        const box = document.querySelector(".grammar-test-question-box");
        box.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <h2>🎉 Test completed! 🎉</h2>
          <p style="margin-top: 20px;">Your score: ${correctCount} / ${questions.length}</p>
          <button onclick="location.reload()" style="margin-top: 30px; padding: 10px 30px; background: #4caf50; color: white; border: none; border-radius: 8px; cursor: pointer;">Try Again</button>
        </div>
      `;
      }
    }, 2000);
  }

  function showStatus(isCorrect) {
    // Удаляем старый результат, если есть
    const oldResult = document.querySelector(".grammar-test-result");
    if (oldResult) oldResult.remove();

    const res = document.createElement("div");
    res.className = `grammar-test-result ${isCorrect ? "success" : "error"}`;
    res.textContent = isCorrect ? "✓ Correct!" : "✗ Incorrect";
    document.querySelector(".grammar-test-question-box").appendChild(res);
  }

  const homeBtn = document.querySelector('.grammar-test-home')

  homeBtn.addEventListener('click', () => {
    window.location.href = 'index.html'
  })
});
