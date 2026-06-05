use reqwest;
use serde::{Deserialize, Serialize};
use anyhow::Result;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
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
    keyframe: Option<String>,
    user_cover: Option<String>,
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
    let keyframe = room_data.keyframe.unwrap_or_default();
    let user_cover = room_data.user_cover.unwrap_or_default();
    let uname = user_data.uname.clone();
    
    println!("[DEBUG] 房间 {} API响应 - UID: {}, 直播状态: {}", room_data.room_id, room_data.uid, room_data.live_status);
    println!("[DEBUG] 主播 {} 原始头像URL: '{}'", uname, user_data.face);
    
    Ok(RoomInfo {
        id: room_data.room_id.to_string(),
        uid: room_data.uid,
        name: uname.clone(),
        avatar: {
            let face_url = user_data.face.trim();
            let avatar_url = if face_url.is_empty() || face_url.contains("noface") {
                println!("[DEBUG] 主播 {} 头像为空或无效,使用默认头像", uname);
                "https://i0.hdslb.com/bfs/face/member/noface.jpg".to_string()
            } else if face_url.starts_with("http://") {
                let https_url = face_url.replace("http://", "https://");
                println!("[DEBUG] 主播 {} HTTP头像转换为HTTPS", uname);
                https_url
            } else {
                println!("[DEBUG] 主播 {} 使用头像: {}", uname, face_url);
                face_url.to_string()
            };
            avatar_url
        },
        title: room_data.title,
        cover: {
            let cover_url = if !keyframe.is_empty() && room_data.live_status == 1 {
                println!("[DEBUG] 房间 {} 直播中,使用关键帧封面", room_data.room_id);
                keyframe.clone()
            } else if !user_cover.is_empty() {
                println!("[DEBUG] 房间 {} 使用用户封面", room_data.room_id);
                user_cover.clone()
            } else {
                println!("[DEBUG] 房间 {} 使用默认封面", room_data.room_id);
                room_data.cover.clone().unwrap_or_default()
            };
            println!("[DEBUG] 房间 {} 最终封面URL长度: {} 字符", room_data.room_id, cover_url.len());
            cover_url
        },
        keyframe: if keyframe.is_empty() { None } else { Some(keyframe) },
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
