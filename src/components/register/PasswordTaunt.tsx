/**
 * PasswordTaunt - AIパスワード煽りコンポーネント
 * Issue #21: AIパスワード煽り機能
 *
 * パスワード入力時にAIが煽りメッセージを表示
 * - パスワード入力のデバウンス（500ms）
 * - POST /api/password/analyze API呼び出し
 * - 煽りメッセージ表示UI
 * - ローディング表示
 */
import { useState, useEffect, useRef } from 'react'
import { analyzePasswordMock } from '../../api/passwordApi'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface PasswordTauntProps {
    /** パスワード（入力値） */
    password: string
    /** デバウンス時間（ミリ秒） */
    debounceMs?: number
    /** カスタムクラス名 */
    className?: string
}

/**
 * デフォルトの煽りメッセージ（APIエラー時などに使用）
 */
const DEFAULT_TAUNT_MESSAGES = [
    'そのパスワード、大丈夫ですか？',
    'もっと強力なパスワードにしましょう。',
    'パスワード強度が低いようです。',
]

export const PasswordTaunt = ({
    password,
    debounceMs = 500,
    className = '',
}: PasswordTauntProps) => {
    const [message, setMessage] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const debounceTimerRef = useRef<number | undefined>(undefined)

    useEffect(() => {
        // パスワードが空の場合は表示しない
        if (!password || password.length === 0) {
            setMessage('')
            setIsLoading(false)
            return
        }

        // 既存のタイマーをクリア
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        // デバウンスタイマーを設定
        setIsLoading(true)
        debounceTimerRef.current = window.setTimeout(async () => {
            try {
                const response = await analyzePasswordMock({ password })
                setMessage(response.message)
            } catch {
                // エラー時はデフォルトメッセージを表示
                const randomMessage =
                    DEFAULT_TAUNT_MESSAGES[
                        Math.floor(Math.random() * DEFAULT_TAUNT_MESSAGES.length)
                    ]
                setMessage(randomMessage)
            } finally {
                setIsLoading(false)
            }
        }, debounceMs)

        // クリーンアップ
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [password, debounceMs])

    // パスワードが空の場合は何も表示しない
    if (!password || password.length === 0) {
        return null
    }

    return (
        <div
            data-testid="password-taunt"
            className={`mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <LoadingSpinner size="small" color="red" />
                    <span className="text-sm text-red-700 dark:text-red-300">
                        AIがパスワードを解析中...
                    </span>
                </div>
            ) : (
                <div className="flex items-start gap-2">
                    <span className="text-xl" aria-hidden="true">
                        😈
                    </span>
                    <p
                        className="text-sm text-red-700 dark:text-red-300 font-medium animate-fade-in"
                        data-testid="taunt-message"
                    >
                        {message}
                    </p>
                </div>
            )}
        </div>
    )
}

export default PasswordTaunt

