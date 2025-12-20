/**
 * QueuePosition - 待機順位表示コンポーネント
 */
import { useState, useEffect, useRef } from 'react'

interface QueuePositionProps {
    /** 現在の順位 */
    position: number
    /** 合計待機人数 */
    totalWaiting: number
}

export function QueuePosition({ position, totalWaiting }: QueuePositionProps) {
    const [animationClass, setAnimationClass] = useState('')
    const prevPositionRef = useRef(position)

    // 順位変化時のアニメーション
    useEffect(() => {
        if (prevPositionRef.current === position) {
            return
        }

        const newClass = position < prevPositionRef.current
            ? 'animate-pulse text-emerald-600'
            : 'animate-bounce text-red-500'

        prevPositionRef.current = position

        const setTimer = setTimeout(() => {
            setAnimationClass(newClass)
        }, 0)

        const resetTimer = setTimeout(() => {
            setAnimationClass('')
        }, 1000)

        return () => {
            clearTimeout(setTimer)
            clearTimeout(resetTimer)
        }
    }, [position])

    // プログレス計算
    const progress = totalWaiting > 0
        ? Math.max(0, Math.min(100, ((totalWaiting - position + 1) / totalWaiting) * 100))
        : 0

    const isNext = position === 1

    return (
        <div
            data-testid="queue-position"
            className="space-y-6"
        >
            {/* 合計人数表示 */}
            <div className="text-center">
                <span className="text-stone-400 text-xs tracking-wide">現在</span>
                <span className="text-stone-800 text-2xl mx-2">{totalWaiting}</span>
                <span className="text-stone-400 text-xs tracking-wide">人待ち</span>
            </div>

            {/* 現在の順位表示 */}
            <div className="text-center">
                <span className="text-stone-400 text-xs tracking-wide">あなたは</span>
                <span
                    className={`text-5xl font-light mx-2 transition-colors duration-300 ${animationClass || (isNext ? 'text-emerald-600' : 'text-stone-800')
                        }`}
                >
                    {position}
                </span>
                <span className="text-stone-400 text-xs tracking-wide">番目</span>
            </div>

            {/* 順位が1の場合の特別メッセージ */}
            {isNext && (
                <div className="text-center">
                    <span className="text-emerald-600 text-sm">
                        まもなくあなたの番です
                    </span>
                </div>
            )}

            {/* プログレスバー */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-stone-400">
                    <span>待機進捗</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-stone-100 rounded-sm h-1 overflow-hidden">
                    <div
                        className="h-full bg-stone-400 rounded-sm transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
