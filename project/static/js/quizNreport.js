// 기존 초기 Quiz와 Report 선택 버튼을 설정하는 함수
function initializeQuizContainer() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `
        <div class="button-container">
            <button class="learn-more" onclick="openQuizContent()">Quiz</button>
            <button class="learn-more" onclick="openReportContent()">Report</button>
        </div>
    `;
}

// Quiz와 Report 버튼 클릭 시 새로운 콘텐츠 창 생성
function openQuizContent() {
    const quizContainer = document.getElementById('quiz-container');
    
    // 퀴즈 창 생성 - 여기서 퀴즈 내용을 동적으로 가져와 표시
    fetch('/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'quiz' })
    })
    .then(response => response.json())
    .then(data => {
        if (data.mode === 'quiz') {
            quizContainer.innerHTML = `
                <div>
                    <h2>퀴즈 질문</h2>
                    <form id="quizForm">
                        ${data.data.map(question => `
                            <div class="question">
                                <p><strong>${question.question}</strong></p>
                                ${question.options.map((option, index) => `
                                    <label>
                                        <input type="radio" name="answer_${question.id}" value="option${index + 1}">
                                        ${option}
                                    </label><br>
                                `).join('')}
                            </div>
                        `).join('')}
                    </form>
                    <button onclick="submitQuiz()">Submit Quiz</button>
                    <button onclick="closeQuiz()">close</button>
                    <p id="score"></p>
                </div>
            `;
            quizContainer.style.display = 'flex'; // 컨테이너 표시
        }
    });
}

// Quiz 제출 함수
function submitQuiz() {
    const formData = new FormData(document.getElementById('quizForm'));
    const answers = {};

    formData.forEach((value, key) => {
        answers[key.split('_')[1]] = value;
    });

    fetch('/submit_answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'quiz', answers })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('score').innerText = `Your score: ${data.score}. Result: ${data.result}`;
    });
}

// 레포트 창 생성 및 표시
function openReportContent() {
    const quizContainer = document.getElementById('quiz-container');
    fetch('/execute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mode: 'report' })
    })
    .then(response => response.json())
    .then(data => {
        if (data.mode === 'report') {
            quizContainer.innerHTML = `
                <div>
                    <h3>Report Topic</h3>
                    <p>${data.topic}</p>
                    <textarea id="reportContent" rows="5" placeholder="Enter your report here..."></textarea>
                    <button onclick="submitReport()">Submit Report</button>
                    <button onclick="closeQuiz()">Close</button>
                </div>
            `;
            quizContainer.style.display = 'flex'; // 컨테이너 표시
        }
    });
}

// 레포트 제출 함수
function submitReport() {
    const content = document.getElementById('reportContent').value;
    fetch('/submit_answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            mode: 'report',
            user_id: 1,  // 임시로 user_id를 1로 지정
            content: content
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.result.status);
        closeQuiz();
    });
}


// Quiz&Report 창 닫기 함수
function closeQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.style.display = 'none';

    // 컨테이너 내용을 완전히 제거한 후 초기화
    quizContainer.innerHTML = '';
    initializeQuizContainer();
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initializeQuizContainer);
