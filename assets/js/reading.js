/* ========================================
        READING - JavaScript Functionality
        ======================================== */

// Timer functionality
let time = 31 * 60 + 22; // 31:22 in seconds
let timerInterval = null;
let isPaused = false;

const timerElement = document.getElementById('timer');
const pauseBtn = document.getElementById('pauseBtn');

function updateTimerDisplay() {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerElement.textContent =
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (!isPaused && time > 0) {
            time--;
            updateTimerDisplay();

            if (time === 0) {
                clearInterval(timerInterval);
                alert('Time is up!');
            }
        }
    }, 1000);
}

// Pause button functionality
pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    pauseBtn.style.background = isPaused ? '#e74c3c' : 'rgba(255, 255, 255, 0.15)';
});

// Step navigation
const steps = document.querySelectorAll('.step');
steps.forEach((step, index) => {
    step.addEventListener('click', () => {
        steps.forEach(s => s.classList.remove('active'));
        step.classList.add('active');

        // Here you could add logic to show/hide different parts
        console.log(`Step ${index + 1} clicked`);
    });
});

// Select dropdown functionality
const selects = document.querySelectorAll('.q-card select');
selects.forEach(select => {
    select.addEventListener('change', function () {
        if (this.value) {
            this.classList.add('has-value');
        } else {
            this.classList.remove('has-value');
        }
    });
});

// Button functions
function goBack() {
    if (confirm('Are you sure you want to go back? Your progress may be lost.')) {
        window.history.back();
    }
}

function finishTest() {
    if (confirm('Are you sure you want to finish? This will submit your answers.')) {
        // Collect all answers
        const answers = {
            part1: [],
            part2: {},
            part3: {}
        };

        // Part 1 - gap inputs
        const gaps = document.querySelectorAll('.gap');
        gaps.forEach((gap, index) => {
            answers.part1.push({
                number: index + 1,
                value: gap.value || '(empty)'
            });
        });

        // Part 2 - select dropdowns
        const part2Selects = document.querySelector('.reading-part2 .q-card select');
        if (part2Selects) {
            const part2Questions = document.querySelectorAll('.reading-part2 .q-card');
            part2Questions.forEach(card => {
                const questionNumber = card.querySelector('p b').textContent;
                const select = card.querySelector('select');
                answers.part2[questionNumber] = select.value || 'not answered';
            });
        }

        // Part 3 - select dropdowns
        const part3Questions = document.querySelectorAll('.reading-part3 .q-card');
        part3Questions.forEach(card => {
            const questionNumber = card.querySelector('p b').textContent;
            const select = card.querySelector('select');
            answers.part3[questionNumber] = select.value || 'not answered';
        });

        console.log('Answers:', answers);
        alert('Test submitted! Check console for answers.');
    }
}

function checkAnswers() {
    let answered = 0;
    let total = 0;

    // Check Part 1
    const gaps = document.querySelectorAll('.gap');
    gaps.forEach(gap => {
        total++;
        if (gap.value.trim()) answered++;
    });

    // Check Part 2
    const part2Selects = document.querySelectorAll('.reading-part2 .q-card select');
    part2Selects.forEach(select => {
        total++;
        if (select.value) answered++;
    });

    // Check Part 3
    const part3Selects = document.querySelectorAll('.reading-part3 .q-card select');
    part3Selects.forEach(select => {
        total++;
        if (select.value) answered++;
    });

    alert(`You have answered ${answered} out of ${total} questions.`);
}

function nextPart() {
    // Highlight next step
    const activeStep = document.querySelector('.step.active');
    const nextStep = activeStep.nextElementSibling;

    if (nextStep && nextStep.classList.contains('step')) {
        steps.forEach(s => s.classList.remove('active'));
        nextStep.classList.add('active');

        // Scroll to Part 2 if going to step 2
        if (nextStep.textContent === '2') {
            const part2 = document.querySelector('.reading-part2');
            part2.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        alert('You are on the last step!');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    startTimer();
    updateTimerDisplay();

    // Navigation to different parts via steps
    const step4 = document.getElementById('step-4');
    if (step4) {
        step4.addEventListener('click', () => {
            const part4 = document.getElementById('reading-part-4');
            if (part4) {
                part4.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});

document.querySelectorAll('.reading-part-4-answers').forEach(group => {
    group.querySelectorAll('div').forEach(option => {
        option.addEventListener('click', () => {
            group.querySelectorAll('div').forEach(o => o.classList.remove('reading-part-4-selected'));
            option.classList.add('reading-part-4-selected');
        });
    });
});

const inputs = document.querySelectorAll('.reading-part-5-input');

inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        if (input.value.length > 0 && inputs[index + 1]) {
            inputs[index + 1].focus();
        }
    });
});