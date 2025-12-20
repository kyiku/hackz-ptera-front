/**
 * CaptchaTimer - CAPTCHA用タイマーコンポーネント
 *
 * 3分タイムアウトの表示と処理
 * 仕様:
 * - タイムアウト: 3分
 * - タイムアウト時は失敗扱い、待機列最後尾へ
 */
import { useState, useEffect, useRef } from 'react'
import {
    DEFAULT_TIMEOUT_SECONDS,
    WARNING_THRESHOLD,
    CRITICAL_THRESHOLD,
    formatTime,
} from './captchaTimerUtils'

export interface CaptchaTimerProps {
    /** タイムアウト秒数（デフォルト: 180秒） */
    duration?: number
    /** タイムアウト時のコールバック */
    onTimeout: () => void
    /** 一時停止フラグ */
    isPaused?: boolean
    /** プログレスバー表示 */
    showProgressBar?: boolean
    /** コンパクト表示 */
    compact?: boolean
}

/**
 * CaptchaTimer コンポーネント
 */
export function CaptchaTimer({
    duration = DEFAULT_TIMEOUT_SECONDS,
    onTimeout,
    isPaused = false,
    showProgressBar = true,
    compact = false,
}: CaptchaTimerProps) {
    const [remainingTime, setRemainingTime] = useState(duration)
    const [isTimedOut, setIsTimedOut] = useState(false)
    const onTimeoutRef = useRef(onTimeout)

    // コールバックの最新を保持
    useEffect(() => {
        onTimeoutRef.current = onTimeout
    }, [onTimeout])

    // カウントダウン処理
    useEffect(() => {
        if (isPaused || isTimedOut || remainingTime <= 0) return

        const timer = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setIsTimedOut(true)
                    onTimeoutRef.current()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isPaused, isTimedOut, remainingTime])

    // 状態判定
    const isWarning = remainingTime <= WARNING_THRESHOLD && remainingTime > CRITICAL_THRESHOLD
    const isCritical = remainingTime <= CRITICAL_THRESHOLD

    // プログレス計算
    const progressPercent = (remainingTime / duration) * 100

    // 色の決定
    const getColorClass = () => {
        if (isCritical) return 'text-stone-700'
        if (isWarning) return 'text-stone-600'
        return 'text-stone-500'
    }

    const getProgressColorClass = () => {
        if (isCritical) return 'bg-stone-700'
        if (isWarning) return 'bg-stone-500'
        return 'bg-stone-400'
    }

    if (compact) {
        return (
            <div
                data-testid="captcha-timer"
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-stone-50 border border-stone-200 ${isCritical ? 'animate-pulse' : ''}`}
            >
                <span className="text-stone-400 text-xs">残</span>
                <span className={`font-mono text-sm ${getColorClass()}`}>
                    {formatTime(remainingTime)}
                </span>
            </div>
        )
    }

    return (
        <div
            data-testid="captcha-timer"
            className={`bg-stone-50 border border-stone-200 rounded-sm p-4 ${isCritical ? 'animate-pulse' : ''}`}
        >
            {/* タイマー表示 */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-stone-400 text-xs tracking-wide">残り時間</span>
                    {isPaused && (
                        <span className="text-stone-500 text-xs bg-stone-100 px-2 py-0.5 rounded-sm">
                            一時停止中
                        </span>
                    )}
                </div>
                <span
                    className={`font-mono text-xl ${getColorClass()}`}
                >
                    {formatTime(remainingTime)}
                </span>
            </div>

            {/* プログレスバー */}
            {showProgressBar && (
                <div className="w-full h-1 bg-stone-100 rounded-sm overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ease-linear ${getProgressColorClass()}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            )}

            {/* 警告メッセージ */}
            {isWarning && !isCritical && (
                <p className="text-stone-500 text-xs mt-2 text-center">
                    残り時間が少なくなっています
                </p>
            )}
            {isCritical && (
                <p className="text-stone-600 text-xs mt-2 text-center">
                    まもなくタイムアウトします
                </p>
            )}

            {/* タイムアウト表示 */}
            {isTimedOut && (
                <div className="mt-2 text-center">
                    <p className="text-stone-700 text-sm tracking-wide">TIME OUT</p>
                </div>
            )}
        </div>
    )
}

export default CaptchaTimer
