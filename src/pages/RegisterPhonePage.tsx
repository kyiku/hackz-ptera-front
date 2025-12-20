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

    return (
        <div
            data-testid="register-phone-page"
            className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-gray-900 flex flex-col items-center justify-center p-4"
        >
            {/* ヘッダー */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-amber-100 mb-2">
                    📞 電話番号を入力
                </h1>
                <p className="text-amber-200/70 text-sm">
                    懐かしの黒電話で番号をダイヤルしてください
                </p>
            </div>

            {/* 電話番号表示エリア */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-amber-800/50 p-6 mb-8 min-w-80">
                <p className="text-amber-200/60 text-xs mb-2 text-center">入力中の電話番号</p>
                <div className="text-center">
                    <span
                        className="font-mono text-4xl font-bold tracking-wider"
                        style={{
                            background: 'linear-gradient(180deg, #fef3c7 0%, #fbbf24 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        {formatWithMask(phoneDigits)}
                    </span>
                </div>
                <p className="text-amber-200/40 text-xs mt-2 text-center">
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
                    className={`px-6 py-3 rounded-lg font-bold transition-all ${phoneDigits.length === 0
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                >
                    ← 1桁削除
                </button>
                <button
                    onClick={handleClear}
                    disabled={phoneDigits.length === 0}
                    className={`px-6 py-3 rounded-lg font-bold transition-all ${phoneDigits.length === 0
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-red-800 hover:bg-red-700 text-white'
                        }`}
                >
                    全削除
                </button>
                <button
                    onClick={handleComplete}
                    disabled={!isComplete}
                    className={`px-8 py-3 rounded-lg font-bold transition-all ${isComplete
                        ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/30'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    完了 ✓
                </button>
            </div>

            {/* 完了メッセージ */}
            {isComplete && (
                <div className="mt-6 text-green-400 text-lg animate-pulse">
                    🎉 11桁入力完了！「完了」ボタンを押してください
                </div>
            )}

            {/* レトロ装飾 */}
            <div className="mt-8 text-amber-200/30 text-xs text-center">
                ※ 正しい黒電話の使い方: 数字の穴に指を入れ、ストッパーまで回し、指を離す
            </div>
        </div>
    )
}

export default RegisterPhonePage
