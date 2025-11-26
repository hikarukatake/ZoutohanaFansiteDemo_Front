"use strict"

document.getElementById("projectForm").addEventListener("submit", function(e) {
    e.preventDefault(); // 本当の送信を止める

    const formData = new FormData(e.target);

    // 送信される値を全部確認
    for (const [key, value] of formData.entries()) {
        console.log(key + ':' + value);
    }
});


// ==========企画URLのプレビュー==========
const urlKeyInput = document.getElementById('urlKey-input');
const urlKeyPreview = document.getElementById('urlKey-preview');

if(urlKeyInput) {
  urlKeyInput.addEventListener('input',()=>{
    if(urlKeyInput.value === ''){
      urlKeyPreview.textContent = '_____'
    } else {
      urlKeyPreview.textContent = urlKeyInput.value
    }
  })
}

// ==========ロゴ画像のプレビュー==========
const logoImgInput = document.getElementById('logoImg-input');
const logoImgPreview = document.getElementById('logoImg-preview');

if(logoImgInput) {
  logoImgInput.addEventListener('change', (event) => {
    const file = event.target.files[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      logoImgPreview.src = event.target.result
      logoImgPreview.style.display = 'block';
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
