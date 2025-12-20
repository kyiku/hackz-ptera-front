/**
 * EmailMorseInput - メールアドレス入力（モールス信号）
 * Issue #38: メールアドレス入力 - 瞬きモールス信号UI
 * 
 * 機能:
 * - モールス信号でメールアドレスを入力
 * - キーボード入力版（カメラ版は今後実装）
 * - モールス信号ヘルプ表示
 */

import React, { useState } from 'react'
import { MorseDecoder } from './MorseDecoder'

export interface EmailMorseInputProps {
    /** 入力完了時のコールバック */
    onSubmit?: (email: string) => void
    /** 初期値 */
    defaultValue?: string
}

export const EmailMorseInput: React.FC<EmailMorseInputProps> = ({
    onSubmit,
    defaultValue = '',
}) => {
    const [currentMorse, setCurrentMorse] = useState('')
    const [email, setEmail] = useState(defaultValue)
    const [showHelp, setShowHelp] = useState(false)

    const handleDot = () => {
        setCurrentMorse((prev) => prev + '.')
    }

    const handleDash = () => {
        setCurrentMorse((prev) => prev + '-')
    }

    const handleSpace = () => {
        if (currentMorse) {
            const char = MorseDecoder.decode(currentMorse)
            if (char) {
                setEmail((prev) => prev + char)
            }
            setCurrentMorse('')
        }
    }

    const handleBackspace = () => {
        if (currentMorse) {
            setCurrentMorse((prev) => prev.slice(0, -1))
        } else {
            setEmail((prev) => prev.slice(0, -1))
        }
    }

    const handleSubmit = () => {
        if (onSubmit && email) {
            onSubmit(email)
        }
    }

    const handleClear = () => {
        setCurrentMorse('')
        setEmail('')
    }

    return (
        <div className="max-w-2xl mx-auto p-6" data-testid="email-morse-input">
            <h2 className="text-2xl font-bold mb-4">メールアドレス入力</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                モールス信号でメールアドレスを入力してください
            </p>

            {/* 入力中のモールス信号 */}
            <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    入力中のモールス信号:
                </div>
                <div
                    className="text-2xl font-mono min-h-[40px]"
                    data-testid="current-morse"
                >
                    {currentMorse || <span className="text-gray-400">（なし）</span>}
                </div>
            </div>

            {/* 変換結果 */}
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    入力結果:
                </div>
                <div
                    className="text-xl font-mono min-h-[32px]"
                    data-testid="email-result"
                >
                    {email || <span className="text-gray-400">（なし）</span>}
                </div>
            </div>

            {/* 入力ボタン */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                    onClick={handleDot}
                    className="px-6 py-4 bg-blue-500 text-white rounded hover:bg-blue-600 text-xl font-bold"
                    data-testid="dot-button"
                >
                    ・（ドット）
                </button>
                <button
                    onClick={handleDash}
                    className="px-6 py-4 bg-blue-500 text-white rounded hover:bg-blue-600 text-xl font-bold"
                    data-testid="dash-button"
                >
                    −（ダッシュ）
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                    onClick={handleSpace}
                    className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
                    data-testid="space-button"
                >
                    文字確定（スペース）
                </button>
                <button
                    onClick={handleBackspace}
                    className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600"
                    data-testid="backspace-button"
                >
                    削除
                </button>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    data-testid="help-button"
                >
                    {showHelp ? 'ヘルプを閉じる' : 'モールス表を見る'}
                </button>
                <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    data-testid="clear-button"
                >
                    クリア
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!email}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    data-testid="submit-button"
                >
                    確定する
                </button>
            </div>

            {/* モールス信号ヘルプ */}
            {showHelp && (
                <div
                    className="p-4 bg-gray-100 dark:bg-gray-800 rounded"
                    data-testid="morse-help"
                >
                    <h3 className="font-bold mb-2">モールス信号対応表</h3>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>a: ・−</div>
                        <div>b: −・・・</div>
                        <div>c: −・−・</div>
                        <div>d: −・・</div>
                        <div>e: ・</div>
                        <div>f: ・・−・</div>
                        <div>g: −−・</div>
                        <div>h: ・・・・</div>
                        <div>i: ・・</div>
                        <div>j: ・−−−</div>
                        <div>k: −・−</div>
                        <div>l: ・−・・</div>
                        <div>m: −−</div>
                        <div>n: −・</div>
                        <div>o: −−−</div>
                        <div>p: ・−−・</div>
                        <div>q: −−・−</div>
                        <div>r: ・−・</div>
                        <div>s: ・・・</div>
                        <div>t: −</div>
                        <div>u: ・・−</div>
                        <div>v: ・・・−</div>
                        <div>w: ・−−</div>
                        <div>x: −・・−</div>
                        <div>y: −・−−</div>
                        <div>z: −−・・</div>
                        <div>@: ・−−・−・</div>
                        <div>.: ・−・−・−</div>
                        <div>0-9: 標準</div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EmailMorseInput
