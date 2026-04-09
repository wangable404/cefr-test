/**
 * Speaking Practice - Автоматическая запись звука с сохранением прогресса
 */

const QUESTIONS = [];

// ========== СОСТОЯНИЕ ==========
let currentQuestionIndex = 0;
let completedQuestions = new Set(); // Хранит индексы отвеченных вопросов
let isAnswering = false; // Флаг, идет ли сейчас ответ на вопрос
let currentPrepTime = 5;
let currentAnswerTime = 30;
let prepInterval = null;
let answerInterval = null;
let currentPhase = "idle"; // idle, prep, answer

// Голосовая запись
let mediaRecorder = null;
let audioStream = null;
let audioChunks = [];
let isRecording = false;
let recordings = {}; // { questionIndex: { blob, url, duration, questionText, timestamp, category } }

// DOM элементы
let questionsGrid, prevBtn, nextBtn, startAnswerBtn;
let prepTimerDisplay, answerTimerDisplay;
let progressFill, progressText;
let activeQuestionText, activeQuestionCategory, activeQuestionNumber;
let recordingStatus, finishButtonContainer;
let questionDots;

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener("DOMContentLoaded", () => {
  const type = localStorage.getItem("currentTest");

  initElements();
  initTheme();
  initMobileMenu();
  initModal();
  attachEventListeners();
  initMicrophone();

  axios
    .get(`${API_URL}/test/${type}/speaking-question`)
    .then((res) => {
      QUESTIONS.push(...res.data);

      // ✅ ВАЖНО: рендер только после получения данных
      renderQuestions();
      updateProgress();
      updateActiveQuestion();
      loadSavedProgress();
      updateUIForQuestion();
    })
    .catch((err) => {
      console.log(err);
      showMessage("Ошибка загрузки вопросов", "error");
    });
});

function initElements() {
  questionsGrid = document.getElementById("questionsGrid");
  prevBtn = document.getElementById("prevBtn");
  nextBtn = document.getElementById("nextBtn");
  startAnswerBtn = document.getElementById("startAnswerBtn");
  prepTimerDisplay = document.getElementById("prepTime");
  answerTimerDisplay = document.getElementById("answerTime");
  progressFill = document.getElementById("progressFill");
  progressText = document.getElementById("progressText");
  activeQuestionText = document.getElementById("activeQuestionText");
  activeQuestionCategory = document.getElementById("activeQuestionCategory");
  activeQuestionNumber = document.getElementById("activeQuestionNumber");
  recordingStatus = document.getElementById("recordingStatus");
  finishButtonContainer = document.getElementById("finishButtonContainer");
  questionDots = document.getElementById("questionDots");
}

// ========== МИКРОФОН ==========
async function initMicrophone() {
  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("Микрофон инициализирован");
    updateRecordingStatus("✅ Микрофон готов", "success");
  } catch (error) {
    console.error("Ошибка доступа к микрофону:", error);
    updateRecordingStatus(
      "❌ Нет доступа к микрофону. Проверьте разрешения.",
      "error",
    );
  }
}

function startRecording() {
  if (!audioStream) {
    updateRecordingStatus("❌ Микрофон не доступен", "error");
    return;
  }

  if (!isAnswering || currentPhase !== "answer") {
    return;
  }

  audioChunks = [];
  mediaRecorder = new MediaRecorder(audioStream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      audioChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    if (audioChunks.length > 0) {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const duration = 60 - currentAnswerTime;

      // Сохраняем запись с полной информацией
      recordings[currentQuestionIndex] = {
        blob: audioBlob,
        url: audioUrl,
        duration: Math.min(60, Math.max(0, duration)),
        questionText: QUESTIONS[currentQuestionIndex].question,
        questionId: QUESTIONS[currentQuestionIndex].id,
        category: QUESTIONS[currentQuestionIndex].category,
        timestamp: new Date().toISOString(),
        questionNumber: currentQuestionIndex + 1,
      };

      // Сохраняем в localStorage
      saveRecordingsToStorage();

      updateRecordingStatus(
        `✅ Запись сохранена (${Math.min(60, Math.max(0, duration))} сек)`,
        "success",
      );

      // Отмечаем вопрос как отвеченный
      if (!completedQuestions.has(currentQuestionIndex)) {
        completedQuestions.add(currentQuestionIndex);
        saveProgress();
        updateProgress();
        renderQuestions();
        updateUIForQuestion();

        // Автоматически переходим к следующему вопросу, если есть
        autoMoveToNextQuestion();
      }
    }
    audioChunks = [];
  };

  mediaRecorder.start();
  isRecording = true;
  updateRecordingStatus(
    `🔴 Идет запись... ${currentAnswerTime} сек осталось`,
    "recording",
  );
}

// Автоматический переход к следующему вопросу
function autoMoveToNextQuestion() {
  if (currentQuestionIndex < QUESTIONS.length - 1) {
    setTimeout(() => {
      if (!isAnswering && !completedQuestions.has(currentQuestionIndex + 1)) {
        currentQuestionIndex++;
        updateActiveQuestion();
        renderQuestions();
        updateUIForQuestion();
        updateNavigationButtons();
        saveCurrentQuestion();
        showMessage(`Переход к вопросу ${currentQuestionIndex + 1}`, "info");
      }
    }, 1500);
  } else {
    // Все вопросы отвечены
    checkAndShowFinishButton();
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    mediaRecorder = null;
  }
}

// ========== ОТОБРАЖЕНИЕ ВОПРОСОВ ==========
function renderQuestions() {
  if (!questionsGrid) return;
  questionsGrid.innerHTML = "";

  QUESTIONS.forEach((question, index) => {
    const card = document.createElement("div");
    card.className = "question-card";
    if (index === currentQuestionIndex) card.classList.add("active");
    if (completedQuestions.has(index)) card.classList.add("completed");

    const hasAudio = recordings[index];

    // <div class="question-card__category">${question.category}</div>
    card.innerHTML = `
            <div class="question-card__number">${index + 1}</div>
            <div class="question-card__text">${question.question.substring(0, 60)}${question.question.length > 60 ? "..." : ""}</div>
            <div class="question-card__icons">
                ${hasAudio ? '<span class="icon-microphone">🎙️</span>' : ""}
                ${completedQuestions.has(index) ? '<span class="icon-check">✓</span>' : ""}
            </div>
        `;

    card.addEventListener("click", () => selectQuestion(index));
    questionsGrid.appendChild(card);
  });

  // Обновляем dots навигацию
  renderQuestionDots();
}

function renderQuestionDots() {
  if (!questionDots) return;
  questionDots.innerHTML = "";

  QUESTIONS.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "question-dot";
    if (index === currentQuestionIndex) dot.classList.add("active");
    if (completedQuestions.has(index)) dot.classList.add("completed");
    dot.textContent = index + 1;
    dot.addEventListener("click", () => selectQuestion(index));
    questionDots.appendChild(dot);
  });
}

function selectQuestion(index) {
  if (index === currentQuestionIndex) return;

  // Если идет ответ на вопрос, нельзя переключаться
  if (isAnswering) {
    updateRecordingStatus(
      "⚠️ Сначала завершите ответ на текущий вопрос",
      "warning",
    );
    return;
  }

  // Останавливаем все таймеры если они есть
  stopAllTimers();

  currentQuestionIndex = index;
  saveCurrentQuestion();
  renderQuestions();
  updateActiveQuestion();
  updateUIForQuestion();
  updateNavigationButtons();
}

function updateActiveQuestion() {
  const question = QUESTIONS[currentQuestionIndex];
  if (activeQuestionNumber)
    activeQuestionNumber.textContent = `Вопрос ${currentQuestionIndex + 1}`;
  if (activeQuestionCategory)
    activeQuestionCategory.textContent = question.category;
  if (activeQuestionText) activeQuestionText.textContent = question.question;
}

function updateUIForQuestion() {
  const isCompleted = completedQuestions.has(currentQuestionIndex);
  const hasRecording = recordings[currentQuestionIndex];

  if (startAnswerBtn) {
    if (isCompleted) {
      startAnswerBtn.disabled = true;
      startAnswerBtn.textContent = "✅ Вопрос завершен";
      startAnswerBtn.classList.add("completed");
    } else {
      startAnswerBtn.disabled = false;
      startAnswerBtn.textContent = "🎤 Ответить на вопрос";
      startAnswerBtn.classList.remove("completed");
    }
  }

  // Обновляем статус
  if (isCompleted) {
    updateRecordingStatus(
      "✅ Вопрос已回答. Выберите другой вопрос или продолжите.",
      "success",
    );
  } else if (hasRecording && !isCompleted) {
    updateRecordingStatus(
      "📁 Есть запись, но вопрос не отмечен как ответенный",
      "info",
    );
  } else {
    updateRecordingStatus(
      '🎤 Нажмите "Ответить на вопрос" чтобы начать',
      "info",
    );
  }
}

// ========== ПРОЦЕСС ОТВЕТА ==========
function startAnswerProcess() {
  // Проверяем, не отвечен ли уже вопрос
  if (completedQuestions.has(currentQuestionIndex)) {
    updateRecordingStatus("⚠️ Этот вопрос уже отвечен", "warning");
    return;
  }

  // Проверяем, не идет ли уже ответ
  if (isAnswering) {
    updateRecordingStatus("⚠️ Сейчас идет ответ на вопрос", "warning");
    return;
  }

  // Начинаем процесс ответа
  isAnswering = true;
  currentPhase = "prep";
  currentPrepTime = 5;
  currentAnswerTime = 30;

  updatePrepDisplay();
  updateAnswerDisplay();

  // Отключаем навигацию
  if (prevBtn) prevBtn.disabled = true;
  if (nextBtn) nextBtn.disabled = true;
  if (startAnswerBtn) startAnswerBtn.disabled = true;

  updateRecordingStatus("⏱️ Подготовка: 5 секунд...", "prep");

  // Запускаем таймер подготовки
  prepInterval = setInterval(() => {
    if (currentPrepTime > 0) {
      currentPrepTime--;
      updatePrepDisplay();
      updateRecordingStatus(`⏱️ Подготовка: ${currentPrepTime} сек`, "prep");

      if (currentPrepTime === 0) {
        // Заканчиваем подготовку, начинаем ответ
        clearInterval(prepInterval);
        prepInterval = null;
        startAnswerPhase();
      }
    }
  }, 1000);
}

function startAnswerPhase() {
  currentPhase = "answer";
  updateRecordingStatus("🎤 Начинаем запись ответа...", "info");

  // Начинаем запись
  startRecording();

  // Запускаем таймер ответа
  answerInterval = setInterval(() => {
    if (currentAnswerTime > 0) {
      currentAnswerTime--;
      updateAnswerDisplay();

      if (isRecording) {
        updateRecordingStatus(
          `🔴 Запись: ${60 - currentAnswerTime} сек (осталось ${currentAnswerTime} сек)`,
          "recording",
        );
      }

      if (currentAnswerTime === 0) {
        // Время ответа закончилось
        clearInterval(answerInterval);
        answerInterval = null;

        if (isRecording) {
          stopRecording();
        }

        // Небольшая задержка чтобы запись сохранилась
        setTimeout(() => {
          finishCurrentQuestion();
        }, 500);
      }
    }
  }, 1000);
}

function finishCurrentQuestion() {
  // Отмечаем вопрос как отвеченный
  if (!completedQuestions.has(currentQuestionIndex)) {
    completedQuestions.add(currentQuestionIndex);
    saveProgress();
    updateProgress();
    renderQuestions();
  }

  // Сбрасываем флаги
  isAnswering = false;
  currentPhase = "idle";

  // Останавливаем таймеры
  if (prepInterval) {
    clearInterval(prepInterval);
    prepInterval = null;
  }
  if (answerInterval) {
    clearInterval(answerInterval);
    answerInterval = null;
  }

  // Включаем навигацию
  if (prevBtn) prevBtn.disabled = false;
  if (nextBtn) nextBtn.disabled = false;

  updateUIForQuestion();
  updateRecordingStatus(
    `✅ Вопрос ${currentQuestionIndex + 1} завершен!`,
    "success",
  );

  // Обновляем таймеры на экране
  currentPrepTime = 5;
  currentAnswerTime = 30;
  updatePrepDisplay();
  updateAnswerDisplay();

  // Проверяем, все ли вопросы отвечены
  checkAndShowFinishButton();
}

function checkAndShowFinishButton() {
  const completed = completedQuestions.size;
  const total = QUESTIONS.length;

  if (finishButtonContainer) {
    if (completed === total && total > 0) {
      finishButtonContainer.style.display = "flex";
      updateRecordingStatus(
        '🎉 Все вопросы отвечены! Нажмите "Завершить тест" для отправки',
        "success",
      );
    } else {
      finishButtonContainer.style.display = "none";
    }
  }
}

function stopAllTimers() {
  if (prepInterval) {
    clearInterval(prepInterval);
    prepInterval = null;
  }
  if (answerInterval) {
    clearInterval(answerInterval);
    answerInterval = null;
  }
  if (isRecording) {
    stopRecording();
  }
  isAnswering = false;
  currentPhase = "idle";
  currentPrepTime = 5;
  currentAnswerTime = 30;
  updatePrepDisplay();
  updateAnswerDisplay();
}

// ========== ТАЙМЕРЫ ДИСПЛЕЙ ==========
function updatePrepDisplay() {
  if (prepTimerDisplay) {
    const mins = Math.floor(currentPrepTime / 60);
    const secs = currentPrepTime % 60;
    prepTimerDisplay.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    prepTimerDisplay.style.color = currentPrepTime <= 10 ? "#dc3545" : "";
  }
}

function updateAnswerDisplay() {
  if (answerTimerDisplay) {
    const mins = Math.floor(currentAnswerTime / 60);
    const secs = currentAnswerTime % 60;
    answerTimerDisplay.textContent = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    answerTimerDisplay.style.color = currentAnswerTime <= 10 ? "#dc3545" : "";
  }
}

// ========== ОТПРАВКА НА СЕРВЕР ==========
async function uploadAllRecordings() {
  const totalRecordings = Object.keys(recordings).length;
  const completedCount = completedQuestions.size;

  if (totalRecordings === 0) {
    updateRecordingStatus("❌ Нет записей для отправки", "error");
    showMessage("Нет записей для отправки", "error");
    return;
  }

  if (completedCount < QUESTIONS.length) {
    const confirmSend = window.confirm(
      `Вы ответили только на ${completedCount} из ${QUESTIONS.length} вопросов.\n\nОтправить только отвеченные вопросы?`,
    );
    if (!confirmSend) return;
  }

  // Показываем индикатор загрузки
  const finishBtn = document.getElementById("finishTestBtn");
  const originalBtnText = finishBtn?.textContent;
  if (finishBtn) {
    finishBtn.disabled = true;
    finishBtn.textContent = "📤 Отправка...";
  }

  updateRecordingStatus(
    `📤 Отправка ${totalRecordings} записей на сервер... Пожалуйста, подождите.`,
    "info",
  );

  const formData = new FormData();

  // Добавляем метаданные
  formData.append("total_recordings", totalRecordings);
  formData.append("total_completed", completedCount);
  formData.append("total_questions", QUESTIONS.length);
  formData.append("submitted_at", new Date().toISOString());

  // Сортируем записи по номеру вопроса
  const sortedRecordings = Object.entries(recordings).sort(
    (a, b) => parseInt(a[0]) - parseInt(b[0]),
  );

  // Добавляем каждую запись
  for (const [index, recording] of sortedRecordings) {
    const questionIndex = parseInt(index);
    const question = QUESTIONS[questionIndex];

    if (!recording.blob) {
      console.warn(`Нет blob для вопроса ${questionIndex + 1}`);
      continue;
    }

    const fileName = `question_${questionIndex + 1}_${question.category.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.webm`;

    // Добавляем аудио файл
    formData.append(`audio_${questionIndex + 1}`, recording.blob, fileName);

    // Добавляем метаданные для каждого вопроса
    formData.append(`questions[${questionIndex}][number]`, questionIndex + 1);
    formData.append(`questions[${questionIndex}][id]`, question.id);
    formData.append(`questions[${questionIndex}][text]`, question.question);
    formData.append(`questions[${questionIndex}][category]`, question.category);
    formData.append(
      `questions[${questionIndex}][duration]`,
      recording.duration,
    );
    formData.append(
      `questions[${questionIndex}][timestamp]`,
      recording.timestamp,
    );
  }

  try {
    const token = localStorage.getItem("token");
    const type = localStorage.getItem("currentTest");

    const response = await axios.post(
      `${API_URL}/test/${type}/upload/speaking-question`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000, // 5 минут таймаут для больших файлов
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          updateRecordingStatus(`📤 Отправка: ${percentCompleted}%`, "info");
        },
      },
    );

    if (response.data.success || response.status === 200) {
      updateRecordingStatus(
        "✅ Все записи успешно отправлены на сервер!",
        "success",
      );
      showMessage(
        "Все ответы успешно отправлены! Спасибо за прохождение теста.",
        "success",
      );

      // Опционально: очищаем локальные данные после успешной отправки
      setTimeout(() => {
        clearAllProgress();
      }, 2000);
    } else {
      throw new Error(response.data.message || "Ошибка при отправке");
    }

    if (finishButtonContainer) {
      finishButtonContainer.style.display = "none";
    }
  } catch (error) {
    console.error("Ошибка при отправке:", error);

    let errorMessage = "❌ Ошибка отправки на сервер";
    if (error.response) {
      errorMessage += `: ${error.response.data?.message || error.response.statusText}`;
    } else if (error.request) {
      errorMessage =
        "❌ Нет ответа от сервера. Проверьте подключение к интернету.";
    } else {
      errorMessage += `: ${error.message}`;
    }

    updateRecordingStatus(errorMessage, "error");
    showMessage(errorMessage, "error");
  } finally {
    // Восстанавливаем кнопку
    if (finishBtn) {
      finishBtn.disabled = false;
      finishBtn.textContent = originalBtnText;
    }
  }
}

// ========== ПРОГРЕСС И ХРАНЕНИЕ ==========
function updateProgress() {
  const completed = completedQuestions.size;
  const total = QUESTIONS.length;
  const percentage = (completed / total) * 100;

  if (progressText) progressText.textContent = `${completed} / ${total}`;
  if (progressFill) progressFill.style.width = `${percentage}%`;

  // Показываем кнопку завершения если все вопросы отвечены
  checkAndShowFinishButton();
}

function saveProgress() {
  localStorage.setItem(
    "speaking_completed_questions",
    JSON.stringify(Array.from(completedQuestions)),
  );
}

function saveCurrentQuestion() {
  localStorage.setItem("speaking_current_question", currentQuestionIndex);
}

function saveRecordingsToStorage() {
  // Сохраняем метаданные записей (без blob URL)
  const recordingsMetadata = {};
  for (const [index, recording] of Object.entries(recordings)) {
    recordingsMetadata[index] = {
      duration: recording.duration,
      questionText: recording.questionText,
      questionId: recording.questionId,
      category: recording.category,
      timestamp: recording.timestamp,
      questionNumber: recording.questionNumber,
      // blob не сохраняем в localStorage из-за размера
    };
  }
  localStorage.setItem(
    "speaking_recordings_metadata",
    JSON.stringify(recordingsMetadata),
  );
}

function loadSavedProgress() {
  // Загружаем отвеченные вопросы
  const savedProgress = localStorage.getItem("speaking_completed_questions");
  if (savedProgress) {
    completedQuestions = new Set(JSON.parse(savedProgress));
    updateProgress();
  }

  // Загружаем текущий вопрос
  const savedQuestion = localStorage.getItem("speaking_current_question");
  if (savedQuestion !== null && !isAnswering) {
    currentQuestionIndex = parseInt(savedQuestion);
  }

  // Загружаем метаданные записей (реальные blob не сохраняем при обновлении)
  const savedMetadata = localStorage.getItem("speaking_recordings_metadata");
  if (savedMetadata) {
    const metadata = JSON.parse(savedMetadata);
    for (const [index, meta] of Object.entries(metadata)) {
      if (!recordings[index]) {
        recordings[index] = {
          ...meta,
          blob: null,
          url: null,
        };
      }
    }
  }

  // Обновляем UI
  renderQuestions();
  updateActiveQuestion();
  updateUIForQuestion();
  updateNavigationButtons();
}

function clearAllProgress() {
  completedQuestions.clear();
  recordings = {};
  currentQuestionIndex = 0;
  isAnswering = false;
  stopAllTimers();

  localStorage.removeItem("speaking_completed_questions");
  localStorage.removeItem("speaking_current_question");
  localStorage.removeItem("speaking_recordings_metadata");

  renderQuestions();
  updateProgress();
  updateActiveQuestion();
  updateUIForQuestion();
  updateNavigationButtons();
  updateRecordingStatus("🔄 Прогресс очищен. Можно начинать заново.", "info");
  showMessage("Прогресс успешно очищен", "success");
}

function updateRecordingStatus(message, type = "info") {
  if (recordingStatus) {
    recordingStatus.textContent = message;
    recordingStatus.className = "recording-status";
    recordingStatus.classList.add(`status-${type}`);
  }
}

// ========== НАВИГАЦИЯ ==========
function updateNavigationButtons() {
  if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0 || isAnswering;
  if (nextBtn)
    nextBtn.disabled =
      currentQuestionIndex === QUESTIONS.length - 1 || isAnswering;
}

function nextQuestion() {
  if (isAnswering) {
    updateRecordingStatus(
      "⚠️ Сначала завершите ответ на текущий вопрос",
      "warning",
    );
    return;
  }

  if (currentQuestionIndex < QUESTIONS.length - 1) {
    currentQuestionIndex++;
    updateActiveQuestion();
    renderQuestions();
    updateUIForQuestion();
    updateNavigationButtons();
    saveCurrentQuestion();
  }
}

function prevQuestion() {
  if (isAnswering) {
    updateRecordingStatus(
      "⚠️ Сначала завершите ответ на текущий вопрос",
      "warning",
    );
    return;
  }

  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    updateActiveQuestion();
    renderQuestions();
    updateUIForQuestion();
    updateNavigationButtons();
    saveCurrentQuestion();
  }
}

function showMessage(text, type = "info") {
  const message = document.createElement("div");
  message.className = `message message-${type}`;
  message.textContent = text;
  message.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === "success" ? "#28a745" : type === "error" ? "#dc3545" : type === "warning" ? "#ffc107" : "#17a2b8"};
        color: ${type === "warning" ? "#000" : "#fff"};
        border-radius: 8px;
        font-weight: 500;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;

  document.body.appendChild(message);

  setTimeout(() => {
    message.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => message.remove(), 300);
  }, 3000);
}

// ========== ТЕМА ==========
function initTheme() {
  const savedTheme = localStorage.getItem("speaking_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("speaking_theme", newTheme);
  showMessage(`🌓 ${newTheme === "dark" ? "Темная" : "Светлая"} тема`, "info");
}

// ========== МОБИЛЬНОЕ МЕНЮ ==========
function initMobileMenu() {
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      menuBtn.classList.toggle("active");
      mobileMenu.classList.toggle("active");
      document.body.style.overflow = mobileMenu.classList.contains("active")
        ? "hidden"
        : "";
    });
  }
}

// ========== МОДАЛЬНОЕ ОКНО ==========
function initModal() {
  const instructionsBtn = document.getElementById("instructionsBtn");
  const modal = document.getElementById("instructionsModal");
  const modalClose = document.getElementById("modalClose");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalGotItBtn = document.getElementById("modalGotItBtn");

  if (!modal) return;

  const openModal = () => {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  };

  instructionsBtn?.addEventListener("click", openModal);
  modalClose?.addEventListener("click", closeModal);
  modalOverlay?.addEventListener("click", closeModal);
  modalGotItBtn?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
}

// ========== CSS СТИЛИ ==========
function addStatusStyles() {
  const style = document.createElement("style");
  style.textContent = `
        .recording-status {
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            font-weight: 500;
            margin-top: 20px;
            transition: all 0.3s ease;
        }
        .status-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .status-warning {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeeba;
        }
        .status-info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        .status-recording {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            animation: pulse 1s infinite;
        }
        .status-prep {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        .question-card {
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .question-card.completed {
            border-left: 4px solid #28a745;
            background: rgba(40, 167, 69, 0.05);
        }
        .question-card .icon-microphone {
            font-size: 14px;
            margin-right: 5px;
        }
        .question-card .icon-check {
            font-size: 14px;
            color: #28a745;
        }
        .question-dots {
            display: flex;
            gap: 8px;
            justify-content: center;
            flex-wrap: wrap;
        }
        .question-dot {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid #ddd;
            background: white;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        .question-dot.active {
            background: #007bff;
            border-color: #007bff;
            color: white;
        }
        .question-dot.completed {
            background: #28a745;
            border-color: #28a745;
            color: white;
        }
        .question-dot:hover:not(.active) {
            transform: scale(1.1);
        }
        .btn--success.completed {
            background: #28a745;
            cursor: not-allowed;
            opacity: 0.7;
        }
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    `;
  document.head.appendChild(style);
}

addStatusStyles();

// ========== ОБРАБОТЧИКИ ==========
function attachEventListeners() {
  if (prevBtn) prevBtn.addEventListener("click", prevQuestion);
  if (nextBtn) nextBtn.addEventListener("click", nextQuestion);
  if (startAnswerBtn)
    startAnswerBtn.addEventListener("click", startAnswerProcess);

  const finishTestBtn = document.getElementById("finishTestBtn");
  if (finishTestBtn)
    finishTestBtn.addEventListener("click", uploadAllRecordings);

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

  // Добавляем кнопку очистки прогресса (опционально)
  const clearProgressBtn = document.getElementById("clearProgressBtn");
  if (clearProgressBtn)
    clearProgressBtn.addEventListener("click", clearAllProgress);
}
