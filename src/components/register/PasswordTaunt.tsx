/**
 * PasswordTaunt - AIパスワード煽りコンポーネント
 * Issue #21: AIパスワード煽り機能
 *
 * パスワード入力時にAIが煽りメッセージを表示＆読み上げ
 * - パスワード入力のデバウンス（1000ms）
 * - POST /api/password/analyze API呼び出し（Bedrock）
 * - 煽りメッセージ表示UI
 * - Web Speech APIで読み上げ
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { analyzePassword } from '../../api/passwordApi'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface PasswordTauntProps {
    /** パスワード（入力値） */
    password: string
    /** デバウンス時間（ミリ秒） */
    debounceMs?: number
    /** カスタムクラス名 */
    className?: string
    /** 読み上げを有効にするか */
    enableSpeech?: boolean
}

/**
 * デフォルトの煽りメッセージ（APIエラー時などに使用）
 */
const DEFAULT_TAUNT_MESSAGES = [
    'そのパスワード、大丈夫ですか？',
    'もっと強力なパスワードにしましょう。',
    'パスワード強度が低いようです。',
]

/**
 * Web Speech APIで読み上げ
 */
const speak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return
    }

    // 前の読み上げをキャンセル
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ja-JP'
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // 日本語の音声を探す
    const voices = speechSynthesis.getVoices()
    const japaneseVoice = voices.find(voice => voice.lang.startsWith('ja'))
    if (japaneseVoice) {
        utterance.voice = japaneseVoice
    }

    speechSynthesis.speak(utterance)
}

export const PasswordTaunt = ({
    password,
    debounceMs = 1000,
    className = '',
    enableSpeech = true,
}: PasswordTauntProps) => {
    const [message, setMessage] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const debounceTimerRef = useRef<number | undefined>(undefined)
    const lastSpokenRef = useRef<string>('')

    // 読み上げ実行
    const speakMessage = useCallback((text: string) => {
        if (!enableSpeech || !text || text === lastSpokenRef.current) {
            return
        }

        lastSpokenRef.current = text
        setIsSpeaking(true)
        speak(text)

        // 読み上げ終了を検出
        if ('speechSynthesis' in window) {
            const checkSpeaking = setInterval(() => {
                if (!speechSynthesis.speaking) {
                    setIsSpeaking(false)
                    clearInterval(checkSpeaking)
                }
            }, 100)
        }
    }, [enableSpeech])

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
                const response = await analyzePassword({ password })
                setMessage(response.message)
                // 解析結果を読み上げ
                speakMessage(response.message)
            } catch {
                // エラー時はデフォルトメッセージを表示
                const randomMessage =
                    DEFAULT_TAUNT_MESSAGES[
                        Math.floor(Math.random() * DEFAULT_TAUNT_MESSAGES.length)
                    ]
                setMessage(randomMessage)
                speakMessage(randomMessage)
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
    }, [password, debounceMs, speakMessage])

    // コンポーネントアンマウント時に読み上げ停止
    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel()
            }
        }
    }, [])

    // パスワードが空の場合は何も表示しない
    if (!password || password.length === 0) {
        return null
    }

    return (
        <div
            data-testid="password-taunt"
            className={`mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg ${className}`}
        >
            {isLoading ? (
                <div className="flex items-center gap-3">
                    <LoadingSpinner size="small" color="red" />
                    <span className="text-red-700 font-medium">
                        AIがパスワードを解析中...
                    </span>
                </div>
            ) : (
                <div className="flex items-start gap-3">
                    <span className="text-2xl" aria-hidden="true">
                        {isSpeaking ? '🗣️' : '😈'}
                    </span>
                    <div className="flex-1">
                        <p
                            className="text-red-700 font-medium text-lg"
                            data-testid="taunt-message"
                        >
                            {message}
                        </p>
                        {isSpeaking && (
                            <p className="text-red-500 text-sm mt-1 animate-pulse">
                                読み上げ中...
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default PasswordTaunt
