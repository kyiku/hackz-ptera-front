/**
 * BirthdayScrollInput - 生年月日横スクロールバーコンポーネント
 * Issue #32: 生年月日入力 - 横スクロールバーUI
 * 
 * 機能:
 * - 1年1月1日 〜 2025年12月21日の範囲で日付を生成
 * - 横スクロールで日付を選択
 * - 選択した日付を表示
 * - 閏年は考慮しない（2月は常に28日まで）
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { generateDates } from './generateDates'

export interface BirthdayScrollInputProps {
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
    return `${year}年${parseInt(month, 10)}月${parseInt(day, 10)}日`
}

/**
 * 生年月日横スクロールバーコンポーネント
 */
export const BirthdayScrollInput = ({
    value,
    onChange,
    disabled = false,
    className = '',
}: BirthdayScrollInputProps) => {
    const dates = useMemo(() => generateDates(), [])
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    // 初期選択位置を設定
    useEffect(() => {
        if (value && scrollContainerRef.current) {
            const index = dates.indexOf(value)
            if (index >= 0) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                setSelectedIndex(index)
                // スクロール位置を設定
                const itemWidth = 200 // 各日付アイテムの幅（px）
                const scrollPosition = index * itemWidth - scrollContainerRef.current.clientWidth / 2 + itemWidth / 2
                scrollContainerRef.current.scrollTo({
                    left: Math.max(0, scrollPosition),
                    behavior: 'auto',
                })
            }
        }
    }, [value, dates])

    // スクロール位置から選択された日付を計算
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current || disabled) return

        const container = scrollContainerRef.current
        const scrollLeft = container.scrollLeft
        const itemWidth = 200 // 各日付アイテムの幅（px）
        const centerPosition = scrollLeft + container.clientWidth / 2
        const index = Math.round(centerPosition / itemWidth)
        const clampedIndex = Math.max(0, Math.min(index, dates.length - 1))

        if (clampedIndex !== selectedIndex) {
            setSelectedIndex(clampedIndex)
            onChange(dates[clampedIndex])
        }
    }, [onChange, disabled, selectedIndex, dates])

    // 日付アイテムをクリック
    const handleDateClick = useCallback(
        (index: number) => {
            if (disabled) return

            setSelectedIndex(index)
            onChange(dates[index])

            // クリックした日付を中央にスクロール
            if (scrollContainerRef.current) {
                const itemWidth = 200
                const scrollPosition = index * itemWidth - scrollContainerRef.current.clientWidth / 2 + itemWidth / 2
                scrollContainerRef.current.scrollTo({
                    left: Math.max(0, scrollPosition),
                    behavior: 'smooth',
                })
            }
        },
        [onChange, disabled, dates]
    )

    return (
        <div className={`${className}`}>
            {/* 選択された日付の表示 */}
            {value && (
                <div className="text-center mb-6">
                    <p className="text-2xl font-bold text-white">
                        {formatDate(value)}
                    </p>
                </div>
            )}

            {/* 横スクロールバー */}
            <div
                ref={scrollContainerRef}
                className="overflow-x-auto overflow-y-hidden"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#4B5563 #1F2937',
                }}
                onScroll={handleScroll}
                data-testid="birthday-scroll-container"
            >
                <div className="flex items-center h-32 px-4" style={{ width: `${dates.length * 200}px` }}>
                    {dates.map((date, index) => {
                        const isSelected = selectedIndex === index
                        const distance = selectedIndex !== null ? Math.abs(index - selectedIndex) : Infinity
                        const opacity = distance <= 2 ? 1 : Math.max(0.3, 1 - distance * 0.2)
                        const scale = isSelected ? 1.2 : Math.max(0.8, 1 - distance * 0.1)

                        return (
                            <button
                                key={date}
                                data-testid={`birthday-date-${index}`}
                                data-date={date}
                                onClick={() => handleDateClick(index)}
                                disabled={disabled}
                                className={`
                                    flex-shrink-0 w-48 h-24 mx-2 rounded-lg border-2 transition-all
                                    ${isSelected
                                        ? 'border-blue-500 bg-blue-500/20 scale-110'
                                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                    }
                                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    focus:outline-none focus:ring-2 focus:ring-blue-500
                                `}
                                style={{
                                    opacity,
                                    transform: `scale(${scale})`,
                                }}
                                type="button"
                            >
                                <div className="flex flex-col items-center justify-center h-full">
                                    <p className="text-sm text-gray-400">{formatDate(date)}</p>
                                    {isSelected && (
                                        <p className="text-xs text-blue-400 mt-1">選択中</p>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* スクロール指示 */}
            <p className="text-center text-sm text-gray-400 mt-4">
                横にスクロールして日付を選択してください
            </p>
        </div>
    )
}

export default BirthdayScrollInput

