/**
 * QueuePage - 待機列ページ
 * Issue #1: ルーティング設定
 *
 * WebSocket接続状態と待機順位を表示するページ
 */
import { QueuePosition } from '../components/queue/QueuePosition'
import { useQueueWebSocketMock } from '../hooks/useQueueWebSocketMock'

export function QueuePage() {
  const {
    isConnected,
    isConnecting,
    error,
    position,
    totalWaiting,
    reconnect,
  } = useQueueWebSocketMock()

  return (
    <div
      data-testid="queue-page"
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4"
    >
      <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        {/* ヘッダー */}
        <h1 className="text-2xl font-bold text-white mb-6">
          待機列
        </h1>

        {/* 接続状態表示 */}
        {isConnecting && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-yellow-400 text-lg">接続中...</span>
            </div>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* 待機順位表示エリア - WebSocket経由で更新 */}
        {isConnected && (
          <div className="space-y-6">
            <QueuePosition
              position={position}
              totalWaiting={totalWaiting}
            />

            {/* 推定待機時間 */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">推定待機時間</p>
              <p className="text-white text-xl font-semibold">
                約 {Math.ceil(position * 1.5)} 分
              </p>
            </div>

            {/* メッセージ表示エリア */}
            <div className="text-gray-300 text-sm">
              順番が来るまでお待ちください
            </div>

            {/* アニメーション付きインジケーター */}
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* エラー状態 */}
        {error && (
          <div className="space-y-4">
            <div className="text-red-400 text-lg">
              {error}
            </div>
            <button
              onClick={reconnect}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
            >
              再接続
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QueuePage
