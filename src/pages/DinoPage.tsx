/**
 * DinoPage - Dino Run ゲームページ
 * Issue #9: Dino RunページUI・基本構造
 *
 * Canvas要素を使用したゲームエリアとスコア・タイマー表示
 */
import { useRef, useEffect, useState, useCallback } from 'react'

type GameState = 'ready' | 'playing' | 'gameover'

export function DinoPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [gameState, setGameState] = useState<GameState>('ready')
    const [score, setScore] = useState(0)
    const [timer, setTimer] = useState(0)
    const [highScore, setHighScore] = useState(0)

    // Canvas初期化
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Canvas背景を描画
        ctx.fillStyle = '#1f2937'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // 地面を描画
        ctx.fillStyle = '#374151'
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40)

        // ゲーム待機中のテキスト
        if (gameState === 'ready') {
            ctx.fillStyle = '#9ca3af'
            ctx.font = '24px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('スペースキーでスタート', canvas.width / 2, canvas.height / 2)
        }

        // 恐竜を描画（簡易版）
        ctx.fillStyle = '#10b981'
        ctx.fillRect(80, canvas.height - 80, 40, 40)

    }, [gameState])

    // タイマー更新
    useEffect(() => {
        if (gameState !== 'playing') return

        const interval = setInterval(() => {
            setTimer(prev => prev + 1)
            setScore(prev => prev + 10)
        }, 1000)

        return () => clearInterval(interval)
    }, [gameState])

    // ゲーム開始
    const startGame = useCallback(() => {
        setGameState('playing')
        setScore(0)
        setTimer(0)
    }, [])

    // ゲームオーバー（デモ用）
    const endGame = useCallback(() => {
        setGameState('gameover')
        if (score > highScore) {
            setHighScore(score)
        }
    }, [score, highScore])

    // リトライ
    const retry = useCallback(() => {
        setGameState('ready')
        setScore(0)
        setTimer(0)
    }, [])

    // キーボードイベント
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault()
                if (gameState === 'ready') {
                    startGame()
                } else if (gameState === 'gameover') {
                    retry()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameState, startGame, retry])

    return (
        <div
            data-testid="dino-page"
            className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4"
        >
            {/* ヘッダー */}
            <h1 className="text-3xl font-bold text-white mb-4">
                🦖 Dino Run
            </h1>

            {/* スコア・タイマー表示エリア */}
            <div className="flex gap-8 mb-4 text-white">
                <div className="bg-gray-800/80 px-6 py-3 rounded-lg">
                    <span className="text-gray-400 text-sm">スコア</span>
                    <div className="text-2xl font-bold text-green-400">{score}</div>
                </div>
                <div className="bg-gray-800/80 px-6 py-3 rounded-lg">
                    <span className="text-gray-400 text-sm">タイム</span>
                    <div className="text-2xl font-bold text-blue-400">{timer}秒</div>
                </div>
                <div className="bg-gray-800/80 px-6 py-3 rounded-lg">
                    <span className="text-gray-400 text-sm">ハイスコア</span>
                    <div className="text-2xl font-bold text-yellow-400">{highScore}</div>
                </div>
            </div>

            {/* ゲームエリア（Canvas） */}
            <div className="relative bg-gray-800 rounded-xl border-2 border-gray-700 shadow-2xl overflow-hidden">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={300}
                    className="block"
                    data-testid="game-canvas"
                />

                {/* スタート画面オーバーレイ */}
                {gameState === 'ready' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                        <p className="text-gray-300 text-lg mb-4">
                            障害物を避けて生き残れ！
                        </p>
                        <button
                            onClick={startGame}
                            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-lg"
                        >
                            ゲームスタート
                        </button>
                        <p className="text-gray-500 text-sm mt-4">
                            または スペースキー でスタート
                        </p>
                    </div>
                )}

                {/* ゲームオーバー画面オーバーレイ */}
                {gameState === 'gameover' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                        <p className="text-red-400 text-3xl font-bold mb-2">
                            ゲームオーバー
                        </p>
                        <p className="text-white text-xl mb-4">
                            スコア: {score}
                        </p>
                        <button
                            onClick={retry}
                            className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition-colors text-lg"
                        >
                            リトライ
                        </button>
                    </div>
                )}
            </div>

            {/* ゲーム説明 */}
            <div className="mt-6 text-gray-400 text-center">
                <p className="mb-2">🎮 操作方法</p>
                <div className="flex gap-4 justify-center">
                    <span className="bg-gray-800 px-3 py-1 rounded">スペース</span>
                    <span>ジャンプ</span>
                </div>
            </div>

            {/* タッチ操作ボタン（モバイル用） */}
            {gameState === 'playing' && (
                <button
                    onClick={() => {/* ジャンプ処理 */ }}
                    onTouchStart={() => {/* ジャンプ処理 */ }}
                    className="mt-4 px-12 py-6 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl border-2 border-gray-600 md:hidden"
                >
                    タップでジャンプ
                </button>
            )}

            {/* デモ用：ゲームオーバーボタン */}
            {gameState === 'playing' && (
                <button
                    onClick={endGame}
                    className="mt-4 px-4 py-2 bg-red-600/50 hover:bg-red-600 text-white rounded transition-colors text-sm"
                >
                    ゲームオーバー（デモ）
                </button>
            )}
        </div>
    )
}

export default DinoPage
