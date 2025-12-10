const apiUrl = 'http://localhost:8080/api/posts/view';
const params = new URLSearchParams(window.location.search);
let id = params.get('id');
const listPageUrl = 'http://127.0.0.1:5500/info/post-list.html';

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

async function loadPage() {
  try {
      const response = await fetch(`${apiUrl}/${id}`, {
      method: 'GET'
    });

    // 成功レスポンス（200-299）
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      displayPage(data);

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
  document.title = `${data.title} | お知らせ詳細`
  document.getElementById('breadcrumb-category').innerHTML = `<a href="${listPageUrl}?category=${data.category.toLowerCase()}">${categoryMapping[data.category.toUpperCase()]}</a>`;
  document.getElementById('breadcrumb-here').textContent = data.title;
  document.getElementById('list-category').textContent = categoryMapping[data.category.toUpperCase()];
  document.getElementById('post-title').textContent = data.title;
  document.getElementById('post-data-date').textContent = formatDate(data.postedAt);
  document.getElementById('post-data-category').textContent = '#' + categoryMapping[data.category.toUpperCase()];
  document.getElementById('post-content').textContent = data.content;
  document.getElementById('back-to-list').href = listPageUrl + '?category=' + data.category.toLowerCase();
};

document.addEventListener('DOMContentLoaded', () => {
  loadPage();
});
