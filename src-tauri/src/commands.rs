use tauri_plugin_notification::NotificationExt;
use crate::api::bilibili;

#[tauri::command]
pub async fn fetch_room_info(room_id: String) -> Result<bilibili::RoomInfo, String> {
    bilibili::get_room_info(&room_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_monitored_room(_room_id: String) -> Result<(), String> {
    // Frontend handles room management via Zustand store
    Ok(())
}

#[tauri::command]
pub fn remove_monitored_room(_room_id: String) -> Result<(), String> {
    // Frontend handles room management via Zustand store
    Ok(())
}

#[tauri::command]
pub fn request_notification_permission(app_handle: tauri::AppHandle) -> Result<(), String> {
    let _ = app_handle.notification().request_permission().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn send_notification(app_handle: tauri::AppHandle, title: String, body: String) -> Result<(), String> {
    app_handle.notification()
        .builder()
        .title(&title)
        .body(&body)
        .show()
        .map_err(|e| e.to_string())
}
