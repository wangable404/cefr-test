document.addEventListener("DOMContentLoaded", function () {
  const savedName = localStorage.getItem("userName");
  const savedSurname = localStorage.getItem("userSurname");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  let route = "/";

  if ((!savedName || !savedSurname) && currentPage !== "login.html") {
    window.location.href = "login.html";
    return;
  }

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

  const skillCards = document.querySelectorAll(".skill-card");
  const skillDescriptions = {
    Speaking: "Practice speaking tests",
    Writing: "Practice writing tests",
    Listening: "Practice listening tests",
    Reading: "Practice reading tests",
  };

  skillCards.forEach(function (card) {
    card.addEventListener("click", function () {
      const skill = card.getAttribute("data-skill");
      if (skillDescriptions[skill]) {
        openModal(skill, skillDescriptions[skill]);
      }
    });
  });

  const fullMock = document.querySelector(".full-mock__card");
  if (fullMock) {
    fullMock.addEventListener("click", function () {
      openModal("Full Mock Exam", "Practice all 4 skills");
    });
  }

  const modalCards = document.querySelectorAll("#modalOverlay .card");

  modalCards.forEach(function (card) {
    card.addEventListener("click", function (e) {
      e.stopPropagation();

      const title = card.querySelector("h3")?.textContent;
      const skill = modalSkill?.textContent;

      if (title === "CEFR" && skill === "Writing") {
        localStorage.setItem("currentTest", "CEFRWriting");
        // window.location.href = "cefr-open.html";
        window.location.href = route;
    } else if (title === "CEFR") {
        localStorage.setItem("currentTest", "CEFR");
        // window.location.href = "cefr.html";
        window.location.href = route;
    } else if (title === "IELTS") {
        localStorage.setItem("currentTest", "IELTS");
        // window.location.href = "ielts.html";
        window.location.href = route;
      }
    });

    card.style.cursor = "pointer";
  });

  const toolCards = document.querySelectorAll(".tool-card");
  const toolDescriptions = {
    Tests: "Grammar & vocabulary practice",
    Articles: "Improve vocabulary by reading",
    Flashcards: "Memorize words quickly",
    "Video Guide": "Watch IELTS tips",
  };

  toolCards.forEach(function (card) {
    card.addEventListener("click", function () {
      const name = card.querySelector(".tool-name")?.textContent.trim();
      if (toolDescriptions[name]) {
        switch (name) {
          case "Tests":
            route = "/grammar-test.html";
            break;
          case "Articles":
            route = "/article.html";
            break;
          case "Flashcards":
            route = "/flashcards.html";
            break;
          case "Video Guide":
            route = "/video-guide.html";
            break;
          default:
            route = "/";
            break;
        }
        openModal(name, toolDescriptions[name]);
      }
    });
  });
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
  const verifyModal = document.getElementById("verifyModal");
  const mockTitle = document.getElementById("mockTitle");
  const cancelVerify = document.getElementById("cancelVerify");
  const verifyBtn = document.getElementById("verifyBtn");
  const accessCode = document.getElementById("accessCode");
  const mainContent = document.querySelector("main");

  window.openVerifyModal = function (mockNumber) {
    if (!verifyModal) return;

    if (mockTitle) {
      mockTitle.textContent = `CEFR Writing Mock ${mockNumber} requires an access code`;
    }

    verifyModal.style.display = "block";

    if (mainContent) {
      mainContent.classList.add("main-content-blur");
    }

    document.body.style.overflow = "hidden";
    verifyModal.setAttribute("data-mock-number", mockNumber);
  };

  function closeVerifyModal() {
    if (!verifyModal) return;

    verifyModal.style.display = "none";

    if (mainContent) {
      mainContent.classList.remove("main-content-blur");
    }

    document.body.style.overflow = "";
    if (accessCode) accessCode.value = "";
  }

  if (cancelVerify) {
    cancelVerify.addEventListener("click", closeVerifyModal);
  }

  if (verifyModal) {
    verifyModal.addEventListener("click", function (e) {
      if (e.target.classList.contains("verify-modal__overlay")) {
        closeVerifyModal();
      }
    });
  }

  if (verifyBtn) {
    verifyBtn.addEventListener("click", function () {
      const code = accessCode?.value;
      const mockNumber = verifyModal.getAttribute("data-mock-number");

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
      if (e.key === "Enter") {
        verifyBtn?.click();
      }
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
});
