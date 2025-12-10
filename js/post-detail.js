const apiUrl = 'http://localhost:8080/api/posts/view';
const params = new URLSearchParams(window.location.search);
let id = params.get('id');
const listPageUrl = 'http://127.0.0.1:5500/info/post-list.html';
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
  let prevData;
  let currentData;
  let nextData;

  if (data.length == 3) {
    prevData = data[0];
    currentData = data[1];
    nextData = data[2];
    document.getElementById('prev-post-button').classList.remove('hidden');
    document.getElementById('prev-post-button').href = detailPageUrl + '?id=' + prevData.id;
    document.getElementById('next-post-button').classList.remove('hidden');
    document.getElementById('next-post-button').href = detailPageUrl + '?id=' + nextData.id;

  } else if (data.length == 2) {
    if(data[0].id == id) {
      prevData = null;
      currentData = data[0];
      nextData = data[1];
      document.getElementById('next-post-button').classList.remove('hidden');
      document.getElementById('next-post-button').href = detailPageUrl + '?id=' + nextData.id;

    } else if (data[1].id == id) {
      prevData = data[0];
      currentData = data[1];
      nextData = null;
      document.getElementById('prev-post-button').classList.remove('hidden');
      document.getElementById('prev-post-button').href = detailPageUrl + '?id=' + prevData.id;

    }
  } else {
    prevData = null;
    currentData = data[0];
    nextData = null;
  }

  document.title = `${currentData.title} | お知らせ詳細`

  document.getElementById('breadcrumb-category').innerHTML = `<a href="${listPageUrl}?category=${currentData.category.toLowerCase()}">${categoryMapping[currentData.category.toUpperCase()]}</a>`;
  document.getElementById('breadcrumb-here').textContent = currentData.title;
  document.getElementById('list-category').textContent = categoryMapping[currentData.category.toUpperCase()];
  document.getElementById('post-title').textContent = currentData.title;
  document.getElementById('post-data-date').textContent = formatDate(currentData.postedAt);
  document.getElementById('post-data-category').textContent = '#' + categoryMapping[currentData.category.toUpperCase()];
  document.getElementById('post-content').textContent = currentData.content;
  document.getElementById('back-to-list').href = listPageUrl + '?category=' + currentData.category.toLowerCase();

};

document.addEventListener('DOMContentLoaded', () => {
  loadPage();
});
