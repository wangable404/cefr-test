(function () {
    'use strict';

    // ── Ссылки на DOM-элементы ──
    const startBtn = document.getElementById('mockExamStartBtn');
    const overlay = document.getElementById('mockExamOverlay');
    const cancelBtn = document.getElementById('mockExamCancelBtn');
    const confirmBtn = document.getElementById('mockExamConfirmBtn');
    const loadingEl = document.getElementById('mockExamLoading');

    // ── Проверка наличия необходимых элементов ──
    if (!startBtn || !overlay) {
        console.warn('Mock exam elements not found');
        return;
    }

    // ── Ripple-эффект на кнопке «Start Exam» ──
    startBtn.addEventListener('click', function (e) {
        // Создаём элемент ripple
        const ripple = document.createElement('span');
        ripple.classList.add('mock-exam-ripple');

        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

        this.appendChild(ripple);

        // Удаляем ripple после анимации
        ripple.addEventListener('animationend', function () {
            ripple.remove();
        });

        // Показываем модальное окно подтверждения
        overlay.classList.add('mock-exam-overlay--visible');
    });

    // ── Закрытие модального окна по кнопке «Go Back» ──
    cancelBtn.addEventListener('click', function () {
        overlay.classList.remove('mock-exam-overlay--visible');
    });

    // ── Закрытие модального окна по клику на оверлей ──
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            overlay.classList.remove('mock-exam-overlay--visible');
        }
    });

    // ── Закрытие модального окна по Escape ──
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('mock-exam-overlay--visible')) {
            overlay.classList.remove('mock-exam-overlay--visible');
        }
    });

    // ── Подтверждение запуска экзамена ──
    // Примечание: фактический редирект обрабатывается в mock-exam/start-now.js
    confirmBtn.addEventListener('click', function () {
        // Скрываем модальное окно
        overlay.classList.remove('mock-exam-overlay--visible');

        // Показываем экран загрузки
        loadingEl.classList.add('mock-exam-loading--visible');
    });

    // ── Анимация карточек при прокрутке (Intersection Observer) ──
    // Для случаев, когда страница длиннее экрана
    const cards = document.querySelectorAll('.mock-exam-card');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        cards.forEach(function (card) {
            observer.observe(card);
        });
    }

})();