/**
 * SlotMachineInput - スロットマシン風名前入力コンポーネント
 * Issue #31: 名前入力 - スロットマシンUI
 * 
 * 機能:
 * - あ〜Z（ひらがな・カタカナ・アルファベット）がスロットで回転
 * - ユーザーがストップして文字を選択
 * - 複数のスロットで名前を入力
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface SlotMachineInputProps {
    /** 入力された名前 */
    value: string
    /** 名前変更時のコールバック */
    onChange: (name: string) => void
    /** 最大文字数 */
    maxLength?: number
    /** 無効化されているか */
    disabled?: boolean
    /** カスタムクラス名 */
    className?: string
}

/**
 * 使用可能な文字（あ〜Z）
 */
const CHARACTERS = [
    // ひらがな
    'あ', 'い', 'う', 'え', 'お',
    'か', 'き', 'く', 'け', 'こ',
    'さ', 'し', 'す', 'せ', 'そ',
    'た', 'ち', 'つ', 'て', 'と',
    'な', 'に', 'ぬ', 'ね', 'の',
    'は', 'ひ', 'ふ', 'へ', 'ほ',
    'ま', 'み', 'む', 'め', 'も',
    'や', 'ゆ', 'よ',
    'ら', 'り', 'る', 'れ', 'ろ',
    'わ', 'を', 'ん',
    // カタカナ
    'ア', 'イ', 'ウ', 'エ', 'オ',
    'カ', 'キ', 'ク', 'ケ', 'コ',
    'サ', 'シ', 'ス', 'セ', 'ソ',
    'タ', 'チ', 'ツ', 'テ', 'ト',
    'ナ', 'ニ', 'ヌ', 'ネ', 'ノ',
    'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
    'マ', 'ミ', 'ム', 'メ', 'モ',
    'ヤ', 'ユ', 'ヨ',
    'ラ', 'リ', 'ル', 'レ', 'ロ',
    'ワ', 'ヲ', 'ン',
    // アルファベット（大文字）
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z',
    // アルファベット（小文字）
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
    'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z',
]

/**
 * スロットの状態
 */
type SlotState = 'spinning' | 'stopped'

/**
 * スロットマシン風名前入力コンポーネント
 */
export const SlotMachineInput = ({
    value: _value, // 将来の機能で使用予定（初期値の復元など）
    onChange,
    maxLength = 10,
    disabled = false,
    className = '',
}: SlotMachineInputProps) => {
    // valueは将来の機能で使用予定のため、現時点では未使用
    void _value
    const [slots, setSlots] = useState<string[]>(() => {
        // 初期値: 空文字列の配列
        return Array(maxLength).fill('')
    })
    const [slotStates, setSlotStates] = useState<SlotState[]>(() => {
        return Array(maxLength).fill('stopped' as SlotState)
    })
    const intervalRefs = useRef<(number | undefined)[]>(Array(maxLength).fill(undefined))
    const currentCharIndices = useRef<number[]>(Array(maxLength).fill(0))

    // スロットを回転
    const startSpinning = useCallback(
        (slotIndex: number) => {
            if (disabled || slotStates[slotIndex] === 'spinning') return

            setSlotStates((prev) => {
                const newStates = [...prev]
                newStates[slotIndex] = 'spinning'
                return newStates
            })

            // 既存のインターバルをクリア
            if (intervalRefs.current[slotIndex]) {
                clearInterval(intervalRefs.current[slotIndex])
            }

            // 新しいインターバルを開始
            intervalRefs.current[slotIndex] = window.setInterval(() => {
                currentCharIndices.current[slotIndex] =
                    (currentCharIndices.current[slotIndex] + 1) % CHARACTERS.length

                setSlots((prev) => {
                    const newSlots = [...prev]
                    newSlots[slotIndex] = CHARACTERS[currentCharIndices.current[slotIndex]]
                    return newSlots
                })
            }, 100) // 100msごとに回転
        },
        [disabled, slotStates]
    )

    // スロットを停止
    const stopSpinning = useCallback(
        (slotIndex: number) => {
            if (disabled || slotStates[slotIndex] !== 'spinning') return

            // インターバルをクリア
            if (intervalRefs.current[slotIndex]) {
                clearInterval(intervalRefs.current[slotIndex])
                intervalRefs.current[slotIndex] = undefined
            }

            setSlotStates((prev) => {
                const newStates = [...prev]
                newStates[slotIndex] = 'stopped'
                return newStates
            })

            // 現在の文字を確定
            const selectedChar = CHARACTERS[currentCharIndices.current[slotIndex]]
            setSlots((prev) => {
                const newSlots = [...prev]
                newSlots[slotIndex] = selectedChar
                return newSlots
            })

            // 名前を更新
            const newName = slots
                .map((char, idx) => (idx === slotIndex ? selectedChar : char))
                .join('')
            onChange(newName)

            // 次のスロットを開始（まだ入力可能な場合）
            if (slotIndex < maxLength - 1) {
                setTimeout(() => {
                    startSpinning(slotIndex + 1)
                }, 200)
            }
        },
        [disabled, slotStates, slots, maxLength, onChange, startSpinning]
    )

    // 初期化: 最初のスロットを開始
    useEffect(() => {
        if (!disabled && slots[0] === '') {
            // setTimeoutで非同期に実行してsetStateの警告を回避
            const timer = setTimeout(() => {
                startSpinning(0)
            }, 0)
            return () => clearTimeout(timer)
        }
    }, [disabled, slots, startSpinning])

    // クリーンアップ
    useEffect(() => {
        const intervals = intervalRefs.current
        return () => {
            intervals.forEach((interval) => {
                if (interval) {
                    clearInterval(interval)
                }
            })
        }
    }, [])

    // リセット
    const handleReset = useCallback(() => {
        if (disabled) return

        // すべてのインターバルをクリア
        intervalRefs.current.forEach((interval) => {
            if (interval) {
                clearInterval(interval)
            }
        })

        setSlots(Array(maxLength).fill(''))
        setSlotStates(Array(maxLength).fill('stopped'))
        currentCharIndices.current = Array(maxLength).fill(0)
        onChange('')

        // 最初のスロットを開始
        setTimeout(() => {
            startSpinning(0)
        }, 100)
    }, [disabled, maxLength, onChange, startSpinning])

    // 現在の名前を表示
    const currentName = slots.join('').trim()

    return (
        <div className={`${className}`} data-testid="slot-machine-input">
            {/* 入力された名前の表示 */}
            <div className="text-center mb-6">
                <p className="text-2xl font-bold text-white mb-2">入力された名前</p>
                <p className="text-3xl text-blue-400 min-h-[3rem]">
                    {currentName || <span className="text-gray-500">（未入力）</span>}
                </p>
            </div>

            {/* スロットマシン */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <div className="flex justify-center gap-4 flex-wrap">
                    {slots.map((char, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center"
                            data-testid={`slot-${index}`}
                        >
                            {/* スロット表示 */}
                            <div
                                className={`
                                    w-20 h-24 bg-gray-900 border-2 rounded-lg
                                    flex items-center justify-center
                                    text-4xl font-bold text-white
                                    ${slotStates[index] === 'spinning' ? 'border-yellow-500 animate-pulse' : 'border-gray-600'}
                                    ${disabled ? 'opacity-50' : ''}
                                `}
                            >
                                {char || '?'}
                            </div>

                            {/* ストップボタン */}
                            <button
                                data-testid={`stop-button-${index}`}
                                onClick={() => stopSpinning(index)}
                                disabled={disabled || slotStates[index] !== 'spinning'}
                                className={`
                                    mt-2 px-4 py-2 rounded-lg font-bold text-sm
                                    transition-colors focus:outline-none focus:ring-2 focus:ring-red-500
                                    ${slotStates[index] === 'spinning'
                                        ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }
                                    ${disabled ? 'opacity-50' : ''}
                                `}
                                type="button"
                            >
                                ストップ
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* 操作説明 */}
            <div className="text-center text-sm text-gray-400 mb-4">
                <p>各スロットが回転します。ストップボタンで文字を確定してください。</p>
            </div>

            {/* リセットボタン */}
            <div className="text-center">
                <button
                    data-testid="reset-button"
                    onClick={handleReset}
                    disabled={disabled}
                    className={`
                        px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg
                        transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    type="button"
                >
                    リセット
                </button>
            </div>
        </div>
    )
}

export default SlotMachineInput

