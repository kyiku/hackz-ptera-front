/**
 * RegisterTermsPage - 利用規約ページ
 * Issue #35: 利用規約 - 音声認識読み上げ・検証
 *
 * 機能:
 * - 利用規約テキストを表示
 * - 音声認識で読み上げを検証
 * - 検証成功時にタスク完了としてマーク
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRegistrationStore } from '../store/registrationStore'
import { VoiceRecognitionTerms } from '../components/register/terms/VoiceRecognitionTerms'

/**
 * 利用規約テキスト
 */
const TERMS_TEXT = `利用規約

本サービスを利用するにあたり、以下の利用規約に同意していただく必要があります。

1. サービス利用
本サービスは、ユーザーが提供する情報に基づいて動作します。

2. 個人情報の取り扱い
ユーザーの個人情報は、適切に管理されます。

3. 禁止事項
以下の行為を禁止します：
- 不正なアクセス
- サービスの妨害
- その他、法令に違反する行為

4. 免責事項
本サービスの利用により生じた損害について、当社は一切の責任を負いません。

5. 規約の変更
本規約は、予告なく変更される場合があります。

以上、利用規約に同意の上、サービスをご利用ください。`

const RegisterTermsPage = () => {
    const navigate = useNavigate()
    const { completeTask } = useRegistrationStore()

    // 検証成功時のハンドラ
    const handleVerified = useCallback(() => {
        // タスクを完了としてマーク
        completeTask('terms', { termsAccepted: true })
    }, [completeTask])

    // 戻るボタン（ダッシュボードへ）
    const handleBack = useCallback(() => {
        navigate('/register')
    }, [navigate])

    return (
        <div
            data-testid="register-terms-page"
            className="min-h-screen bg-white text-gray-800 py-8 px-4"
        >
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-light text-center mb-8">利用規約</h1>

                {/* 音声認識読み上げ */}
                <VoiceRecognitionTerms
                    termsText={TERMS_TEXT}
                    onVerified={handleVerified}
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

export default RegisterTermsPage
