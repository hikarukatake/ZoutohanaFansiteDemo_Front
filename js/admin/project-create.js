const newApiUrl = 'http://localhost:8080/api/projects/new';
const detailPageUrl = 'http://127.0.0.1:5500/admin/project-detail.html';

// ==========企画URLのプレビュー==========
const urlKeyInput = document.getElementById('urlKey-input');
const urlKeyPreview = document.getElementById('urlKey-preview');

function updateUrlKeyPreview() {
  if(urlKeyInput.value === ''){
    urlKeyPreview.textContent = '_____'
  } else {
    urlKeyPreview.textContent = urlKeyInput.value
  }
}

if (urlKeyInput) {
  urlKeyInput.addEventListener('input', updateUrlKeyPreview);
  updateUrlKeyPreview();
}

// ==========ロゴ画像のプレビュー==========
const mainImgInput = document.getElementById('mainImg-input');
const mainImgPreview = document.getElementById('mainImg-preview');

if(mainImgInput) {
  mainImgInput.addEventListener('change', (event) => {
    const file = event.target.files[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      mainImgPreview.src = event.target.result
      mainImgPreview.style.display = 'block';
    }
    reader.readAsDataURL(file)
  })
}

// ==========PDF==========
const pdfInput = document.getElementById("pdf-input");
const pdfList  = document.getElementById("pdf-list-ul");
const dt = new DataTransfer();

if(pdfInput) {
  // 複数選択
  pdfInput.addEventListener("change", function (e) {
    const newFiles = Array.from(e.target.files);

    newFiles.forEach(file => dt.items.add(file));
    pdfInput.files = dt.files;

    renderPDFList();
  });
}

// ファイル名リスト
function renderPDFList() {
  pdfList.innerHTML = "";
  Array.from(pdfInput.files).forEach((file, index) => {
    const li = document.createElement("li");

    const btn = document.createElement("button");
    btn.classList.add("pdf-list-removeButton")
    btn.innerHTML = "<span class='material-symbols-outlined'>close</span>";
    btn.addEventListener("click", () => removeFile(index));

    const name = document.createElement("span");
    name.textContent = file.name;

    li.appendChild(btn);
    li.appendChild(name);
    pdfList.appendChild(li);
  });
}

// 「削除」ボタンでファイル選択解除
function removeFile(index) {
  const newDT = new DataTransfer();

  Array.from(pdfInput.files).forEach((file, i) => {
    if (i !== index) newDT.items.add(file);
  });

  pdfInput.files = newDT.files;

  dt.items.clear();
  Array.from(newDT.files).forEach(f => dt.items.add(f));

  renderPDFList();
}

// ==========フォーム==========
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

document.getElementById("projectForm").addEventListener("submit", async function(e) {
    e.preventDefault(); // 本当の送信を止める

    const formData = new FormData(e.target);

    // // 送信される値を全部確認
    // for (const [key, value] of formData.entries()) {
    //     console.log(key + ':' + value);
    // }
    console.log("mainImg value = ", formData.get("mainImg"));


    try {
        const response = await fetch(newApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + getCookie('authToken')
        },
        body: formData
      });


      // 成功レスポンス（200-299）
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        window.location.href = `${detailPageUrl}?id=${data.id}`;

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
});
