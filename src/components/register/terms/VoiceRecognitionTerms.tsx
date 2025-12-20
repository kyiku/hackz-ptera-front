/**
 * VoiceRecognitionTerms - 音声認識読み上げコンポーネント
 * Issue #35: 利用規約 - 音声認識読み上げ・検証
 * 
 * 機能:
 * - 利用規約テキストを表示
 * - ユーザーが音声で読み上げ
 * - 音声認識で内容を検証
 * - 間違えたらやり直し
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface VoiceRecognitionTermsProps {
    /** 利用規約テキスト */
    termsText: string
    /** 検証成功時のコールバック */
    onVerified: () => void
    /** 無効化されているか */
    disabled?: boolean
    /** カスタムクラス名 */
    className?: string
}

/**
 * 音声認識の状態
 */
type RecognitionState = 'idle' | 'listening' | 'processing' | 'success' | 'error'

/**
 * 音声認識読み上げコンポーネント
 */
export const VoiceRecognitionTerms = ({
    termsText,
    onVerified,
    disabled = false,
    className = '',
}: VoiceRecognitionTermsProps) => {
    const [state, setState] = useState<RecognitionState>('idle')
    const [transcript, setTranscript] = useState('')
    const [error, setError] = useState<string | null>(null)
    const recognitionRef = useRef<SpeechRecognition | null>(null)

    // 音声認識の初期化
    useEffect(() => {
        if (typeof window === 'undefined') return

        const SpeechRecognitionConstructor =
            window.SpeechRecognition || (window as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition

        if (!SpeechRecognitionConstructor) {
            // ブラウザ非対応の場合はエラーを設定（初期化時のみ）
            const timer = setTimeout(() => {
                setError('お使いのブラウザは音声認識に対応していません')
            }, 0)
            return () => clearTimeout(timer)
        }

        const recognition = new SpeechRecognitionConstructor()
        recognition.lang = 'ja-JP'
        recognition.continuous = true
        recognition.interimResults = true

        recognition.onstart = () => {
            setState('listening')
            setError(null)
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = ''
            let finalTranscript = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript
                if (event.results[i].isFinal) {
                    finalTranscript += transcript
                } else {
                    interimTranscript += transcript
                }
            }

            setTranscript(finalTranscript || interimTranscript)
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            setState('error')
            setError(`音声認識エラー: ${event.error}`)
        }

        recognition.onend = () => {
            if (state === 'listening') {
                // 自動的に再開（continuous mode）
                if (!disabled) {
                    recognition.start()
                }
            }
        }

        recognitionRef.current = recognition

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [disabled, state])

    // 音声認識開始
    const handleStart = useCallback(() => {
        if (disabled || !recognitionRef.current) return

        try {
            recognitionRef.current.start()
            setState('listening')
            setTranscript('')
            setError(null)
        } catch {
            setError('音声認識を開始できませんでした')
            setState('error')
        }
    }, [disabled])

    // 音声認識停止
    const handleStop = useCallback(() => {
        if (!recognitionRef.current) return

        recognitionRef.current.stop()
        setState('idle')
    }, [])

    // 検証
    const handleVerify = useCallback(() => {
        if (!transcript.trim()) {
            setError('読み上げ内容が空です')
            return
        }

        setState('processing')

        // 簡易的な検証（実際の実装では、より詳細な検証が必要）
        // 利用規約テキストと読み上げ内容を比較
        const normalizedTerms = termsText
            .replace(/\s+/g, '')
            .replace(/[。、]/g, '')
            .toLowerCase()
        const normalizedTranscript = transcript
            .replace(/\s+/g, '')
            .replace(/[。、]/g, '')
            .toLowerCase()

        // 類似度を計算（簡易版）
        const similarity = calculateSimilarity(normalizedTerms, normalizedTranscript)

        // 80%以上の類似度で成功とみなす
        if (similarity >= 0.8) {
            setState('success')
            setTimeout(() => {
                onVerified()
            }, 1000)
        } else {
            setState('error')
            setError(
                `読み上げ内容が正しくありません。類似度: ${Math.round(similarity * 100)}%。もう一度読み上げてください。`
            )
        }
    }, [transcript, termsText, onVerified])

    // リセット
    const handleReset = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
        setState('idle')
        setTranscript('')
        setError(null)
    }, [])

    return (
        <div className={`${className}`} data-testid="voice-recognition-terms">
            {/* 利用規約テキスト */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6 max-h-64 overflow-y-auto">
                <h2 className="text-xl font-bold text-white mb-4">利用規約</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{termsText}</p>
            </div>

            {/* 状態表示 */}
            <div className="text-center mb-6">
                {state === 'idle' && (
                    <p className="text-gray-400">「読み上げ開始」ボタンを押して、利用規約を読み上げてください</p>
                )}
                {state === 'listening' && (
                    <div>
                        <div className="inline-block w-4 h-4 bg-red-500 rounded-full animate-pulse mr-2"></div>
                        <p className="text-red-400 inline">音声認識中...</p>
                    </div>
                )}
                {state === 'processing' && (
                    <p className="text-yellow-400">検証中...</p>
                )}
                {state === 'success' && (
                    <p className="text-green-400">✓ 検証成功！</p>
                )}
                {state === 'error' && error && (
                    <p className="text-red-400">{error}</p>
                )}
            </div>

            {/* 読み上げ内容表示 */}
            {transcript && (
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-bold text-white mb-2">読み上げ内容</h3>
                    <p className="text-gray-300">{transcript}</p>
                </div>
            )}

            {/* 操作ボタン */}
            <div className="flex flex-col gap-4 items-center">
                {state === 'idle' && (
                    <button
                        data-testid="start-button"
                        onClick={handleStart}
                        disabled={disabled}
                        className={`
                            px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                            transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        type="button"
                    >
                        読み上げ開始
                    </button>
                )}

                {state === 'listening' && (
                    <>
                        <button
                            data-testid="stop-button"
                            onClick={handleStop}
                            disabled={disabled}
                            className={`
                                px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg
                                transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                            type="button"
                        >
                            読み上げ停止
                        </button>
                        <button
                            data-testid="verify-button"
                            onClick={handleVerify}
                            disabled={disabled || !transcript.trim()}
                            className={`
                                px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg
                                transition-colors focus:outline-none focus:ring-2 focus:ring-green-500
                                ${disabled || !transcript.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                            type="button"
                        >
                            検証
                        </button>
                    </>
                )}

                {(state === 'error' || state === 'success') && (
                    <button
                        data-testid="reset-button"
                        onClick={handleReset}
                        disabled={disabled}
                        className={`
                            px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg
                            transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        type="button"
                    >
                        やり直す
                    </button>
                )}
            </div>
        </div>
    )
}

/**
 * 文字列の類似度を計算（簡易版）
 */
function calculateSimilarity(str1: string, str2: string): number {
    if (str1.length === 0 && str2.length === 0) return 1
    if (str1.length === 0 || str2.length === 0) return 0

    // 最長共通部分列（LCS）の長さを計算
    const lcs = longestCommonSubsequence(str1, str2)
    const maxLength = Math.max(str1.length, str2.length)

    return lcs / maxLength
}

/**
 * 最長共通部分列（LCS）の長さを計算
 */
function longestCommonSubsequence(str1: string, str2: string): number {
    const m = str1.length
    const n = str2.length
    const dp: number[][] = Array(m + 1)
        .fill(null)
        .map(() => Array(n + 1).fill(0))

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
            }
        }
    }

    return dp[m][n]
}

// 型定義
interface SpeechRecognition extends EventTarget {
    lang: string
    continuous: boolean
    interimResults: boolean
    start(): void
    stop(): void
    onstart: ((event: Event) => void) | null
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
    onend: (() => void) | null
}

interface SpeechRecognitionEvent extends Event {
    resultIndex: number
    results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
    length: number
    item(index: number): SpeechRecognitionResult
    [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
    length: number
    item(index: number): SpeechRecognitionAlternative
    [index: number]: SpeechRecognitionAlternative
    isFinal: boolean
}

interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string
    message: string
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition
        webkitSpeechRecognition: new () => SpeechRecognition
    }
}

export default VoiceRecognitionTerms

