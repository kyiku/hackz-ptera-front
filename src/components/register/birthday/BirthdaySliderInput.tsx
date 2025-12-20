/**
 * BirthdaySliderInput - 生年月日スライダー入力コンポーネント
 *
 * 年・月・日の3つのスライダーで生年月日を選択
 */

import { useState, useEffect, useCallback, useMemo } from 'react'

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

/** 月ごとの日数（閏年は考慮しない） */
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/** 年の範囲 */
const MIN_YEAR = 1900
const MAX_YEAR = new Date().getFullYear()

/**
 * 生年月日スライダー入力コンポーネント
 */
export const BirthdaySliderInput = ({
    value,
    onChange,
    disabled = false,
    className = '',
}: BirthdaySliderInputProps) => {
    // 初期値のパース
    const initialDate = useMemo(() => {
        if (value) {
            const [year, month, day] = value.split('-').map(Number)
            return { year, month, day }
        }
        return { year: 2000, month: 1, day: 1 }
    }, [value])

    const [year, setYear] = useState(initialDate.year)
    const [month, setMonth] = useState(initialDate.month)
    const [day, setDay] = useState(initialDate.day)

    // 選択した月の最大日数
    const maxDay = useMemo(() => DAYS_IN_MONTH[month - 1], [month])

    // 日が最大値を超えないように調整
    useEffect(() => {
        if (day > maxDay) {
            setDay(maxDay)
        }
    }, [day, maxDay])

    // 日付が変更されたらコールバックを呼び出す
    useEffect(() => {
        const dateString = `${year}-${String(month).padStart(2, '0')}-${String(Math.min(day, maxDay)).padStart(2, '0')}`
        onChange(dateString)
    }, [year, month, day, maxDay, onChange])

    // スライダー変更ハンドラ
    const handleYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!disabled) setYear(Number(e.target.value))
    }, [disabled])

    const handleMonthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!disabled) setMonth(Number(e.target.value))
    }, [disabled])

    const handleDayChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!disabled) setDay(Number(e.target.value))
    }, [disabled])

    return (
        <div className={`space-y-8 ${className}`} data-testid="birthday-slider-input">
            {/* 選択された日付の表示 */}
            <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">
                    {year}年 {month}月 {Math.min(day, maxDay)}日
                </p>
                <p className="text-gray-400 text-sm">
                    スライダーを動かして生年月日を選択
                </p>
            </div>

            {/* 年スライダー */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-gray-300 font-medium">年</label>
                    <span className="text-blue-400 font-bold text-xl">{year}年</span>
                </div>
                <input
                    type="range"
                    min={MIN_YEAR}
                    max={MAX_YEAR}
                    value={year}
                    onChange={handleYearChange}
                    disabled={disabled}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-6
                        [&::-webkit-slider-thumb]:h-6
                        [&::-webkit-slider-thumb]:bg-blue-500
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:hover:bg-blue-400
                        [&::-moz-range-thumb]:w-6
                        [&::-moz-range-thumb]:h-6
                        [&::-moz-range-thumb]:bg-blue-500
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:border-0
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="year-slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                    <span>{MIN_YEAR}</span>
                    <span>{MAX_YEAR}</span>
                </div>
            </div>

            {/* 月スライダー */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-gray-300 font-medium">月</label>
                    <span className="text-green-400 font-bold text-xl">{month}月</span>
                </div>
                <input
                    type="range"
                    min={1}
                    max={12}
                    value={month}
                    onChange={handleMonthChange}
                    disabled={disabled}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-6
                        [&::-webkit-slider-thumb]:h-6
                        [&::-webkit-slider-thumb]:bg-green-500
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:hover:bg-green-400
                        [&::-moz-range-thumb]:w-6
                        [&::-moz-range-thumb]:h-6
                        [&::-moz-range-thumb]:bg-green-500
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:border-0
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="month-slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                    <span>1月</span>
                    <span>12月</span>
                </div>
            </div>

            {/* 日スライダー */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-gray-300 font-medium">日</label>
                    <span className="text-purple-400 font-bold text-xl">{Math.min(day, maxDay)}日</span>
                </div>
                <input
                    type="range"
                    min={1}
                    max={maxDay}
                    value={Math.min(day, maxDay)}
                    onChange={handleDayChange}
                    disabled={disabled}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-6
                        [&::-webkit-slider-thumb]:h-6
                        [&::-webkit-slider-thumb]:bg-purple-500
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:hover:bg-purple-400
                        [&::-moz-range-thumb]:w-6
                        [&::-moz-range-thumb]:h-6
                        [&::-moz-range-thumb]:bg-purple-500
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:cursor-pointer
                        [&::-moz-range-thumb]:border-0
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="day-slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                    <span>1日</span>
                    <span>{maxDay}日</span>
                </div>
            </div>
        </div>
    )
}

export default BirthdaySliderInput
