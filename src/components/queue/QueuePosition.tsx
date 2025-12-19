/**
 * QueuePosition - 待機順位表示コンポーネント
 * 
 * 待機列の順位をリアルタイム表示し、数値変化時にアニメーションを行う
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
        if (prevPositionRef.current !== position) {
            if (position < prevPositionRef.current) {
                // 順位が上がった（数字が減った）= ハイライト
                setAnimationClass('animate-pulse text-green-400')
            } else {
                // 順位が下がった（数字が増えた）= 警告
                setAnimationClass('animate-bounce text-red-400')
            }

            prevPositionRef.current = position

            // アニメーションをリセット
            const timer = setTimeout(() => {
                setAnimationClass('')
            }, 1000)

            return () => clearTimeout(timer)
        }
    }, [position])

    // プログレス計算（0〜100%）
    const progress = totalWaiting > 0
        ? Math.max(0, Math.min(100, ((totalWaiting - position + 1) / totalWaiting) * 100))
        : 0

    // 順位が1の場合は特別表示
    const isNext = position === 1

    return (
        <div
            data-testid="queue-position"
            className="space-y-4"
        >
            {/* 合計人数表示 */}
            <div className="text-center">
                <span className="text-gray-400 text-sm">現在</span>
                <span className="text-white text-2xl font-bold mx-2">{totalWaiting}</span>
                <span className="text-gray-400 text-sm">人待ち</span>
            </div>

            {/* 現在の順位表示 */}
            <div className="text-center">
                <span className="text-gray-400 text-sm">あなたは</span>
                <span
                    className={`text-5xl font-bold mx-2 transition-colors duration-300 ${animationClass || (isNext ? 'text-green-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400')
                        }`}
                >
                    {position}
                </span>
                <span className="text-gray-400 text-sm">番目です</span>
            </div>

            {/* 順位が1の場合の特別メッセージ */}
            {isNext && (
                <div className="text-center animate-pulse">
                    <span className="text-green-400 font-bold text-lg">
                        🎉 まもなくあなたの番です！
                    </span>
                </div>
            )}

            {/* プログレスバー */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                    <span>待機進捗</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
