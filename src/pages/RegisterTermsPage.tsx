/**
 * RegisterTermsPage - 利用規約ページ（プレースホルダー）
 * Issue #37: 登録ダッシュボード（ハブ＆スポーク形式）
 *
 * TODO: 後続のissueで実装予定（音声認識読み上げ）
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const RegisterTermsPage = () => {
    const navigate = useNavigate()

    const handleBack = useCallback(() => {
        navigate('/register')
    }, [navigate])

    return (
        <div data-testid="register-terms-page" className="min-h-screen bg-white text-gray-800 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">利用規約</h1>
                <p className="text-gray-500 mb-8">Coming Soon</p>
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

export default RegisterTermsPage
