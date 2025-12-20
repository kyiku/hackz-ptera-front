/**
 * SlotMachineInput - パチンコ屋風スロットマシン名前入力コンポーネント
 * Issue #31: 名前入力 - スロットマシンUI
 * 
 * 機能:
 * - あ〜Z（ひらがな・カタカナ・アルファベット）がスロットで回転
 * - シンプルなパチンコ屋風デザイン
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
 * パチンコ屋風スロットマシン名前入力コンポーネント
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
    const reelRefs = useRef<(HTMLDivElement | null)[]>(Array(maxLength).fill(null))

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
            }, 50) // 50msごとに回転
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
        },
        [disabled, slotStates, slots, onChange]
    )

    // レバーを引いてすべてのスロットを同時に回転
    const handleLeverPull = useCallback(() => {
        if (disabled) return

        // すべてのスロットを同時に回転開始
        for (let i = 0; i < maxLength; i++) {
            startSpinning(i)
        }
    }, [disabled, maxLength, startSpinning])

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
    }, [disabled, maxLength, onChange])

    // 現在の名前を表示
    const currentName = slots.join('').trim()

    return (
        <div className={`${className}`} data-testid="slot-machine-input">
            {/* シンプルな背景 */}
            <div className="bg-gray-800 border-4 border-gray-600 rounded-lg p-8 mb-6">
                <div className="flex items-center justify-center gap-6">
                    {/* 左側のレバー */}
                    <div className="flex flex-col items-center">
                        <button
                            data-testid="lever-button"
                            onClick={handleLeverPull}
                            disabled={disabled || slotStates.some(state => state === 'spinning')}
                            className={`
                                relative w-14 h-40 bg-gray-700
                                border-2 border-gray-900 rounded
                                transition-all duration-150 focus:outline-none
                                ${disabled || slotStates.some(state => state === 'spinning')
                                    ? 'opacity-40 cursor-not-allowed'
                                    : 'cursor-pointer hover:bg-gray-600 active:translate-y-1 active:bg-gray-500'
                                }
                            `}
                            type="button"
                        >
                            {/* レバーの握り部分 */}
                            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-red-700 rounded-full border-2 border-red-900" />
                            {/* レバーのテキスト */}
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white font-bold text-xs rotate-90 whitespace-nowrap">
                                PULL
                            </div>
                        </button>
                        <p className="mt-2 text-white text-sm font-bold">レバー</p>
                    </div>

                    {/* スロットエリア */}
                    <div className="flex-1">
                        {/* スロットリール */}
                        <div className="flex justify-center gap-3">
                            {slots.map((char, index) => {
                                const isSpinning = slotStates[index] === 'spinning'
                                const isStopped = slotStates[index] === 'stopped' && char
                                
                                return (
                                    <div
                                        key={index}
                                        className="flex flex-col items-center"
                                        data-testid={`slot-${index}`}
                                    >
                                        {/* リールの外枠 */}
                                        <div
                                            className={`
                                                relative w-24 h-36 bg-black
                                                border-4 rounded overflow-hidden
                                                ${isSpinning 
                                                    ? 'border-white' 
                                                    : isStopped 
                                                        ? 'border-white' 
                                                        : 'border-gray-600'
                                                }
                                            `}
                                        >
                                            {/* リールの中身 */}
                                            <div
                                                ref={(el) => { reelRefs.current[index] = el }}
                                                className={`
                                                    absolute inset-0 flex items-center justify-center
                                                    ${isSpinning ? 'reel-spinning' : ''}
                                                `}
                                            >
                                                {/* 表示文字 */}
                                                <div
                                                    className={`
                                                        text-5xl font-bold
                                                        ${isSpinning || isStopped
                                                            ? 'text-white' 
                                                            : 'text-gray-600'
                                                        }
                                                    `}
                                                >
                                                    {char || '?'}
                                                </div>
                                            </div>

                                            {/* 上部のマスク（リール効果） */}
                                            <div className="absolute top-0 left-0 right-0 h-6 bg-black z-10 pointer-events-none" />
                                            {/* 下部のマスク（リール効果） */}
                                            <div className="absolute bottom-0 left-0 right-0 h-6 bg-black z-10 pointer-events-none" />
                                            
                                            {/* 中央のガイドライン */}
                                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white opacity-50 transform -translate-y-1/2 z-10 pointer-events-none" />
                                        </div>

                                        {/* ストップボタン */}
                                        <button
                                            data-testid={`stop-button-${index}`}
                                            onClick={() => stopSpinning(index)}
                                            disabled={disabled || !isSpinning}
                                            className={`
                                                mt-3 px-6 py-2 rounded font-bold text-base
                                                transition-all duration-150 focus:outline-none
                                                ${isSpinning
                                                    ? 'bg-red-700 hover:bg-red-800 text-white cursor-pointer border-2 border-red-900'
                                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed border-2 border-gray-700'
                                                }
                                                ${disabled ? 'opacity-50' : ''}
                                            `}
                                            type="button"
                                        >
                                            STOP
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* 入力された名前の表示 */}
            <div className="text-center mb-6">
                <div className="inline-block px-8 py-3 bg-black border-2 border-white rounded">
                    <p className="text-2xl font-bold text-white">
                        {currentName || '---'}
                    </p>
                </div>
            </div>

            {/* 操作説明 */}
            <div className="text-center mb-4">
                <p className="text-gray-400 text-sm">
                    レバーを引くと3つのスロットが同時に回転します。STOPボタンで文字を確定してください
                </p>
            </div>

            {/* リセットボタン */}
            <div className="text-center">
                <button
                    data-testid="reset-button"
                    onClick={handleReset}
                    disabled={disabled}
                    className={`
                        px-8 py-2 bg-gray-600 hover:bg-gray-700
                        text-white rounded font-bold
                        transition-colors duration-150 focus:outline-none
                        border-2 border-gray-700
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
