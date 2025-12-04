let currentPage = 1;
let totalPage = 1;
const apiUrl = 'http://localhost:8080/api/mypage';

function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [key, val] = cookie.split("=");
    if (key === name) {
      return decodeURIComponent(val).split(",");
    }
  }
  return [];
};

function trimText(original, LIMIT = 100) {  // 200文字だとちょっと表示しすぎな感じがしたので仮で100に変更
    return original.length > LIMIT ? original.substring(0, LIMIT) + "......" : original;
};

async function loadPage(page) {
  try {
      const response = await fetch(`${apiUrl}?page=${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getCookie('authToken'),
      }
    });


    // 成功レスポンス（200-299）
    if (response.ok) {
      const data = await response.json();
      displayMypage(data);

      currentPage = page;
      totalPage = data.reviews.paginationInfo.total;
      document.getElementById('pageInfo').innerHTML = `今のページ : ${currentPage}, 最大ページ : ${totalPage}`

    } else {
      // 失敗レスポンス (401 Unauthorized など)
      const errorText = await response.text();
      let errorMessage = `情報取得に失敗しました。ステータスコード: ${response.status}`;

      // サーバーから詳細なエラーメッセージが返されている場合
      try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
      } catch (e) {
          // JSONとしてパースできない場合は無視
      }

      throw new Error(errorMessage);
    }

  } catch (error) {
      console.error('情報取得エラー:', error.message);
  }
};

function displayMypage(data) {
  document.getElementById('profile-name').textContent = data.myInfo.nickname;
  document.getElementById('profile-id').textContent = "@" + data.myInfo.loginId;
  document.getElementById('profile-text').textContent = data.myInfo.selfIntroduction;

  document.getElementById('active-event').innerHTML = data.projects.map(project => `
    <div class="my-image-box">
      <section class="card-event">
        <div class="event-content">
          <div class="event-info">
            <div class="event-box">
              <div class="event-title">${project.name}</div>
              <div class="event-green"></div>
            </div>
            <div class="count-number-box">
              <p class="event-countdown">投稿終了まで</p>
              <p class="count-number">あと</p>
              <p class="count-unit">${project.lastDate}</p>
            </div>
          </div>
        </div>
        <button class="action-button">
          <span class="btn-main-text">${project.name} の書評を書く</span>
          <span class="btn-sub-text">あなたのお気に入りの一冊を共有しよう</span>
          <span class="btn-plus">＋</span>
        </button>
      </section>
    </div>
  `).join('');

  document.getElementById('book-card-block').innerHTML = data.reviews.reviewList.map(review => `
    <div class="book-card">
      <div class="card-header">
        <div class="title-row">
          <h2 class="book-title">${review.bookTitle}</h2>
          <span class="vote-count">${review.voteCount} 票</span>
        </div>
        <div class="author-name-box">
          <p class="author-name">著者名 ： </p>
          <p class="author-name">${review.bookAuthor}</p>
        </div>
      </div>

      <div class="card-body">
        <p class="description">
          ${trimText(review.reviewContent)}
        </p>
      </div>

      <div class="card-footer">
        <span class="tag">pjId:${review.projectId} rvId:${review.reviewId}</span>
        <a href="#" class="details-link">詳細へ</a>
      </div>
    </div>
  `).join('');
};


document.addEventListener('DOMContentLoaded', () => {
  loadPage(currentPage);

  document.getElementById('prevBtn')?.addEventListener('click', () => {
    if (currentPage > 1) {
      loadPage(currentPage - 1);
    }
  });

  document.getElementById('nextBtn')?.addEventListener('click', () => {
    if (currentPage < totalPage) {
      loadPage(currentPage + 1);
    }
  });
});
