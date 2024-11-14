from flask import Flask, render_template, request, jsonify
import sqlite3
import random

app = Flask(__name__)

# 데이터베이스 초기화 함수
def init_db():
    with sqlite3.connect("database.db") as conn:
        cursor = conn.cursor()
        
        # 질문 테이블 생성
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question_text TEXT NOT NULL,
                difficulty_level VARCHAR(10),
                category VARCHAR(50)
            )
        ''')

        # 선택지 테이블 생성
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS choices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question_id INT,
                choice_text TEXT NOT NULL,
                is_correct BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
            )
        ''')

        # 유저 테이블 생성 (사용자 관리)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                score INT DEFAULT 0,
                attempts INT DEFAULT 0
            )
        ''')

        # 사용자가 질문에 답한 기록을 저장하는 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INT,
                question_id INT,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (question_id) REFERENCES questions(id),
                UNIQUE (user_id, question_id)
            )
        ''')
        # 주제 테이블 생성
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS topics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic_text TEXT NOT NULL
            )
        ''')

        # 제출된 레포트 테이블 생성
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INT,
                topic_id INT,
                content TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (topic_id) REFERENCES topics(id)
            )
        ''')
        conn.commit()

# 초기 샘플 퀴즈 데이터 추가 함수
def add_sample_questions():
    with sqlite3.connect("database.db") as conn:
        cursor = conn.cursor()

            
        # 샘플 주제 추가
        cursor.execute("SELECT COUNT(*) FROM topics")
        if cursor.fetchone()[0] == 0:
            topics = [
                "The Future of Artificial Intelligence",
                "Challenges in Machine Learning",
                "Ethics in Artificial Intelligence"
            ]
            cursor.executemany("INSERT INTO topics (topic_text) VALUES (?)", [(topic,) for topic in topics])

        conn.commit()

# 데이터베이스 초기화 함수 (DB 생성 및 기본 데이터 삽입)
def initialize_db():
    conn = sqlite3.connect('quiz.db')
    cursor = conn.cursor()
    
    # questions 테이블 생성
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        option1 TEXT NOT NULL,
        option2 TEXT NOT NULL,
        option3 TEXT NOT NULL,
        option4 TEXT NOT NULL,
        correct_option TEXT NOT NULL  -- 정답을 나타내는 보기 (option1, option2, option3, option4)
    )
    ''')
    
    # 초기 AI 관련 퀴즈 데이터 삽입
    questions = [
        (
            "What does 'AI' stand for?",
            "Artificial Intelligence",  # correct
            "Automatic Integration",
            "Automated Interaction",
            "Advanced Internet",
            "option1"
        ),
        (
            "Which language is most commonly used for AI and machine learning?",
            "Java",
            "Python",  # correct
            "C++",
            "JavaScript",
            "option2"
        ),
        (
            "What is a neural network?",
            "A network of computers connected for data sharing",
            "A system designed to mimic the human brain's structure",  # correct
            "A new version of the internet",
            "A software update protocol",
            "option2"
        )
    ]
    
    # 데이터 삽입
    cursor.executemany('''
    INSERT INTO questions (question, option1, option2, option3, option4, correct_option)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', questions)
    
    conn.commit()
    conn.close()
    print("Database initialized and populated with default questions.")

# 데이터베이스에서 퀴즈 질문과 보기를 가져오는 함수
def get_questions():
    conn = sqlite3.connect('quiz.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, question, option1, option2, option3, option4 FROM questions LIMIT 3")
    questions = cursor.fetchall()
    conn.close()
    return questions

# 제출된 정답을 채점하는 함수
def check_answers(user_answers):
    conn = sqlite3.connect('quiz.db')
    cursor = conn.cursor()
    
    score = 0
    for question_id, user_answer in user_answers.items():
        cursor.execute("SELECT correct_option FROM questions WHERE id = ?", (question_id,))
        correct_answer = cursor.fetchone()[0]
        if user_answer == correct_answer:
            score += 10  # 정답일 경우 +10점

    conn.close()
    return score


def get_random_topic():
    with sqlite3.connect("database.db") as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM topics")
        topics = cursor.fetchall()
    if topics:
        return random.choice(topics)
    return None

# 보고서 제출 함수
def submit_report(user_id, topic_id, content):
    with sqlite3.connect("database.db") as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO reports (user_id, topic_id, content)
            VALUES (?, ?, ?)
        ''', (user_id, topic_id, content))
        conn.commit()
    return {"status": "Report submitted successfully"}