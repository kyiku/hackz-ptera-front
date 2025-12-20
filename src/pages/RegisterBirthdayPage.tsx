/**
 * RegisterBirthdayPage - 生年月日入力ページ
 * Issue #32: 生年月日入力 - スライダーUI
 *
 * 機能:
 * - 年・月・日のスライダーで日付を選択
 * - 選択した日付をregistrationStoreに保存
 * - タスク完了としてマーク
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRegistrationStore } from '../store/registrationStore'
import { BirthdaySliderInput } from '../components/register/birthday/BirthdaySliderInput'

const RegisterBirthdayPage = () => {
    const navigate = useNavigate()
    const { formData, completeTask } = useRegistrationStore()

    // 日付選択時のハンドラ
    const handleDateChange = useCallback(
        (date: string) => {
            // フォームデータを更新してタスクを完了
            completeTask('birthday', { birthday: date })
        },
        [completeTask]
    )

    // 戻るボタン（ダッシュボードへ）
    const handleBack = useCallback(() => {
        navigate('/register')
    }, [navigate])

    return (
        <div
            data-testid="register-birthday-page"
            className="min-h-screen bg-gray-900 text-white py-8 px-4"
        >
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">生年月日入力</h1>

                {/* スライダー入力 */}
                <BirthdaySliderInput
                    value={formData.birthday}
                    onChange={handleDateChange}
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

export default RegisterBirthdayPage
