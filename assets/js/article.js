// assets/js/article.js
document.addEventListener("DOMContentLoaded", function () {
  // ===== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК =====
  const sidebarTools = document.querySelectorAll(".article-tool");
  const contentPanels = document.querySelectorAll(".article-panel");
  const backBtn = document.querySelector(".article-back");

  if (backBtn) {
    backBtn.addEventListener("click", function () {
      window.location.href = "index.html";
    });
  }

  function activateTab(tabId) {
    // Переключаем кнопки в сайдбаре
    sidebarTools.forEach((tool) => {
      const toolTab = tool.getAttribute("data-tab");
      if (toolTab === tabId) {
        tool.classList.add("active");
      } else {
        tool.classList.remove("active");
      }
    });

    // Переключаем панели контента
    contentPanels.forEach((panel) => {
      if (panel.id === tabId) {
        panel.classList.add("active");
      } else {
        panel.classList.remove("active");
      }
    });
  }

  // Вешаем обработчики на кнопки
  sidebarTools.forEach((tool) => {
    tool.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab");
      activateTab(tabId);
    });
  });

  // ===== СЧЕТЧИК СЛОВ =====
  const editor = document.querySelector(".article-editor");
  const wordCountDisplay = document.querySelector(".article-wordcount");

  if (editor && wordCountDisplay) {
    editor.addEventListener("input", function () {
      const text = this.value.trim();
      let wordCount = 0;

      if (text.length > 0) {
        // Разбиваем по пробелам и удаляем пустые элементы
        const words = text.split(/\s+/).filter((word) => word.length > 0);
        wordCount = words.length;
      }

      wordCountDisplay.textContent = `${wordCount} words`;
    });
  }

  // ===== ЗАГРУЗКА ДАННЫХ С БЕКЕНДА =====
  const type = localStorage.getItem("currentTest");

  axios
    .get(`${API_URL}/test/${type}/article`)
    .then((response) => {
      const article = response.data;
      console.log(article);

      // Обновляем PRACTICE панель (оригинальный текст)
      const originalTextDiv = document.querySelector("#practice .article-text");
      if (originalTextDiv && article.text) {
        // Форматируем текст с подсветкой слов из vocabulary
        let formattedText = article.text;

        // Подсвечиваем слова из vocabulary, если они есть в тексте
        if (article.vocabulary && article.vocabulary.length > 0) {
          article.vocabulary.forEach((vocabItem) => {
            const word = vocabItem.word;
            // Создаем регулярное выражение для поиска слова (регистронезависимо)
            const regex = new RegExp(`\\b(${word})\\b`, "gi");
            formattedText = formattedText.replace(
              regex,
              `<span class="article-highlight">$1</span>`,
            );
          });
        }

        // Заменяем переносы строк на <br><br>
        formattedText = formattedText
          .split("\n\n")
          .map((p) => `<p>${p}</p>`)
          .join("");
        originalTextDiv.innerHTML = formattedText;
      }

      // Обновляем TRANSLATION панель (перевод)
      const translationPanel = document.querySelector(
        "#translation .article-card p",
      );
      if (translationPanel && article.translation) {
        // Заменяем переносы строк на <br><br>
        const formattedTranslation = article.translation.split("\n\n")
          .map((p) => `<p>${p}</p>`)
          .join("");
        translationPanel.innerHTML = formattedTranslation;
      }

      // Обновляем LEXICAL панель (словарь)
      const lexicalWrapper = document.querySelector(
        "#lexical .lexical-wrapper",
      );
      if (
        lexicalWrapper &&
        article.vocabulary &&
        article.vocabulary.length > 0
      ) {
        // Очищаем существующий контент, но сохраняем заголовок
        const header = lexicalWrapper.querySelector(".lexical-header");
        lexicalWrapper.innerHTML = "";
        if (header) {
          lexicalWrapper.appendChild(header);
        } else {
          const newHeader = document.createElement("div");
          newHeader.className = "lexical-header";
          newHeader.innerHTML = "📚 Lexical Resources";
          lexicalWrapper.appendChild(newHeader);
        }

        // Добавляем карточки для каждого слова из vocabulary
        article.vocabulary.forEach((vocabItem) => {
          const lexCard = document.createElement("div");
          lexCard.className = "lex-card";

          lexCard.innerHTML = `
            <div class="lex-title"><span class="dot"></span>${vocabItem.word}</div>
            <div class="lex-desc">${vocabItem.definition || "No definition available"}</div>
            <div class="lex-translate">${vocabItem.translation || "No translation available"}</div>
            <div class="lex-example">
              <p>"${vocabItem.example || "No example available"}"</p>
              <span>${vocabItem.example_translation || "No example translation available"}</span>
            </div>
          `;

          lexicalWrapper.appendChild(lexCard);
        });
      }

      // Обновляем заголовок страницы с уровнем статьи
      const headerTitle = document.querySelector(".article-header-title");
      if (headerTitle && article.level) {
        headerTitle.innerHTML = `📄 Articles - ${article.type} ${article.level}`;
      }
    })
    .catch((error) => {
      console.error("Error loading article:", error);
      // Показываем сообщение об ошибке
      const originalTextDiv = document.querySelector("#practice .article-text");
      if (originalTextDiv) {
        originalTextDiv.innerHTML =
          '<p style="color: red;">Error loading article. Please try again later.</p>';
      }
    });
});
