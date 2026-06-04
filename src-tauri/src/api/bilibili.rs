use reqwest;
use serde::{Deserialize, Serialize};
use anyhow::Result;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RoomInfo {
    pub id: String,
    pub uid: u64,
    pub name: String,
    pub avatar: String,
    pub title: String,
    pub cover: String,
    pub keyframe: Option<String>,
    pub is_live: bool,
    pub live_status: i32,
    pub start_time: Option<u64>,
    pub online_count: u64,
    pub area_name: String,
}

#[derive(Debug, Deserialize)]
struct ApiResponse {
    code: i32,
    message: String,
    data: RoomData,
}

#[derive(Debug, Deserialize)]
struct RoomData {
    room_id: u64,
    uid: u64,
    title: String,
    cover: String,
    keyframe: String,
    live_status: i32,
    live_start_time: u64,
    online: u64,
    area_name: String,
    uname: String,
    face: String,
}

impl From<RoomData> for RoomInfo {
    fn from(data: RoomData) -> Self {
        Self {
            id: data.room_id.to_string(),
            uid: data.uid,
            name: data.uname,
            avatar: data.face,
            title: data.title,
            cover: data.cover,
            keyframe: if data.keyframe.is_empty() { None } else { Some(data.keyframe) },
            is_live: data.live_status == 1,
            live_status: data.live_status,
            start_time: if data.live_status == 1 { Some(data.live_start_time) } else { None },
            online_count: data.online,
            area_name: data.area_name,
        }
    }
}

pub async fn get_room_info(room_id: &str) -> Result<RoomInfo> {
    let url = format!(
        "https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id={}",
        room_id
    );
    
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .build()?;
    
    let response = client.get(&url).send().await?;
    let api_response: ApiResponse = response.json().await?;
    
    if api_response.code != 0 {
        return Err(anyhow::anyhow!("API error: {}", api_response.message));
    }
    
    Ok(api_response.data.into())
}

pub async fn batch_get_room_info(room_ids: &[String]) -> Result<Vec<RoomInfo>> {
    let mut results = Vec::new();
    
    for room_id in room_ids {
        match get_room_info(room_id).await {
            Ok(info) => results.push(info),
            Err(e) => eprintln!("Failed to fetch room {}: {}", room_id, e),
        }
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
    }
    
    Ok(results)
}
