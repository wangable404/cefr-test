const taskContent = document.getElementById("task-content");
const tabs = document.querySelectorAll(".writing-tab");
const textarea = document.querySelector(".writing-textarea");
const wordCount = document.getElementById("word-count");
const target = document.getElementById("target");

// CONTENTS
const tasks = {
    1: `
    <div class="writing-card writing-context">
        <b>CONTEXT:</b>
        <p>You recently used a city bicycle rental service.</p>
    </div>

    <div class="writing-card">
        <p><i>Dear Customer,</i></p>
        <p>Thank you for using CityBike rental service! We hope you enjoyed exploring the city on two wheels.</p>
        <p>How did you find the bicycle condition and the docking stations? Was our app easy to use for rentals?</p>
        <p>What improvements would encourage you to use our service more often?</p>
        <p>CityBike Customer Team</p>
    </div>

    <div class="writing-card writing-task">
        <b>Task 1.1:</b>
        <p>Write a letter to your friend, who is visiting your city soon. Write about your feelings and what you think they should do.</p>
    </div>
    `,
    2: `
    <div class="writing-card writing-context">
        <b>CONTEXT:</b>
        <p>You recently used a city bicycle rental service.</p>
    </div>

    <div class="writing-card">
        <p><i>Dear Customer,</i></p>
        <p>Thank you for using CityBike rental service! We hope you enjoyed exploring the city on two wheels.</p>
        <p>How did you find the bicycle condition and the docking stations? Was our app easy to use for rentals?</p>
        <p>What improvements would encourage you to use our service more often?</p>
        <p>CityBike Customer Team</p>
    </div>

    <div class="writing-card writing-task">
        <b>Task 1.2:</b>
<h2 class="title">TASK 2</h2>
<div class="line"></div>

<div class="context">
  <h3>CONTEXT:</h3>
  <p>
    You are participating in an online discussion forum. The topic is:
    <span class="highlight">"Should physical education be compulsory in schools?"</span>
    Write your response, giving reasons and examples. Write 180–200 words.
  </p>
</div>
    </div>
    `
};

// SWITCH TABS
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const id = tab.dataset.tab;
        if (id) {
            taskContent.innerHTML = tasks[id];
        }

        // change target
        if (id == "2") {
            target.textContent = "Target: 120-150 words";
        } else {
            target.textContent = "Target: 50-70 words";
        }
    });
});

// INIT
taskContent.innerHTML = tasks[1];

// WORD COUNT
textarea.addEventListener("input", () => {
    const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0);
    wordCount.textContent = words.length + " words";
});