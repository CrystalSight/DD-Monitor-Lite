export interface LiveRoom {
  id: string;              // 房间号
  uid: number;             // 主播 UID
  name: string;            // 主播名称
  avatar: string;          // 主播头像 URL
  title: string;           // 直播标题
  cover: string;           // 直播封面图
  keyframe?: string | null;       // 直播画面快照
  isLive: boolean;         // 开播状态
  liveStatus: number;      // 直播状态码
  startTime?: number | null;      // 开播时间戳
  onlineCount: number;     // 在线人数
  areaName: string;        // 分区名称
  addedAt?: number;        // 添加时间戳
}
