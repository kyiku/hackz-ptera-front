/**
 * useAutoRedirect - 自動リダイレクトカスタムhook
 * Issue #28: 自動リダイレクト機能
 * 
 * 機能:
 * - 指定時間後に自動リダイレクト
 * - カウントダウン表示
 * - リダイレクトキャンセル
 * - リダイレクト前のコールバック
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export interface UseAutoRedirectOptions {
    /** リダイレクト先のパス */
    to: string
    /** 遅延時間（ミリ秒） */
    delay: number
    /** リダイレクト前のコールバック（falseを返すとキャンセル） */
    onBeforeRedirect?: () => boolean | void
    /** 自動開始するか */
    autoStart?: boolean
}

export interface UseAutoRedirectReturn {
    /** 残り秒数 */
    remainingSeconds: number
    /** リダイレクトをキャンセル */
    cancel: () => void
    /** リダイレクトを開始 */
    start: () => void
    /** リダイレクト中かどうか */
    isRedirecting: boolean
}

export const useAutoRedirect = ({
    to,
    delay,
    onBeforeRedirect,
    autoStart = true,
}: UseAutoRedirectOptions): UseAutoRedirectReturn => {
    const navigate = useNavigate()
    const [remainingSeconds, setRemainingSeconds] = useState(
        Math.ceil(delay / 1000)
    )
    const [isRedirecting, setIsRedirecting] = useState(autoStart)
    const timerRef = useRef<number | undefined>(undefined)
    const countdownRef = useRef<number | undefined>(undefined)

    const cancel = useCallback(() => {
        setIsRedirecting(false)
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = undefined
        }
        if (countdownRef.current) {
            clearInterval(countdownRef.current)
            countdownRef.current = undefined
        }
    }, [])

    const start = useCallback(() => {
        setIsRedirecting(true)
        setRemainingSeconds(Math.ceil(delay / 1000))
    }, [delay])

    useEffect(() => {
        if (!isRedirecting) return

        // カウントダウン
        countdownRef.current = window.setInterval(() => {
            setRemainingSeconds((prev) => {
                const next = prev - 1
                if (next <= 0) {
                    if (countdownRef.current) {
                        clearInterval(countdownRef.current)
                    }
                }
                return Math.max(0, next)
            })
        }, 1000)

        // リダイレクト
        timerRef.current = window.setTimeout(() => {
            // コールバックがfalseを返したらキャンセル
            if (onBeforeRedirect) {
                const result = onBeforeRedirect()
                if (result === false) {
                    cancel()
                    return
                }
            }
            navigate(to)
        }, delay)

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
            if (countdownRef.current) {
                clearInterval(countdownRef.current)
            }
        }
    }, [isRedirecting, to, delay, navigate, onBeforeRedirect, cancel])

    return {
        remainingSeconds,
        cancel,
        start,
        isRedirecting,
    }
}

export default useAutoRedirect
