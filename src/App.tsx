import { useEffect, useState } from 'react';
import { useRoomStore } from './stores/roomStore';
import { RoomCard } from './components/RoomCard';
import { AddRoomModal } from './components/AddRoomModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SettingsPanel } from './components/SettingsPanel';

export default function App() {
  const { rooms, addRoom, removeRoom, checkStatusChanges, enableNotifications, notificationsEnabled } = useRoomStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 不再自动请求通知权限，改为用户交互时请求

  // 定时检查直播间状态
  useEffect(() => {
    const interval = setInterval(() => {
      checkStatusChanges();
    }, 120000); // 每120秒(2分钟)检查一次

    // 立即执行一次
    checkStatusChanges();

    return () => clearInterval(interval);
  }, [checkStatusChanges]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DD Monitor Lite</h1>
            <p className="text-sm text-gray-500 mt-1">
              监控 {rooms.length} 个直播间
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="设置"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={async () => {
                // 用户交互时请求通知权限
                if (!notificationsEnabled) {
                  await enableNotifications();
                }
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              + 添加直播间
            </button>
          </div>
        </div>
      </header>

      {/* 设置面板 */}
      {showSettings && (
        <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
          <SettingsPanel />
        </div>
      )}

      {/* 直播间列表 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {rooms.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">暂无监控的直播间</p>
            <p className="text-sm mt-2">点击右上角按钮添加要监控的直播间</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms
              .sort((a, b) => {
                // 正在直播的排在前面
                if (a.isLive && !b.isLive) return -1;
                if (!a.isLive && b.isLive) return 1;
                // 同为直播或未开播,按添加时间倒序(新的在前)
                return (b.addedAt || 0) - (a.addedAt || 0);
              })
              .map(room => (
              <ErrorBoundary key={room.id}>
                <RoomCard 
                  room={room} 
                  onRemove={() => removeRoom(room.id)}
                />
              </ErrorBoundary>
            ))}
          </div>
        )}
      </main>

      {/* 添加直播间弹窗 */}
      {showAddModal && (
        <AddRoomModal 
          onClose={() => setShowAddModal(false)}
          onAdd={async (roomId) => {
            try {
              await addRoom(roomId);
              setShowAddModal(false);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              alert(`添加失败: ${errorMessage}`);
              console.error('Failed to add room:', error);
            }
          }}
        />
      )}
    </div>
  );
}
