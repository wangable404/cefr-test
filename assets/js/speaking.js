const type = localStorage.getItem("currentTest");
const params = new URLSearchParams(window.location.search);
const part = params.get("part");

document.querySelector('.header-desc').textContent = `${part ? `Part ${part}` : 'Full speaking'} - ${type}`

// Состояние приложения
let questions = [];
let currentQuestionIndex = 0;
let isTestActive = false;
let currentPhase = null;
let timerInterval = null;
let timeLeft = 0;
let mediaRecorder = null;
let audioChunks = [];
let recordings = [];

const PREP_TIME = 5;
const ANSWER_TIME = 30;

// DOM элементы
const connectionReminderModal = document.getElementById(
  "connectionReminderModal",
);
const tutorialModal = document.getElementById("tutorialModal");
const micCheckModal = document.getElementById("micCheckModal");
const connectionReminderContinue = document.getElementById(
  "connectionReminderContinue",
);
const tutorialBack = document.getElementById("tutorialBack");
const micCheckBtn = document.getElementById("micCheckBtn");
const tutorialBegin = document.getElementById("tutorialBegin");
const closeMicCheck = document.getElementById("closeMicCheck");
const micTestRecordBtn = document.getElementById("micTestRecordBtn");
const micCheckDone = document.getElementById("micCheckDone");
const loader = document.getElementById("loader");
const mainContent = document.getElementById("mainContent");
const uploadSection = document.getElementById("uploadSection");
const uploadResultsBtn = document.getElementById("uploadResultsBtn");
const uploadStatus = document.getElementById("uploadStatus");
const questionCategoryEl = document.getElementById("questionCategory");
const questionTextEl = document.getElementById("questionText");
const statusMessageEl = document.getElementById("statusMessage");
const preparationTimerEl = document.getElementById("preparationTimer");
const speakingTimerEl = document.getElementById("speakingTimer");
const preparationTimeEl = document.getElementById("preparationTime");
const speakingTimeEl = document.getElementById("speakingTime");
const progressTextEl = document.getElementById("progressText");
const progressFillEl = document.getElementById("progressFill");
const recordingIndicator = document.getElementById("recordingIndicator");

// Переключение языков
document.querySelectorAll(".tab-btn").forEach((tab) => {
  tab.addEventListener("click", () => {
    const lang = tab.getAttribute("data-lang");
    document
      .querySelectorAll(".tab-btn")
      .forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    document
      .querySelectorAll(".t-title")
      .forEach((title) => (title.style.display = "none"));
    document.querySelector(`.t-title[data-title="${lang}"]`).style.display =
      "block";
    document
      .querySelectorAll(".lang-pane")
      .forEach((pane) => (pane.style.display = "none"));
    document.querySelector(`.lang-pane[data-pane="${lang}"]`).style.display =
      "block";
  });
});

// Загрузка вопросов
async function loadQuestionsFromBackend() {
  try {
    loader.style.display = "block";
    console.log(type);
    
    const response = await axios.get(
      `${API_URL}/test/${type}/speaking-question`,
    );
    if (
      response.data &&
      Array.isArray(response.data) &&
      response.data.length > 0
    ) {
      questions = response.data;
      recordings = new Array(questions.length).fill(null);
      initUI();
      loader.style.display = "none";
      mainContent.style.display = "block";
      displayQuestion(0);
      return true;
    } else {
      throw new Error("Нет данных от сервера");
    }
  } catch (error) {
    console.error("Ошибка загрузки вопросов:", error);
    loader.innerHTML = `
                    <div class="error-message">
                        ❌ Ошибка загрузки вопросов: ${error.message}<br>
                        <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">Повторить</button>
                    </div>
                `;
    return false;
  }
}

function initUI() {
  preparationTimeEl.textContent = formatTime(PREP_TIME);
  speakingTimeEl.textContent = formatTime(ANSWER_TIME);
}

function displayQuestion(index) {
  if (index >= questions.length) return;
  const question = questions[index];
  questionCategoryEl.textContent = question.category || "General";
  questionTextEl.textContent = question.question;
  updateProgress();
}

function speakText(text, callback) {
  if (!window.speechSynthesis) {
    if (callback) callback();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.onend = () => {
    if (callback) callback();
  };
  utterance.onerror = () => {
    if (callback) callback();
  };
  setTimeout(() => window.speechSynthesis.speak(utterance), 100);
}

function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function updateProgress() {
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressFillEl.style.width = `${progress}%`;
  progressTextEl.textContent = `Вопрос ${currentQuestionIndex + 1} из ${questions.length}`;
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function startTimer(duration, onTick, onComplete) {
  stopTimer();
  timeLeft = duration;
  timerInterval = setInterval(() => {
    if (timeLeft <= 0) {
      stopTimer();
      if (onComplete) onComplete();
    } else {
      timeLeft--;
      if (onTick) onTick(timeLeft);
    }
  }, 1000);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Запись аудио
async function startRecording(questionIndex) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const question = questions[questionIndex];
      recordings[questionIndex] = {
        blob: audioBlob,
        questionId: question.id,
        question: question.question,
        category: question.category,
        duration: ANSWER_TIME,
        timestamp: new Date().toISOString(),
      };
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.start();
    return true;
  } catch (error) {
    console.error("Ошибка доступа к микрофону:", error);
    statusMessageEl.innerHTML =
      "❌ Ошибка доступа к микрофону! Проверьте разрешения.";
    return false;
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
}

// Фазы теста
function startPreparationPhase() {
  currentPhase = "preparation";
  preparationTimerEl.classList.add("active");
  speakingTimerEl.classList.remove("active");
  preparationTimeEl.textContent = formatTime(PREP_TIME);
  speakingTimeEl.textContent = formatTime(ANSWER_TIME);
  statusMessageEl.innerHTML =
    "⏱️ ПОДГОТОВКА... Обдумайте свой ответ (5 секунд)";
  recordingIndicator.style.display = "none";
  startTimer(
    PREP_TIME,
    (remaining) => {
      preparationTimeEl.textContent = formatTime(remaining);
      statusMessageEl.innerHTML = `⏱️ ПОДГОТОВКА... Осталось ${remaining} секунд`;
    },
    () => startSpeakingPhase(),
  );
}

async function startSpeakingPhase() {
  currentPhase = "speaking";
  preparationTimerEl.classList.remove("active");
  speakingTimerEl.classList.add("active");
  preparationTimeEl.textContent = formatTime(PREP_TIME);
  speakingTimeEl.textContent = formatTime(ANSWER_TIME);
  statusMessageEl.innerHTML =
    "🎤 ОТВЕЧАЙТЕ... Идет запись вашего ответа (30 секунд)";
  recordingIndicator.style.display = "flex";
  await startRecording(currentQuestionIndex);
  startTimer(
    ANSWER_TIME,
    (remaining) => {
      speakingTimeEl.textContent = formatTime(remaining);
      statusMessageEl.innerHTML = `🎤 ОТВЕЧАЙТЕ... Осталось ${remaining} секунд`;
    },
    () => {
      stopRecording();
      finishCurrentQuestion();
    },
  );
}

function finishCurrentQuestion() {
  stopTimer();
  stopSpeaking();
  if (currentQuestionIndex + 1 < questions.length) {
    statusMessageEl.innerHTML =
      "✅ Вопрос завершен! Переход к следующему вопросу...";
    recordingIndicator.style.display = "none";
    setTimeout(() => {
      currentQuestionIndex++;
      loadQuestion(currentQuestionIndex);
    }, 1500);
  } else {
    // Тест завершён, показываем кнопку отправки
    finishTest();
  }
}

function loadQuestion(index) {
  stopTimer();
  stopSpeaking();
  currentPhase = null;
  const question = questions[index];
  questionCategoryEl.textContent = question.category || "General";
  questionTextEl.textContent = question.question;
  updateProgress();
  recordingIndicator.style.display = "none";
  preparationTimeEl.textContent = formatTime(PREP_TIME);
  speakingTimeEl.textContent = formatTime(ANSWER_TIME);
  preparationTimerEl.classList.remove("active");
  speakingTimerEl.classList.remove("active");
  statusMessageEl.innerHTML =
    "🔊 ОЗВУЧИВАНИЕ ВОПРОСА... Пожалуйста, слушайте внимательно";
  speakText(question.question, () => {
    statusMessageEl.innerHTML = "🎧 Вопрос озвучен! Начинается подготовка...";
    setTimeout(startPreparationPhase, 500);
  });
}

// Завершение теста (без автоматической отправки)
function finishTest() {
  isTestActive = false;
  stopTimer();
  stopSpeaking();
  statusMessageEl.innerHTML =
    "🎉 ТЕСТ ЗАВЕРШЕН! 🎉 Нажмите кнопку ниже, чтобы отправить ответы.";
  recordingIndicator.style.display = "none";
  uploadSection.style.display = "block";
}

// Функция отправки результатов (аналог вашей uploadAllRecordings)
async function uploadAllRecordings() {
  const totalRecordings = recordings.filter((r) => r !== null).length;
  const completedCount = totalRecordings;

  if (totalRecordings === 0) {
    updateUploadStatus("❌ Нет записей для отправки", "error");
    return;
  }

  if (completedCount < questions.length) {
    const confirmSend = window.confirm(
      `Вы ответили только на ${completedCount} из ${questions.length} вопросов.\n\nОтправить только отвеченные вопросы?`,
    );
    if (!confirmSend) return;
  }

  // Блокируем кнопку
  uploadResultsBtn.disabled = true;
  uploadResultsBtn.textContent = "📤 Отправка...";
  updateUploadStatus(
    `📤 Отправка ${totalRecordings} записей на сервер... Пожалуйста, подождите.`,
    "info",
  );

  const formData = new FormData();

  // Сортируем по индексу
  const sortedRecordings = [];
  for (let i = 0; i < recordings.length; i++) {
    if (recordings[i]) {
      sortedRecordings.push({ index: i, data: recordings[i] });
    }
  }

  for (const { index, data } of sortedRecordings) {
    const question = questions[index];
    const fileName = `question_${index + 1}_${(question.category || "general").replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.webm`;
    formData.append(`audio_${index + 1}`, data.blob, fileName);
    formData.append(`questions[${index}][id]`, data.questionId);
  }

  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/test/${type}/upload/speaking-question`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 300000,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          updateUploadStatus(`📤 Отправка: ${percent}%`, "info");
        },
      },
    );

    if (response.data.success || response.status === 200) {
      updateUploadStatus(
        "✅ Все записи успешно отправлены на сервер!",
        "success",
      );
      uploadResultsBtn.disabled = false;
      uploadResultsBtn.textContent = "✓ Отправлено";
      uploadResultsBtn.disabled = true;
      // Можно скрыть кнопку через некоторое время
    } else {
      throw new Error(response.data.message || "Ошибка при отправке");
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
    updateUploadStatus(errorMessage, "error");
    uploadResultsBtn.disabled = false;
    uploadResultsBtn.textContent = "📤 Отправить результаты";
  }
}

function updateUploadStatus(message, type) {
  uploadStatus.innerHTML = message;
  uploadStatus.style.color =
    type === "error" ? "#dc3545" : type === "success" ? "#059669" : "#666";
}

// Обработчики модальных окон
connectionReminderContinue.addEventListener("click", () => {
  connectionReminderModal.style.display = "none";
  tutorialModal.style.display = "flex";
});

tutorialBack.addEventListener("click", () => {
  tutorialModal.style.display = "none";
  connectionReminderModal.style.display = "flex";
});

micCheckBtn.addEventListener("click", () => {
  tutorialModal.style.display = "none";
  micCheckModal.style.display = "flex";
});

closeMicCheck.addEventListener("click", () => {
  micCheckModal.style.display = "none";
  tutorialModal.style.display = "flex";
});

// Тест микрофона
let micStream = null;
let micRecorder = null;
let micChunks = [];
let isMicRecording = false;
let micTimerInterval = null;

micTestRecordBtn.addEventListener("click", async () => {
  if (!isMicRecording) {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micRecorder = new MediaRecorder(micStream);
      micChunks = [];
      micRecorder.ondataavailable = (event) => micChunks.push(event.data);
      micRecorder.onstop = () => {
        const audioBlob = new Blob(micChunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
        document.getElementById("micTestStatus").innerHTML =
          "✅ Recording complete! Playing back...";
        setTimeout(() => {
          document.getElementById("micTestStatus").innerHTML =
            "Click to test again";
        }, 3000);
        if (micStream) micStream.getTracks().forEach((track) => track.stop());
        isMicRecording = false;
        micTestRecordBtn.classList.remove("recording");
        clearInterval(micTimerInterval);
        document.getElementById("micTestTimer").innerHTML = "";
      };
      micRecorder.start();
      isMicRecording = true;
      micTestRecordBtn.classList.add("recording");
      document.getElementById("micTestStatus").innerHTML =
        "🔴 Recording... Click to stop";
      let seconds = 0;
      micTimerInterval = setInterval(() => {
        seconds++;
        document.getElementById("micTestTimer").innerHTML =
          `Recording: ${seconds}s`;
      }, 1000);
      setTimeout(() => {
        if (
          isMicRecording &&
          micRecorder &&
          micRecorder.state === "recording"
        ) {
          micRecorder.stop();
        }
      }, 5000);
    } catch (error) {
      console.error("Microphone error:", error);
      document.getElementById("micTestStatus").innerHTML =
        "❌ Microphone access denied";
    }
  } else {
    if (micRecorder && micRecorder.state === "recording") {
      micRecorder.stop();
    }
  }
});

micCheckDone.addEventListener("click", async () => {
  micCheckModal.style.display = "none";
  await startTest();
});

tutorialBegin.addEventListener("click", async () => {
  tutorialModal.style.display = "none";
  await startTest();
});

async function startTest() {
  isTestActive = true;
  currentQuestionIndex = 0;
  recordings = new Array(questions.length).fill(null);
  await loadQuestion(0);
}

// Кнопка отправки результатов
uploadResultsBtn.addEventListener("click", uploadAllRecordings);

async function init() {
  connectionReminderModal.style.display = "flex";
  await loadQuestionsFromBackend();
}

init();
