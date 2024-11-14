document.addEventListener('DOMContentLoaded', () => {
    const codeSnippets = {
        python: `
print("Hello, World!")
        `,
        java: `
public class HelloWorld {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}
        `,
        cpp: `
#include <iostream>
using namespace std;
int main() {
  cout << "Hello, World!";
  return 0;
}
        `
    };

    const keywords = {
        python: {
            "print": "blue-keyword",  // Python print 함수
            '"Hello, World!"': "red-keyword",  // Hello, World! 텍스트
        },
        java: {
            "public": "blue-keyword",
            "static": "purple-keyword",
            "void": "purple-keyword",
            "int": "green-keyword",
            "System.out.println": "orange-keyword",
            '"Hello, World!"': "red-keyword",  // Hello, World! 텍스트
        },
        cpp: {
            "#include": "purple-keyword",
            "using": "blue-keyword",
            "namespace": "blue-keyword",
            "int": "green-keyword",
            "cout": "orange-keyword",
            "return": "red-keyword",
            "main": "blue-keyword",
            '"Hello, World!"': "red-keyword",  // Hello, World! 텍스트
        }
    };

    const languageTabs = document.querySelectorAll('.language-tab');
    const codeBox = document.getElementById('code-box');
    const lineNumbers = document.getElementById('line-numbers');

    // 언어 탭 클릭 시 코드 및 줄 번호 업데이트
    languageTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelector('.language-tab.active').classList.remove('active');
            tab.classList.add('active');

            const language = tab.getAttribute('data-language');
            codeBox.innerHTML = highlightCode(codeSnippets[language].trim(), keywords[language]); // 코드 하이라이팅
            updateLineNumbers(); // 줄 번호 업데이트
        });
    });

    // 코드 입력 시 줄 번호 업데이트
    codeBox.addEventListener('input', updateLineNumbers);

    // 초기 코드 및 줄 번호 설정
    codeBox.innerHTML = highlightCode(codeSnippets.python.trim(), keywords.python);
    updateLineNumbers();

    function highlightCode(code, languageKeywords) {
        // HTML 특수 문자를 변환
        code = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
        // 키워드마다 하이라이트 적용
        Object.entries(languageKeywords).forEach(([keyword, className]) => {
            // 각 키워드에 대해 정확히 일치하는 문자열을 <span>으로 감싸기
            const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
            code = code.replace(regex, `<span class="${className}">$1</span>`);
        });
    
        return code;
    }
    
    

    function updateLineNumbers() {
        const lines = Math.max(codeBox.textContent.split('\n').length, 20); // 최소 20줄
        lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => `<div>${i + 1}</div>`).join('');
    }
});

// 페이지 로드 시 퀴즈 창 기본 닫기 및 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (typeof closeQuiz === 'function') {
        closeQuiz(); // 처음 웹페이지에 들어왔을 때 퀴즈 창을 기본적으로 닫음
    }
    
    if (typeof changeVideoFromIndex === 'function') {
        changeVideoFromIndex(0); // 비디오 초기화
    }
});
