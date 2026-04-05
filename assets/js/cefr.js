document.addEventListener("DOMContentLoaded", function () {
    // ======================
    // DOM Elements
    // ======================
    const form = document.getElementById('cefrForm');
    const fullNameInput = document.getElementById('fullName');
    const passcodeInput = document.getElementById('passcode');
    const errorMessage = document.getElementById('errorMessage');
    const backButton = document.querySelector('.cefr-back');

    // ======================
    // Constants
    // ======================
    const VALID_PASSCODE = "9370946019"; // Passcode для CEFR мока
    const MIN_NAME_LENGTH = 2;
    const MAX_NAME_LENGTH = 50;

    // ======================
    // Helper Functions
    // ======================

    /**
     * Валидация имени
     */
    function validateName(name) {
        name = name.trim();

        if (name.length === 0) {
            return { valid: false, message: "Full name is required" };
        }

        if (name.length < MIN_NAME_LENGTH) {
            return { valid: false, message: `Name must be at least ${MIN_NAME_LENGTH} characters` };
        }

        if (name.length > MAX_NAME_LENGTH) {
            return { valid: false, message: `Name must be less than ${MAX_NAME_LENGTH} characters` };
        }

        // Проверка на допустимые символы (буквы, пробелы, дефисы, точки)
        const nameRegex = /^[a-zA-Z\s\-'.]+$/;
        if (!nameRegex.test(name)) {
            return { valid: false, message: "Name can only contain letters, spaces, hyphens, and apostrophes" };
        }

        return { valid: true, message: "" };
    }

    /**
     * Валидация passcode
     */
    function validatePasscode(passcode) {
        if (!passcode) {
            return { valid: false, message: "Passcode is required" };
        }

        // Убираем ведущие нули и проверяем
        const passcodeStr = passcode.toString().trim();

        if (passcodeStr.length === 0) {
            return { valid: false, message: "Passcode is required" };
        }

        // Проверяем, что это число
        if (isNaN(passcodeStr)) {
            return { valid: false, message: "Passcode must be a number" };
        }

        // Проверяем длину (10 цифр)
        if (passcodeStr.length !== 10) {
            return { valid: false, message: "Passcode must be 10 digits" };
        }

        return { valid: true, message: "" };
    }

    /**
     * Показать ошибку
     */
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.color = "#e12626";

            // Добавляем красную обводку к полю passcode
            if (passcodeInput) {
                passcodeInput.classList.add('cefr-input-error');
                passcodeInput.style.borderColor = "#e12626";
            }
        }
    }

    /**
     * Очистить ошибку
     */
    function clearError() {
        if (errorMessage) {
            errorMessage.textContent = "";
        }

        // Возвращаем обычный стиль полю passcode
        if (passcodeInput) {
            passcodeInput.classList.remove('cefr-input-error');
            passcodeInput.style.borderColor = "#d9dde2";
        }
    }

    /**
     * Форматирование имени (капитализация первой буквы каждого слова)
     */
    function formatName(name) {
        return name
            .trim()
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    /**
     * Сохранить данные пользователя
     */
    function saveUserData(name) {
        // Сохраняем имя и фамилию (разделяем по первому пробелу)
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        localStorage.setItem('userName', firstName);
        localStorage.setItem('userSurname', lastName);

        // Сохраняем время последнего входа
        localStorage.setItem('lastLogin', new Date().toISOString());

        // Сохраняем выбранный тест
        localStorage.setItem('currentTest', 'CEFR');
    }

    // ======================
    // Event Listeners
    // ======================

    /**
     * Обработка отправки формы
     */
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Очищаем предыдущие ошибки
            clearError();

            // Получаем значения
            const fullName = fullNameInput ? fullNameInput.value : '';
            const passcode = passcodeInput ? passcodeInput.value : '';

            // Валидация имени
            const nameValidation = validateName(fullName);
            if (!nameValidation.valid) {
                showError(nameValidation.message);
                if (fullNameInput) {
                    fullNameInput.focus();
                }
                return;
            }

            // Валидация passcode
            const passcodeValidation = validatePasscode(passcode);
            if (!passcodeValidation.valid) {
                showError(passcodeValidation.message);
                if (passcodeInput) {
                    passcodeInput.focus();
                }
                return;
            }

            // Проверка passcode
            if (passcode.toString() !== VALID_PASSCODE) {
                showError("Invalid passcode. Please try again.");
                if (passcodeInput) {
                    passcodeInput.value = '';
                    passcodeInput.focus();
                }
                return;
            }

            // Всё хорошо - форматируем имя и сохраняем
            const formattedName = formatName(fullName);

            // Сохраняем данные пользователя
            saveUserData(formattedName);

            // Показываем успешное сообщение
            showSuccessAndRedirect();
        });
    }

    /**
     * Очистка ошибки при вводе в поле passcode
     */
    if (passcodeInput) {
        passcodeInput.addEventListener('input', function () {
            clearError();

            // Убираем красный цвет при вводе
            this.style.borderColor = "#d9dde2";
        });
    }

    /**
     * Очистка ошибки при вводе в поле имени
     */
    if (fullNameInput) {
        fullNameInput.addEventListener('input', function () {
            // Если есть ошибка и она не про passcode, очищаем
            if (errorMessage && errorMessage.textContent && !errorMessage.textContent.includes('passcode')) {
                clearError();
            }
        });
    }

    /**
     * Валидация на лету для имени (чтобы пользователь сразу видел ошибки)
     */
    if (fullNameInput) {
        fullNameInput.addEventListener('blur', function () {
            const name = this.value;
            const validation = validateName(name);

            if (!validation.valid && name.length > 0) {
                // Показываем ошибку, но не блокируем отправку
                if (errorMessage && !errorMessage.textContent) {
                    errorMessage.textContent = validation.message;
                    errorMessage.style.color = "#e12626";
                }
            } else {
                // Если имя валидно и нет других ошибок, очищаем
                if (errorMessage && errorMessage.textContent && errorMessage.textContent.includes('Name')) {
                    clearError();
                }
            }
        });
    }

    /**
     * Показать успех и перенаправить
     */
    function showSuccessAndRedirect() {
        // Показываем зеленое сообщение об успехе
        if (errorMessage) {
            errorMessage.textContent = "✓ Access granted! Redirecting...";
            errorMessage.style.color = "#0b4d3a";
            errorMessage.style.fontWeight = "500";
        }

        // Деактивируем кнопку
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.style.opacity = "0.7";
            submitButton.textContent = "Redirecting...";
        }

        // Перенаправляем на страницу CEFR теста
        setTimeout(function () {
            window.location.href = "mock-exam.html";
        }, 1500);
    }

    /**
     * Обработка кнопки "назад"
     */
    if (backButton) {
        backButton.addEventListener('click', function () {
            window.location.href = "index.html"; // Возврат на главную
        });
    }

    /**
     * Автозаполнение имени, если пользователь уже входил
     */
    function autoFillName() {
        const savedName = localStorage.getItem('userName');
        const savedSurname = localStorage.getItem('userSurname');

        if (savedName && fullNameInput) {
            const fullName = savedSurname ? `${savedName} ${savedSurname}` : savedName;
            fullNameInput.value = fullName;
        }
    }

    // Вызываем автозаполнение при загрузке
    autoFillName();

    // ======================
    // Дополнительная защита от XSS
    // ======================

    /**
     * Экранирование HTML специальных символов
     */
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Применяем экранирование к полю имени
    if (fullNameInput) {
        fullNameInput.addEventListener('input', function () {
            // Просто для демонстрации - в реальности экранирование должно быть на сервере
            this.value = this.value.replace(/[<>]/g, '');
        });
    }
});