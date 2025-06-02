use tauri::{Manager, Url};
use dotenv::dotenv;
use std::env;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().ok();
    let app_url = env::var("APP_URL").unwrap_or_else(|_| "http://marcadas.arpb.mil".to_string());
    println!("APP_URL: {}", app_url);
    if app_url.starts_with("http") {
        tauri::Builder::default()
        .setup(move |app| {
            app.get_webview_window("main").unwrap().navigate
            (
                Url::parse(&app_url).unwrap(),
            ).unwrap();

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    }
    else {
        tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    }
}
