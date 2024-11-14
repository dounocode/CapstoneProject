document.addEventListener("DOMContentLoaded", function () {
    // 강의가 로드될 때 번역 내용을 가져오는 함수
    function loadTranscript(videoId) {
        const apiUrl = `http://127.0.0.1:5000/transcribe/${videoId}`; // API URL
        const transcriptContainer = document.getElementById("transcript");

        // Loading 표시
        transcriptContainer.innerHTML = "<p>Loading transcript...</p>";

        // API 호출
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch transcript");
                }
                return response.json();
            })
            .then(data => {
                // 번역된 한국어 텍스트 업데이트
                transcriptContainer.innerHTML = `<p>${data.translated_text.replace(/\n/g, '<br>')}</p>`;
            })
            .catch(error => {
                console.error("Error fetching transcript:", error);
                transcriptContainer.innerHTML = "<p>Failed to load transcript.</p>";
            });
    }

    // 강의 변경 시 Transcript 로드
    function changeVideo(element) {
        const videoId = element.getAttribute("data-url").split("/").pop(); // 강의 ID 추출
        const videoPlayer = document.getElementById("video-player");

        // 비디오 URL 업데이트
        videoPlayer.src = element.getAttribute("data-url");
        videoPlayer.load();

        // Transcript 로드
        loadTranscript(videoId);
    }

    // 초기 Transcript 로드 (강의 1번 기준)
    loadTranscript("lecture1.mp4");

    // 강의 변경 시 이벤트 연결
    const lectureItems = document.querySelectorAll(".lecture-list li");
    lectureItems.forEach(item => {
        item.addEventListener("click", function () {
            changeVideo(this);
        });
    });
});
