/**
 * DinoPage - Dino Run ゲームページ
 * Issue #9: Dino RunページUI・基本構造
 *
 * Canvas要素を使用したゲームエリアとスコア・タイマー表示
 */
import { useRef, useEffect, useState, useCallback } from 'react'
import { Dinosaur, GROUND_Y } from '../components/dino/Dinosaur'

type GameState = 'ready' | 'playing' | 'gameover'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 300

export function DinoPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const dinoRef = useRef<Dinosaur | null>(null)
    const animationFrameRef = useRef<number>(0)

    const [gameState, setGameState] = useState<GameState>('ready')
    const [score, setScore] = useState(0)
    const [timer, setTimer] = useState(0)
    const [highScore, setHighScore] = useState(0)

    // 恐竜インスタンス初期化
    useEffect(() => {
        dinoRef.current = new Dinosaur(80)
    }, [])

    // ゲームループ
    const gameLoop = useCallback(() => {
        const canvas = canvasRef.current
        const dino = dinoRef.current
        if (!canvas || !dino) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 背景クリア
        ctx.fillStyle = '#1f2937'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        // 地面を描画
        ctx.fillStyle = '#374151'
        ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y)

        // 地面のライン
        ctx.strokeStyle = '#4b5563'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, GROUND_Y)
        ctx.lineTo(CANVAS_WIDTH, GROUND_Y)
        ctx.stroke()

        // 恐竜を更新・描画
        dino.update()
        dino.draw(ctx)

        // スコア更新（毎フレーム）
        setScore(prev => prev + 1)

        // ゲームループ継続
        animationFrameRef.current = requestAnimationFrame(gameLoop)
    }, [])

    // ゲーム開始
    const startGame = useCallback(() => {
        if (dinoRef.current) {
            dinoRef.current.reset()
        }
        setGameState('playing')
        setScore(0)
        setTimer(0)
        animationFrameRef.current = requestAnimationFrame(gameLoop)
    }, [gameLoop])

    // ゲームオーバー
    const endGame = useCallback(() => {
        cancelAnimationFrame(animationFrameRef.current)
        setGameState('gameover')
        setHighScore(prev => Math.max(prev, score))
    }, [score])

    // リトライ
    const retry = useCallback(() => {
        if (dinoRef.current) {
            dinoRef.current.reset()
        }
        setGameState('ready')
        setScore(0)
        setTimer(0)
    }, [])

    // ジャンプ処理
    const handleJump = useCallback(() => {
        if (gameState === 'playing' && dinoRef.current) {
            dinoRef.current.jump()
        }
    }, [gameState])

    // タイマー更新
    useEffect(() => {
        if (gameState !== 'playing') return

        const interval = setInterval(() => {
            setTimer(prev => prev + 1)
        }, 1000)

        return () => clearInterval(interval)
    }, [gameState])

    // 初期描画
    useEffect(() => {
        const canvas = canvasRef.current
        const dino = dinoRef.current
        if (!canvas || !dino) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 背景
        ctx.fillStyle = '#1f2937'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        // 地面
        ctx.fillStyle = '#374151'
        ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y)

        // 地面のライン
        ctx.strokeStyle = '#4b5563'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, GROUND_Y)
        ctx.lineTo(CANVAS_WIDTH, GROUND_Y)
        ctx.stroke()

        // 恐竜を描画
        dino.draw(ctx)

        // スタート画面テキスト
        if (gameState === 'ready') {
            ctx.fillStyle = '#9ca3af'
            ctx.font = '24px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('スペースキーでスタート', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
        }
    }, [gameState])

    // クリーンアップ
    useEffect(() => {
        return () => {
            cancelAnimationFrame(animationFrameRef.current)
        }
    }, [])

    // キーボードイベント
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault()
                if (gameState === 'ready') {
                    startGame()
                } else if (gameState === 'playing') {
                    handleJump()
                } else if (gameState === 'gameover') {
                    retry()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameState, startGame, retry, handleJump])

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
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
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
                    <span className="bg-gray-800 px-3 py-1 rounded">スペース / タップ</span>
                    <span>ジャンプ</span>
                </div>
            </div>

            {/* タッチ操作ボタン（モバイル用） */}
            {gameState === 'playing' && (
                <button
                    onClick={handleJump}
                    onTouchStart={(e) => {
                        e.preventDefault()
                        handleJump()
                    }}
                    className="mt-4 px-12 py-6 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl border-2 border-gray-600 active:bg-green-600 md:hidden"
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
