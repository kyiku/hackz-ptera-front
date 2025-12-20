/**
 * RegisterNamePage - 名前入力ページ
 * Issue #31: 名前入力 - スロットマシンUI
 * 
 * 機能:
 * - スロットマシン風UIで名前を入力
 * - 選択した名前をregistrationStoreに保存
 * - タスク完了としてマーク
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRegistrationStore } from '../store/registrationStore'
import { SlotMachineInput } from '../components/register/name/SlotMachineInput'

const RegisterNamePage = () => {
    const navigate = useNavigate()
    const { formData, completeTask } = useRegistrationStore()

    // 名前変更時のハンドラ
    const handleNameChange = useCallback(
        (name: string) => {
            // 名前が入力されたらタスクを完了
            if (name.trim()) {
                completeTask('name', { name: name.trim() })
            }
        },
        [completeTask]
    )

    // 戻るボタン（ダッシュボードへ）
    const handleBack = useCallback(() => {
        navigate('/register')
    }, [navigate])

    return (
        <div
            data-testid="register-name-page"
            className="min-h-screen bg-gray-900 text-white py-8 px-4"
        >
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">名前入力</h1>

                {/* スロットマシン */}
                <SlotMachineInput
                    value={formData.name || ''}
                    onChange={handleNameChange}
                    maxLength={3}
                />

                {/* 戻るボタン */}
                <div className="text-center mt-8">
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
        </div>
    )
}

export default RegisterNamePage
