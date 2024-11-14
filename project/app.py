from flask import Flask, render_template, jsonify, request
import modules.progress_module
import os
import openai
import sqlite3
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from apscheduler.schedulers.background import BackgroundScheduler
from modules.whisper_module import transcribe_audio
from modules.translate_module import translate_text
from modules.communityNnews_module import get_all_posts, create_post, init_database,create_comment,get_comments_for_post, get_post, delete_comment, delete_post  # community 기능 추가
from modules.quizNreport_module import initialize_db,init_db,add_sample_questions,get_random_topic,submit_report,get_questions,check_answers
from webdriver_manager.chrome import ChromeDriverManager

# 환경 변수에서 OpenAI API 키를 가져와 설정
openai.api_key = os.getenv("OPENAI_API_KEY")

# 데이터베이스 경로 설정
DATABASE = 'news.db'

app = Flask(__name__)

# 데이터베이스 초기화 함수
def initialize_database():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            date TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# 뉴스 크롤링 함수
def fetch_latest_news():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    url = "https://news.mit.edu/topic/artificial-intelligence2"
    driver.get(url)

    try:
        WebDriverWait(driver, 60).until(
            EC.presence_of_all_elements_located((By.XPATH, "//*[@id='block-mit-content']/div/div/div/div[2]/div[1]/article/div[2]/h3"))
        )

        news_data = []
        articles = driver.find_elements(By.XPATH, "//*[@id='block-mit-content']/div/div/div/div[2]/div/article")[:4]
        
        for article in articles:
            try:
                title = article.find_element(By.XPATH, "./div[2]/h3").text.strip()
                link = "https://news.mit.edu" + article.find_element(By.XPATH, "./div[2]/h3/a").get_attribute("href")
                summary = article.find_element(By.XPATH, "./div[2]/p[1]/span").text.strip()
                date = article.find_element(By.XPATH, "./div[2]/p[2]").text.strip()

                news_data.append((title, link, date))
            except Exception as e:
                print("크롤링 중 오류 발생:", e)
    except TimeoutException:
        print("페이지 로드 시간 초과 - 요소를 찾지 못했습니다.")
        news_data = []
    finally:
        driver.quit()

    # 데이터베이스에 저장
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM news")
    cursor.executemany("INSERT INTO news (title, url, date) VALUES (?, ?, ?)", news_data)
    conn.commit()
    conn.close()

    print("크롤링된 뉴스 데이터:", news_data)



# 뉴스 데이터를 가져오는 엔드포인트
@app.route('/latest-ai-news')
def latest_ai_news():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("SELECT title, url, date FROM news ORDER BY id DESC LIMIT 4")
    news_data = [{"title": row[0], "url": row[1], "date": row[2]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(news_data)

# 게시판 전체 글 조회 엔드포인트
@app.route('/community')
def community():
    posts = get_all_posts()
    return jsonify(posts)

# 게시판 글 추가 엔드포인트
@app.route('/community/add', methods=['POST'])
def add_community_post():
    title = request.json.get('title')
    content = request.json.get('content')
    result = create_post(title, content) 
    return jsonify(result)


# 특정 게시글 조회 엔드포인트
@app.route('/community/<int:post_id>', methods=['GET'])
def get_post_detail(post_id):
    post = get_post(post_id)  # 데이터베이스에서 해당 ID의 게시글 조회
    if post:
        # 리스트 그대로 반환
        return jsonify(post)
    else:
        # 게시글이 없을 경우 404 에러 반환
        return jsonify({"error": "Post not found"}), 404
    
#특정 게시글 삭제
@app.route('/community/<int:post_id>', methods=['DELETE'])
def delete_post_endpoint(post_id):
    try:
        delete_post(post_id)  # 데이터베이스에서 게시글 삭제
        return jsonify({"message": "Post deleted successfully"}), 200
    except Exception as e:
        # 에러 발생 시 디버깅 정보와 함께 500 반환
        return jsonify({"error": str(e)}), 500

#특정 댓글 삭제
@app.route('/community/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment_endpoint(comment_id):
    try:
        delete_comment(comment_id)  # 데이터베이스에서 댓글 삭제
        return jsonify({"message": "Comment deleted successfully"}), 200
    except Exception as e:
        # 에러 발생 시 디버깅 정보와 함께 500 반환
        return jsonify({"error": str(e)}), 500    


#특정 게시글 댓글 추가
@app.route('/community/<int:post_id>/comments', methods=['POST'])
def add_comment(post_id):
    content = request.json.get('content')
    if not content:
        return jsonify({"error": "Content is required"}), 400

    create_comment(post_id, content)
    return jsonify({"message": "Comment added successfully"}), 201

# 특정 게시글의 댓글 조회 엔드포인트
@app.route('/community/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    comments = get_comments_for_post(post_id)
    return jsonify(comments)

# 메인 페이지
@app.route('/')
def home():
    return render_template('index.html')

# 강의실 페이지
@app.route('/lecture')
def lecture():
    return render_template('lecture.html')

# 챗봇 페이지
@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')


# 특정 비디오 파일을 텍스트로 변환 후 한국어로 번역하여 반환
@app.route('/transcribe/<filename>')
def transcribe(filename):

    # project 폴더에 맞게 절대 경로로 설정  #항상 project 경로 체크
    video_path = os.path.abspath(os.path.join('project', 'static', 'videos', filename)) #project 경로체크
    print("Absolute Video Path:", video_path)  # 디버깅용 출력
    # 비디오 파일을 텍스트로 변환
    transcript = transcribe_audio(video_path)
    # 변환된 텍스트를 한국어로 번역
    translated_text = translate_text(transcript)
    # 변환된 텍스트와 번역된 텍스트를 JSON으로 반환
    return jsonify({"transcript": transcript, "translated_text": translated_text})
    # http://127.0.0.1:5000/transcribe/lecture1.mp4 (강의영상별 번역실행)

    # 사용자 메시지를 OpenAI API로 전달하여 응답을 생성하는 챗봇 엔드포인트
    #이 엔드포인트는 사용자 메시지를 OpenAI API에 보내고, API의 응답을 받아 JSON 형식으로 반환


#챗봇 엔드포인트
@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')  # 사용자 메시지 받기
    
    # OpenAI API에 메시지를 전달하고 응답 받기
    response = openai.Completion.create(
        model="text-davinci-003",  # 사용할 모델
        prompt=user_message,
        max_tokens=150,  # 응답 길이 제한
        temperature=0.7  # 창의성 정도 조절
    )

    # 응답 텍스트 추출
    bot_response = response['choices'][0]['text'].strip()

    # JSON 형식으로 응답 반환
    return jsonify({"response": bot_response})


# 서버 시작 시 데이터베이스 초기화 및 첫 뉴스 크롤링
initialize_database()
fetch_latest_news()

# 뉴스 크롤링 스케줄러 설정 (6시간마다)
scheduler = BackgroundScheduler()
scheduler.add_job(fetch_latest_news, 'interval', hours=6)
scheduler.start()
init_database()
init_db()
initialize_db()
add_sample_questions()


# 퀴즈 시작 (초기화)
# 퀴즈와 레포트 모드를 선택적으로 실행하는 엔드포인트
@app.route('/execute', methods=['POST'])
def execute():
    mode = request.json.get('mode')  # 'quiz' 또는 'report'
    
    if mode == 'quiz':
        # 퀴즈 질문 가져오기
        questions = get_questions()
        formatted_questions = [
            {
                "id": q[0],
                "question": q[1],
                "options": [q[2], q[3], q[4], q[5]]
            } for q in questions
        ]
        return jsonify({"mode": "quiz", "data": formatted_questions})
    
    elif mode == 'report':
        # 랜덤으로 선택된 보고서 주제 가져오기
        topic = get_random_topic()
        if not topic:
            return jsonify({"error": "No topics available"}), 404
        topic_id, topic_text = topic
        return jsonify({"mode": "report", "topic": topic_text})
    
    else:
        return jsonify({"error": "Invalid mode selected"}), 400
    
@app.route('/submit_answer', methods=['POST'])
def submit_answer():
    mode = request.json.get('mode')  # 'quiz' 또는 'report'
    
    if mode == 'quiz':
        # 퀴즈 답안 제출
        user_answers = request.json.get('answers')  # {question_id: selected_option, ...}
        score = check_answers(user_answers)
        result = "Passed" if score == 30 else "Failed"
        return jsonify({"score": score, "result": result})
    
    elif mode == 'report':
        # 보고서 제출
        data = request.json
        user_id = data.get("user_id")
        content = data.get("content")

        if not all([user_id, content]):
            return jsonify({"error": "Missing required fields"}), 400

        topic = get_random_topic()
        if not topic:
            return jsonify({"error": "No topics available"}), 404
        
        topic_id, topic_text = topic
        response = submit_report(user_id, topic_id, content)
        return jsonify({"topic": topic_text, "result": response})
    
    else:
        return jsonify({"error": "Invalid mode selected"}), 400
    
#==============================================
# 강의진도추적시스템
@app.route('/lecture/progress', methods=['POST'])
def update_progress():
    data = request.json
    lecture_id = data.get('lecture_id')
    current_time = data.get('current_time')
    
    # 입력 값 유효성 검증
    if not lecture_id or current_time is None:
        return jsonify({"error": "Missing required parameters"}), 400
    
    # 진행 상태 업데이트 및 완료 여부 반환
    result = modules.progress_module.update_progress(lecture_id, current_time)
    return jsonify(result)
#===============================================

# 서버 시작 시 데이터베이스 초기화
if __name__ == '__main__':
    initialize_database()
    app.run(debug=True)




