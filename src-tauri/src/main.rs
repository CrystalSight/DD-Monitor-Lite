// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
mod commands;
mod monitor;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::fetch_room_info,
            commands::add_monitored_room,
            commands::remove_monitored_room,
            commands::start_monitoring,
            commands::request_notification_permission,
            commands::send_notification
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
