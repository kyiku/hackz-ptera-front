/**
 * BirthdaySliderInput - 生年月日スライダー入力コンポーネント
 *
 * 1つのスライダーで1年1月1日〜2025年12月21日の全日付を選択
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { generateDates } from './generateDates'

export interface BirthdaySliderInputProps {
    /** 選択された日付（YYYY-MM-DD形式） */
    value: string | null
    /** 日付選択時のコールバック */
    onChange: (date: string) => void
    /** 無効化されているか */
    disabled?: boolean
    /** カスタムクラス名 */
    className?: string
}

/**
 * 日付をフォーマット（表示用）
 */
function formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-')
    return `${parseInt(year, 10)}年${parseInt(month, 10)}月${parseInt(day, 10)}日`
}

/**
 * 生年月日スライダー入力コンポーネント
 */
export const BirthdaySliderInput = ({
    value,
    onChange,
    disabled = false,
    className = '',
}: BirthdaySliderInputProps) => {
    // 全日付リストを生成
    const dates = useMemo(() => generateDates(), [])

    // 初期インデックスを計算
    const initialIndex = useMemo(() => {
        if (value) {
            const idx = dates.indexOf(value)
            if (idx >= 0) return idx
        }
        // デフォルト: 2000年1月1日付近
        const defaultDate = '2000-01-01'
        const idx = dates.indexOf(defaultDate)
        return idx >= 0 ? idx : Math.floor(dates.length / 2)
    }, [value, dates])

    const [sliderValue, setSliderValue] = useState(initialIndex)

    // 選択中の日付
    const selectedDate = dates[sliderValue] || dates[0]

    // スライダー変更時
    const handleSliderChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (disabled) return
            const newIndex = Number(e.target.value)
            setSliderValue(newIndex)
            onChange(dates[newIndex])
        },
        [disabled, dates, onChange]
    )

    // 初回マウント時に値を通知
    useEffect(() => {
        if (!value && dates.length > 0) {
            onChange(dates[sliderValue])
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className={`space-y-8 ${className}`} data-testid="birthday-slider-input">
            {/* 選択された日付の表示 */}
            <div className="text-center">
                <p className="text-5xl font-bold text-gray-800 mb-4">
                    {formatDate(selectedDate)}
                </p>
                <p className="text-gray-500 text-sm">
                    スライダーを動かして生年月日を選択
                </p>
            </div>

            {/* 単一スライダー */}
            <div className="space-y-4 px-4">
                <input
                    type="range"
                    min={0}
                    max={dates.length - 1}
                    value={sliderValue}
                    onChange={handleSliderChange}
                    disabled={disabled}
                    className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-8
                        [&::-webkit-slider-thumb]:h-8
                        [&::-webkit-slider-thumb]:bg-blue-500
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:hover:bg-blue-400
                        [&::-webkit-slider-thumb]:transition-colors
                        [&::-moz-range-thumb]:w-8
                        [&::-moz-range-thumb]:h-8
                        [&::-moz-range-thumb]:bg-blue-500
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:border-0
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="birthday-slider"
                />
                <div className="flex justify-between text-sm text-gray-500">
                    <span>1年1月1日</span>
                    <span>2025年12月21日</span>
                </div>
            </div>

            {/* 進捗表示 */}
            <div className="text-center text-gray-500 text-xs">
                {sliderValue + 1} / {dates.length} 日目
            </div>
        </div>
    )
}

export default BirthdaySliderInput
