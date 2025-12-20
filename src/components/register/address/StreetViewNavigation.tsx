/**
 * StreetViewNavigation - ストリートビュー風ナビゲーションコンポーネント
 * Issue #34: 住所入力 - ストリートビュー風ナビゲーション
 *
 * 機能:
 * - ハックツオフィスからスタート
 * - 方向キーで移動
 * - 自分の家まで歩いて移動
 * - 現在位置を住所として保存
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface StreetViewNavigationProps {
    /** 選択された住所 */
    value: string | null
    /** 住所選択時のコールバック */
    onChange: (address: string) => void
    /** 無効化されているか */
    disabled?: boolean
    /** カスタムクラス名 */
    className?: string
}

/**
 * 方向
 */
type Direction = 'north' | 'south' | 'east' | 'west'

/**
 * 位置情報
 */
interface Position {
    x: number
    y: number
    street: string
    building: string
}

/**
 * ハックツオフィスの初期位置
 */
const START_POSITION: Position = {
    x: 0,
    y: 0,
    street: 'ハックツオフィス前',
    building: 'ハックツオフィス',
}

/**
 * 位置から住所を生成
 */
function generateAddress(position: Position): string {
    return `${position.street} ${position.building}`
}

/**
 * 移動先の位置を計算
 */
function calculateNextPosition(current: Position, direction: Direction): Position {
    const step = 1
    let newX = current.x
    let newY = current.y

    switch (direction) {
        case 'north':
            newY -= step
            break
        case 'south':
            newY += step
            break
        case 'east':
            newX += step
            break
        case 'west':
            newX -= step
            break
    }

    // 簡易的な住所生成（実際の実装では、より詳細な住所マッピングが必要）
    const streetNames = [
        'ハックツ通り',
        'プログラミング通り',
        'コード通り',
        'デバッグ通り',
        'テスト通り',
        'デプロイ通り',
        'リリース通り',
        'メンテナンス通り',
    ]

    const buildingNames = [
        '1丁目',
        '2丁目',
        '3丁目',
        '4丁目',
        '5丁目',
        '6丁目',
        '7丁目',
        '8丁目',
    ]

    const streetIndex = Math.abs(newX + newY) % streetNames.length
    const buildingIndex = Math.abs(newX) % buildingNames.length

    return {
        x: newX,
        y: newY,
        street: streetNames[streetIndex],
        building: `${buildingIndex + 1}番地`,
    }
}

/**
 * ストリートビュー風ナビゲーションコンポーネント
 */
export const StreetViewNavigation = ({
    value,
    onChange,
    disabled = false,
    className = '',
}: StreetViewNavigationProps) => {
    const [position, setPosition] = useState<Position>(START_POSITION)
    const [steps, setSteps] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    // valueが変更されたら位置を更新（オプション機能）
    useEffect(() => {
        // valueから位置を復元する機能は将来実装可能
        // 現時点では未使用のため、lintエラーを回避
        if (value) {
            // 将来的にvalueから位置を復元する処理を追加可能
        }
    }, [value])

    // キーボードイベントハンドラ
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (disabled) return

            let direction: Direction | null = null

            switch (event.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    direction = 'north'
                    break
                case 'ArrowDown':
                case 's':
                case 'S':
                    direction = 'south'
                    break
                case 'ArrowRight':
                case 'd':
                case 'D':
                    direction = 'east'
                    break
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    direction = 'west'
                    break
                default:
                    return
            }

            if (direction) {
                event.preventDefault()
                const newPosition = calculateNextPosition(position, direction)
                setPosition(newPosition)
                setSteps((prev) => prev + 1)
                onChange(generateAddress(newPosition))
            }
        },
        [disabled, position, onChange]
    )

    // キーボードイベントリスナーを登録
    useEffect(() => {
        if (disabled) return

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [handleKeyDown, disabled])

    // ボタンクリックハンドラ
    const handleDirectionClick = useCallback(
        (direction: Direction) => {
            if (disabled) return

            const newPosition = calculateNextPosition(position, direction)
            setPosition(newPosition)
            setSteps((prev) => prev + 1)
            onChange(generateAddress(newPosition))
        },
        [disabled, position, onChange]
    )

    // リセット
    const handleReset = useCallback(() => {
        if (disabled) return

        setPosition(START_POSITION)
        setSteps(0)
        onChange(generateAddress(START_POSITION))
    }, [disabled, onChange])

    const currentAddress = generateAddress(position)

    return (
        <div className={`${className}`} ref={containerRef} data-testid="street-view-navigation">
            {/* 現在位置表示 */}
            <div className="text-center mb-6">
                <p className="text-2xl font-medium text-gray-800 mb-2">現在地</p>
                <p className="text-lg text-gray-600">{currentAddress}</p>
                <p className="text-sm text-gray-500 mt-2">歩数: {steps}歩</p>
            </div>

            {/* ストリートビュー風表示エリア */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-8 mb-6 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🏢</div>
                    <p className="text-xl text-gray-800 mb-2">{position.building}</p>
                    <p className="text-lg text-gray-500">{position.street}</p>
                    <p className="text-sm text-gray-400 mt-4">
                        座標: ({position.x}, {position.y})
                    </p>
                </div>
            </div>

            {/* 方向ボタン */}
            <div className="flex flex-col items-center gap-2 mb-4">
                {/* 上 */}
                <button
                    data-testid="direction-north"
                    onClick={() => handleDirectionClick('north')}
                    disabled={disabled}
                    className={`
                        px-6 py-3 bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white rounded-lg
                        transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    type="button"
                >
                    ↑ 北へ
                </button>

                {/* 左右 */}
                <div className="flex gap-4">
                    <button
                        data-testid="direction-west"
                        onClick={() => handleDirectionClick('west')}
                        disabled={disabled}
                        className={`
                            px-6 py-3 bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white rounded-lg
                            transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        type="button"
                    >
                        ← 西へ
                    </button>
                    <button
                        data-testid="direction-east"
                        onClick={() => handleDirectionClick('east')}
                        disabled={disabled}
                        className={`
                            px-6 py-3 bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white rounded-lg
                            transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        type="button"
                    >
                        東へ →
                    </button>
                </div>

                {/* 下 */}
                <button
                    data-testid="direction-south"
                    onClick={() => handleDirectionClick('south')}
                    disabled={disabled}
                    className={`
                        px-6 py-3 bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white rounded-lg
                        transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    type="button"
                >
                    ↓ 南へ
                </button>
            </div>

            {/* 操作説明 */}
            <div className="text-center text-sm text-gray-500 mb-4">
                <p>方向キー（↑↓←→）またはWASDキーで移動</p>
                <p>または、ボタンをクリックして移動</p>
            </div>

            {/* リセットボタン */}
            <div className="text-center">
                <button
                    data-testid="reset-button"
                    onClick={handleReset}
                    disabled={disabled}
                    className={`
                        px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg
                        transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    type="button"
                >
                    スタート地点に戻る
                </button>
            </div>
        </div>
    )
}

export default StreetViewNavigation
