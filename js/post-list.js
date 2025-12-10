let currentPage = 1;
let totalPage = 1;
const apiUrl = 'http://localhost:8080/api/posts/list';
const params = new URLSearchParams(window.location.search);
let category = 'new';
if (params.get('category')) {
  category = params.get('category');
}
const detailPageUrl = 'http://127.0.0.1:5500/info/post-detail.html';

const categoryMapping = {
  'NEW': '新着情報',
  'PROJECT': '企画情報',
  'DONATION': '寄贈情報',
  'ELSE': 'その他情報'
};

function formatDate(isoString) {
  const d = new Date(isoString);

  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  const hour  = String(d.getHours()).padStart(2, '0');
  const min   = String(d.getMinutes()).padStart(2, '0');

  return `${year}/${month}/${day} ${hour}:${min}`;
}

async function loadPage(page, paginationAnchor = false) {
  try {
      const response = await fetch(`${apiUrl}/${category}?page=${page}`, {
      method: 'GET'
    });

    // 成功レスポンス（200-299）
    if (response.ok) {
      const data = await response.json();

      currentPage = data.paginationInfo.current;
      totalPage = data.paginationInfo.total;

      displayPage(data);
      renderPagination(currentPage, totalPage);

      if (paginationAnchor) {
        const anchor = document.getElementById("PostTop");
        anchor.scrollIntoView({ behavior: "smooth", block: "start" });
      }


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

function displayPage(data) {
  document.title = `${categoryMapping[category.toUpperCase()]} | お知らせ`
  document.getElementById('breadcrumb-here').textContent = categoryMapping[category.toUpperCase()];

  document.querySelectorAll('.tab-item').forEach(li => {
    if (li.textContent.trim() === categoryMapping[category.toUpperCase()]) {
      li.classList.add('active');
    }
  });

  const newsList = document.getElementById('news-list');
  newsList.innerHTML = data.postViews.map(post => `
    <a href="${detailPageUrl}?id=${post.id}" class="news-item">
      <div class="news-body">
        <div class="news-meta">
          <span class="news-date">${formatDate(post.postedAt)}</span>
          <span class="news-tag">#${categoryMapping[post.category]}</span>
        </div>
        <div class="news-block">
          <p class="news-title">${post.title}</p>
          <span class="news-arrow">&gt;</span>
        </div>
      </div>
    </a>
  `).join('');

  const pagination = document.createElement('div');
  pagination.id = 'pagination';
  pagination.classList.add('pagination');
  newsList.appendChild(pagination);
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
      loadPage(current - 1, true);
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
        loadPage(p, true);
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
    loadPage(current + 1, true);
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
});
