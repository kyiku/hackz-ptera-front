/**
 * OTPページ
 * 微分問題を解いてOTP認証を行う
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import CalcOtpDisplay from '../components/otp/CalcOtpDisplay'
import {
    sendOtp,
    verifyOtp,
    isVerifySuccess,
    isVerifyRetryableFailure,
    isVerifyFinalFailure,
} from '../api/otpApi'

const OtpPage = () => {
    const navigate = useNavigate()
    const [problemLatex, setProblemLatex] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [attemptsRemaining, setAttemptsRemaining] = useState<number | undefined>()
    const [loadError, setLoadError] = useState<string>('')
    const [isSuccess, setIsSuccess] = useState(false)

    // 問題を取得
    const fetchProblem = useCallback(async () => {
        setIsLoading(true)
        setLoadError('')
        try {
            const response = await sendOtp()
            setProblemLatex(response.problem_latex)
            setErrorMessage('')
            setAttemptsRemaining(undefined)
        } catch (error) {
            console.error('Failed to fetch OTP problem:', error)
            setLoadError('問題の取得に失敗しました')
        } finally {
            setIsLoading(false)
        }
    }, [])

    // 初回ロード時に問題を取得
    useEffect(() => {
        fetchProblem()
    }, [fetchProblem])

    // 回答を送信
    const handleSubmit = useCallback(async (answer: string) => {
        setIsSubmitting(true)
        setErrorMessage('')

        try {
            const response = await verifyOtp({ answer })

            if (isVerifySuccess(response)) {
                // 成功 - 正解を表示して2秒後にリダイレクト
                setIsSuccess(true)
                setTimeout(() => {
                    navigate(`/register?token=${response.register_token}`)
                }, 2000)
            } else if (isVerifyRetryableFailure(response)) {
                // リトライ可能な失敗
                setErrorMessage(response.message)
                setAttemptsRemaining(response.attempts_remaining)
                setProblemLatex(response.new_problem_latex)
            } else if (isVerifyFinalFailure(response)) {
                // 最終失敗 - リダイレクト
                setErrorMessage(response.message)
                setAttemptsRemaining(0)
                setTimeout(() => {
                    navigate('/')
                }, response.redirect_delay * 1000)
            }
        } catch (error) {
            console.error('OTP verification failed:', error)
            setErrorMessage('認証に失敗しました')
        } finally {
            setIsSubmitting(false)
        }
    }, [navigate])

    // ローディング中
    if (isLoading) {
        return (
            <div
                data-testid="otp-page"
                className="min-h-screen bg-stone-50 flex items-center justify-center"
            >
                <div className="text-center">
                    <div className="w-6 h-6 border border-stone-300 border-t-stone-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-stone-500">読み込み中</p>
                </div>
            </div>
        )
    }

    // ロードエラー
    if (loadError) {
        return (
            <div
                data-testid="otp-page"
                className="min-h-screen bg-stone-50 flex items-center justify-center"
            >
                <div className="text-center">
                    <p className="text-stone-600 mb-6">{loadError}</p>
                    <button
                        onClick={fetchProblem}
                        className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white text-sm tracking-wide rounded-sm transition-colors"
                        type="button"
                    >
                        再試行
                    </button>
                </div>
            </div>
        )
    }

    // 正解時
    if (isSuccess) {
        return (
            <div
                data-testid="otp-page"
                className="min-h-screen bg-stone-50 flex items-center justify-center"
            >
                <div className="text-center">
                    {/* シンプルなチェックマーク */}
                    <div className="w-16 h-16 mx-auto mb-6 border-2 border-emerald-600 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-emerald-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl text-stone-800 mb-2">正解</h1>
                    <p className="text-sm text-stone-500">登録画面に移動します</p>
                </div>
            </div>
        )
    }

    return (
        <div
            data-testid="otp-page"
            className="min-h-screen bg-stone-50 flex flex-col"
        >
            {/* ヘッダー */}
            <header className="py-8 text-center">
                <h1 className="text-lg text-stone-700 tracking-wide">
                    本人確認
                </h1>
            </header>

            {/* メインコンテンツ */}
            <main className="flex-1 flex items-start justify-center">
                <div className="w-full max-w-2xl">
                    <CalcOtpDisplay
                        problemLatex={problemLatex}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        errorMessage={errorMessage}
                        attemptsRemaining={attemptsRemaining}
                        disabled={attemptsRemaining === 0}
                    />
                </div>
            </main>
        </div>
    )
}

export default OtpPage
