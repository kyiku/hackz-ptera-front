/**
 * Issue #21: feat: AIパスワード煽り機能
 *
 * パスワード入力時にAIが煽りメッセージを表示するコンポーネント
 * - パスワード入力のデバウンス（500ms）
 * - POST /api/password/analyze API呼び出し
 * - 煽りメッセージ表示UI
 * - ローディング表示
 */

import { useState, useEffect, useRef } from 'react'

interface PasswordTauntProps {
  password: string
}

interface AnalyzeResponse {
  error: false
  message: string
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const PasswordTaunt = ({ password }: PasswordTauntProps) => {
  const [message, setMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const debounceTimerRef = useRef<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // パスワードが空の時は表示しない
    if (!password || password.trim() === '') {
      setIsVisible(false)
      setMessage('')
      setIsLoading(false)
      
      // 進行中のリクエストをキャンセル
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      
      // デバウンスタイマーをクリア
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      return
    }

    // デバウンス: 500ms待機
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(async () => {
      // 進行中のリクエストをキャンセル
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // 新しいAbortControllerを作成
      abortControllerRef.current = new AbortController()
      setIsLoading(true)
      setIsVisible(false)

      try {
        const response = await fetch(`${API_URL}/api/password/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = (await response.json()) as AnalyzeResponse

        if (data.error === false && data.message) {
          setMessage(data.message)
          setIsVisible(true)
        } else {
          // エラー時はデフォルトの煽りを表示
          setMessage('そのパスワード、大丈夫ですか？')
          setIsVisible(true)
        }
      } catch (error) {
        // エラー時はデフォルトの煽りを表示
        if (error instanceof Error && error.name !== 'AbortError') {
          setMessage('そのパスワード、大丈夫ですか？')
          setIsVisible(true)
        }
      } finally {
        setIsLoading(false)
      }
    }, 500)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [password])

  // パスワードが空の時は何も表示しない
  if (!password || password.trim() === '') {
    return null
  }

  return (
    <div
      data-testid="password-taunt"
      className={`mt-4 p-4 rounded-lg border-2 transition-all duration-300 ${
        isVisible
          ? 'opacity-100 translate-y-0 border-red-500 bg-red-900/20'
          : 'opacity-0 translate-y-2'
      }`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2 text-yellow-400">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
          <span>AIがパスワードを分析中...</span>
        </div>
      ) : (
        <p className="text-red-400 font-semibold animate-pulse">{message}</p>
      )}
    </div>
  )
}

