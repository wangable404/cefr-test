// ===== DELAY CONTROL COMPONENT =====
const delayToggle = document.getElementById('delayToggle');
const delayPanel = document.querySelector('.delay-panel');
const delayStartBtn = document.getElementById('delayStartBtn');
const delayTimer = document.getElementById('delayTimer');
const timerValue = document.querySelector('.timer-value');
const delayControl = document.querySelector('.delay-control');
const delayBetween = document.getElementById('delayBetween');
const replayCount = document.getElementById('replayCount');

let delayInterval = null;
let currentPlay = 0;
let totalPlays = 2;
let delaySeconds = 5;

// Toggle delay panel
if (delayToggle && delayPanel) {
    delayToggle.addEventListener('click', () => {
        if (!delayControl.classList.contains('running')) {
            delayPanel.classList.toggle('active');
        }
    });
}

// Start delay countdown
if (delayStartBtn) {
    delayStartBtn.addEventListener('click', () => {
        // Clear any existing interval to prevent memory leaks
        if (delayInterval) {
            clearInterval(delayInterval);
            delayInterval = null;
        }

        // Get settings
        delaySeconds = parseInt(delayBetween.value) || 5;
        totalPlays = parseInt(replayCount.value) || 2;
        currentPlay = 0;

        // Show running state
        if (delayControl) {
            delayControl.classList.add('running');
        }

        if (delayPanel) {
            delayPanel.classList.add('active');
        }

        if (delayTimer) {
            delayTimer.classList.add('active');
        }

        // Start the first play immediately
        playAudioWithDelay();
    });
}

function playAudioWithDelay() {
    currentPlay++;

    // Update button text
    if (delayStartBtn) {
        const btnText = delayStartBtn.querySelector('span:last-child');
        if (btnText) {
            btnText.textContent = `Playing ${currentPlay}/${totalPlays}...`;
        }
    }

    // Simulate audio playing (in real app, this would trigger actual audio)
    console.log(`Playing audio ${currentPlay} of ${totalPlays}`);

    if (currentPlay < totalPlays) {
        // Start countdown for next play
        let remaining = delaySeconds;
        updateTimerDisplay(remaining);

        delayInterval = setInterval(() => {
            remaining--;
            updateTimerDisplay(remaining);

            if (remaining <= 0) {
                clearInterval(delayInterval);
                playAudioWithDelay();
            }
        }, 1000);
    } else {
        // All plays complete
        setTimeout(() => {
            resetDelayControl();
        }, 1000);
    }
}

function updateTimerDisplay(seconds) {
    if (timerValue) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerValue.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

function resetDelayControl() {
    if (delayInterval) {
        clearInterval(delayInterval);
        delayInterval = null;
    }

    if (delayControl) {
        delayControl.classList.remove('running');
    }

    if (delayTimer) {
        delayTimer.classList.remove('active');
    }

    if (delayStartBtn) {
        const btnText = delayStartBtn.querySelector('span:last-child');
        if (btnText) {
            btnText.textContent = 'Start with Delay';
        }
    }

    if (timerValue) {
        timerValue.textContent = `00:${delaySeconds.toString().padStart(2, '0')}`;
    }

    currentPlay = 0;
}

// ===== Part 1 & 2: simple validation highlight =====
const inputs = document.querySelectorAll(".fill input");

inputs.forEach(input => {
    input.addEventListener("input", () => {
        if (input.value.trim() !== "") {
            input.style.borderBottom = "2px solid green";
        } else {
            input.style.borderBottom = "2px solid #0f8b7f";
        }
    });
});

// ===== Part 3: Toggle Options Panel =====
const toggleBtn = document.getElementById("toggleOptions");
const optionsPanel = document.querySelector(".part3-options-panel");
const contentContainer = document.querySelector(".part3-content");

if (toggleBtn && optionsPanel) {
    toggleBtn.addEventListener("click", () => {
        optionsPanel.classList.toggle("hidden");

        if (contentContainer) {
            contentContainer.classList.toggle("options-hidden");
        }
    });
}

// ===== Part 3: Select change highlight =====
const speakerSelects = document.querySelectorAll(".part3-speaker-item select");

speakerSelects.forEach(select => {
    select.addEventListener("change", () => {
        const speakerItem = select.closest(".part3-speaker-item");

        if (select.value !== "") {
            speakerItem.style.borderLeftColor = "#27ae60";
            speakerItem.style.background = "#f0f9f4";
        } else {
            speakerItem.style.borderLeftColor = "#0f8b7f";
            speakerItem.style.background = "white";
        }
    });
});

// ===== Part 4 Map Based: Option button selection =====
document.querySelectorAll('.part-4-map-content .question-card').forEach(card => {
    const buttons = card.querySelectorAll('.option-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remove selected from all buttons in this question
            buttons.forEach(b => b.classList.remove('selected'));
            // Add selected to clicked button
            this.classList.add('selected');
        });
    });
});

// Clear all map selections
function clearMapSelections() {
    document.querySelectorAll('.part-4-map-content .option-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// Pencil tool (placeholder for now)
function enablePencil() {
    console.log('Pencil tool enabled');
}

const part6Inputs = document.querySelectorAll(".part-6 input");

part6Inputs.forEach(input => {
    input.addEventListener("focus", () => {
        input.style.borderBottom = "2px solid #111";
    });

    input.addEventListener("blur", () => {
        input.style.borderBottom = "2px solid #2bb673";
    });
});