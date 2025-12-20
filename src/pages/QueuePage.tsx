/**
 * QueuePage - 待機列ページ
 * Issue #1: ルーティング設定
 *
 * WebSocket接続状態と待機順位を表示するページ
 */
import { QueuePosition } from '../components/queue/QueuePosition'
import { useQueueWebSocket } from '../hooks/useQueueWebSocket'

export function QueuePage() {
  const {
    isConnected,
    isConnecting,
    error,
    position,
    totalWaiting,
    reconnect,
    countdownSeconds,
    isMyTurn,
  } = useQueueWebSocket()

  return (
    <div
      data-testid="queue-page"
      className="min-h-screen bg-white flex items-center justify-center p-4"
    >
      <div className="bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-8 w-full max-w-md text-center">
        {/* ヘッダー */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          待機列
        </h1>

        {/* 接続状態表示 */}
        {isConnecting && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-amber-600 text-lg">接続中...</span>
            </div>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* 待機順位表示エリア - WebSocket経由で更新 */}
        {isConnected && !isMyTurn && (
          <div className="space-y-6">
            <QueuePosition
              position={position}
              totalWaiting={totalWaiting}
            />

            {/* 推定待機時間 */}
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-gray-500 text-xs mb-1">推定待機時間</p>
              <p className="text-gray-800 text-xl font-semibold">
                約 {Math.ceil(position * 1.5)} 分
              </p>
            </div>

            {/* メッセージ表示エリア */}
            <div className="text-gray-600 text-sm">
              順番が来るまでお待ちください
            </div>

            {/* アニメーション付きインジケーター */}
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 自分の番が来た時のカウントダウン表示 */}
        {isConnected && isMyTurn && (
          <div className="space-y-6" data-testid="countdown-section">
            <div className="text-center">
              <p className="text-green-600 text-2xl font-bold mb-4">
                🎉 あなたの番です！
              </p>
              <div className="bg-green-500 rounded-xl p-6 shadow-sm">
                <p className="text-white text-sm mb-2">ゲーム開始まで</p>
                <p className="text-white text-6xl font-bold" data-testid="countdown-number">
                  {countdownSeconds}
                </p>
                <p className="text-white text-sm mt-2">秒</p>
              </div>
            </div>

            {/* パルスアニメーション */}
            <div className="flex justify-center">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-ping" />
            </div>

            <p className="text-gray-600 text-sm">
              Dino Run ゲームに移動します...
            </p>
          </div>
        )}

        {/* エラー状態 */}
        {error && (
          <div className="space-y-4">
            <div className="text-red-500 text-lg">
              {error}
            </div>
            <button
              onClick={reconnect}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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

