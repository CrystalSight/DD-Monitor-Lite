import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';
import { LiveRoom } from '../types';
import { formatDuration } from '../utils/format';

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
        try {
          const info = await invoke<LiveRoom>('fetch_room_info', { roomId });
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
            if (room.isLive && !oldRoom.isLive) {
              // 开播通知
              invoke('send_notification', {
                appHandle: null,
                title: `${room.name} 开播了!`,
                body: room.title
              }).catch(console.error);
            } else if (!room.isLive && oldRoom.isLive) {
              // 下播通知
              const duration = room.startTime 
                ? Math.floor((Date.now() / 1000) - room.startTime)
                : room.onlineCount || 0;
              invoke('send_notification', {
                appHandle: null,
                title: `${room.name} 已下播`,
                body: `本次直播时长: ${formatDuration(duration)}`
              }).catch(console.error);
            }
          }
          
          return {
            rooms: state.rooms.map(r => r.id === room.id ? room : r)
          };
        });
      },
      
      checkStatusChanges: async () => {
        const rooms = get().rooms;
        // 并行请求所有房间信息，提高性能
        await Promise.all(
          rooms.map(async (room) => {
            try {
              const info = await invoke<LiveRoom>('fetch_room_info', { roomId: room.id });
              get().updateRoom(info);
            } catch (error) {
              console.error(`Failed to check room ${room.id}:`, error);
            }
          })
        );
      },
      
      enableNotifications: async () => {
        try {
          await invoke('request_notification_permission', { appHandle: null });
          set({ notificationsEnabled: true });
        } catch (error) {
          console.error('Failed to enable notifications:', error);
        }
      }
    }),
    {
      name: 'dd-monitor-storage',
      partialize: (state) => ({ rooms: state.rooms })
    }
  )
);
