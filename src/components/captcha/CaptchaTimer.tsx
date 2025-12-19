/**
 * CaptchaTimer - CAPTCHA用タイマーコンポーネント
 * 
 * 3分タイムアウトの表示と処理
 * 仕様:
 * - タイムアウト: 3分
 * - タイムアウト時は失敗扱い、待機列最後尾へ
 */
import { useState, useEffect, useCallback, useRef } from 'react'

// デフォルトタイムアウト（3分 = 180秒）
export const DEFAULT_TIMEOUT_SECONDS = 180

// 警告閾値
const WARNING_THRESHOLD = 30  // 30秒で警告色
const CRITICAL_THRESHOLD = 10  // 10秒で点滅

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
 * 秒数をMM:SS形式にフォーマット
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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
        if (isCritical) return 'text-red-500'
        if (isWarning) return 'text-yellow-500'
        return 'text-green-500'
    }

    const getProgressColorClass = () => {
        if (isCritical) return 'bg-red-500'
        if (isWarning) return 'bg-yellow-500'
        return 'bg-green-500'
    }

    if (compact) {
        return (
            <div
                data-testid="captcha-timer"
                className={`
          inline-flex items-center gap-2 px-3 py-1 rounded-full
          bg-gray-800 border border-gray-700
          ${isCritical ? 'animate-pulse' : ''}
        `}
            >
                <span className="text-gray-400 text-xs">⏱</span>
                <span className={`font-mono font-bold ${getColorClass()}`}>
                    {formatTime(remainingTime)}
                </span>
            </div>
        )
    }

    return (
        <div
            data-testid="captcha-timer"
            className={`
        bg-gray-800/80 border border-gray-700 rounded-lg p-4
        ${isCritical ? 'animate-pulse border-red-500/50' : ''}
      `}
        >
            {/* タイマー表示 */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">⏱ 残り時間</span>
                    {isPaused && (
                        <span className="text-yellow-500 text-xs bg-yellow-500/20 px-2 py-0.5 rounded">
                            一時停止中
                        </span>
                    )}
                </div>
                <span
                    className={`font-mono text-2xl font-bold ${getColorClass()} ${isCritical ? 'animate-pulse' : ''}`}
                >
                    {formatTime(remainingTime)}
                </span>
            </div>

            {/* プログレスバー */}
            {showProgressBar && (
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ease-linear ${getProgressColorClass()}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            )}

            {/* 警告メッセージ */}
            {isWarning && !isCritical && (
                <p className="text-yellow-500 text-xs mt-2 text-center">
                    ⚠ 残り時間が少なくなっています
                </p>
            )}
            {isCritical && (
                <p className="text-red-500 text-xs mt-2 text-center animate-pulse">
                    ⚠ まもなくタイムアウトします！
                </p>
            )}

            {/* タイムアウト表示 */}
            {isTimedOut && (
                <div className="mt-2 text-center">
                    <p className="text-red-500 font-bold">⏰ 時間切れ</p>
                </div>
            )}
        </div>
    )
}

/**
 * useCaptchaTimer - タイマーロジックのカスタムフック
 */
export function useCaptchaTimer(duration: number = DEFAULT_TIMEOUT_SECONDS) {
    const [remainingTime, setRemainingTime] = useState(duration)
    const [isPaused, setIsPaused] = useState(false)
    const [isTimedOut, setIsTimedOut] = useState(false)

    // カウントダウン
    useEffect(() => {
        if (isPaused || isTimedOut || remainingTime <= 0) return

        const timer = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setIsTimedOut(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isPaused, isTimedOut, remainingTime])

    // 一時停止
    const pause = useCallback(() => {
        setIsPaused(true)
    }, [])

    // 再開
    const resume = useCallback(() => {
        setIsPaused(false)
    }, [])

    // リセット
    const reset = useCallback(() => {
        setRemainingTime(duration)
        setIsTimedOut(false)
        setIsPaused(false)
    }, [duration])

    return {
        remainingTime,
        formattedTime: formatTime(remainingTime),
        isPaused,
        isTimedOut,
        isWarning: remainingTime <= WARNING_THRESHOLD && remainingTime > CRITICAL_THRESHOLD,
        isCritical: remainingTime <= CRITICAL_THRESHOLD,
        progressPercent: (remainingTime / duration) * 100,
        pause,
        resume,
        reset,
    }
}
