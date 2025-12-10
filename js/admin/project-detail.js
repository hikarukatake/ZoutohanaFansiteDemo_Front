const viewApiUrl = 'http://localhost:8080/api/projects/adminView';
const imageApiUrl = 'http://localhost:8080/api/image';
// const updateApiUrl = 'http://localhost:8080/api/projects/update';
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

// ====================API関係ない系====================
// ==========QRコード画像のプレビュー==========
let currentUrlKey = null;

document.getElementById("qrImg-showButton").addEventListener("click", function () {
  document.getElementById("qrImg-preview").classList.toggle("hidden");
});

document.getElementById("qrImg-downloadButton").addEventListener("click", function () {
  const link = document.createElement('a');
  link.href = currentQrImageUrl;
  link.download = `${currentUrlKey}_QR.png`;
  link.target = '_blank';
  link.click();
});

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

// ====================API関係ある系====================
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

// ==========情報取得・表示==========
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch(`${viewApiUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getCookie('authToken'),
      }
    });

    // 成功レスポンス（200-299）
    if (response.ok) {
      const data = await response.json();
      displayProject(data);

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

const qrImgPreview = document.getElementById('qrImg-preview');

async function displayProject(data) {
  console.log(data);

  document.querySelector('select[name="published"]').value = String(data.published).toUpperCase();
  document.querySelector('select[name="status"]').value = data.status;

  if (data.qrImgUrl) {
    try {
      const qrImgResponse = await fetch(`${imageApiUrl}/${data.qrImgUrl}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + getCookie('authToken')
        }
      });

      if (qrImgResponse.ok) {
        const blob = await qrImgResponse.blob();
        const objectUrl = URL.createObjectURL(blob);
        qrImgPreview.src = objectUrl;
        qrImgPreview.classList.toggle("hidden");

        currentQrImageUrl = objectUrl;
        currentUrlKey = data.urlKey;
      }

    } catch (error) {
      console.error('QRコード画像取得エラー:', error.message);
    }
  }

  document.querySelector('input[name="name"]').value = data.name;
  document.querySelector('input[name="urlKey"]').value = data.urlKey;
  updateUrlKeyPreview();
  document.querySelector('textarea[name="introduction"]').value = data.introduction;
  document.querySelector('input[name="projectStartAt"]').value = data.projectStartAt.slice(0, 16);
  document.querySelector('input[name="projectEndAt"]').value = data.projectEndAt.slice(0, 16);
  document.querySelector('input[name="submissionStartAt"]').value = data.submissionStartAt.slice(0, 16);
  document.querySelector('input[name="submissionEndAt"]').value = data.submissionEndAt.slice(0, 16);
  document.querySelector('input[name="votingStartAt"]').value = data.votingStartAt.slice(0, 16);
  document.querySelector('input[name="votingEndAt"]').value = data.votingEndAt.slice(0, 16);
  document.querySelector(`input[name="enableVisibleBookTitle"][value="${String(data.enableVisibleBookTitle).toUpperCase()}"]`).checked = true;
  document.querySelector(`input[name="enableVisibleReviewTitle"][value="${String(data.enableVisibleReviewTitle).toUpperCase()}"]`).checked = true;
  document.querySelector(`input[name="enableVisibleUserInfo"][value="${String(data.enableVisibleUserInfo).toUpperCase()}"]`).checked = true;
  document.querySelector(`input[name="themeColor"][value="${data.themeColor}"]`).checked = true;

  if (data.mainImgUrl) {
    try {
      const mainImgResponse = await fetch(`${imageApiUrl}/${data.mainImgUrl}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + getCookie('authToken')
        }
      });

      if (mainImgResponse.ok) {
        const blob = await mainImgResponse.blob();
        const objectUrl = URL.createObjectURL(blob);
        mainImgPreview.src = objectUrl;
        mainImgPreview.style.display = 'block';
      }

    } catch (error) {
      console.error('ロゴ画像取得エラー:', error.message);
    }
  }
};

// // ==========フォーム送信==========
document.getElementById("projectForm").addEventListener("submit", async function(e) {
    e.preventDefault(); // 本当の送信を止める

//     const formData = new FormData(e.target);
//     console.log("mainImg value = ", formData.get("mainImg"));


//     try {
//         const response = await fetch(updateApiUrl, {
//         method: 'POST',
//         headers: {
//           'Authorization': 'Bearer ' + getCookie('authToken')
//         },
//         body: formData
//       });


//       // 成功レスポンス（200-299）
//       if (response.ok) {
//         const data = await response.json();
//         console.log(data)

//       } else {
//         // 失敗レスポンス (401 Unauthorized など)
//         const errorText = await response.text();
//         let errorMessage = `情報取得に失敗しました。ステータスコード: ${response.status}`;

//         // サーバーから詳細なエラーメッセージが返されている場合
//         try {
//             const errorJson = JSON.parse(errorText);
//             errorMessage = errorJson.message || errorMessage;
//         } catch (e) {
//             // JSONとしてパースできない場合は無視
//         }

//         throw new Error(errorMessage);
//       }

//     } catch (error) {
//         console.error('情報取得エラー:', error.message);
//     }
});
