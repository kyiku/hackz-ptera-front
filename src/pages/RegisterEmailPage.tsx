/**
 * RegisterEmailPage - メールアドレス入力ページ
 * Issue #38: メールアドレス入力 - 瞬きモールス信号UI
 *
 * 機能:
 * - カメラで瞬きを検出
 * - 短い瞬き = ドット（・）、長い瞬き = ダッシュ（−）
 * - モールス信号をデコードしてメールアドレスを入力
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRegistrationStore } from '../store/registrationStore'
import { EmailMorseInput } from '../components/register/email/EmailMorseInput'

const RegisterEmailPage = () => {
    const navigate = useNavigate()
    const { completeTask } = useRegistrationStore()

    // メールアドレス確定時のハンドラ
    const handleSubmit = useCallback((email: string) => {
        completeTask('email', { email })
        navigate('/register')
    }, [completeTask, navigate])

    // 戻るボタン
    const handleBack = useCallback(() => {
        navigate('/register')
    }, [navigate])

    return (
        <div
            data-testid="register-email-page"
            className="min-h-screen bg-white text-gray-800 py-8 px-4"
        >
            <div className="max-w-4xl mx-auto">
                <EmailMorseInput onSubmit={handleSubmit} />

                {/* 戻るボタン */}
                <div className="text-center mt-8">
                    <button
                        data-testid="back-to-dashboard-button"
                        onClick={handleBack}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="button"
                    >
                        ダッシュボードに戻る
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RegisterEmailPage
