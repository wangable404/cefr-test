document.addEventListener("DOMContentLoaded", function () {
  const user = localStorage.getItem("googleUser");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  let route = "/";

  if (!user && currentPage !== "login.html") {
    window.location.href = "login.html";
    return;
  }

  // ========== Боковое меню ==========
  const menuBtn = document.querySelector(".menu-icon");
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.querySelector(".overlay");

  if (menuBtn && sidebar && overlay) {
    menuBtn.addEventListener("click", function () {
      sidebar.classList.toggle("active");
      overlay.classList.toggle("active");
    });
    overlay.addEventListener("click", function () {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });
  }

  // ========== Модалка выбора CEFR/IELTS (существующая) ==========
  const modal = document.getElementById("modalOverlay");
  const modalSkill = document.getElementById("modalSkill");
  const modalText = document.getElementById("modalText");
  const closeModal = document.getElementById("closeModal");

  function openModal(title, text) {
    if (!modal) return;
    modalSkill.textContent = title;
    modalText.textContent = text;
    modal.style.display = "flex";
  }

  function closeModalFunc() {
    if (modal) modal.style.display = "none";
  }

  if (closeModal) closeModal.addEventListener("click", closeModalFunc);
  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModalFunc();
    });
  }

  // Карточки навыков
  const skillCards = document.querySelectorAll(".skill-card");
  const skillDescriptions = {
    Speaking: "Practice speaking tests",
    Writing: "Practice writing tests",
    Reading: "Practice reading tests",
  };

  skillCards.forEach(function (card) {
    card.addEventListener("click", function () {
      const skill = card.getAttribute("data-skill");
      if (skillDescriptions[skill]) {
        switch (skill) {
          case "Speaking":
            route = "/speaking.html";
            break;
          case "Writing":
            route = "/writing.html";
            break;
          case "Listening":
            route = "/listening.html";
            break;
          case "Reading":
            route = "/reading.html";
            break;
          default:
            route = "/";
            break;
        }
        openModal(skill, skillDescriptions[skill]);
      }
    });
  });

  // ========== НОВАЯ ЛОГИКА ДЛЯ SPEAKING ==========
  // Переменная для хранения выбранного экзамена (IELTS / CEFR)
  let selectedExamType = null;

  // Функция показа модалки выбора режима (Full / Part Based)
  window.showSpeakingModeModal = function (examType) {
    selectedExamType = examType;
    const modeModal = document.getElementById("speakingModeModal");
    const label = document.getElementById("speakingModeMockLabel");
    if (modeModal && label) {
      label.textContent = `${examType} Speaking Practice`;
      modeModal.style.display = "flex";
      document.body.style.overflow = "hidden";
      // Закрываем предыдущее модальное окно (выбора CEFR/IELTS)
      closeModalFunc();
    }
  };

  window.closeSpeakingModeModal = function () {
    const modeModal = document.getElementById("speakingModeModal");
    if (modeModal) {
      modeModal.style.display = "none";
      document.body.style.overflow = "";
    }
  };

  // Функция показа модалки выбора Part (1,2,3)
  window.showSpeakingPartPicker = function (examType) {
    selectedExamType = examType;
    const partModal = document.getElementById("speakingPartPickerModal");
    const title = document.getElementById("speakingPartPickerTitle");
    if (partModal && title) {
      title.textContent = `Select an ${examType} Part`;
      partModal.style.display = "flex";
      document.body.style.overflow = "hidden";
      // Закрываем модалку выбора режима
      closeSpeakingModeModal();
    }
  };

  window.closeSpeakingPartPicker = function () {
    const partModal = document.getElementById("speakingPartPickerModal");
    if (partModal) {
      partModal.style.display = "none";
      document.body.style.overflow = "";
    }
  };

  // Переход на speaking.html с параметрами
  function startSpeakingTest(examType, mode, part = null) {
    let url = `/speaking.html?exam=${examType.toLowerCase()}&mode=${mode}`;
    if (part) {
      url += `&part=${part}`;
    }
    window.location.href = url;
  }

  // Обработчики для новой модалки выбора режима
  const fullMockBtn = document.getElementById("fullMockSpeakingBtn");
  const partBasedBtn = document.getElementById("partBasedSpeakingBtn");

  if (fullMockBtn) {
    fullMockBtn.addEventListener("click", function () {
      if (selectedExamType) {
        startSpeakingTest(selectedExamType, "full");
      }
    });
  }

  if (partBasedBtn) {
    partBasedBtn.addEventListener("click", function () {
      if (selectedExamType) {
        showSpeakingPartPicker(selectedExamType);
      }
    });
  }

  const partPickerBtn = document.querySelectorAll('.part-picker-btn')

  partPickerBtn.forEach(btn => {
    btn.addEventListener('click', function () {
      const part = btn.getAttribute('data-part')
      if (selectedExamType) {
        startSpeakingTest(selectedExamType, 'part', part)
      }
    })
  })

  // Переопределяем обработчик клика по карточкам IELTS/CEFR в модалке #modalOverlay
  const modalCards = document.querySelectorAll("#modalOverlay .card");
  modalCards.forEach(function (card) {
    card.addEventListener("click", function (e) {
      e.stopPropagation();
      const title = card.querySelector("h3")?.textContent;
      const skill = modalSkill?.textContent;
      localStorage.setItem("currentTest", title);

      // Если выбрано Speaking, то показываем новую модалку выбора режима
      if (skill === "Speaking" && (title === "CEFR" || title === "IELTS")) {
        showSpeakingModeModal(title);
      } 
      // Для остальных навыков оставляем старую логику
      else if (skill !== "Speaking" && (title === "CEFR" || title === "IELTS")) {
        window.location.href = route;
      }
    });
    card.style.cursor = "pointer";
  });

  // ========== Остальной код (Tools, Video Guide, Verify Modal, NotAvailable и т.д.) ==========
  // ... (весь остальной ваш код без изменений, кроме одного момента:
  // в обработчике tool-card для Video Guide оставляем как есть)

  // Ниже приведён код, который был у вас ранее (verifyModal, video guide, notAvailableModal и т.д.)
  // Убедитесь, что вы его скопировали полностью, так как он не меняется.

  // ========== Инструменты (Tests, Articles, Flashcards) ==========
  const toolCards = document.querySelectorAll(".tool-card");
  const toolDescriptions = {
    Tests: "Grammar & vocabulary practice",
    Articles: "Improve vocabulary by reading",
    Flashcards: "Memorize words quickly",
  };

  toolCards.forEach(function (card) {
    card.addEventListener("click", function () {
      const name = card.querySelector(".tool-name")?.textContent.trim();
      if (toolDescriptions[name]) {
        switch (name) {
          case "Tests":
            route = "/grammar-test.html";
            openModal(name, toolDescriptions[name]);
            break;
          case "Articles":
            route = "/article.html";
            openModal(name, toolDescriptions[name]);
            break;
          case "Flashcards":
            route = "/flashcard.html";
            openModal(name, toolDescriptions[name]);
            break;
          default:
            route = "/";
            break;
        }
      }
    });
  });

  // ========== Verify Modal (остаётся без изменений) ==========
  function createVerifyModal() {
    if (document.getElementById("verifyModal")) return;
    const modalHTML = `
      <div class="verify-modal" id="verifyModal" style="display: none;">
        <div class="verify-modal__overlay"></div>
        <div class="verify-modal__content">
          <div class="verify-code">
            <div class="verify-code__icon">🔐</div>
            <h2 class="verify-code__title">Access Code Required</h2>
            <p class="verify-code__desc" id="mockTitle">CEFR Writing Mock requires an access code</p>
            <div class="verify-code__input-box">
              <input class="verify-code__input" type="text" placeholder="Enter your access code" id="accessCode" />
            </div>
            <div class="verify-code__buttons">
              <button class="verify-code__btn verify-code__btn--cancel" id="cancelVerify">Cancel</button>
              <button class="verify-code__btn verify-code__btn--verify" id="verifyBtn">Verify & Start</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }
  createVerifyModal();

  const verifyModalEl = document.getElementById("verifyModal");
  const mockTitle = document.getElementById("mockTitle");
  const cancelVerify = document.getElementById("cancelVerify");
  const verifyBtn = document.getElementById("verifyBtn");
  const accessCode = document.getElementById("accessCode");
  const mainContent = document.querySelector("main");

  window.openVerifyModal = function (mockNumber) {
    if (!verifyModalEl) return;
    if (mockTitle) mockTitle.textContent = `CEFR Writing Mock ${mockNumber} requires an access code`;
    verifyModalEl.style.display = "block";
    if (mainContent) mainContent.classList.add("main-content-blur");
    document.body.style.overflow = "hidden";
    verifyModalEl.setAttribute("data-mock-number", mockNumber);
  };

  function closeVerifyModal() {
    if (!verifyModalEl) return;
    verifyModalEl.style.display = "none";
    if (mainContent) mainContent.classList.remove("main-content-blur");
    document.body.style.overflow = "";
    if (accessCode) accessCode.value = "";
  }

  if (cancelVerify) cancelVerify.addEventListener("click", closeVerifyModal);
  if (verifyModalEl) {
    verifyModalEl.addEventListener("click", function (e) {
      if (e.target.classList.contains("verify-modal__overlay")) closeVerifyModal();
    });
  }
  if (verifyBtn) {
    verifyBtn.addEventListener("click", function () {
      const code = accessCode?.value;
      const mockNumber = verifyModalEl.getAttribute("data-mock-number");
      if (code && code.length > 0) {
        if (validateAccessCode(mockNumber, code)) {
          alert("✅ Access granted! Starting mock exam...");
          closeVerifyModal();
        } else {
          alert("❌ Invalid access code");
        }
      } else {
        alert("Please enter an access code");
      }
    });
  }
  if (accessCode) {
    accessCode.addEventListener("keypress", function (e) {
      if (e.key === "Enter") verifyBtn?.click();
    });
  }

  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, "0");
  }

  function validateAccessCode(mockNumber, code) {
    const validCodeHashes = {
      "01": simpleHash("CEFR2024"),
      "02": simpleHash("WRITE123"),
      "03": simpleHash("ACCESS456"),
      "04": simpleHash("MOCK789"),
      "05": simpleHash("TEST000"),
    };
    const enteredHash = simpleHash(code || "");
    return validCodeHashes[mockNumber] === enteredHash;
  }

  // ========== Video Guide Feature (остаётся без изменений) ==========
  const videoUrls = {
    "CEFR-Speaking-1": "https://youtu.be/_W1zizhx03M",
    "CEFR-Speaking-2": "https://youtu.be/T7wvJbPNE20",
    "CEFR-Writing-1": "https://www.youtube.com/watch?v=YsU1Z6N6gMY",
    "CEFR-Writing-2": "https://www.youtube.com/watch?v=gs0QtL3QmqI",
    "IELTS-Speaking-1": "https://youtu.be/3BaCRHRtARg",
    "IELTS-Speaking-2": "https://youtu.be/1Zs0uPg9Z94",
    "IELTS-Writing-1": "https://youtu.be/xc0vbz_7xas",
    "IELTS-Writing-2": "https://youtu.be/HiZo05KgeYY",
  };

  let currentExamType = null;
  let currentSkillType = null;

  function createExamModal() {
    if (document.getElementById("examModal")) return;
    const modalHTML = `
      <div id="examModal" class="modalOverlay video-modal-overlay">
        <div class="modal">
          <div class="title"><span>🎬</span><span id="examModalTitle">IELTS Video Guide</span></div>
          <div class="cards" style="margin-top:20px">
            <div class="card" data-exam="CEFR">
              <div class="icon">📘</div>
              <div><h3>CEFR</h3><p>Common European Framework</p></div>
            </div>
            <div class="card" data-exam="IELTS">
              <div class="icon">🌍</div>
              <div><h3>IELTS</h3><p>International English</p></div>
            </div>
          </div>
          <button class="cancel" id="closeExamModal">Cancel</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  function createSkillModal() {
    if (document.getElementById("skillChoiceModal")) return;
    const modalHTML = `
      <div id="skillChoiceModal" class="modalOverlay video-modal-overlay">
        <div class="modal">
          <div class="title"><span>🎬</span><span id="skillModalTitle">IELTS Video Guide</span></div>
          <div class="cards" style="margin-top:20px">
            <div class="card" data-skill="Speaking">
              <div class="icon">🎤</div>
              <div><h3>Speaking</h3><p>Mock exam tips</p></div>
            </div>
            <div class="card" data-skill="Writing">
              <div class="icon">✍️</div>
              <div><h3>Writing</h3><p>Essay guide</p></div>
            </div>
          </div>
          <button class="video-modal-cancel" id="closeSkillModalBtn">Cancel</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  function createVideoListModal() {
    if (document.getElementById("videoListModal")) return;
    const modalHTML = `
      <div id="videoListModal" class="modalOverlay video-modal-overlay">
        <div class="modal">
          <div class="title"><span>🎬</span><span id="videoListModalTitle">IELTS Speaking</span></div>
          <div class="video-guides-count" id="videoGuidesCount" style="margin-top:20px">2 video guides available</div>
          <div id="videoListContainer" class="cards" style="margin-top:15px"></div>
          <button class="video-modal-cancel" id="closeVideoListModal">Cancel</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }

  function closeAllVideoModals() {
    const examModal = document.getElementById("examModal");
    const skillModal = document.getElementById("skillChoiceModal");
    const videoModal = document.getElementById("videoListModal");
    if (examModal) examModal.style.display = "none";
    if (skillModal) skillModal.style.display = "none";
    if (videoModal) videoModal.style.display = "none";
    document.body.style.overflow = "";
  }

  function openVideoModal(modalId) {
    closeAllVideoModals();
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
  }

  function showVideoList(examType, skillType) {
    const titleMap = {
      "CEFR-Speaking": "CEFR Speaking",
      "CEFR-Writing": "CEFR Writing",
      "IELTS-Speaking": "IELTS Speaking",
      "IELTS-Writing": "IELTS Writing",
    };
    const title = document.getElementById("videoListModalTitle");
    const countSpan = document.getElementById("videoGuidesCount");
    const container = document.getElementById("videoListContainer");
    if (title) title.textContent = titleMap[`${examType}-${skillType}`] || `🎬 ${examType} ${skillType}`;
    if (countSpan) countSpan.textContent = "2 video guides available";
    if (container) {
      container.innerHTML = "";
      const videos = [
        { num: 1, name: `${skillType} Mock 1 Guide`, desc: "Full walkthrough" },
        { num: 2, name: `${skillType} Mock 2 Guide`, desc: "Full walkthrough" },
      ];
      videos.forEach((video) => {
        const videoItem = document.createElement("div");
        videoItem.className = "card";
        videoItem.innerHTML = `<h4>${video.name}</h4><p>${video.desc}</p>`;
        videoItem.addEventListener("click", () => {
          const videoKey = `${examType}-${skillType}-${video.num}`;
          const videoUrl = videoUrls[videoKey] || `https://www.youtube.com/results?search_query=${examType}+${skillType}+guide`;
          window.open(videoUrl, "_blank");
          closeAllVideoModals();
        });
        container.appendChild(videoItem);
      });
    }
    openVideoModal("videoListModal");
  }

  function initVideoGuideFeature() {
    createExamModal();
    createSkillModal();
    createVideoListModal();
    const videoGuideBtn = Array.from(document.querySelectorAll(".tool-card")).find(card => card.querySelector(".tool-name")?.textContent.trim() === "Video Guide");
    if (videoGuideBtn) {
      videoGuideBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const titleEl = document.getElementById("examModalTitle");
        if (titleEl) titleEl.textContent = "Video Guide";
        openVideoModal("examModal");
      });
    }
    document.querySelectorAll("[data-exam]").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentExamType = btn.getAttribute("data-exam");
        const skillTitle = document.getElementById("skillModalTitle");
        if (skillTitle) skillTitle.textContent = `${currentExamType} Video Guide`;
        openVideoModal("skillChoiceModal");
      });
    });
    document.querySelectorAll("[data-skill]").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentSkillType = btn.getAttribute("data-skill");
        if (currentExamType && currentSkillType) showVideoList(currentExamType, currentSkillType);
      });
    });
    const closeExam = document.getElementById("closeExamModal");
    const closeSkill = document.getElementById("closeSkillModalBtn");
    const closeVideo = document.getElementById("closeVideoListModal");
    if (closeExam) closeExam.addEventListener("click", closeAllVideoModals);
    if (closeSkill) closeSkill.addEventListener("click", closeAllVideoModals);
    if (closeVideo) closeVideo.addEventListener("click", closeAllVideoModals);
    document.querySelectorAll(".video-modal-overlay").forEach((overlayEl) => {
      overlayEl.addEventListener("click", (e) => {
        if (e.target === overlayEl) closeAllVideoModals();
      });
    });
    const sidebarCards = document.querySelectorAll(".section-card");
    sidebarCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        e.stopPropagation();
        const cardText = card.textContent.trim();
        const parentSection = card.closest(".section");
        let examType = "", skillType = "";
        if (parentSection) {
          const bTag = parentSection.querySelector("b");
          if (bTag) examType = bTag.textContent.trim();
        }
        if (cardText.includes("Speaking")) skillType = "Speaking";
        else if (cardText.includes("Writing")) skillType = "Writing";
        else if (cardText.includes("Listening")) skillType = "Listening";
        else if (cardText.includes("Reading")) skillType = "Reading";
        if (examType && (skillType === "Speaking" || skillType === "Writing")) {
          currentExamType = examType;
          currentSkillType = skillType;
          showVideoList(currentExamType, currentSkillType);
        } else if (examType && skillType) {
          alert(`${skillType} module for ${examType} coming soon!`);
        }
      });
    });
  }
  initVideoGuideFeature();

  // ========== Not Available Modal ==========
  function showNotAvailableModal() {
    const modalNA = document.getElementById('notAvailableModal');
    if (modalNA) {
      modalNA.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }
  function closeNotAvailableModal() {
    const modalNA = document.getElementById('notAvailableModal');
    if (modalNA) {
      modalNA.style.display = 'none';
      document.body.style.overflow = '';
    }
  }
  const modalOverlayNA = document.getElementById('notAvailableModal');
  if (modalOverlayNA) {
    modalOverlayNA.addEventListener('click', function(e) {
      if (e.target === modalOverlayNA) closeNotAvailableModal();
    });
  }
  const closeBtnNA = document.getElementById('closeNotAvailableBtn');
  if (closeBtnNA) closeBtnNA.addEventListener('click', closeNotAvailableModal);
  document.querySelectorAll('.demo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      if (action === 'speaking' || action === 'fullmock') {
        showNotAvailableModal();
      } else {
        alert('✅ Эта функция работает! (просто демо)');
      }
    });
  });
});