document.addEventListener("DOMContentLoaded", function () {
    const words = ["Python", "Java", "C++", "JavaScript", "node.js"];
    const dynamicText = document.getElementById("dynamic-text");
    let wordIndex = 0;
    let charIndex = 0;
    let typing = true;

    dynamicText.style.color = "#00E5FF"; // 언어 부분 색상 설정
  
    function typeEffect() {
      if (typing) {
        // 타이핑 애니메이션 효과: 현재 단어의 문자를 하나씩 추가
        if (charIndex < words[wordIndex].length) {
          dynamicText.textContent += words[wordIndex].charAt(charIndex);
          charIndex++;
          setTimeout(typeEffect, 150);
        } else {
          // 모든 문자를 다 타이핑했을 때 대기 후 삭제 시작
          typing = false;
          setTimeout(typeEffect, 1000);
        }
      } else {
        // 지우기 애니메이션 효과: 마지막 글자부터 하나씩 제거
        if (charIndex > 0) {
          dynamicText.textContent = dynamicText.textContent.slice(0, -1);
          charIndex--;
          setTimeout(typeEffect, 100);
        } else {
          // 모든 문자를 다 지운 후 다음 단어로 넘어감
          typing = true;
          wordIndex = (wordIndex + 1) % words.length;
          setTimeout(typeEffect, 500);
        }
      }
    }
  
    typeEffect();
  });
  

  document.addEventListener("DOMContentLoaded", function () {
    // 뉴스 데이터를 가져와 화면에 표시하는 함수
    fetch('http://127.0.0.1:5000/latest-ai-news') // API 경로
        .then(response => response.json())
        .then(news => {
            const newsContainer = document.getElementById("news-container");
            newsContainer.innerHTML = ""; // 기존 내용을 초기화
            news.slice(0, 8).forEach(item => { // 상위 8개 뉴스만 표시
                // 각 뉴스 항목을 카드 형태로 생성
                const newsCard = document.createElement("div");
                newsCard.classList.add("news-card");
                newsCard.innerHTML = `
                    <h3>${item.title}</h3>
                    <p>${item.date}</p>
                    <a href="${item.url}" target="_blank">자세히 보기</a>
                `;
                newsContainer.appendChild(newsCard); // news-container에 카드 추가
            });
        })
        .catch(error => console.error("뉴스를 가져오는 중 오류 발생:", error));
});

