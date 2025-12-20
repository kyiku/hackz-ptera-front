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
            className="w-full max-w-2xl mx-auto p-6"
        >
            {/* 問題表示エリア */}
            <div className="mb-8 p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-gray-700 mb-6 text-center">
                    次の問題を解いてください
                </h2>
                <div
                    ref={mathRef}
                    className="text-xl text-center text-gray-800 min-h-[60px] flex items-center justify-center overflow-x-auto"
                    data-testid="problem-display"
                />
                {parsedProblem.instruction && (
                    <p className="text-lg text-center text-gray-700 mt-6">
                        {parsedProblem.instruction}
                    </p>
                )}
            </div>

            {/* 回答入力フォーム */}
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
                <div>
                    <label
                        htmlFor="otp-answer"
                        className="block text-sm font-medium text-gray-700 mb-2 text-center"
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
                        className="w-full px-4 py-3 text-2xl text-center font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        data-testid="otp-input"
                        autoComplete="off"
                    />
                </div>

                {/* エラーメッセージ */}
                {errorMessage && (
                    <div
                        className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center"
                        data-testid="error-message"
                    >
                        {errorMessage}
                        {attemptsRemaining !== undefined && (
                            <span className="block mt-1 font-semibold">
                                残り試行回数: {attemptsRemaining}回
                            </span>
                        )}
                    </div>
                )}

                {/* 送信ボタン */}
                <button
                    type="submit"
                    disabled={answer.length !== 6 || isSubmitting || disabled}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    data-testid="submit-button"
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center">
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                            確認中...
                        </span>
                    ) : (
                        '送信'
                    )}
                </button>
            </form>

            {/* ヒント */}
            <p className="mt-4 text-sm text-gray-500 text-center">
                f(x)を微分して、指定されたxの値を代入してください
            </p>
        </div>
    )
}

export default CalcOtpDisplay
