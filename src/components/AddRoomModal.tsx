import { useState } from 'react';

interface AddRoomModalProps {
  onClose: () => void;
  onAdd: (roomId: string) => Promise<void>;
}

export function AddRoomModal({ onClose, onAdd }: AddRoomModalProps) {
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);

  // 从输入中提取房间号
  const extractRoomId = (input: string): string => {
    const trimmed = input.trim();
    
    // 如果已经是纯数字,直接返回
    if (/^\d+$/.test(trimmed)) {
      return trimmed;
    }
    
    // 尝试从 URL 中提取房间号
    // 支持的格式:
    // https://live.bilibili.com/226054
    // https://live.bilibili.com/blanc/226054
    // http://live.bilibili.com/226054
    const urlPatterns = [
      /live\.bilibili\.com\/(\d+)/,
      /live\.bilibili\.com\/blanc\/(\d+)/,
    ];
    
    for (const pattern of urlPatterns) {
      const match = trimmed.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // 如果不是 URL 也不是纯数字,返回原始输入(让后端处理错误)
    return trimmed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) return;
    
    setLoading(true);
    try {
      const extractedId = extractRoomId(roomId);
      await onAdd(extractedId);
    } catch (error) {
      console.error('Add room error:', error);
      throw error;
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
