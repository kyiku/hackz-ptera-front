/**
 * captchaTimerUtils - CAPTCHAタイマー関連のユーティリティ
 */
import { useState, useEffect, useCallback } from 'react'

// デフォルトタイムアウト（3分 = 180秒）
export const DEFAULT_TIMEOUT_SECONDS = 180

// 警告閾値
export const WARNING_THRESHOLD = 30  // 30秒で警告色
export const CRITICAL_THRESHOLD = 10  // 10秒で点滅

/**
 * 秒数をMM:SS形式にフォーマット
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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
