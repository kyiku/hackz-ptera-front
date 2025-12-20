/**
 * CaptchaPage - CAPTCHA認証ページ
 *
 * 座標クリック型CAPTCHAのUI
 * - API連携（画像取得・検証）
 * - クリック座標取得
 * - 残り試行回数表示
 * - 3分タイムアウト
 */
import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CaptchaImage } from '../components/captcha/CaptchaImage'
import type { ClickPosition } from '../components/captcha/CaptchaImage'
import { CaptchaTimer } from '../components/captcha/CaptchaTimer'
import { DEFAULT_TIMEOUT_SECONDS } from '../components/captcha/captchaTimerUtils'
import {
    getCaptchaImageMock,
    verifyCaptchaMock,
    isVerifySuccess,
    isVerifyFinalFailure,
} from '../api/captchaApi'
import type { CaptchaVerifyResponse } from '../api/captchaApi'

// CAPTCHA設定
const MAX_ATTEMPTS = 3

type CaptchaState = 'loading' | 'idle' | 'verifying' | 'success' | 'error' | 'timeout'

export function CaptchaPage() {
    const navigate = useNavigate()

    const [imageUrl, setImageUrl] = useState<string>('')
    const [selectedPosition, setSelectedPosition] = useState<ClickPosition | null>(null)
    const [remainingAttempts, setRemainingAttempts] = useState(MAX_ATTEMPTS)
    const [captchaState, setCaptchaState] = useState<CaptchaState>('loading')
    const [message, setMessage] = useState<string>('')
    const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null)
    const [timerKey, setTimerKey] = useState(0)  // タイマーリセット用

    // CAPTCHA画像を取得
    const loadCaptchaImage = useCallback(async () => {
        setCaptchaState('loading')
        setMessage('')
        setSelectedPosition(null)

        try {
            const response = await getCaptchaImageMock()
            setImageUrl(response.image_url)
            setMessage('画像内の特定のポイントをクリックしてください。')
            setCaptchaState('idle')
        } catch {
            setCaptchaState('error')
            setMessage('画像の取得に失敗しました。ページを更新してください。')
        }
    }, [])

    // 初回ロード
    useEffect(() => {
        const timer = setTimeout(() => {
            loadCaptchaImage()
        }, 0)
        return () => clearTimeout(timer)
    }, [loadCaptchaImage])

    // 画像クリック時のハンドラ
    const handleImageSelect = useCallback((positions: ClickPosition[]) => {
        // 最新の1つだけを使用
        if (positions.length > 0) {
            setSelectedPosition(positions[positions.length - 1])
        } else {
            setSelectedPosition(null)
        }
    }, [])

    // CAPTCHA検証
    const verifyCaptcha = useCallback(async () => {
        if (!selectedPosition) {
            setMessage('画像をクリックして位置を選択してください')
            return
        }

        setCaptchaState('verifying')
        setMessage('')

        try {
            const response: CaptchaVerifyResponse = await verifyCaptchaMock({
                x: selectedPosition.x,
                y: selectedPosition.y,
            })

            if (isVerifySuccess(response)) {
                // 成功: 次のステージへ遷移
                setCaptchaState('success')
                setMessage(response.message)

                setTimeout(() => {
                    navigate(`/${response.next_stage}`)
                }, 2000)
            } else if (isVerifyFinalFailure(response)) {
                // 最終失敗: リダイレクトカウントダウン
                setCaptchaState('error')
                setMessage(response.message)
                setRemainingAttempts(0)
                setRedirectCountdown(response.redirect_delay)
            } else {
                // リトライ可能な失敗
                setRemainingAttempts(response.attempts_remaining)
                setMessage(response.message)
                setImageUrl(response.new_image_url)
                setSelectedPosition(null)
                setCaptchaState('idle')
            }
        } catch {
            setCaptchaState('error')
            setMessage('検証に失敗しました。もう一度お試しください。')
        }
    }, [selectedPosition, navigate])

    // リダイレクトカウントダウン
    useEffect(() => {
        if (redirectCountdown === null || redirectCountdown <= 0) return

        const timer = setTimeout(() => {
            setRedirectCountdown(prev => (prev !== null ? prev - 1 : null))
        }, 1000)

        return () => clearTimeout(timer)
    }, [redirectCountdown])

    // カウントダウン終了時
    useEffect(() => {
        if (redirectCountdown === 0) {
            const timer = setTimeout(() => {
                setRedirectCountdown(null)
            }, 0)
            return () => clearTimeout(timer)
        }
    }, [redirectCountdown])

    // タイムアウト処理
    const handleTimeout = useCallback(() => {
        setCaptchaState('timeout')
        setMessage('時間切れです。待機列の最後尾に移動します。')
        // 3秒後に待機列ページへリダイレクト
        setTimeout(() => {
            navigate('/queue')
        }, 3000)
    }, [navigate])

    // ページリセット
    const resetCaptcha = useCallback(() => {
        setRemainingAttempts(MAX_ATTEMPTS)
        setRedirectCountdown(null)
        setTimerKey(prev => prev + 1)  // タイマーリセット
        loadCaptchaImage()
    }, [loadCaptchaImage])

    return (
        <div
            data-testid="captcha-page"
            className="min-h-screen bg-stone-50 flex items-center justify-center p-4"
        >
            <div className="bg-white border border-stone-200 rounded-sm p-8 sm:p-10 w-full max-w-4xl">
                {/* タイマー */}
                <div className="mb-8">
                    <CaptchaTimer
                        key={timerKey}
                        duration={DEFAULT_TIMEOUT_SECONDS}
                        onTimeout={handleTimeout}
                        isPaused={captchaState === 'verifying' || captchaState === 'success' || captchaState === 'timeout'}
                        showProgressBar={true}
                    />
                </div>

                {/* ヘッダー */}
                <div className="text-center mb-8">
                    <h1 className="text-xl text-stone-700 tracking-wide mb-2">
                        ロボットではないことを確認
                    </h1>
                    <p className="text-stone-400 text-sm">
                        画像内の指定されたポイントをクリックしてください
                    </p>
                </div>

                {/* 残り試行回数 */}
                <div className="flex justify-between items-center mb-6">
                    <span className="text-stone-400 text-xs tracking-wide">残り試行回数</span>
                    <div className="flex gap-1">
                        {Array.from({ length: MAX_ATTEMPTS }, (_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${i < remainingAttempts ? 'bg-stone-600' : 'bg-stone-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* 説明文 */}
                {message && captchaState !== 'error' && captchaState !== 'success' && (
                    <div className="bg-stone-50 border border-stone-200 rounded-sm p-4 mb-6">
                        <p className="text-stone-600 text-sm text-center">
                            {message}
                        </p>
                    </div>
                )}

                {/* CAPTCHA画像エリア */}
                <div className="mb-6">
                    <CaptchaImage
                        imageUrl={imageUrl}
                        onSelect={handleImageSelect}
                        maxSelections={1}
                        disabled={captchaState === 'verifying' || captchaState === 'success' || captchaState === 'error'}
                    />
                </div>

                {/* 選択座標表示 */}
                {selectedPosition && captchaState === 'idle' && (
                    <div className="bg-stone-50 rounded-sm p-3 mb-4 text-center">
                        <p className="text-stone-500 text-xs">
                            選択座標: ({selectedPosition.x}, {selectedPosition.y})
                        </p>
                    </div>
                )}

                {/* エラーメッセージ */}
                {captchaState === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-sm p-3 mb-4">
                        <p className="text-red-500 text-sm text-center">{message}</p>
                    </div>
                )}

                {/* 成功メッセージ */}
                {captchaState === 'success' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-3 mb-4">
                        <p className="text-emerald-600 text-sm text-center">
                            {message} 登録ページへ移動します...
                        </p>
                    </div>
                )}

                {/* カウントダウン表示 */}
                {redirectCountdown !== null && redirectCountdown > 0 && (
                    <div className="text-stone-500 text-sm text-center mb-4">
                        {redirectCountdown}秒後にリトライ可能...
                    </div>
                )}

                {/* 送信ボタン */}
                {captchaState !== 'success' && remainingAttempts > 0 && (
                    <button
                        onClick={verifyCaptcha}
                        disabled={captchaState === 'verifying' || captchaState === 'loading' || !selectedPosition}
                        className={`w-full py-4 rounded-sm text-sm tracking-wide transition-colors ${captchaState === 'verifying' || captchaState === 'loading' || !selectedPosition
                                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                : 'bg-stone-800 hover:bg-stone-700 text-white'
                            }`}
                    >
                        {captchaState === 'verifying' ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                                検証中...
                            </span>
                        ) : captchaState === 'loading' ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                                読み込み中...
                            </span>
                        ) : (
                            '確認'
                        )}
                    </button>
                )}

                {/* リセットボタン（試行回数切れ時） */}
                {remainingAttempts <= 0 && redirectCountdown === null && (
                    <button
                        onClick={resetCaptcha}
                        className="w-full py-4 bg-stone-800 hover:bg-stone-700 text-white text-sm tracking-wide rounded-sm transition-colors"
                    >
                        やり直す
                    </button>
                )}

                {/* ヘルプテキスト */}
                <p className="text-stone-400 text-xs text-center mt-6">
                    画像が見えにくい場合は更新してください
                </p>
            </div>
        </div>
    )
}

export default CaptchaPage
