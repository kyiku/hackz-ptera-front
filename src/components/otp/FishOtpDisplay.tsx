/**
 * FishOtpDisplay - 魚OTP画像表示コンポーネント
 * Issue #22: 魚OTP画像表示UI
 *
 * 魚画像を表示し、正しい順序で選択するUI
 * - 魚画像のグリッド表示
 * - 選択機能（順序通りに選択）
 * - アニメーション（ゆらゆら泳ぐ、選択時、間違い時）
 * - アクセシビリティ対応
 */
import { useState, useMemo } from 'react'

export interface FishImage {
    url: string
    name: string
    index: number
}

export interface FishOtpDisplayProps {
    /** 魚画像のURL配列 */
    fishImages: string[]
    /** 正しい順序（インデックスの配列） */
    correctOrder?: number[]
    /** 選択時のコールバック */
    onSelect?: (selectedIndices: number[]) => void
    /** 選択が無効化されているか */
    disabled?: boolean
    /** カスタムクラス名 */
    className?: string
}

/**
 * 配列をシャッフル（Fisher-Yatesアルゴリズム）
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

export const FishOtpDisplay = ({
    fishImages,
    correctOrder = [],
    onSelect,
    disabled = false,
    className = '',
}: FishOtpDisplayProps) => {
    // 魚の名前を生成（URLから推定、またはデフォルト名）
    const getFishName = (url: string, index: number): string => {
        // URLから魚の名前を抽出（例: /fish/salmon.png -> salmon）
        const match = url.match(/([^/]+)\.(png|jpg|jpeg|webp)$/i)
        if (match) {
            return match[1].charAt(0).toUpperCase() + match[1].slice(1)
        }
        // デフォルト名
        return `魚${index + 1}`
    }

    // ランダムな順序で魚画像を表示（初回のみ）
    const [shuffledFishImages] = useState(() => {
        const indexed = fishImages.map((url, index) => ({
            url,
            name: getFishName(url, index),
            originalIndex: index,
        }))
        return shuffleArray(indexed)
    })

    const [selectedIndices, setSelectedIndices] = useState<number[]>([])
    const [wrongSelectionIndex, setWrongSelectionIndex] = useState<number | null>(null)

    // 正しい順序が指定されていない場合は、順番通りに選択できるようにする
    const effectiveCorrectOrder = correctOrder.length > 0 ? correctOrder : fishImages.map((_, i) => i)

    // 次の選択すべきインデックス
    const nextExpectedIndex = useMemo(() => {
        return effectiveCorrectOrder[selectedIndices.length] ?? null
    }, [effectiveCorrectOrder, selectedIndices.length])

    // 選択処理
    const handleFishClick = (originalIndex: number, displayIndex: number) => {
        if (disabled) return

        // 既に選択されている場合は無視
        if (selectedIndices.includes(originalIndex)) return

        // 正しい順序かチェック
        if (originalIndex === nextExpectedIndex) {
            // 正しい選択
            const newSelected = [...selectedIndices, originalIndex]
            setSelectedIndices(newSelected)
            setWrongSelectionIndex(null)

            // すべて選択完了
            if (newSelected.length === effectiveCorrectOrder.length) {
                // 完了状態
            }

            // コールバック呼び出し
            if (onSelect) {
                onSelect(newSelected)
            }
        } else {
            // 間違った選択
            setWrongSelectionIndex(displayIndex)

            // 震えアニメーション後、リセット
            setTimeout(() => {
                setWrongSelectionIndex(null)
                setSelectedIndices([])
            }, 600)
        }
    }

    // 選択をリセット
    const handleReset = () => {
        setSelectedIndices([])
        setWrongSelectionIndex(null)
    }

    // 選択された魚の表示インデックスを取得
    const getSelectedDisplayIndex = (originalIndex: number): number | null => {
        const selectedPosition = selectedIndices.indexOf(originalIndex)
        return selectedPosition >= 0 ? selectedPosition : null
    }

    return (
        <div
            data-testid="fish-otp-display"
            className={`${className}`}
        >
            {/* 選択指示 */}
            <div className="mb-4 text-center">
                <p className="text-lg font-medium text-white mb-2">
                    魚を正しい順序で選択してください
                </p>
                {selectedIndices.length > 0 && (
                    <p className="text-sm text-gray-400">
                        選択済み: {selectedIndices.length} / {effectiveCorrectOrder.length}
                    </p>
                )}
            </div>

            {/* 魚画像グリッド */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {shuffledFishImages.map((fish, displayIndex) => {
                    const isSelected = selectedIndices.includes(fish.originalIndex)
                    const selectedPosition = getSelectedDisplayIndex(fish.originalIndex)
                    const isWrong = wrongSelectionIndex === displayIndex

                    return (
                        <button
                            key={`${fish.originalIndex}-${displayIndex}`}
                            data-testid={`fish-item-${displayIndex}`}
                            data-original-index={fish.originalIndex}
                            onClick={() => handleFishClick(fish.originalIndex, displayIndex)}
                            disabled={disabled || isSelected}
                            className={`
                                relative p-4 rounded-lg border-2 transition-all
                                ${isSelected
                                    ? 'border-blue-500 bg-blue-500/20'
                                    : isWrong
                                    ? 'border-red-500 bg-red-500/20 animate-shake'
                                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                }
                                ${disabled || isSelected ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
                                focus:outline-none focus:ring-2 focus:ring-blue-500
                            `}
                            aria-label={`${fish.name}を選択`}
                            type="button"
                        >
                            {/* 魚画像 */}
                            <div className="relative mb-2">
                                <img
                                    src={fish.url}
                                    alt={fish.name}
                                    className={`
                                        w-full h-32 object-contain
                                        ${isSelected ? '' : 'animate-float'}
                                    `}
                                    draggable={false}
                                />
                                {/* 選択順序のバッジ */}
                                {selectedPosition !== null && (
                                    <div
                                        className="absolute top-0 right-0 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm"
                                        data-testid={`selection-badge-${displayIndex}`}
                                    >
                                        {selectedPosition + 1}
                                    </div>
                                )}
                            </div>

                            {/* 魚の名前ラベル */}
                            <p
                                className="text-sm font-medium text-white text-center"
                                data-testid={`fish-name-${displayIndex}`}
                            >
                                {fish.name}
                            </p>
                        </button>
                    )
                })}
            </div>

            {/* リセットボタン */}
            {selectedIndices.length > 0 && (
                <div className="text-center">
                    <button
                        data-testid="reset-selection-button"
                        onClick={handleReset}
                        disabled={disabled}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="button"
                    >
                        選択をリセット
                    </button>
                </div>
            )}
        </div>
    )
}

export default FishOtpDisplay

