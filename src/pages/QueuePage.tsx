/**
 * QueuePage - 待機列ページ
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
      className="min-h-screen bg-stone-50 flex items-center justify-center p-4"
    >
      <div className="bg-white border border-stone-200 rounded-sm p-10 w-full max-w-md text-center">
        {/* ヘッダー */}
        <h1 className="text-lg text-stone-700 tracking-wide mb-8">
          待機列
        </h1>

        {/* 接続状態表示 */}
        {isConnecting && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse" />
              <span className="text-stone-500 text-sm">接続中</span>
            </div>
            <div className="flex justify-center">
              <div className="w-6 h-6 border border-stone-300 border-t-stone-600 rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* 待機順位表示エリア */}
        {isConnected && !isMyTurn && (
          <div className="space-y-8">
            <QueuePosition
              position={position}
              totalWaiting={totalWaiting}
            />

            {/* 推定待機時間 */}
            <div className="py-4 border-t border-b border-stone-100">
              <p className="text-xs text-stone-400 mb-1 tracking-wide uppercase">推定待機時間</p>
              <p className="text-stone-800 text-xl">
                約 {Math.ceil(position * 1.5)} 分
              </p>
            </div>

            {/* メッセージ */}
            <p className="text-stone-500 text-sm">
              順番が来るまでお待ちください
            </p>

            {/* インジケーター */}
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 自分の番 */}
        {isConnected && isMyTurn && (
          <div className="space-y-8" data-testid="countdown-section">
            <div className="text-center">
              <p className="text-emerald-600 text-sm tracking-wide mb-6">
                YOUR TURN
              </p>
              <div className="py-8 border border-emerald-200 bg-emerald-50/50 rounded-sm">
                <p className="text-xs text-emerald-600 mb-2">ゲーム開始まで</p>
                <p className="text-emerald-700 text-5xl font-light" data-testid="countdown-number">
                  {countdownSeconds}
                </p>
                <p className="text-xs text-emerald-600 mt-2">秒</p>
              </div>
            </div>

            <p className="text-stone-500 text-sm">
              Dino Run ゲームに移動します
            </p>
          </div>
        )}

        {/* エラー状態 */}
        {error && (
          <div className="space-y-6">
            <p className="text-stone-600 text-sm">
              {error}
            </p>
            <button
              onClick={reconnect}
              className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white text-sm tracking-wide rounded-sm transition-colors"
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
