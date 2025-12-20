/**
 * PasswordTaunt - AIパスワード煽りコンポーネント
 * Issue #21: AIパスワード煽り機能
 *
 * パスワード入力時にAIが煽りメッセージを表示＆読み上げ
 * - パスワード入力のデバウンス（1000ms）
 * - POST /api/password/analyze API呼び出し（Bedrock）
 * - フォールバック: モックAPI
 * - Web Speech APIで読み上げ
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { analyzePassword, analyzePasswordMock } from '../../api/passwordApi'
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
    /** モックAPIを使用するか（開発用） */
    useMock?: boolean
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
const speakText = (text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onEnd?.()
        return
    }

    // 前の読み上げをキャンセル
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ja-JP'
    utterance.rate = 1.1  // 少し速め
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onend = () => {
        onEnd?.()
    }

    utterance.onerror = () => {
        onEnd?.()
    }

    // 音声リストを取得（非同期で読み込まれることがある）
    const setVoiceAndSpeak = () => {
        const voices = speechSynthesis.getVoices()
        const japaneseVoice = voices.find(voice =>
            voice.lang.startsWith('ja') || voice.lang === 'ja-JP'
        )
        if (japaneseVoice) {
            utterance.voice = japaneseVoice
        }
        speechSynthesis.speak(utterance)
    }

    // 音声リストがすでに読み込まれている場合
    if (speechSynthesis.getVoices().length > 0) {
        setVoiceAndSpeak()
    } else {
        // 音声リストの読み込みを待つ
        speechSynthesis.onvoiceschanged = () => {
            setVoiceAndSpeak()
        }
        // フォールバック: 1秒後に実行
        setTimeout(() => {
            if (!speechSynthesis.speaking) {
                setVoiceAndSpeak()
            }
        }, 1000)
    }
}

export const PasswordTaunt = ({
    password,
    debounceMs = 1000,
    className = '',
    enableSpeech = true,
    useMock = false,
}: PasswordTauntProps) => {
    const [message, setMessage] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const debounceTimerRef = useRef<number | undefined>(undefined)
    const lastSpokenRef = useRef<string>('')

    // 読み上げ実行
    const speakMessage = useCallback((text: string) => {
        if (!enableSpeech || !text) {
            return
        }

        // 同じメッセージは読み上げない
        if (text === lastSpokenRef.current) {
            return
        }

        lastSpokenRef.current = text
        setIsSpeaking(true)

        speakText(text, () => {
            setIsSpeaking(false)
        })
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
            const getDefaultMessage = () =>
                DEFAULT_TAUNT_MESSAGES[Math.floor(Math.random() * DEFAULT_TAUNT_MESSAGES.length)]

            try {
                let resultMessage = ''

                if (useMock) {
                    // モックAPIを使用
                    const response = await analyzePasswordMock({ password })
                    resultMessage = response?.message || ''
                } else {
                    // 本番APIを試す、失敗したらモックにフォールバック
                    try {
                        const response = await analyzePassword({ password })
                        resultMessage = response?.message || ''
                    } catch (err) {
                        console.log('Bedrock API failed, falling back to mock:', err)
                        try {
                            const mockResponse = await analyzePasswordMock({ password })
                            resultMessage = mockResponse?.message || ''
                        } catch (mockErr) {
                            console.log('Mock API also failed:', mockErr)
                        }
                    }
                }

                // メッセージが空の場合はデフォルトメッセージを使用
                const finalMessage = resultMessage || getDefaultMessage()
                setMessage(finalMessage)
                // パスワードを読み上げてからAIメッセージを読み上げ
                const fullSpeech = `あなたのパスワードは、${password.split('').join('、')}、ですね。${finalMessage}`
                speakMessage(fullSpeech)
            } catch (err) {
                // エラー時はデフォルトメッセージを表示
                console.log('Password analysis error:', err)
                const randomMessage = getDefaultMessage()
                setMessage(randomMessage)
                const fullSpeech = `あなたのパスワードは、${password.split('').join('、')}、ですね。${randomMessage}`
                speakMessage(fullSpeech)
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
    }, [password, debounceMs, speakMessage, useMock])

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
                    {/* 再読み上げボタン */}
                    {!isSpeaking && message && enableSpeech && (
                        <button
                            type="button"
                            onClick={() => {
                                lastSpokenRef.current = ''
                                speakMessage(message)
                            }}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="もう一度読み上げる"
                        >
                            🔊
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default PasswordTaunt
