/**
 * DinoPage - Dino Run ゲームページ
 * Issue #9: Dino RunページUI・基本構造
 *
 * Canvas要素を使用したゲームエリアとスコア・タイマー表示
 * タイムアウト: 3分（180秒）
 */
import { useRef, useEffect, useState, useCallback } from 'react'
import { Dinosaur, GROUND_Y } from '../components/dino/Dinosaur'
import { ObstacleManager } from '../components/dino/Obstacle'
import { checkCollision } from '../components/dino/CollisionDetector'
import { ScoreDisplay, TARGET_SCORE, isTimeout, isTargetAchieved } from '../components/dino/ScoreDisplay'

type GameState = 'ready' | 'playing' | 'gameover' | 'success'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 300

export function DinoPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const dinoRef = useRef<Dinosaur | null>(null)
    const obstacleManagerRef = useRef<ObstacleManager | null>(null)
    const animationFrameRef = useRef<number>(0)
    const scoreRef = useRef<number>(0)
    const timerRef = useRef<number>(0)

    const [gameState, setGameState] = useState<GameState>('ready')
    const [score, setScore] = useState(0)
    const [timer, setTimer] = useState(0)
    const [highScore, setHighScore] = useState(0)
    const [isNewHighScore, setIsNewHighScore] = useState(false)
    const [isTimeoutFail, setIsTimeoutFail] = useState(false)

    // 恐竜・障害物マネージャー初期化
    useEffect(() => {
        dinoRef.current = new Dinosaur(80)
        obstacleManagerRef.current = new ObstacleManager(CANVAS_WIDTH)
    }, [])

    // ゲーム成功処理
    const handleSuccess = useCallback(() => {
        cancelAnimationFrame(animationFrameRef.current)
        setGameState('success')

        const currentScore = scoreRef.current
        if (currentScore > highScore) {
            setHighScore(currentScore)
            setIsNewHighScore(true)
        } else {
            setIsNewHighScore(false)
        }
    }, [highScore])

    // ゲームオーバー処理
    const handleGameOver = useCallback((timeout: boolean = false) => {
        cancelAnimationFrame(animationFrameRef.current)
        setGameState('gameover')
        setIsTimeoutFail(timeout)

        const currentScore = scoreRef.current
        if (currentScore > highScore) {
            setHighScore(currentScore)
            setIsNewHighScore(true)
        } else {
            setIsNewHighScore(false)
        }
    }, [highScore])

    // ゲームループ
    const gameLoop = useCallback(() => {
        const canvas = canvasRef.current
        const dino = dinoRef.current
        const obstacleManager = obstacleManagerRef.current
        if (!canvas || !dino || !obstacleManager) return

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

        // 障害物を更新・描画
        obstacleManager.update(scoreRef.current)
        obstacleManager.draw(ctx)

        // 当たり判定
        const dinoHitbox = dino.getHitbox()
        for (const obstacle of obstacleManager.obstacles) {
            const obstacleHitbox = obstacle.getHitbox()
            if (checkCollision(dinoHitbox, obstacleHitbox)) {
                handleGameOver(false)
                return
            }
        }

        // スコア更新（毎フレーム）
        scoreRef.current += 1
        setScore(scoreRef.current)

        // 目標スコア達成チェック
        if (isTargetAchieved(scoreRef.current, TARGET_SCORE)) {
            handleSuccess()
            return
        }

        // ゲームループ継続
        animationFrameRef.current = requestAnimationFrame(gameLoop)
    }, [handleGameOver, handleSuccess])

    // ゲーム開始
    const startGame = useCallback(() => {
        if (dinoRef.current) {
            dinoRef.current.reset()
        }
        if (obstacleManagerRef.current) {
            obstacleManagerRef.current.reset()
        }
        scoreRef.current = 0
        timerRef.current = 0
        setGameState('playing')
        setScore(0)
        setTimer(0)
        setIsTimeoutFail(false)
        animationFrameRef.current = requestAnimationFrame(gameLoop)
    }, [gameLoop])

    // リトライ
    const retry = useCallback(() => {
        if (dinoRef.current) {
            dinoRef.current.reset()
        }
        if (obstacleManagerRef.current) {
            obstacleManagerRef.current.reset()
        }
        scoreRef.current = 0
        timerRef.current = 0
        setGameState('ready')
        setScore(0)
        setTimer(0)
        setIsTimeoutFail(false)
    }, [])

    // ジャンプ処理
    const handleJump = useCallback(() => {
        if (gameState === 'playing' && dinoRef.current) {
            dinoRef.current.jump()
        }
    }, [gameState])

    // タイマー更新（3分タイムアウト）
    useEffect(() => {
        if (gameState !== 'playing') return

        const interval = setInterval(() => {
            timerRef.current += 1
            setTimer(timerRef.current)

            // タイムアウトチェック
            if (isTimeout(timerRef.current)) {
                handleGameOver(true)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [gameState, handleGameOver])

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
                } else if (gameState === 'gameover' || gameState === 'success') {
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
            <ScoreDisplay
                score={score}
                time={timer}
                highScore={highScore}
                targetScore={TARGET_SCORE}
                showTargetScore={gameState === 'playing'}
                isGameOver={gameState === 'gameover' || gameState === 'success'}
            />

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
                        <p className="text-gray-300 text-lg mb-2">
                            障害物を避けて生き残れ！
                        </p>
                        <p className="text-purple-400 text-sm mb-4">
                            制限時間: 3分 / 目標スコア: {TARGET_SCORE}
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
                            {isTimeoutFail ? '⏰ タイムアウト' : 'ゲームオーバー'}
                        </p>
                        <p className="text-white text-xl mb-2">
                            スコア: {score}
                        </p>
                        {isNewHighScore && (
                            <p className="text-yellow-400 text-lg font-bold mb-2 animate-pulse">
                                🎉 NEW HIGH SCORE!
                            </p>
                        )}
                        {isTimeoutFail && (
                            <p className="text-gray-400 text-sm mb-4">
                                3分以内にクリアできませんでした
                            </p>
                        )}
                        <button
                            onClick={retry}
                            className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition-colors text-lg"
                        >
                            リトライ
                        </button>
                    </div>
                )}

                {/* 成功画面オーバーレイ */}
                {gameState === 'success' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                        <p className="text-green-400 text-3xl font-bold mb-2 animate-bounce">
                            🎉 クリア！
                        </p>
                        <p className="text-white text-xl mb-2">
                            スコア: {score}
                        </p>
                        <p className="text-blue-400 text-lg mb-2">
                            タイム: {Math.floor(timer / 60)}分{timer % 60}秒
                        </p>
                        {isNewHighScore && (
                            <p className="text-yellow-400 text-lg font-bold mb-2 animate-pulse">
                                🏆 NEW HIGH SCORE!
                            </p>
                        )}
                        <button
                            onClick={retry}
                            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-lg"
                        >
                            もう一度プレイ
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
        </div>
    )
}




export default DinoPage
