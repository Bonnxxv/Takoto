use reqwest::Client;
use tauri::Emitter;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;

/// Melakukan token exchange service account JWT ke Google, dari Rust (bypass CORS browser)
#[tauri::command]
pub async fn exchange_service_account_token(jwt: String) -> Result<String, String> {
    let client = Client::new();
    // Kirim sebagai raw body agar encoding tidak mengubah karakter pada grant_type
    let body = format!(
        "grant_type=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Ajwt-bearer&assertion={}",
        jwt
    );
    let res = client
        .post("https://oauth2.googleapis.com/token")
        .header("Content-Type", "application/x-www-form-urlencoded")
        .body(body)
        .send()
        .await
        .map_err(|e| format!("Request gagal: {}", e))?;

    let status = res.status();
    let body = res.text().await.map_err(|e| e.to_string())?;

    if !status.is_success() {
        return Err(format!("Gagal mendapatkan token: {}", body));
    }

    let json: serde_json::Value =
        serde_json::from_str(&body).map_err(|e| format!("JSON error: {}", e))?;

    json.get("access_token")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| format!("access_token tidak ada di respons: {}", body))
}

#[tauri::command]
pub async fn oauth_start_server(app: tauri::AppHandle) -> Result<u16, String> {
    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .map_err(|e| format!("Gagal membuat server OAuth: {}", e))?;

    let port = listener
        .local_addr()
        .map_err(|e| e.to_string())?
        .port();

    tauri::async_runtime::spawn(async move {
        match listener.accept().await {
            Ok((mut stream, _)) => {
                let mut buffer = vec![0u8; 8192];
                let n = stream.read(&mut buffer).await.unwrap_or(0);
                let request = String::from_utf8_lossy(&buffer[..n]).to_string();

                let html = r#"<!DOCTYPE html><html><head><meta charset="utf-8"><title>Takoto</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8f9fa}div{text-align:center;padding:40px;border-radius:12px;background:white;box-shadow:0 4px 20px rgba(0,0,0,.1)}h2{color:#1a1a1a;margin:0 0 8px}p{color:#666;margin:0}</style></head><body><div><h2>Login Berhasil!</h2><p>Anda dapat menutup tab ini dan kembali ke Takoto.</p></div></body></html>"#;
                let response = format!(
                    "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
                    html.len(),
                    html
                );
                let _ = stream.write_all(response.as_bytes()).await;
                let _ = stream.flush().await;

                // Extract the callback URL from the HTTP GET request line
                let path = request
                    .lines()
                    .next()
                    .and_then(|l| l.split_whitespace().nth(1))
                    .unwrap_or("/")
                    .to_string();

                let callback_url = format!("http://localhost:{}{}", port, path);
                let _ = app.emit("oauth-callback", callback_url);
            }
            Err(e) => {
                tracing::error!("OAuth server accept error: {}", e);
            }
        }
    });

    Ok(port)
}
