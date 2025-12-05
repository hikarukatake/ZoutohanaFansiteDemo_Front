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

      currentPage = data.reviews.paginationInfo.current;
      totalPage = data.reviews.paginationInfo.total;

      renderPagination(currentPage, totalPage);
      displayMypage(data);

      const anchor = document.getElementById("MypageReviewTop");
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });

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
        <span class="tag">${review.projectName}</span>
        <a href="#" class="details-link">詳細へ</a>
      </div>
    </div>
  `).join('');
};

function renderPagination(current, total) {
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  // 一つ前のページに行くボタン
  const prev = document.createElement("button");
  prev.textContent = "<";
  prev.classList.add("page-btn");

  if (current === 1) {
    prev.disabled = true;
  }

  prev.onclick = function() {
      loadPage(current - 1);
  };
  container.appendChild(prev);

  const pages = getPageNumbers(current, total); // 詳しくはgetPageNumbers()のコメントで

  pages.forEach(p => {
    if (p === "...") {
      // 省略するページのspanを作って入れる
      const dots = document.createElement("span");
      dots.textContent = "...";
      dots.classList.add("page-dots");
      container.appendChild(dots);
    } else {
      // 番号として表示するページのボタンを作って入れる
      const btn = document.createElement("button");
      btn.textContent = p;
      btn.classList.add("page-number");
      if (p === current) {
        btn.classList.add("active");
      }
      btn.onclick = function() {
        loadPage(p);
      };
      container.appendChild(btn);
    }
  });

  // 一つ後ろのページに行くボタン
  const next = document.createElement("button");
  next.textContent = ">";
  next.classList.add("page-btn");
  if (current === total) {
    next.disabled = true;
  }
  next.onclick = function() {
    loadPage(current + 1);
  };
  container.appendChild(next);
}

function getPageNumbers(current, total) {
  // 現ページ番号と総ページ数から、番号として表示するページ・省略するページを判定して返す
  // 例: 現ページが3、総ページ数7。最初と最後のページ・現ページとその前後を表示 → ["1", "...", "3", "4", "5", "...", "7"]
  const pages = [];

  // 総ページ数が5以下なら全部表示
  if (total <= 5) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }

  // 1ページ目は表示
  pages.push(1);

  // (2以上で)現ページより番号が小さいページを省略
  if (current > 3) {
    pages.push("...");
  }

  // 現ページとその前後
  let prevPage = Math.max(2, current - 1);
  let nextPage = Math.min(total - 1, current + 1);
  for (let i = prevPage; i <= nextPage; i++) {
    pages.push(i);
  }

  // (最後のページ未満で)現ページより番号が大きいページを省略
  if (current < total - 2) {
    pages.push("...");
  }

  // 最後のページは表示
  pages.push(total);

  return pages;
}



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
