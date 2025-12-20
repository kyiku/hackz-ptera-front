/**
 * Issue #25: feat: 登録フォーム - トークン有効期限管理
 *
 * トークン有効期限を監視するカスタムフック
 * - トークン有効期限のカウントダウン表示
 * - 期限切れ警告
 * - 自動リダイレクト
 */

import { useState, useEffect, useRef } from 'react'

export interface UseTokenExpiryOptions {
  token: string | null
  expiresAt: Date | null
  onExpired?: () => void
  onWarning?: (remainingSeconds: number) => void
}

export interface UseTokenExpiryReturn {
  isExpired: boolean
  remainingSeconds: number
  remainingMinutes: number
  isWarning: boolean // 残り1分以下
  isDanger: boolean // 残り30秒以下
}

/**
 * トークン有効期限を監視するフック
 */
export function useTokenExpiry({
  token,
  expiresAt,
  onExpired,
  onWarning,
}: UseTokenExpiryOptions): UseTokenExpiryReturn {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0)
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const intervalRef = useRef<number | null>(null)
  const warningFiredRef = useRef<boolean>(false)

  useEffect(() => {
    if (!token || !expiresAt) {
      setIsExpired(true)
      setRemainingSeconds(0)
      return
    }

    const updateRemaining = () => {
      const now = new Date()
      const diff = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)

      if (diff <= 0) {
        setIsExpired(true)
        setRemainingSeconds(0)
        if (onExpired) {
          onExpired()
        }
        return
      }

      setRemainingSeconds(diff)
      setIsExpired(false)

      // 警告: 残り1分以下
      if (diff <= 60 && !warningFiredRef.current) {
        warningFiredRef.current = true
        if (onWarning) {
          onWarning(diff)
        }
      }
    }

    // 初回計算
    updateRemaining()

    // 1秒ごとに更新
    intervalRef.current = window.setInterval(updateRemaining, 1000)

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      warningFiredRef.current = false
    }
  }, [token, expiresAt, onExpired, onWarning])

  const remainingMinutes = Math.floor(remainingSeconds / 60)
  const isWarning = remainingSeconds > 0 && remainingSeconds <= 60
  const isDanger = remainingSeconds > 0 && remainingSeconds <= 30

  return {
    isExpired,
    remainingSeconds,
    remainingMinutes,
    isWarning,
    isDanger,
  }
}

