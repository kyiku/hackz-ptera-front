/**
 * RegisterPasswordPage - パスワード入力ページ
 * Issue #21: AIパスワード煽り機能
 *
 * 機能:
 * - パスワード入力
 * - Bedrockでリアルタイム解析
 * - 解析結果を表示＆読み上げ
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRegistrationStore } from '../store/registrationStore'
import { PasswordTaunt } from '../components/register/PasswordTaunt'

const RegisterPasswordPage = () => {
    const navigate = useNavigate()
    const { completeTask } = useRegistrationStore()
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    // パスワード確定時のハンドラ
    const handleSubmit = useCallback(() => {
        if (password.length >= 8) {
            completeTask('password', { password })
            navigate('/register')
        }
    }, [password, completeTask, navigate])

    // 戻るボタン
    const handleBack = useCallback(() => {
        navigate('/register')
    }, [navigate])

    const isValid = password.length >= 8

    return (
        <div
            data-testid="register-password-page"
            className="min-h-screen bg-white text-gray-800 py-8 px-4"
        >
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-light text-center mb-8">パスワード入力</h1>

                <div className="mb-6">
                    <p className="text-gray-600 mb-4 text-center">
                        AIがあなたのパスワードをリアルタイムで解析＆読み上げます
                    </p>

                    {/* パスワード入力フィールド */}
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="パスワードを入力..."
                            className="w-full px-4 py-4 text-xl border-2 border-gray-300 rounded-lg focus:border-gray-800 focus:outline-none transition-colors"
                            data-testid="password-input"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>

                    {/* 文字数表示 */}
                    <div className="flex justify-between mt-2 text-sm">
                        <span className={password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                            {password.length >= 8 ? '✓ 8文字以上' : `${password.length}/8文字以上必要`}
                        </span>
                        <span className="text-gray-400">
                            {password.length}文字
                        </span>
                    </div>
                </div>

                {/* AI煽りメッセージ（読み上げ付き） */}
                <PasswordTaunt
                    password={password}
                    debounceMs={1000}
                    enableSpeech={true}
                />

                {/* 操作ボタン */}
                <div className="flex flex-col gap-4 mt-8">
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid}
                        className={`
                            w-full px-8 py-4 text-lg rounded-lg transition-colors
                            ${isValid
                                ? 'bg-gray-800 text-white hover:bg-gray-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }
                        `}
                        data-testid="submit-button"
                        type="button"
                    >
                        このパスワードで確定
                    </button>

                    <button
                        onClick={handleBack}
                        className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        data-testid="back-to-dashboard-button"
                        type="button"
                    >
                        ダッシュボードに戻る
                    </button>
                </div>

                {/* 注意書き */}
                <p className="text-center text-gray-400 text-sm mt-8">
                    ※ AIの解析結果は参考程度にしてください
                </p>
            </div>
        </div>
    )
}

export default RegisterPasswordPage
