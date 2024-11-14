
function showTab(tabId) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
    if (tabId === 'community') {// 커뮤니티 창
        fetchPosts();
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const quizContainer = document.getElementById('quiz-container');
  
    sidebar.classList.toggle('collapsed');
  
    // 사이드바 접기 상태에 따라 퀴즈 화면 위치 조정
    const isCollapsed = sidebar.classList.contains('collapsed');
    quizContainer.style.left = isCollapsed ? '60px' : '240px';
    quizContainer.style.width = `calc(100% - ${isCollapsed ? '60px' : '240px'})`;
  }

// 챗봇 모달 열기 함수
function openChatbotModal() {
    document.getElementById("chatbot-modal").style.display = "flex";
}

// 챗봇 모달 닫기 함수
function closeChatbotModal() {
    document.getElementById("chatbot-modal").style.display = "none";
}

// 모든 강의의 URL을 HTML에서 가져와 배열로 저장
const lectures = Array.from(document.querySelectorAll('.lecture-list li')).map(item => item.getAttribute('data-url'));

let currentLectureIndex = 0; // 현재 강의 인덱스 초기화
let currentQuizActive = false; // 퀴즈 상태 여부

// 강의 변경 함수
function changeVideo(element) {
    const url = element.getAttribute('data-url');
    const videoPlayer = document.getElementById('video-player');

    // 퀴즈 창이 열려 있다면 닫기
    if (currentQuizActive) {
        closeQuiz();
    }

    // 현재 강의와 선택한 강의가 같은 경우 종료
    if (currentLectureIndex === lectures.indexOf(url)) {
        return;
    }

    videoPlayer.src = url;
    videoPlayer.load();

    // 인덱스 업데이트
    currentLectureIndex = lectures.indexOf(url);
    currentQuizActive = false; // 퀴즈 상태 비활성화
    updateLectureButtons();
}

// 강의 버튼을 활성화/비활성화하는 함수
function updateLectureButtons() {
    const lectureItems = document.querySelectorAll('.lecture-list li');
    lectureItems.forEach((item, index) => {
        // 현재 강의인 경우에도 클릭 가능하도록 disabled 클래스를 추가하지 않음
        if (index === currentLectureIndex && !currentQuizActive) {
            item.classList.remove('disabled'); // 현재 강의도 활성화 상태로 유지
        } else if (currentQuizActive && item.classList.contains('quiz-item')) {
            item.classList.add('disabled'); // 퀴즈 버튼 비활성화
        } else {
            item.classList.remove('disabled'); // 나머지는 활성화
        }
    });
}

// 이전 강의로 이동(바텀바 화살표 버튼)
function goToPreviousLecture() {
    if (currentLectureIndex > 0) {
        currentLectureIndex--;
        changeVideoFromIndex(currentLectureIndex);
    }
}

// 다음 강의로 이동(바텀바 화살표 버튼)
function goToNextLecture() {
    if (currentLectureIndex < lectures.length - 2) {
        currentLectureIndex++;
        changeVideoFromIndex(currentLectureIndex);
    }
}

// 인덱스를 사용하여 강의를 변경하는 함수
function changeVideoFromIndex(index) {
    const videoPlayer = document.getElementById('video-player');

    // 퀴즈 창 닫기
    if (currentQuizActive) {
        closeQuiz();
    }

    videoPlayer.src = lectures[index];
    videoPlayer.load();
    currentLectureIndex = index;
    currentQuizActive = false; // 퀴즈 상태 비활성화
    updateLectureButtons();
}

// 바텀바 화살표에 이벤트 리스너 추가
document.querySelector('.bottom-bar .bar-icon[alt="왼쪽 화살표"]').addEventListener('click', goToPreviousLecture);
document.querySelector('.bottom-bar .bar-icon[alt="오른쪽 화살표"]').addEventListener('click', goToNextLecture);

// 초기 강의 설정
changeVideoFromIndex(currentLectureIndex);

// 퀴즈 창 설정
function openQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.style.display = 'flex'; // 퀴즈 창 표시
    currentQuizActive = true; // 퀴즈 활성화
    updateLectureButtons(); // 버튼 상태 업데이트
}

function closeQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.style.display = 'none'; // 퀴즈 창 숨김
    currentQuizActive = false; // 퀴즈 비활성화
    updateLectureButtons(); // 버튼 상태 업데이트
}

// 사이드바의 퀴즈 버튼에 이벤트 연결
document.querySelector('.lecture-list li:last-child').addEventListener('click', openQuiz);  

// 초기 강의 목록 아이콘 설정
function initializeLectureIcons() {
    const lectureItems = document.querySelectorAll('.lecture-list li');
    lectureItems.forEach((item, index) => {
        const icon = item.querySelector('.lecture-icon');
        if (index === 0) {
            icon.src = '/static/images/play.png'; // lecture1에 play.png 설정
            icon.style.display = 'inline-block';
        } else {
            icon.style.display = 'none'; // 다른 강의 아이콘 숨기기
        }
    });
}

// 초기 강의 목록 아이콘 설정
function initializeLectureIcons() {
    const lectureItems = document.querySelectorAll('.lecture-list li');
    lectureItems.forEach((item, index) => {
        const icon = item.querySelector('.lecture-icon');
        
        // 첫 번째 강의 아이템일 경우 play.png 아이콘 설정
        if (index === 0) {
            icon.src = '/static/images/play.png';
            icon.style.display = 'inline-block';
            item.style.color = 'black'; // lecture1 텍스트 색상을 검정색으로 설정
        }
        // Quiz&Report 항목일 경우 exam.png 아이콘 설정
        else if (item.classList.contains('quiz-item')) {
            icon.src = '/static/images/exam.png';
            icon.style.display = 'inline-block';
        } else {
            icon.style.display = 'none';
        }
    });
}



// 강의 변경 함수
function changeVideo(element) {
    const url = element.getAttribute('data-url');
    const videoPlayer = document.getElementById('video-player');
    const lectureIndex = Array.from(element.parentNode.children).indexOf(element); // 선택된 강의의 인덱스 가져오기

    // 퀴즈 창이 열려 있다면 닫기
    if (currentQuizActive) {
        closeQuiz();
    }

    // 선택한 강의와 현재 강의가 같다면 아무 작업도 수행하지 않음
    if (currentLectureIndex === lectureIndex) {
        return;
    }

    videoPlayer.src = url;
    videoPlayer.load();

    // 이전 강의를 check.png로 변경
    updateLectureIcon(currentLectureIndex, 'check.png');
    // 현재 강의를 play.png로 변경
    updateLectureIcon(lectureIndex, 'play.png');

    // 인덱스 업데이트
    currentLectureIndex = lectureIndex;
    currentQuizActive = false;
}

// 특정 강의의 아이콘을 업데이트하는 함수
function updateLectureIcon(index, iconType) {
    const lectureItems = document.querySelectorAll('.lecture-list li');
    const icon = lectureItems[index].querySelector('.lecture-icon');
    icon.src = `/static/images/${iconType}`; // 경로를 직접 설정
    icon.style.display = 'inline-block';
}

// 초기 설정 호출
initializeLectureIcons();

