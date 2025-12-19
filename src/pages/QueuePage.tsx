/**
 * QueuePage - 待機列ページ
 * Issue #1: ルーティング設定
 *
 * WebSocket接続状態と待機順位を表示するページ
 */
import { useState, useEffect } from 'react'
import { QueuePosition } from '../components/queue/QueuePosition'

type ConnectionStatus = 'connecting' | 'connected' | 'error'

export function QueuePage() {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const [queuePosition, setQueuePosition] = useState<number>(10)
  const [totalWaiting, setTotalWaiting] = useState<number>(50)
  const [message, setMessage] = useState<string>('')

  // シミュレーション: 接続後に待機順位を表示
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('connected')
      setMessage('順番が来るまでお待ちください')
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // シミュレーション: 順位が徐々に減少（アニメーションデモ用）
  useEffect(() => {
    if (status !== 'connected') return

    const interval = setInterval(() => {
      setQueuePosition(prev => {
        if (prev <= 1) return 1
        return prev - 1
      })
      setTotalWaiting(prev => Math.max(prev - 1, 10))
    }, 3000)

    return () => clearInterval(interval)
  }, [status])

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
        {status === 'connecting' && (
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

        {/* 待機順位表示エリア - QueuePositionコンポーネント使用 */}
        {status === 'connected' && (
          <div className="space-y-6">
            <QueuePosition
              position={queuePosition}
              totalWaiting={totalWaiting}
            />

            {/* 推定待機時間 */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">推定待機時間</p>
              <p className="text-white text-xl font-semibold">
                約 {Math.ceil(queuePosition * 1.5)} 分
              </p>
            </div>

            {/* メッセージ表示エリア */}
            <div className="text-gray-300 text-sm">
              {message}
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
        {status === 'error' && (
          <div className="space-y-4">
            <div className="text-red-400 text-lg">
              接続エラーが発生しました
            </div>
            <button
              onClick={() => {
                setStatus('connecting')
                setQueuePosition(10)
                setTotalWaiting(50)
                setTimeout(() => {
                  setStatus('connected')
                  setMessage('順番が来るまでお待ちください')
                }, 2000)
              }}
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
