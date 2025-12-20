/**
 * RegisterCaptchaPage - CAPTCHA認証ページ
 *
 * ウォーリーを探せ風CAPTCHAで認証
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRegistrationStore } from '../store/registrationStore'
import { CaptchaInput } from '../components/register/captcha/CaptchaInput'

const RegisterCaptchaPage = () => {
    const navigate = useNavigate()
    const { completeTask } = useRegistrationStore()

    // CAPTCHA成功時
    const handleSuccess = useCallback(() => {
        completeTask('captcha', { captchaVerified: true })
        navigate('/register')
    }, [completeTask, navigate])

    // 3回失敗時
    const handleFinalFailure = useCallback(() => {
        navigate('/queue')
    }, [navigate])

    // 戻るボタン
    const handleBack = useCallback(() => {
        navigate('/register')
    }, [navigate])

    return (
        <div
            data-testid="register-captcha-page"
            className="min-h-screen bg-white text-gray-800 py-8 px-4"
        >
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-light text-center mb-8">CAPTCHA認証</h1>

                <CaptchaInput
                    onSuccess={handleSuccess}
                    onFinalFailure={handleFinalFailure}
                />

                {/* 戻るボタン */}
                <div className="text-center mt-8">
                    <button
                        data-testid="back-to-dashboard-button"
                        onClick={handleBack}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        type="button"
                    >
                        ダッシュボードに戻る
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RegisterCaptchaPage
