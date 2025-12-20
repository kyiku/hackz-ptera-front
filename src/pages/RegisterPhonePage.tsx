/**
 * RegisterPhonePage - 黒電話ダイヤルによる電話番号入力ページ
 * Issue #33: 電話番号入力UI（黒電話ダイヤル）
 *
 * レトロな黒電話UIで電話番号を1桁ずつ入力
 */
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotaryDial } from '../components/register/phone/RotaryDial'
import { useRegistrationStore } from '../store/registrationStore'

// 電話番号のフォーマット（例: 090-1234-5678）
function formatPhoneNumber(digits: string): string {
    if (digits.length <= 3) {
        return digits
    } else if (digits.length <= 7) {
        return `${digits.slice(0, 3)}-${digits.slice(3)}`
    } else {
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
    }
}

// 表示用のマスク（入力中の桁を*で表示）
function formatWithMask(digits: string): string {
    const masked = digits.padEnd(11, '*')
    return `${masked.slice(0, 3)}-${masked.slice(3, 7)}-${masked.slice(7)}`
}

export function RegisterPhonePage() {
    const navigate = useNavigate()
    const completeTask = useRegistrationStore((state) => state.completeTask)

    const [phoneDigits, setPhoneDigits] = useState('')
    const [isComplete, setIsComplete] = useState(false)

    // 数字入力ハンドラ
    const handleDigitComplete = useCallback((digit: string) => {
        if (phoneDigits.length >= 11) return

        const newDigits = phoneDigits + digit
        setPhoneDigits(newDigits)

        if (newDigits.length === 11) {
            setIsComplete(true)
        }
    }, [phoneDigits])

    // 1桁削除
    const handleBackspace = useCallback(() => {
        if (phoneDigits.length > 0) {
            setPhoneDigits(phoneDigits.slice(0, -1))
            setIsComplete(false)
        }
    }, [phoneDigits])

    // 全削除
    const handleClear = useCallback(() => {
        setPhoneDigits('')
        setIsComplete(false)
    }, [])

    // 完了
    const handleComplete = useCallback(() => {
        if (phoneDigits.length === 11) {
            completeTask('phone', { phone: formatPhoneNumber(phoneDigits) })
            navigate('/register')
        }
    }, [phoneDigits, completeTask, navigate])

    // 戻る
    const handleBack = useCallback(() => {
        navigate('/register')
    }, [navigate])

    return (
        <div
            data-testid="register-phone-page"
            className="min-h-screen bg-white flex flex-col items-center justify-center p-4"
        >
            {/* ヘッダー */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-light text-gray-800 mb-2">
                    電話番号入力
                </h1>
                <p className="text-gray-500 text-sm">
                    ダイヤルを回して番号を入力してください
                </p>
            </div>

            {/* 電話番号表示エリア */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 mb-8 min-w-80">
                <p className="text-gray-500 text-xs mb-2 text-center">入力中の電話番号</p>
                <div className="text-center">
                    <span className="font-mono text-4xl font-bold tracking-wider text-gray-800">
                        {formatWithMask(phoneDigits)}
                    </span>
                </div>
                <p className="text-gray-400 text-xs mt-2 text-center">
                    {phoneDigits.length} / 11 桁入力済み
                </p>
            </div>

            {/* 黒電話ダイヤル */}
            <RotaryDial
                onDigitComplete={handleDigitComplete}
                disabled={isComplete}
            />

            {/* コントロールボタン */}
            <div className="flex gap-4 mt-8">
                <button
                    onClick={handleBackspace}
                    disabled={phoneDigits.length === 0}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        phoneDigits.length === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                >
                    ← 1桁削除
                </button>
                <button
                    onClick={handleClear}
                    disabled={phoneDigits.length === 0}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        phoneDigits.length === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                >
                    全削除
                </button>
                <button
                    onClick={handleComplete}
                    disabled={!isComplete}
                    className={`px-8 py-3 rounded-lg font-medium transition-all ${
                        isComplete
                            ? 'bg-gray-800 hover:bg-gray-700 text-white'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    完了
                </button>
            </div>

            {/* 完了メッセージ */}
            {isComplete && (
                <div className="mt-6 text-green-600 text-lg">
                    11桁入力完了！「完了」ボタンを押してください
                </div>
            )}

            {/* 戻るボタン */}
            <div className="mt-8">
                <button
                    data-testid="back-to-dashboard-button"
                    onClick={handleBack}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                    ダッシュボードに戻る
                </button>
            </div>
        </div>
    )
}

export default RegisterPhonePage
