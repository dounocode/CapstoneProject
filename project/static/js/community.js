function openPostForm() {
    document.getElementById('community-posts').style.display = 'none';
    document.getElementById('post-form').style.display = 'flex';
}

function closePostForm() {
    document.getElementById('post-form').style.display = 'none';
    document.getElementById('community-posts').style.display = 'block';
}

// 게시글 전체 불러오기
async function fetchPosts() {
    const response = await fetch('/community');
    const posts = await response.json();
    const postsContainer = document.getElementById('community-posts');
    postsContainer.innerHTML = ''; // 기존 게시글 초기화

    // 게시글이 없을 경우 메시지 표시
    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>No posts available. Be the first to post!</p>';
    } else {
        // 게시글 데이터를 반복하여 화면에 추가
        posts.forEach(post => {
            const postId = post[0]; // 게시글 ID
            const postTitle = post[1]; // 게시글 제목
            const postDate = new Date(post[2]).toLocaleString(); // 게시글 작성 시간

            // 게시글 HTML 요소 생성 및 추가
            const postElement = document.createElement('div');
            postElement.className = 'post-item';
            postElement.innerHTML = `
                <p class="title"><strong>${postTitle}</strong></p>
                <p class="post-date">${postDate}</p>
                <button onclick="openPostDetails(${postId})">View Post</button>
            `;
            postsContainer.appendChild(postElement);
        });
    }
}

// 특정 게시글 열기
async function openPostDetails(postId) {
    try {
        // 특정 게시글 데이터 가져오기
        const response = await fetch(`/community/${postId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch post details (status: ${response.status})`);
        }

        const post = await response.json();

        // 게시글 상세 정보 표시
        document.getElementById('post-title').innerText = post[1]; // 게시글 제목
        document.getElementById('post-content').innerText = post[2]; // 게시글 내용
        document.getElementById('post-title').setAttribute('data-id', post[0]); // 게시글 ID 저장
        document.getElementById('post-created-at').innerText = `Created at: ${new Date(post[3]).toLocaleString()}`; // 작성 시간 표시

        // 해당 게시글의 댓글 데이터 가져오기
        const commentsResponse = await fetch(`/community/${postId}/comments`);
        if (!commentsResponse.ok) {
            throw new Error('Failed to fetch comments');
        }

        const comments = await commentsResponse.json();
        const commentsContainer = document.getElementById('comments-container');
        commentsContainer.innerHTML = ''; // 기존 댓글 초기화

        // 댓글 데이터 반복 처리
        comments.forEach(comment => {
            const commentId = comment[0]; // 댓글 ID
            const commentContent = comment[1]; // 댓글 내용
            const commentDate = new Date(comment[2]).toLocaleString(); // 댓글 작성 시간

            // 댓글 HTML 요소 생성 및 추가
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';
            commentElement.innerHTML = `
                <p>${commentContent}</p>
                <span class="comment-date">${commentDate}</span>
                <button class="comment-delete-btn" onclick="deleteComment(${commentId})">Delete</button>
            `;
            commentsContainer.appendChild(commentElement);
        });

        // 게시글 상세 화면 표시
        document.getElementById('community-posts').style.display = 'none';
        document.getElementById('post-details').style.display = 'block';
    } catch (error) {
        console.error('Error opening post details:', error);
        alert(`An error occurred: ${error.message}`);
    }
}

// 게시글 작성
async function submitPost() {
    // 제목과 내용 가져오기
    const title = document.getElementById('post-title-input').value;
    const content = document.getElementById('post-content-input').value;

    // 제목 또는 내용이 비어 있으면 경고 메시지 표시
    if (!title || !content) {
        alert('Both title and content are required!');
        return;
    }

    try {
        // 서버로 POST 요청
        const response = await fetch('/community/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content }),
        });

        if (response.ok) {
            alert('Post created successfully!');
            document.getElementById('post-title-input').value = ''; // 입력창 초기화
            document.getElementById('post-content-input').value = ''; // 입력창 초기화
            closePostForm(); // 작성 폼 닫기
            fetchPosts(); // 게시글 목록 갱신
        } else {
            alert('Failed to create post. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting post:', error);
        alert('An error occurred while submitting the post.');
    }
}

// 댓글 작성
async function submitComment() {
    const postId = document.getElementById('post-title').getAttribute('data-id'); // 현재 게시글 ID
    const content = document.getElementById('comment-content-input').value; // 댓글 내용 가져오기

    if (!content) {
        alert('Comment cannot be empty!'); // 댓글 내용이 비어있으면 경고
        return;
    }

    try {
        const response = await fetch(`/community/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });

        if (response.ok) {
            alert('Comment added successfully!');
            document.getElementById('comment-content-input').value = ''; // 입력창 초기화
            openPostDetails(postId); // 댓글 목록 갱신
        } else {
            alert('Failed to add comment.');
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
        alert('An error occurred while submitting the comment.');
    }
}

// 게시글 삭제
async function deletePost() {
    const postId = document.getElementById('post-title').getAttribute('data-id'); // 현재 게시글 ID
    await fetch(`/community/${postId}`, { method: 'DELETE' }); // 서버로 DELETE 요청
    alert('Post deleted successfully!');
    closePostDetails();
    fetchPosts(); // 게시글 목록 갱신
}

// 댓글 삭제
async function deleteComment(commentId) {
    await fetch(`/community/comments/${commentId}`, { method: 'DELETE' }); // 서버로 DELETE 요청
    alert('Comment deleted successfully!');
    const postId = document.getElementById('post-title').getAttribute('data-id'); // 현재 게시글 ID
    openPostDetails(postId); // 댓글 목록 갱신
}

// 특정 게시글 닫기
function closePostDetails() {
    document.getElementById('post-details').style.display = 'none';
    document.getElementById('community-posts').style.display = 'block';
}

// 이벤트 리스너 추가
document.getElementById('submit-post-btn').addEventListener('click', submitPost);