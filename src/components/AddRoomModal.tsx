import { useState } from 'react';

interface AddRoomModalProps {
  onClose: () => void;
  onAdd: (roomId: string) => Promise<void>;
}

export function AddRoomModal({ onClose, onAdd }: AddRoomModalProps) {
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    
    setLoading(true);
    try {
      await onAdd(roomId.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">添加直播间</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
              房间号或直播间链接
            </label>
            <input
              type="text"
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="例如: 123456 或 https://live.bilibili.com/123456"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              支持直接粘贴 Bilibili 直播间链接，会自动提取房间号
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              disabled={loading || !roomId.trim()}
            >
              {loading ? '添加中...' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
