import { useRoomStore } from '../stores/roomStore';

export function SettingsPanel() {
  const { notificationsEnabled, enableNotifications } = useRoomStore();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">通知设置</h3>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">开播&下播提醒</p>
          <p className="text-xs text-gray-500 mt-1">
            当监控的主播开播或下播时发送系统通知
          </p>
        </div>
        
        <button
          onClick={async () => {
            if (!notificationsEnabled) {
              await enableNotifications();
            }
          }}
          disabled={notificationsEnabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            notificationsEnabled 
              ? 'bg-blue-500' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      {notificationsEnabled && (
        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          通知已启用
        </p>
      )}
    </div>
  );
}
