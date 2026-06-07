import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';
import { LiveRoom } from '../types';

interface RoomStore {
  rooms: LiveRoom[];
  notificationsEnabled: boolean;
  addRoom: (roomId: string) => Promise<void>;
  removeRoom: (roomId: string) => Promise<void>;
  updateRoom: (room: LiveRoom) => void;
  checkStatusChanges: () => Promise<void>;
  enableNotifications: () => Promise<void>;
}

export const useRoomStore = create<RoomStore>()(
  persist(
    (set, get) => ({
      rooms: [],
      notificationsEnabled: false,
      
      addRoom: async (roomId) => {
        // 检查是否已存在
        const existingRoom = get().rooms.find(r => r.id === roomId);
        if (existingRoom) {
          throw new Error(`直播间 ${roomId} 已在监控列表中`);
        }
          
        try {
          const info = await invoke<LiveRoom>('fetch_room_info', { roomId });
            
          // 调试日志
          console.log('=== 房间信息调试 ===');
          console.log('房间ID:', info.id);
          console.log('主播名称:', info.name);
          console.log('头像URL:', info.avatar);
          console.log('封面URL:', info.cover);
          console.log('关键帧:', info.keyframe);
          console.log('直播状态:', info.isLive);
          console.log('==================');
            
          set((state) => ({
            rooms: [...state.rooms, { ...info, addedAt: Date.now() }]
          }));
          await invoke('add_monitored_room', { roomId });
        } catch (error) {
          console.error('Failed to add room:', error);
          throw error;
        }
      },
      
      removeRoom: async (roomId) => {
        set((state) => ({
          rooms: state.rooms.filter(r => r.id !== roomId)
        }));
        await invoke('remove_monitored_room', { roomId });
      },
      
      updateRoom: (room) => {
        set((state) => {
          const oldRoom = state.rooms.find(r => r.id === room.id);
          
          // 检测开播/下播状态变化
          if (oldRoom && oldRoom.isLive !== room.isLive) {
            // 只在通知启用时发送
            if (state.notificationsEnabled) {
              if (room.isLive && !oldRoom.isLive) {
                // 开播通知
                invoke('send_notification', {
                  title: `${room.name} 开播了!`,
                  body: room.title
                }).catch(console.error);
              } else if (!room.isLive && oldRoom.isLive) {
                // 下播通知
                invoke('send_notification', {
                  title: `${room.name} 已下播`,
                  body: '直播已结束'
                }).catch(console.error);
              }
            }
          }
          
          return {
            rooms: state.rooms.map(r => r.id === room.id ? room : r)
          };
        });
      },
      
      checkStatusChanges: async () => {
        const rooms = get().rooms;
        
        if (rooms.length === 0) {
          console.log('无监控房间,跳过本次轮询');
          return;
        }
        
        console.log(`开始更新 ${rooms.length} 个房间`);
        
        // 并行请求所有房间信息，提高性能并检测状态变化
        await Promise.all(
          rooms.map(async (room) => {
            try {
              const info = await invoke<LiveRoom>('fetch_room_info', { roomId: room.id });
              // 后端已在 keyframe 中添加时间戳,直接使用
              if (info.isLive && info.keyframe) {
                info.cover = info.keyframe;
              }
              get().updateRoom(info);
            } catch (error) {
              console.error(`Failed to check room ${room.id}:`, error);
            }
          })
        );
      },
      
      enableNotifications: async () => {
        try {
          await invoke('request_notification_permission');
          set({ notificationsEnabled: true });
        } catch (error) {
          console.error('Failed to enable notifications:', error);
        }
      }
    }),
    {
      name: import.meta.env.DEV ? 'dd-monitor-storage-dev' : 'dd-monitor-storage',
      partialize: (state) => ({ 
        rooms: state.rooms,
        notificationsEnabled: state.notificationsEnabled 
      })
    }
  )
);
