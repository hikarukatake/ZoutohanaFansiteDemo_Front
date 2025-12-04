/**
 * ログイン処理スクリプト
 */
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const loginButton = document.getElementById('login-submit-btn'); // ボタンのテキスト更新用
    const accountIdInput = document.getElementById('account-id');
    const passwordInput = document.getElementById('password');

    // Cookieにトークンを保存するヘルパー関数
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        // Secure, SameSite等の設定は環境に応じて追加してください。
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    if (loginForm) {
        // フォームの submit イベントで処理を開始
        loginForm.addEventListener('submit', async function (e) {
            // フォームのデフォルト動作（ページリロード）を停止
            e.preventDefault();

            const loginId = accountIdInput.value.trim();
            const password = passwordInput.value;
            // ログイン成功時の遷移先 (今回はハードコードします)
            const redirectUrl = '../books/isbn-search.html'; 

            // バリデーションチェック
            if (!loginId || !password) {
                alert("アカウントIDとパスワードを入力してください。");
                return;
            }

            // ログインリクエスト用のJSONデータ
            const loginData = {
                "loginId": loginId,
                "password": password
            };

            const apiUrl = 'http://localhost:8080/api/auth/login';

            // ボタンをローディング表示にし、二重送信を防ぐ
            loginButton.textContent = 'ログイン中...';
            loginButton.style.pointerEvents = 'none';

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loginData),
                });

                // 成功レスポンス（200-299）
                if (response.ok) {
                    const data = await response.json();
                    const token = data.token; // JSONボディに "token": "..." の形式で含まれていると仮定

                    if (token) {
                        // トークンをCookieに保存 (例: 7日間有効)
                        setCookie('authToken', token, 7);

                        console.log('ログイン成功。トークンをCookieに保存しました。');

                        // ログイン成功後の画面へ遷移
                        window.location.href = redirectUrl;

                    } else {
                        throw new Error("API応答にトークンが含まれていません。");
                    }

                } else {
                    // 失敗レスポンス (401 Unauthorized など)
                    const errorText = await response.text();
                    let errorMessage = `ログインに失敗しました。ステータスコード: ${response.status}`;
                    
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
                console.error('ログイン処理エラー:', error.message);
                alert(`ログインエラー: ${error.message}\nIDまたはパスワードが正しくありません。`);

            } finally {
                // 処理が完了したらボタンを元に戻す
                loginButton.textContent = 'ログイン';
                loginButton.style.pointerEvents = 'auto';
            }
        });
    }

    // --- 既存のテーマロード関数 ---
    // (元のHTMLにあったloadTheme関数を移動)
    async function loadTheme() {
        try {
            const response = await fetch('/api/theme'); // バックのURL
            const theme = await response.json();

            // CSS変数にセット (setThemeVariable関数はtheme.jsで定義されている前提)
            if (typeof setThemeVariable === 'function') {
                setThemeVariable('--main-color', theme.mainColor);
                setThemeVariable('--back-color', theme.backColor);
                setThemeVariable('--font-normal', theme.fontNormal);
                setThemeVariable('--text-white-color', theme.textWhiteColor);
            } else {
                console.warn("setThemeVariable関数が見つかりません。../js/theme.jsが正しく読み込まれているか確認してください。");
            }


        } catch (err) {
            console.error("テーマ読み込み失敗:", err);
        }
    }

    // ページ読み込み時に適用
    window.addEventListener("DOMContentLoaded", loadTheme);
});