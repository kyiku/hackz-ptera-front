/**
 * useTokenExpiry - トークン有効期限管理hook
 * Issue #25: 登録フォーム - トークン有効期限管理
 * 
 * 機能:
 * - トークン有効期限の監視（10分）
 * - カウントダウン表示
 * - 期限切れ警告表示（残り1分、残り30秒）
 * - 期限切れ時の自動リダイレクト（待機列最後尾へ）
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../store/sessionStore'

export interface UseTokenExpiryOptions {
    /** 期限切れ時のコールバック */
    onExpired?: () => void
    /** 警告時のコールバック（残り1分） */
    onWarning?: () => void
    /** 危険時のコールバック（残り30秒） */
    onDanger?: () => void
    /** チェック間隔（ミリ秒、デフォルト: 1000ms = 1秒） */
    checkInterval?: number
}

export interface UseTokenExpiryReturn {
    /** 残り時間（秒） */
    remainingSeconds: number
    /** 残り時間（分） */
    remainingMinutes: number
    /** 期限切れかどうか */
    isExpired: boolean
    /** 警告状態かどうか（残り1分以下） */
    isWarning: boolean
    /** 危険状態かどうか（残り30秒以下） */
    isDanger: boolean
    /** フォーマットされた残り時間文字列（例: "09:45"） */
    formattedTime: string
}

/**
 * 警告閾値: 残り1分（60秒）
 */
const WARNING_THRESHOLD_SECONDS = 60

/**
 * 危険閾値: 残り30秒
 */
const DANGER_THRESHOLD_SECONDS = 30

/**
 * 時間をフォーマット（例: "09:45"）
 */
function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * トークン有効期限を監視するカスタムフック
 */
export const useTokenExpiry = ({
    onExpired,
    onWarning,
    onDanger,
    checkInterval = 1000,
}: UseTokenExpiryOptions = {}): UseTokenExpiryReturn => {
    const navigate = useNavigate()
    const { tokenExpiresAt, reset } = useSessionStore()

    // 残り時間を計算
    const calculateRemaining = useCallback((): number => {
        if (!tokenExpiresAt) {
            return 0
        }

        const now = new Date()
        const expiresAt = new Date(tokenExpiresAt)
        const diff = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)

        return Math.max(0, diff)
    }, [tokenExpiresAt])

    // 初期値を計算（useMemoで計算済み）
    const [remainingSeconds, setRemainingSeconds] = useState(() => calculateRemaining())
    const [isExpired, setIsExpired] = useState(() => calculateRemaining() <= 0)

    const warningFiredRef = useRef(false)
    const dangerFiredRef = useRef(false)
    const expiredFiredRef = useRef(false)
    const intervalRef = useRef<number | undefined>(undefined)
    const onExpiredRef = useRef(onExpired)
    const onWarningRef = useRef(onWarning)
    const onDangerRef = useRef(onDanger)
    const resetRef = useRef(reset)
    const navigateRef = useRef(navigate)

    // コールバックの最新値を保持
    useEffect(() => {
        onExpiredRef.current = onExpired
        onWarningRef.current = onWarning
        onDangerRef.current = onDanger
        resetRef.current = reset
        navigateRef.current = navigate
    }, [onExpired, onWarning, onDanger, reset, navigate])

    // タイマーを開始/更新
    useEffect(() => {
        if (!tokenExpiresAt) {
            // トークンがない場合は期限切れ
            // Note: tokenExpiresAtが変更されたときに状態を更新する必要があるため、useEffect内でsetStateを呼ぶ
            // これは外部状態（Zustand store）の変更に反応して内部状態を更新する必要があるため、許容される
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setRemainingSeconds(0)
            setIsExpired(true)
            return
        }

        // 初回計算を即座に実行（タイマーの初期化に必要）
        const initialRemaining = calculateRemaining()
         
        setRemainingSeconds(initialRemaining)
        if (initialRemaining <= 0) {
             
            setIsExpired(true)
            if (!expiredFiredRef.current) {
                expiredFiredRef.current = true
                resetRef.current()
                if (onExpiredRef.current) {
                    onExpiredRef.current()
                }
                navigateRef.current('/', { replace: true })
            }
        } else {
             
            setIsExpired(false)
        }

        // 定期チェック
        intervalRef.current = window.setInterval(() => {
            const remaining = calculateRemaining()
            setRemainingSeconds(remaining)

            if (remaining <= 0) {
                setIsExpired(true)

                // 期限切れコールバック（1回のみ）
                if (!expiredFiredRef.current) {
                    expiredFiredRef.current = true

                    // セッションリセット（待機列最後尾へ）
                    resetRef.current()

                    // コールバック呼び出し
                    if (onExpiredRef.current) {
                        onExpiredRef.current()
                    }

                    // トップページへリダイレクト
                    navigateRef.current('/', { replace: true })
                }
                return
            }

            setIsExpired(false)

            // 危険状態チェック（残り30秒以下）
            if (remaining <= DANGER_THRESHOLD_SECONDS && !dangerFiredRef.current) {
                dangerFiredRef.current = true
                if (onDangerRef.current) {
                    onDangerRef.current()
                }
            }

            // 警告状態チェック（残り1分以下）
            if (remaining <= WARNING_THRESHOLD_SECONDS && !warningFiredRef.current) {
                warningFiredRef.current = true
                if (onWarningRef.current) {
                    onWarningRef.current()
                }
            }
        }, checkInterval)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [tokenExpiresAt, checkInterval, calculateRemaining])

    // トークンが変更されたらフラグをリセット
    useEffect(() => {
        warningFiredRef.current = false
        dangerFiredRef.current = false
        expiredFiredRef.current = false
    }, [tokenExpiresAt])

    const remainingMinutes = Math.floor(remainingSeconds / 60)
    const isWarning = remainingSeconds <= WARNING_THRESHOLD_SECONDS && !isExpired
    const isDanger = remainingSeconds <= DANGER_THRESHOLD_SECONDS && !isExpired
    const formattedTime = formatTime(remainingSeconds)

    return {
        remainingSeconds,
        remainingMinutes,
        isExpired,
        isWarning,
        isDanger,
        formattedTime,
    }
}

export default useTokenExpiry
