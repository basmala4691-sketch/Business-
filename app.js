// Main Application Logic
let quizData = [];
let userAnswers = {};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        quizData = data.questions;
        renderQuiz();
    } catch (error) {
        console.error('Error loading quiz data:', error);
    }
});

function renderQuiz() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';

    quizData.forEach((q, index) => {
        const qCard = document.createElement('div');
        qCard.className = 'question-card';
        qCard.id = `q-card-${q.id}`;

        let optionsHTML = '';
        if (q.type === 'multiple_choice' || q.type === 'true_false' || q.type === 'matching') {
            optionsHTML = `<ul class="options-list">` + 
                q.options.map(opt => `
                    <li class="option-item" onclick="selectOption(${q.id}, '${opt.replace(/'/g, "\'")}', this)">
                        ${opt}
                    </li>
                `).join('') + `</ul>`;
        } else if (q.type === 'short_answer') {
            optionsHTML = `
                <textarea id="sa-${q.id}" class="option-item" style="width:100%; height:80px; resize:vertical;" placeholder="Type your answer here..." onchange="recordTextAnswer(${q.id}, this.value)"></textarea>
            `;
        }

        qCard.innerHTML = `
            <h3>Q${index + 1}. ${q.question}</h3>
            ${optionsHTML}
            <div class="explanation" id="exp-${q.id}">
                <strong>Explanation:</strong> ${q.explanation}<br>
                <strong>Correct Answer:</strong> ${q.answer}
            </div>
        `;
        container.appendChild(qCard);
    });
}

function selectOption(qId, selectedOpt, element) {
    userAnswers[qId] = selectedOpt;
    const parent = element.parentElement;
    Array.from(parent.children).forEach(child => child.classList.remove('selected'));
    element.classList.add('selected');
    updateProgress();
}

function recordTextAnswer(qId, text) {
    userAnswers[qId] = text.trim();
    updateProgress();
}

function updateProgress() {
    const count = Object.keys(userAnswers).length;
    document.getElementById('progress-text').innerText = `${count} / ${quizData.length} Answered`;
}

function submitExam() {
    let score = 0;
    quizData.forEach(q => {
        const card = document.getElementById(`q-card-${q.id}`);
        const exp = document.getElementById(`exp-${q.id}`);
        exp.style.display = 'block';

        if (q.type === 'multiple_choice' || q.type === 'true_false' || q.type === 'matching') {
            const options = card.querySelectorAll('.option-item');
            options.forEach(opt => {
                const text = opt.innerText.trim();
                if (text === q.answer) {
                    opt.classList.add('correct');
                }
                if (userAnswers[q.id] === text && text !== q.answer) {
                    opt.classList.add('incorrect');
                }
            });
            if (userAnswers[q.id] === q.answer) score++;
        } else if (q.type === 'short_answer') {
            if (userAnswers[q.id] && userAnswers[q.id].toLowerCase().includes(q.answer.toLowerCase().slice(0, 10))) {
                score++;
            }
        }
    });

    alert(`Exam submitted! Score: ${score} / ${quizData.length}`);
}
