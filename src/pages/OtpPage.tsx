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
            setLoadError('問題の取得に失敗しました。再度お試しください。')
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
                // 成功 - 登録完了ページへ遷移
                navigate('/register')
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
            setErrorMessage('認証に失敗しました。再度お試しください。')
        } finally {
            setIsSubmitting(false)
        }
    }, [navigate])

    // ローディング中
    if (isLoading) {
        return (
            <div
                data-testid="otp-page"
                className="min-h-screen bg-gray-50 flex items-center justify-center"
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">問題を読み込み中...</p>
                </div>
            </div>
        )
    }

    // ロードエラー
    if (loadError) {
        return (
            <div
                data-testid="otp-page"
                className="min-h-screen bg-gray-50 flex items-center justify-center"
            >
                <div className="text-center">
                    <p className="text-red-600 mb-4">{loadError}</p>
                    <button
                        onClick={fetchProblem}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        type="button"
                    >
                        再試行
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div
            data-testid="otp-page"
            className="min-h-screen bg-gray-50 flex items-center justify-center py-8"
        >
            <div className="w-full max-w-lg">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    OTP認証
                </h1>
                <CalcOtpDisplay
                    problemLatex={problemLatex}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    errorMessage={errorMessage}
                    attemptsRemaining={attemptsRemaining}
                    disabled={attemptsRemaining === 0}
                />
            </div>
        </div>
    )
}

export default OtpPage
