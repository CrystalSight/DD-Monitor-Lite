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
struct RoomBasicInfo {
    room_id: u64,
    uid: u64,
    title: String,
    cover: Option<String>,
    live_status: i32,
    live_start_time: Option<u64>,
    online: u64,
    area_name: String,
}

#[derive(Debug, Deserialize)]
struct RoomBasicApiResponse {
    code: i32,
    message: String,
    data: RoomBasicInfo,
}

#[derive(Debug, Deserialize)]
struct UserInfo {
    uname: String,
    face: String,
}

#[derive(Debug, Deserialize)]
struct UserApiResponse {
    code: i32,
    message: String,
    data: UserData,
}

#[derive(Debug, Deserialize)]
struct UserData {
    info: UserInfo,
}



pub async fn get_room_info(room_id: &str) -> Result<RoomInfo> {
    let client = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .build()?;
    
    // 第一步:获取房间基本信息
    let room_url = format!(
        "https://api.live.bilibili.com/room/v1/Room/get_info?room_id={}",
        room_id
    );
    
    let room_response = client.get(&room_url).send().await?;
    let room_api: RoomBasicApiResponse = room_response.json().await?;
    
    if room_api.code != 0 {
        return Err(anyhow::anyhow!("获取房间信息失败: {}", room_api.message));
    }
    
    let room_data = room_api.data;
    
    // 第二步:获取主播信息
    let user_url = format!(
        "https://api.live.bilibili.com/live_user/v1/Master/info?uid={}",
        room_data.uid
    );
    
    let user_response = client.get(&user_url).send().await?;
    let user_api: UserApiResponse = user_response.json().await?;
    
    if user_api.code != 0 {
        return Err(anyhow::anyhow!("获取用户信息失败: {}", user_api.message));
    }
    
    let user_data = user_api.data.info;
    
    // 组合数据
    Ok(RoomInfo {
        id: room_data.room_id.to_string(),
        uid: room_data.uid,
        name: user_data.uname,
        avatar: if user_data.face.is_empty() {
            "https://i0.hdslb.com/bfs/face/member/noface.jpg".to_string()
        } else {
            user_data.face
        },
        title: room_data.title,
        cover: room_data.cover.unwrap_or_default(),
        keyframe: None,
        is_live: room_data.live_status == 1,
        live_status: room_data.live_status,
        start_time: room_data.live_start_time,
        online_count: room_data.online,
        area_name: room_data.area_name,
    })
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
