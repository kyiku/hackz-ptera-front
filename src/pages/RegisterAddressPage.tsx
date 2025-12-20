/**
 * RegisterAddressPage - 住所入力ページ（プレースホルダー）
 * Issue #37: 登録ダッシュボード（ハブ＆スポーク形式）
 *
 * TODO: 後続のissueで実装予定（ストリートビュー風）
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const RegisterAddressPage = () => {
    const navigate = useNavigate()

    const handleBack = useCallback(() => {
        navigate('/register')
    }, [navigate])

    return (
        <div data-testid="register-address-page" className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">住所入力</h1>
                <p className="text-gray-400 mb-8">Coming Soon</p>
                <button
                    data-testid="back-to-dashboard-button"
                    onClick={handleBack}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="button"
                >
                    ダッシュボードに戻る
                </button>
            </div>
        </div>
    )
}

export default RegisterAddressPage

