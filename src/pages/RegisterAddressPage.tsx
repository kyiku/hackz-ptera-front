/**
 * RegisterAddressPage - 住所入力ページ
 * Issue #34: 住所入力 - ストリートビュー風ナビゲーション
 *
 * 機能:
 * - ストリートビュー風ナビゲーションで住所を選択
 * - 選択した住所をregistrationStoreに保存
 * - タスク完了としてマーク
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRegistrationStore } from '../store/registrationStore'
import { StreetViewNavigation } from '../components/register/address/StreetViewNavigation'

const RegisterAddressPage = () => {
    const navigate = useNavigate()
    const { formData, completeTask } = useRegistrationStore()

    // 住所選択時のハンドラ
    const handleAddressChange = useCallback(
        (address: string) => {
            // フォームデータを更新してタスクを完了
            completeTask('address', { address })
        },
        [completeTask]
    )

    // 戻るボタン（ダッシュボードへ）
    const handleBack = useCallback(() => {
        navigate('/register')
    }, [navigate])

    return (
        <div
            data-testid="register-address-page"
            className="min-h-screen bg-white text-gray-800 py-8 px-4"
        >
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-light text-center mb-8">住所入力</h1>

                {/* ストリートビュー風ナビゲーション */}
                <StreetViewNavigation
                    value={formData.address}
                    onChange={handleAddressChange}
                />

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

export default RegisterAddressPage
