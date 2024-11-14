#뉴스, 커뮤니티 데이터 저장소

import sqlite3
from datetime import datetime
DATABASE = 'community.db'
# 데이터베이스 초기화 함수
def init_database():
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()
    
    # 게시글 테이블 생성
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 댓글 테이블 생성
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        )
    ''')

    # 뉴스 데이터 테이블 생성
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS news_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            date TEXT NOT NULL
        )
    ''')

    connection.commit()
    connection.close()

# 게시글 작성 함수
def create_post(title, content):
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()
    cursor.execute('INSERT INTO posts (title, content) VALUES (?, ?)', (title, content))
    connection.commit()
    connection.close()

# 모든 게시글 조회 함수
def get_all_posts():
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()
    cursor.execute('SELECT id, title, created_at FROM posts')
    posts = cursor.fetchall()
    connection.close()
    return posts

# 특정 게시글 조회 함수
def get_post(post_id):
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()
    cursor.execute('SELECT id, title, content, created_at FROM posts WHERE id = ?', (post_id,))
    post = cursor.fetchone()
    connection.close()
    return post

# 게시글 삭제 함수
def delete_post(post_id):
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()
    cursor.execute('DELETE FROM posts WHERE id = ?', (post_id,))
    connection.commit()
    connection.close()

# 댓글 작성 함수
def create_comment(post_id, content):
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()
    cursor.execute('INSERT INTO comments (post_id, content) VALUES (?, ?)', (post_id, content))
    connection.commit()
    connection.close()

# 특정 게시글의 모든 댓글 조회 함수
def get_comments_for_post(post_id):
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()
    cursor.execute('SELECT id, content, created_at FROM comments WHERE post_id = ?', (post_id,))
    comments = cursor.fetchall()
    connection.close()
    return comments

# 댓글 삭제 함수
def delete_comment(comment_id):
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()
    cursor.execute('DELETE FROM comments WHERE id = ?', (comment_id,))
    connection.commit()
    connection.close()

# 최신 뉴스 데이터를 데이터베이스에 저장하는 함수
def save_news_data(news_data):
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()
    
    # 기존 뉴스 데이터 삭제
    cursor.execute('DELETE FROM news_data')
    
    # 새로운 뉴스 데이터 삽입
    for news in news_data:
        cursor.execute('INSERT INTO news_data (title, url, date) VALUES (?, ?, ?)', 
                       (news['title'], news['url'], news['date']))
    
    connection.commit()
    connection.close()

# 저장된 최신 뉴스 데이터를 조회하는 함수
def get_latest_news():
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()
    cursor.execute('SELECT title, url, date FROM news_data ORDER BY id DESC')
    news_data = cursor.fetchall()
    connection.close()
    return news_data