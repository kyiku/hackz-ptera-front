/**
 * OTPページ
 * Issue #1: ルーティング設定
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const OtpPage = () => {
    const navigate = useNavigate()

    const handleBack = useCallback(() => {
        navigate('/register')
    }, [navigate])

    return (
        <div data-testid="otp-page" className="min-h-screen bg-white text-gray-800 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">OTP認証</h1>
                <p className="text-gray-500 mb-8">OTP Page - Coming Soon</p>
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
    )
}

export default OtpPage
