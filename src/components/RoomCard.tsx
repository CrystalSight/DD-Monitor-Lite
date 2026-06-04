import { useMemo } from 'react';
import { LiveRoom } from '../types';
import { formatDuration } from '../utils/format';

interface RoomCardProps {
  room: LiveRoom;
  onRemove: () => void;
}

export function RoomCard({ room, onRemove }: RoomCardProps) {
  const duration = useMemo(() => {
    return room.startTime && room.isLive
      ? Math.floor((Date.now() / 1000) - room.startTime)
      : room.duration || 0;
  }, [room.startTime, room.isLive, room.duration]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-100">
      <div className="flex items-start gap-4">
        {/* 主播头像 */}
        <img 
          src={room.avatar} 
          alt={room.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="40"%3E👤%3C/text%3E%3C/svg%3E';
          }}
        />
        
        {/* 直播信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-gray-900 truncate" title={room.name}>
              {room.name}
            </h3>
            <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
              room.isLive 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {room.isLive ? '直播中' : '未开播'}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mt-1 line-clamp-2" title={room.title}>
            {room.title}
          </p>
          
          {/* 封面图 */}
          {room.cover && (
            <img 
              src={room.cover} 
              alt="直播封面"
              className="mt-2 w-full h-32 object-cover rounded bg-gray-100"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          
          {/* 额外信息 */}
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            {room.areaName && (
              <div className="flex items-center gap-1">
                <span>📺</span>
                <span>{room.areaName}</span>
              </div>
            )}
            {room.isLive && (
              <>
                {room.onlineCount !== undefined && (
                  <div className="flex items-center gap-1">
                    <span>👥</span>
                    <span>{room.onlineCount.toLocaleString()} 人观看</span>
                  </div>
                )}
                {room.startTime && (
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>已播 {formatDuration(duration)}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* 删除按钮 */}
        <button 
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
          title="移除直播间"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
