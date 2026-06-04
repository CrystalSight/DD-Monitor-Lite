use std::sync::Arc;
use tokio::sync::broadcast;
use crate::api::bilibili::{self, RoomInfo};

pub struct MonitorService {
    rooms: Arc<std::sync::Mutex<Vec<String>>>,
    tx: broadcast::Sender<RoomUpdate>,
}

#[derive(Clone, Debug)]
pub enum RoomUpdate {
    StatusChanged(RoomInfo),
    InfoUpdated(RoomInfo),
}

impl MonitorService {
    pub fn new() -> (Self, broadcast::Receiver<RoomUpdate>) {
        let (tx, rx) = broadcast::channel(100);
        (
            Self {
                rooms: Arc::new(std::sync::Mutex::new(Vec::new())),
                tx,
            },
            rx,
        )
    }
    
    pub fn add_room(&self, room_id: String) {
        if let Ok(mut rooms) = self.rooms.lock() {
            if !rooms.contains(&room_id) {
                rooms.push(room_id);
            }
        }
    }
    
    pub fn remove_room(&self, room_id: &str) {
        if let Ok(mut rooms) = self.rooms.lock() {
            rooms.retain(|id| id != room_id);
        }
    }
    
    pub async fn start_monitoring(&self) {
        let rooms = self.rooms.clone();
        let tx = self.tx.clone();
        
        tokio::spawn(async move {
            loop {
                let room_ids = rooms.lock().unwrap().clone();
                
                if !room_ids.is_empty() {
                    match bilibili::batch_get_room_info(&room_ids).await {
                        Ok(infos) => {
                            for info in infos {
                                let _ = tx.send(RoomUpdate::InfoUpdated(info));
                            }
                        }
                        Err(e) => eprintln!("Monitoring error: {}", e),
                    }
                }
                
                tokio::time::sleep(tokio::time::Duration::from_secs(30)).await;
            }
        });
    }
}
