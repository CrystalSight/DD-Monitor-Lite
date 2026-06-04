use tauri_plugin_notification::NotificationExt;
use crate::monitor::MonitorService;
use crate::api::bilibili;

static MONITOR: std::sync::OnceLock<MonitorService> = std::sync::OnceLock::new();

#[tauri::command]
pub async fn fetch_room_info(room_id: String) -> Result<bilibili::RoomInfo, String> {
    bilibili::get_room_info(&room_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_monitored_room(room_id: String) -> Result<(), String> {
    let monitor = MONITOR.get_or_init(|| {
        let (service, _) = MonitorService::new();
        service
    });
    monitor.add_room(room_id);
    Ok(())
}

#[tauri::command]
pub fn remove_monitored_room(room_id: String) -> Result<(), String> {
    let monitor = MONITOR.get_or_init(|| {
        let (service, _) = MonitorService::new();
        service
    });
    monitor.remove_room(&room_id);
    Ok(())
}

#[tauri::command]
pub fn start_monitoring() -> Result<(), String> {
    let monitor = MONITOR.get_or_init(|| {
        let (service, _) = MonitorService::new();
        service
    });
    // start_monitoring spawns a background task, so we call it but don't block
    // We need to use a runtime to call the async method
    tokio::spawn(async move {
        monitor.start_monitoring().await;
    });
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
