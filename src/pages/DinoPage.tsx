/**
 * DinoPage - Dino Run ゲームページ
 * Issue #9: Dino RunページUI・基本構造
 *
 * Canvas要素を使用したゲームエリアとスコア・タイマー表示
 * タイムアウト: 3分（180秒）
 * ゲーム終了時にAPI送信
 */
import { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dinosaur, GROUND_Y } from '../components/dino/Dinosaur'
import { ObstacleManager } from '../components/dino/Obstacle'
import { checkCollision } from '../components/dino/CollisionDetector'
import { ScoreDisplay } from '../components/dino/ScoreDisplay'
import { TARGET_SCORE, isTimeout, isTargetAchieved } from '../components/dino/scoreUtils'
import { submitGameResult, startGame as startGameApi } from '../api/dinoApi'
import type { GameResultResponse } from '../api/dinoApi'
import { useSessionStore } from '../store/sessionStore'

type GameState = 'ready' | 'playing' | 'gameover' | 'success' | 'submitting'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 300

export function DinoPage() {
    const navigate = useNavigate()
    const setStatus = useSessionStore((state) => state.setStatus)
    const resetSession = useSessionStore((state) => state.reset)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const dinoRef = useRef<Dinosaur | null>(null)
    const obstacleManagerRef = useRef<ObstacleManager | null>(null)
    const animationFrameRef = useRef<number>(0)
    const scoreRef = useRef<number>(0)
    const timerRef = useRef<number>(0)
    const gameLoopRef = useRef<(() => void) | null>(null)

    const [gameState, setGameState] = useState<GameState>('ready')
    const [score, setScore] = useState(0)
    const [timer, setTimer] = useState(0)
    const [highScore, setHighScore] = useState(0)
    const [isNewHighScore, setIsNewHighScore] = useState(false)
    const [isTimeoutFail, setIsTimeoutFail] = useState(false)

    // API関連状態
    const [apiMessage, setApiMessage] = useState<string>('')
    const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null)
    const [apiError, setApiError] = useState<string | null>(null)

    // 恐竜・障害物マネージャー初期化
    useEffect(() => {
        dinoRef.current = new Dinosaur(80)
        obstacleManagerRef.current = new ObstacleManager(CANVAS_WIDTH)
    }, [])

    // ゲーム開始時にバックエンドに通知（ユーザーステータスをstage1_dinoに昇格）
    useEffect(() => {
        const initGame = async () => {
            try {
                const response = await startGameApi()
                if (response.error) {
                    console.warn('Game start warning:', response.message)
                } else {
                    console.log('Game initialized:', response.message)
                    setStatus('stage1_dino')
                }
            } catch (error) {
                console.error('Failed to initialize game:', error)
            }
        }
        initGame()
    }, [setStatus])

    // API結果送信
    const submitResult = useCallback(async (cleared: boolean) => {
        setGameState('submitting')
        setApiError(null)

        // クリア時はフロントエンドで即座に成功扱い（APIレスポンスに依存しない）
        if (cleared) {
            setGameState('success')
            setApiMessage('ゲームクリア！次のステージへ進みます。')
            setStatus('registering')
            setTimeout(() => {
                navigate('/register')
            }, 2000)

            // APIには結果を送信（バックグラウンド、エラーは無視）
            submitGameResult({
                result: 'clear',
                score: scoreRef.current,
            }).catch(() => {})
            return
        }

        // ゲームオーバー時は従来通りAPI結果に従う
        try {
            const response: GameResultResponse = await submitGameResult({
                result: 'gameover',
                score: scoreRef.current,
            })

            setApiMessage(response.message)

            // 失敗: セッションをリセットしてリダイレクトカウントダウン開始
            resetSession()
            setGameState('gameover')
            if ('redirect_delay' in response) {
                setRedirectCountdown(response.redirect_delay)
            } else {
                setRedirectCountdown(3)
            }
        } catch (error) {
            setApiError(error instanceof Error ? error.message : 'API送信に失敗しました')
            setGameState('gameover')
        }
    }, [navigate, setStatus, resetSession])

    // リダイレクトカウントダウン
    useEffect(() => {
        if (redirectCountdown === null || redirectCountdown <= 0) return

        const timer = setTimeout(() => {
            setRedirectCountdown(prev => (prev !== null ? prev - 1 : null))
        }, 1000)

        return () => clearTimeout(timer)
    }, [redirectCountdown])

    // カウントダウン終了時に待機列ページへリダイレクト
    useEffect(() => {
        if (redirectCountdown === 0) {
            // setTimeoutで非同期にしてlintエラーを回避
            const timer = setTimeout(() => {
                navigate('/queue')
            }, 0)
            return () => clearTimeout(timer)
        }
    }, [redirectCountdown, navigate])

    // ゲーム成功処理
    const handleSuccess = useCallback(() => {
        cancelAnimationFrame(animationFrameRef.current)

        const currentScore = scoreRef.current
        if (currentScore > highScore) {
            setHighScore(currentScore)
            setIsNewHighScore(true)
        } else {
            setIsNewHighScore(false)
        }

        // API送信
        submitResult(true)
    }, [highScore, submitResult])

    // ゲームオーバー処理
    const handleGameOver = useCallback((timeout: boolean = false) => {
        cancelAnimationFrame(animationFrameRef.current)
        setIsTimeoutFail(timeout)

        const currentScore = scoreRef.current
        if (currentScore > highScore) {
            setHighScore(currentScore)
            setIsNewHighScore(true)
        } else {
            setIsNewHighScore(false)
        }

        // API送信
        submitResult(false)
    }, [highScore, submitResult])

    // ゲームループ
    const gameLoop = useCallback(() => {
        const canvas = canvasRef.current
        const dino = dinoRef.current
        const obstacleManager = obstacleManagerRef.current
        if (!canvas || !dino || !obstacleManager) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 背景クリア（白背景）
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        // 地面を描画（砂漠色）
        ctx.fillStyle = '#f5f0e6'
        ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y)

        // 地面のライン
        ctx.strokeStyle = '#535353'
        ctx.lineWidth = 1
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
        animationFrameRef.current = requestAnimationFrame(() => gameLoopRef.current?.())
    }, [handleGameOver, handleSuccess])

    // gameLoopRefを最新に保つ
    useEffect(() => {
        gameLoopRef.current = gameLoop
    }, [gameLoop])

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
        setApiMessage('')
        setApiError(null)
        setRedirectCountdown(null)
        animationFrameRef.current = requestAnimationFrame(gameLoop)
    }, [gameLoop])


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

        // 背景（白）
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

        // 地面（砂漠色）
        ctx.fillStyle = '#f5f0e6'
        ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y)

        // 地面のライン
        ctx.strokeStyle = '#535353'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, GROUND_Y)
        ctx.lineTo(CANVAS_WIDTH, GROUND_Y)
        ctx.stroke()

        // 恐竜を描画
        dino.draw(ctx)

        // スタート画面テキスト
        if (gameState === 'ready') {
            ctx.fillStyle = '#535353'
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
                } else if (gameState === 'gameover' && redirectCountdown === null) {
                    // ゲームオーバー時は待機列へ戻る
                    navigate('/queue')
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameState, startGame, handleJump, redirectCountdown, navigate])

    return (
        <div
            data-testid="dino-page"
            className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4"
        >
            {/* ヘッダー */}
            <h1 className="text-2xl font-light text-stone-700 mb-4 flex items-center gap-3 tracking-wide">
                <img src="/dino-icon.png" alt="Dino" className="w-16 h-16 object-contain" />
                <span>Dino Run</span>
            </h1>

            {/* スコア・タイマー表示エリア */}
            <ScoreDisplay
                score={score}
                time={timer}
                highScore={highScore}
                targetScore={TARGET_SCORE}
                showTargetScore={gameState === 'playing'}
                isGameOver={gameState === 'gameover' || gameState === 'success' || gameState === 'submitting'}
            />

            {/* ゲームエリア（Canvas） */}
            <div className="relative bg-white rounded-sm border border-stone-200 overflow-hidden">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="block"
                    data-testid="game-canvas"
                />

                {/* スタート画面オーバーレイ */}
                {gameState === 'ready' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90">
                        <p className="text-stone-600 text-lg mb-2 tracking-wide">
                            障害物を避けて生き残れ
                        </p>
                        <p className="text-stone-400 text-sm mb-6">
                            制限時間: 3分 / 目標スコア: {TARGET_SCORE}
                        </p>
                        <button
                            onClick={startGame}
                            className="px-10 py-4 bg-stone-800 hover:bg-stone-700 text-white text-sm tracking-wide rounded-sm transition-colors"
                        >
                            ゲームスタート
                        </button>
                        <p className="text-stone-400 text-xs mt-6">
                            または スペースキー でスタート
                        </p>
                    </div>
                )}

                {/* 送信中オーバーレイ */}
                {gameState === 'submitting' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90">
                        <div className="w-10 h-10 border border-stone-300 border-t-stone-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-stone-600 text-sm tracking-wide">
                            結果を送信中...
                        </p>
                    </div>
                )}

                {/* ゲームオーバー画面オーバーレイ */}
                {gameState === 'gameover' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90">
                        <p className="text-stone-700 text-2xl font-light mb-3 tracking-wide">
                            {isTimeoutFail ? 'TIME OUT' : 'GAME OVER'}
                        </p>
                        <p className="text-stone-600 text-lg mb-2">
                            スコア: {score}
                        </p>
                        {isNewHighScore && (
                            <p className="text-stone-500 text-sm tracking-wide mb-2">
                                NEW HIGH SCORE
                            </p>
                        )}
                        {apiMessage && (
                            <p className="text-stone-400 text-sm mb-2">
                                {apiMessage}
                            </p>
                        )}
                        {apiError && (
                            <p className="text-red-500 text-sm mb-2">
                                {apiError}
                            </p>
                        )}
                        {redirectCountdown !== null && redirectCountdown > 0 && (
                            <p className="text-stone-400 text-sm mb-4">
                                {redirectCountdown}秒後に待機列へ戻ります...
                            </p>
                        )}
                        <button
                            onClick={() => navigate('/queue')}
                            disabled={redirectCountdown !== null && redirectCountdown > 0}
                            className={`px-8 py-3 text-sm tracking-wide rounded-sm transition-colors ${redirectCountdown !== null && redirectCountdown > 0
                                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                : 'bg-stone-800 hover:bg-stone-700 text-white'
                                }`}
                        >
                            待機列へ戻る
                        </button>
                    </div>
                )}

                {/* 成功画面オーバーレイ */}
                {gameState === 'success' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90">
                        <p className="text-emerald-600 text-2xl font-light mb-3 tracking-wide">
                            CLEAR
                        </p>
                        <p className="text-stone-600 text-lg mb-2">
                            スコア: {score}
                        </p>
                        <p className="text-stone-500 text-sm mb-2">
                            タイム: {Math.floor(timer / 60)}分{timer % 60}秒
                        </p>
                        {isNewHighScore && (
                            <p className="text-stone-500 text-sm tracking-wide mb-2">
                                NEW HIGH SCORE
                            </p>
                        )}
                        {apiMessage && (
                            <p className="text-stone-400 text-sm mb-4">
                                {apiMessage}
                            </p>
                        )}
                        <p className="text-stone-400 text-xs">
                            次のステージへ移動中...
                        </p>
                    </div>
                )}
            </div>

            {/* ゲーム説明 */}
            <div className="mt-8 text-stone-500 text-center">
                <p className="mb-3 text-xs tracking-wide">操作方法</p>
                <div className="flex gap-4 justify-center items-center">
                    <span className="px-3 py-2 border border-stone-300 text-stone-500 text-xs rounded-sm">スペース / タップ</span>
                    <span className="text-stone-400">→</span>
                    <span className="text-sm">ジャンプ</span>
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
                    className="mt-6 px-12 py-6 bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-white text-sm tracking-wide rounded-sm transition-colors md:hidden"
                >
                    タップでジャンプ
                </button>
            )}
        </div>
    )
}

export default DinoPage
