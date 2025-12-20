/**
 * CalcOtpDisplay - 微分OTP表示コンポーネント
 *
 * 微分問題をKaTeXでレンダリングし、6桁の回答を入力するUI
 */
import { useState, useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export interface CalcOtpDisplayProps {
    /** LaTeX形式の問題文 */
    problemLatex: string
    /** 回答送信時のコールバック */
    onSubmit: (answer: string) => void
    /** 送信中かどうか */
    isSubmitting?: boolean
    /** エラーメッセージ */
    errorMessage?: string
    /** 残り試行回数 */
    attemptsRemaining?: number
    /** 無効化されているか */
    disabled?: boolean
}

export const CalcOtpDisplay = ({
    problemLatex,
    onSubmit,
    isSubmitting = false,
    errorMessage,
    attemptsRemaining,
    disabled = false,
}: CalcOtpDisplayProps) => {
    const [answer, setAnswer] = useState('')
    const mathRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // 問題文をパースして表示用に変換
    const parsedProblem = (() => {
        if (!problemLatex) return { formula: '', instruction: '' }

        // "f(x) = ... を微分し、x = k での値を求めよ" の形式をパース
        const match = problemLatex.match(/^(f\(x\)\s*=\s*.+?)\s*(を微分し、.+)$/)
        if (match) {
            return {
                formula: match[1],
                instruction: match[2],
            }
        }
        return { formula: problemLatex, instruction: '' }
    })()

    // KaTeXで数式部分をレンダリング
    useEffect(() => {
        if (mathRef.current && parsedProblem.formula) {
            try {
                // f(x) = ax^2 + bx + c を LaTeX形式に変換
                const latexFormula = parsedProblem.formula
                    .replace(/\^(\d+)/g, '^{$1}')  // x^2 → x^{2}
                    .replace(/(\d)x/g, '$1 \\cdot x')  // 3x → 3 \cdot x (optional)

                katex.render(latexFormula, mathRef.current, {
                    throwOnError: false,
                    displayMode: true,
                })
            } catch (error) {
                console.error('KaTeX rendering error:', error)
                if (mathRef.current) {
                    mathRef.current.textContent = parsedProblem.formula
                }
            }
        }
    }, [parsedProblem.formula])

    // 問題が変わったら入力をクリア
    useEffect(() => {
        setAnswer('')
        inputRef.current?.focus()
    }, [problemLatex])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (answer.length === 6 && !isSubmitting && !disabled) {
            onSubmit(answer)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6)
        setAnswer(value)
    }

    return (
        <div
            data-testid="calc-otp-display"
            className="w-full max-w-2xl mx-auto px-6 py-10"
        >
            {/* 問題表示エリア */}
            <div className="mb-12 py-10 px-8 bg-white border border-stone-200 rounded-sm">
                <p className="text-sm text-stone-500 mb-8 text-center tracking-wide">
                    次の問題を解いてください
                </p>
                <div
                    ref={mathRef}
                    className="text-xl text-center text-stone-800 min-h-[60px] flex items-center justify-center overflow-x-auto"
                    data-testid="problem-display"
                />
                {parsedProblem.instruction && (
                    <p className="text-base text-center text-stone-600 mt-8">
                        {parsedProblem.instruction}
                    </p>
                )}
            </div>

            {/* 回答入力フォーム */}
            <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto">
                <div>
                    <label
                        htmlFor="otp-answer"
                        className="block text-xs text-stone-500 mb-3 text-center tracking-wide uppercase"
                    >
                        6桁の答えを入力
                    </label>
                    <input
                        ref={inputRef}
                        id="otp-answer"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={answer}
                        onChange={handleInputChange}
                        disabled={isSubmitting || disabled}
                        placeholder="000000"
                        className="w-full px-4 py-4 text-2xl text-center font-mono tracking-[0.3em] bg-white border border-stone-300 rounded-sm focus:border-stone-500 focus:outline-none transition-colors disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed"
                        data-testid="otp-input"
                        autoComplete="off"
                    />
                </div>

                {/* エラーメッセージ */}
                {errorMessage && (
                    <div
                        className="py-3 px-4 border border-red-200 bg-red-50/50 text-red-700 text-sm text-center rounded-sm"
                        data-testid="error-message"
                    >
                        {errorMessage}
                        {attemptsRemaining !== undefined && (
                            <span className="block mt-1 text-red-600">
                                残り {attemptsRemaining} 回
                            </span>
                        )}
                    </div>
                )}

                {/* 送信ボタン */}
                <button
                    type="submit"
                    disabled={answer.length !== 6 || isSubmitting || disabled}
                    className="w-full py-4 px-4 bg-stone-800 hover:bg-stone-700 text-white text-sm tracking-wide rounded-sm transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-stone-500 focus:ring-offset-2"
                    data-testid="submit-button"
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center">
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            確認中
                        </span>
                    ) : (
                        '送信'
                    )}
                </button>
            </form>

            {/* ヒント */}
            <p className="mt-10 text-xs text-stone-400 text-center">
                f(x)を微分して、指定されたxの値を代入してください
            </p>
        </div>
    )
}

export default CalcOtpDisplay
