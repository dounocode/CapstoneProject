// 메시지 보내기 함수
async function sendMessage() {
    const inputElement = document.getElementById("chat-input");
    const chatContent = document.getElementById("chat-content");

    const userMessage = inputElement.value.trim();

    // 메시지가 비어있을 경우 처리하지 않음
    if (!userMessage) {
        alert("Please enter a message.");
        return;
    }

    // 사용자 메시지를 화면에 표시
    const userMessageElement = document.createElement("div");
    userMessageElement.className = "user-message";
    userMessageElement.innerHTML = `<p>${userMessage}</p>`;
    chatContent.appendChild(userMessageElement);

    // 입력창 초기화
    inputElement.value = "";

    // 챗봇 응답 요청
    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: userMessage }),
        });

        if (response.ok) {
            const data = await response.json();
            const botMessage = data.response;

            // 챗봇 응답 메시지를 화면에 표시
            const botMessageElement = document.createElement("div");
            botMessageElement.className = "bot-message";
            botMessageElement.innerHTML = `<p>${botMessage}</p>`;
            chatContent.appendChild(botMessageElement);

            // 스크롤을 맨 아래로 이동
            chatContent.scrollTop = chatContent.scrollHeight;
        } else {
            throw new Error("Failed to get a response from the chatbot.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while communicating with the chatbot.");
    }
}