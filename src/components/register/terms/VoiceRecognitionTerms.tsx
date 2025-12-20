/**
 * VoiceRecognitionTerms - 音声認識読み上げコンポーネント
 * Issue #35: 利用規約 - 音声認識読み上げ・検証
 *
 * 機能:
 * - 利用規約テキストを表示
 * - ユーザーが音声で読み上げ
 * - リアルタイムで内容を検証
 * - 間違えたら最初からやり直し
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

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
type RecognitionState = 'idle' | 'listening' | 'success' | 'error'

/**
 * テキストを正規化（比較用）
 */
function normalizeText(text: string): string {
    return text
        .replace(/\s+/g, '')
        .replace(/[。、！？「」（）『』【】・]/g, '')
        .toLowerCase()
}

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
    const [accumulatedTranscript, setAccumulatedTranscript] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)
    const recognitionRef = useRef<SpeechRecognition | null>(null)

    // 正規化された利用規約テキスト
    const normalizedTerms = useMemo(() => normalizeText(termsText), [termsText])

    // 音声認識の初期化
    useEffect(() => {
        if (typeof window === 'undefined') return

        const SpeechRecognitionConstructor =
            window.SpeechRecognition || (window as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition

        if (!SpeechRecognitionConstructor) {
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
            let fullTranscript = ''

            for (let i = 0; i < event.results.length; i++) {
                fullTranscript += event.results[i][0].transcript
            }

            setAccumulatedTranscript(fullTranscript)
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error !== 'no-speech') {
                setState('error')
                setError(`音声認識エラー: ${event.error}`)
            }
        }

        recognition.onend = () => {
            // listening状態でエラーでなければ再開
            if (state === 'listening' && !disabled) {
                try {
                    recognition.start()
                } catch {
                    // 既に開始されている場合は無視
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

    // リアルタイム検証
    useEffect(() => {
        if (state !== 'listening' || !accumulatedTranscript) return

        const normalizedTranscript = normalizeText(accumulatedTranscript)
        if (normalizedTranscript.length === 0) return

        // 先頭一致チェック
        if (!normalizedTerms.startsWith(normalizedTranscript)) {
            setState('error')
            setError('読み上げ内容が利用規約と一致しません。最初からやり直してください。')
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
            return
        }

        // 進捗更新
        const newProgress = normalizedTranscript.length / normalizedTerms.length
        setProgress(newProgress)

        // 完全一致で成功
        if (normalizedTranscript === normalizedTerms) {
            setState('success')
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
            setTimeout(() => {
                onVerified()
            }, 1000)
        }
    }, [accumulatedTranscript, normalizedTerms, state, onVerified])

    // 音声認識開始
    const handleStart = useCallback(() => {
        if (disabled || !recognitionRef.current) return

        try {
            recognitionRef.current.start()
            setState('listening')
            setAccumulatedTranscript('')
            setProgress(0)
            setError(null)
        } catch {
            setError('音声認識を開始できませんでした')
            setState('error')
        }
    }, [disabled])

    // リセット（最初からやり直し）
    const handleReset = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
        setState('idle')
        setAccumulatedTranscript('')
        setProgress(0)
        setError(null)
    }, [])

    // 読み上げ済みの文字数を計算
    const matchedCharCount = useMemo(() => {
        const normalizedTranscript = normalizeText(accumulatedTranscript)
        if (!normalizedTerms.startsWith(normalizedTranscript)) return 0

        // 正規化された文字数から元のテキストの位置を推定
        let normalizedIndex = 0
        let originalIndex = 0

        while (normalizedIndex < normalizedTranscript.length && originalIndex < termsText.length) {
            const originalChar = termsText[originalIndex]
            const normalizedOriginalChar = normalizeText(originalChar)

            if (normalizedOriginalChar.length === 0) {
                // スキップされる文字（空白、句読点など）
                originalIndex++
            } else if (normalizedOriginalChar === normalizedTranscript[normalizedIndex]) {
                normalizedIndex++
                originalIndex++
            } else {
                break
            }
        }

        return originalIndex
    }, [accumulatedTranscript, termsText, normalizedTerms])

    return (
        <div className={`${className}`} data-testid="voice-recognition-terms">
            {/* 進捗バー */}
            {state === 'listening' && (
                <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>進捗</span>
                        <span>{Math.round(progress * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-green-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progress * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* 利用規約テキスト（ハイライト付き） */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
                <h2 className="text-xl font-medium text-gray-800 mb-4">利用規約</h2>
                <p className="whitespace-pre-wrap leading-relaxed">
                    <span className="text-green-600 font-medium">
                        {termsText.slice(0, matchedCharCount)}
                    </span>
                    <span className="text-gray-600">
                        {termsText.slice(matchedCharCount)}
                    </span>
                </p>
            </div>

            {/* 状態表示 */}
            <div className="text-center mb-6">
                {state === 'idle' && (
                    <p className="text-gray-500">「読み上げ開始」ボタンを押して、利用規約を最初から読み上げてください</p>
                )}
                {state === 'listening' && (
                    <div>
                        <div className="inline-block w-4 h-4 bg-red-500 rounded-full animate-pulse mr-2"></div>
                        <span className="text-red-600">音声認識中... リアルタイムで検証しています</span>
                    </div>
                )}
                {state === 'success' && (
                    <p className="text-green-600 text-xl font-medium">読み上げ完了！検証成功！</p>
                )}
                {state === 'error' && error && (
                    <p className="text-red-600">{error}</p>
                )}
            </div>

            {/* 読み上げ内容表示 */}
            {accumulatedTranscript && state === 'listening' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">認識中のテキスト</h3>
                    <p className="text-blue-700">{accumulatedTranscript}</p>
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
                            px-8 py-3 bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white rounded-lg
                            transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        type="button"
                    >
                        読み上げ開始
                    </button>
                )}

                {state === 'listening' && (
                    <button
                        data-testid="stop-button"
                        onClick={handleReset}
                        disabled={disabled}
                        className={`
                            px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg
                            transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        type="button"
                    >
                        中止してやり直す
                    </button>
                )}

                {state === 'error' && (
                    <button
                        data-testid="reset-button"
                        onClick={handleReset}
                        disabled={disabled}
                        className={`
                            px-8 py-3 bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white rounded-lg
                            transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        type="button"
                    >
                        最初からやり直す
                    </button>
                )}
            </div>
        </div>
    )
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
