/**
 * RotaryDial - 日本4号電話機風ダイヤルコンポーネント
 * Issue #33: 電話番号入力UI
 *
 * 日本の4号電話機をモチーフに:
 * - ベークライトの「ぬめっとした黒い光沢」
 * - 数字盤の「黄ばんだ経年劣化」
 * - ダイヤルを回す際の重さを感じさせる
 */
import { useState, useRef, useCallback, useEffect } from 'react'

interface RotaryDialProps {
    onDigitComplete: (digit: string) => void
    disabled?: boolean
}

// ダイヤル穴の位置（1-9-0、反時計回りに配置）
// 配置: 1が右上(1時)から始まり、反時計回りに0が真下(6時)
// 計算式: 実座標 = cos/sin((angle - 90) * PI/180)
// angle=0で12時、angle=90で3時、angle=180で6時、angle=270で9時
const DIGIT_POSITIONS = [
    { digit: '1', angle: 27 },    // 1時の位置
    { digit: '2', angle: 4 },     // 12時寄り
    { digit: '3', angle: -19 },   // 11時
    { digit: '4', angle: -42 },   // 10時
    { digit: '5', angle: -65 },   // 9時寄り上
    { digit: '6', angle: -88 },   // 9時
    { digit: '7', angle: -111 },  // 8時
    { digit: '8', angle: -134 },  // 7時
    { digit: '9', angle: -157 },  // 6時寄り左
    { digit: '0', angle: 180 },   // 6時（真下）
]

// ストッパー位置（右側、3-4時の位置）
const STOPPER_ANGLE = 100

export function RotaryDial({ onDigitComplete, disabled = false }: RotaryDialProps) {
    const dialRef = useRef<HTMLDivElement>(null)
    const [rotation, setRotation] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [selectedDigit, setSelectedDigit] = useState<string | null>(null)
    const [isReturning, setIsReturning] = useState(false)
    const startAngleRef = useRef(0)
    const startRotationRef = useRef(0)

    // 角度計算
    const calculateAngle = useCallback((clientX: number, clientY: number) => {
        if (!dialRef.current) return 0
        const rect = dialRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI)
    }, [])

    // ドラッグ開始
    const handleDragStart = useCallback((clientX: number, clientY: number, digit: string) => {
        if (disabled || isReturning) return
        setIsDragging(true)
        setSelectedDigit(digit)
        startAngleRef.current = calculateAngle(clientX, clientY)
        startRotationRef.current = rotation
    }, [disabled, isReturning, rotation, calculateAngle])

    // ドラッグ中 - 重さを感じさせるため、回転量を0.7倍に
    const handleDragMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging || !selectedDigit) return

        const currentAngle = calculateAngle(clientX, clientY)
        let delta = currentAngle - startAngleRef.current

        // 角度の正規化
        if (delta > 180) delta -= 360
        if (delta < -180) delta += 360

        // 重さを再現：回転量を減衰させる
        const weightedDelta = delta * 0.7

        const newRotation = Math.max(0, Math.min(STOPPER_ANGLE, startRotationRef.current + weightedDelta))
        setRotation(newRotation)
    }, [isDragging, selectedDigit, calculateAngle])

    // ドラッグ終了
    const handleDragEnd = useCallback(() => {
        if (!isDragging || !selectedDigit) return

        setIsDragging(false)

        if (rotation >= STOPPER_ANGLE - 10) {
            setIsReturning(true)
            // バネで戻る時間（重いダイヤルを再現）
            const returnDuration = 600 + (rotation / STOPPER_ANGLE) * 400

            setRotation(0)

            setTimeout(() => {
                if (selectedDigit) {
                    onDigitComplete(selectedDigit)
                }
                setIsReturning(false)
                setSelectedDigit(null)
            }, returnDuration)
        } else {
            setRotation(0)
            setSelectedDigit(null)
        }
    }, [isDragging, selectedDigit, rotation, onDigitComplete])

    // マウスイベント
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY)
        const handleMouseUp = () => handleDragEnd()

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, handleDragMove, handleDragEnd])

    // タッチイベント
    useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                handleDragMove(e.touches[0].clientX, e.touches[0].clientY)
            }
        }
        const handleTouchEnd = () => handleDragEnd()

        if (isDragging) {
            window.addEventListener('touchmove', handleTouchMove)
            window.addEventListener('touchend', handleTouchEnd)
        }

        return () => {
            window.removeEventListener('touchmove', handleTouchMove)
            window.removeEventListener('touchend', handleTouchEnd)
        }
    }, [isDragging, handleDragMove, handleDragEnd])

    return (
        <div className="relative select-none">
            {/* ベークライト製電話機本体 - ぬめっとした黒い光沢 */}
            <div
                className="w-80 h-80 rounded-full flex items-center justify-center relative"
                style={{
                    background: `
                        radial-gradient(ellipse at 30% 20%, rgba(80, 80, 80, 0.8) 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 80%, rgba(40, 40, 40, 0.6) 0%, transparent 40%),
                        linear-gradient(135deg, #2a2a2a 0%, #0a0a0a 50%, #1a1a1a 100%)
                    `,
                    boxShadow: `
                        inset 0 2px 20px rgba(255, 255, 255, 0.15),
                        inset 0 -5px 20px rgba(0, 0, 0, 0.8),
                        0 10px 40px rgba(0, 0, 0, 0.8),
                        0 0 0 8px #1a1a1a,
                        0 0 0 12px #0a0a0a
                    `,
                }}
            >
                {/* 光沢ハイライト */}
                <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                        background: `
                            radial-gradient(ellipse 60% 40% at 35% 25%, rgba(255, 255, 255, 0.12) 0%, transparent 100%),
                            radial-gradient(ellipse 30% 20% at 65% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 100%)
                        `,
                    }}
                />

                {/* 回転するダイヤル盤 - 黄ばんだ経年劣化 */}
                <div
                    ref={dialRef}
                    className={`relative w-60 h-60 rounded-full ${isReturning ? 'transition-transform ease-out' : ''
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transitionDuration: isReturning ? '700ms' : '0ms',
                        // 黄ばんだアイボリー色の数字盤
                        background: `
                            radial-gradient(circle at 50% 50%, #f5e6c8 0%, #e8d4a8 40%, #d4c090 70%, #c4a870 100%)
                        `,
                        boxShadow: `
                            inset 0 2px 10px rgba(0, 0, 0, 0.3),
                            inset 0 -2px 5px rgba(255, 255, 255, 0.2),
                            0 4px 15px rgba(0, 0, 0, 0.4)
                        `,
                        // 経年劣化のテクスチャ感
                        filter: 'contrast(0.95) saturate(0.9)',
                    }}
                >
                    {/* 汚れ・経年劣化のオーバーレイ */}
                    <div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                            background: `
                                radial-gradient(ellipse at 20% 30%, rgba(139, 119, 80, 0.15) 0%, transparent 40%),
                                radial-gradient(ellipse at 80% 70%, rgba(100, 80, 50, 0.1) 0%, transparent 30%),
                                radial-gradient(ellipse at 50% 90%, rgba(80, 60, 30, 0.1) 0%, transparent 25%)
                            `,
                        }}
                    />

                    {/* センターキャップ - 金属製の古びたキャップ */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full z-10"
                        style={{
                            background: `
                                radial-gradient(ellipse at 30% 30%, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)
                            `,
                            boxShadow: `
                                inset 0 2px 8px rgba(255, 255, 255, 0.2),
                                inset 0 -3px 8px rgba(0, 0, 0, 0.5),
                                0 2px 10px rgba(0, 0, 0, 0.5)
                            `,
                            border: '3px solid #0a0a0a',
                        }}
                    />

                    {/* 数字の穴 */}
                    {DIGIT_POSITIONS.map(({ digit, angle }) => {
                        const radians = (angle - 90) * (Math.PI / 180)
                        const radius = 95
                        const x = Math.cos(radians) * radius
                        const y = Math.sin(radians) * radius
                        const isSelected = selectedDigit === digit

                        return (
                            <div
                                key={digit}
                                className={`absolute w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all duration-100`}
                                style={{
                                    left: `calc(50% + ${x}px - 22px)`,
                                    top: `calc(50% + ${y}px - 22px)`,
                                    transform: `rotate(${-rotation}deg)`,
                                    // 穴の深さを表現
                                    background: isSelected
                                        ? 'radial-gradient(circle, #1a1a1a 0%, #0a0a0a 100%)'
                                        : 'radial-gradient(circle, #2a2a2a 0%, #0a0a0a 100%)',
                                    boxShadow: isSelected
                                        ? 'inset 0 3px 10px rgba(0, 0, 0, 0.9), inset 0 -1px 3px rgba(80, 80, 80, 0.3)'
                                        : 'inset 0 4px 12px rgba(0, 0, 0, 0.8), inset 0 -2px 4px rgba(100, 100, 100, 0.2), 0 1px 2px rgba(0, 0, 0, 0.3)',
                                    border: '1px solid #0a0a0a',
                                }}
                                onMouseDown={(e) => handleDragStart(e.clientX, e.clientY, digit)}
                                onTouchStart={(e) => {
                                    if (e.touches.length > 0) {
                                        handleDragStart(e.touches[0].clientX, e.touches[0].clientY, digit)
                                    }
                                }}
                            >
                                {/* 数字 - 経年劣化で少しかすれた感じ */}
                                <span
                                    className="text-lg font-bold"
                                    style={{
                                        color: isSelected ? '#d4c090' : '#f5e6c8',
                                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                                        fontFamily: 'serif',
                                        opacity: 0.95,
                                    }}
                                >
                                    {digit}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* フィンガーストッパー - 参照画像のような金属製タブ（3-4時の位置） */}
                <div
                    className="absolute"
                    style={{
                        // 3-4時の位置（右側やや下）に配置
                        right: '18px',
                        top: '55%',
                        transform: 'translateY(-50%) rotate(-10deg)',
                        width: '12px',
                        height: '35px',
                        background: `
                            linear-gradient(90deg, 
                                #3a3a3a 0%, 
                                #7a7a7a 20%, 
                                #a0a0a0 40%, 
                                #c0c0c0 50%, 
                                #a0a0a0 60%, 
                                #7a7a7a 80%, 
                                #3a3a3a 100%
                            )
                        `,
                        borderRadius: '2px 2px 4px 4px',
                        boxShadow: `
                            inset 0 2px 4px rgba(255, 255, 255, 0.4),
                            inset 0 -2px 4px rgba(0, 0, 0, 0.3),
                            3px 3px 10px rgba(0, 0, 0, 0.5),
                            -1px -1px 3px rgba(255, 255, 255, 0.1)
                        `,
                        border: '1px solid #1a1a1a',
                    }}
                />
            </div>

            {/* 操作説明 */}
            <div className="text-center mt-6 text-amber-200/70 text-sm">
                {isDragging ? (
                    <span className="text-amber-300">
                        ゆっくりストッパーまで回してください...
                    </span>
                ) : isReturning ? (
                    <span className="text-amber-400">
                        カチカチカチ... ダイヤルが戻っています
                    </span>
                ) : (
                    <span>
                        数字穴に指を入れ、右のストッパーまで回してください
                    </span>
                )}
            </div>

            {/* 回転状態インジケーター */}
            {isDragging && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-amber-600 transition-all duration-100"
                        style={{ width: `${(rotation / STOPPER_ANGLE) * 100}%` }}
                    />
                </div>
            )}
        </div>
    )
}

export default RotaryDial

