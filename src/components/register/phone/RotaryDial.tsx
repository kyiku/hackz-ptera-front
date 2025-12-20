/**
 * RotaryDial - 日本4号電話機風ダイヤルコンポーネント
 * Issue #33: 電話番号入力UI
 *
 * 日本の4号電話機をモチーフに:
 * - ベークライトの「ぬめっとした黒い光沢」
 * - 数字盤の「黄ばんだ経年劣化」
 * - 本物のダイヤル操作を再現（選択した数字がストッパーまで回転）
 */
import { useState, useRef, useCallback, useEffect } from 'react'

interface RotaryDialProps {
    onDigitComplete: (digit: string) => void
    disabled?: boolean
}

// ダイヤル穴の位置（1-9-0、反時計回りに配置）
// angle は時計の文字盤での位置（0°=12時、90°=3時、180°=6時、270°=9時）
// CSS では (angle - 90) として変換される
//
// 参考画像に基づく配置:
// - 1: 2時の位置（60°）
// - 0: 6時の位置（180°）
// - 反時計回りに均等配置
// - ストッパー: 5時の位置（150°）
//
// 1(60°)から0(180°)まで反時計回りに240°を9等分
// 間隔 = 240° / 9 ≈ 26.67°
const DIGIT_POSITIONS = [
    { digit: '1', angle: 60 },      // 2時
    { digit: '2', angle: 33.33 },   // 1時40分
    { digit: '3', angle: 6.67 },    // 12時20分
    { digit: '4', angle: -20 },     // 11時20分
    { digit: '5', angle: -46.67 },  // 10時30分
    { digit: '6', angle: -73.33 },  // 9時30分
    { digit: '7', angle: -100 },    // 8時40分
    { digit: '8', angle: -126.67 }, // 7時50分
    { digit: '9', angle: -153.33 }, // 7時
    { digit: '0', angle: 180 },     // 6時（真下）
]

// ストッパー位置（5時方向 = 150度）
const STOPPER_DISPLAY_ANGLE = 150

// 回転量計算
// 数字の穴がストッパーまで時計回りに何度回るか
function calculateRequiredRotation(digitAngle: number): number {
    // 時計回りの回転量 = ストッパー角度 - 数字角度（正規化）
    let rotation = (STOPPER_DISPLAY_ANGLE - digitAngle + 360) % 360

    // 0 (180°) からストッパー (150°) まで:
    // 150 - 180 = -30 → +360 = 330度（ほぼ1周）
    // 
    // 1 (60°) からストッパー (150°) まで:
    // 150 - 60 = 90度（最短）

    // rotation が 0 の場合は 360 度にする
    if (rotation === 0) {
        rotation = 360
    }

    return Math.min(rotation, 340)
}

export function RotaryDial({ onDigitComplete, disabled = false }: RotaryDialProps) {
    const dialRef = useRef<HTMLDivElement>(null)
    const [rotation, setRotation] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [selectedDigit, setSelectedDigit] = useState<string | null>(null)
    const [requiredRotation, setRequiredRotation] = useState(0)
    const [isReturning, setIsReturning] = useState(false)
    const startAngleRef = useRef(0)

    // 中心からの角度を計算
    const calculateAngle = useCallback((clientX: number, clientY: number) => {
        if (!dialRef.current) return 0
        const rect = dialRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI)
    }, [])

    // ドラッグ中の累積回転量を追跡
    const accumulatedRotationRef = useRef(0)
    const lastAngleRef = useRef(0)

    // ドラッグ開始
    const handleDragStart = useCallback((clientX: number, clientY: number, digit: string, digitAngle: number) => {
        if (disabled || isReturning) return

        const required = calculateRequiredRotation(digitAngle)

        setIsDragging(true)
        setSelectedDigit(digit)
        setRequiredRotation(required)

        // 現在のカーソル位置を基準角度として記録
        const startAngle = calculateAngle(clientX, clientY)
        startAngleRef.current = startAngle
        lastAngleRef.current = startAngle
        accumulatedRotationRef.current = 0
    }, [disabled, isReturning, calculateAngle])

    // ドラッグ中 - カーソル位置に数字が追従
    const handleDragMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging || !selectedDigit) return

        const currentAngle = calculateAngle(clientX, clientY)

        // 前回の角度からの差分を計算
        let delta = currentAngle - lastAngleRef.current

        // 角度の正規化（-180 ~ 180）
        if (delta > 180) delta -= 360
        if (delta < -180) delta += 360

        // 累積回転量を更新（時計回りは正の値）
        accumulatedRotationRef.current += delta
        lastAngleRef.current = currentAngle

        // 時計回り（正の回転）のみ許可し、必要回転量以内に制限
        const newRotation = Math.max(0, Math.min(requiredRotation, accumulatedRotationRef.current))
        setRotation(newRotation)
    }, [isDragging, selectedDigit, requiredRotation, calculateAngle])

    // ドラッグ終了
    const handleDragEnd = useCallback(() => {
        if (!isDragging || !selectedDigit) return

        setIsDragging(false)

        // ストッパーに到達した場合（必要回転量の90%以上）
        if (rotation >= requiredRotation * 0.9) {
            setIsReturning(true)

            // 戻りアニメーション時間（ゆっくり戻る）
            const returnDuration = 800 + (rotation / 100) * 400

            // ゆっくり戻す
            setRotation(0)

            setTimeout(() => {
                if (selectedDigit) {
                    onDigitComplete(selectedDigit)
                }
                setIsReturning(false)
                setSelectedDigit(null)
                setRequiredRotation(0)
            }, returnDuration)
        } else {
            // ストッパーに到達しなかった場合も戻す
            setIsReturning(true)
            setRotation(0)
            setTimeout(() => {
                setIsReturning(false)
                setSelectedDigit(null)
                setRequiredRotation(0)
            }, 400)
        }
    }, [isDragging, selectedDigit, rotation, requiredRotation, onDigitComplete])

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

    // ストッパーの位置計算（5-6時の間、6時寄り）
    const stopperRadians = (STOPPER_DISPLAY_ANGLE - 90) * (Math.PI / 180)
    const stopperRadius = 125 // 外側に配置
    const stopperX = Math.cos(stopperRadians) * stopperRadius
    const stopperY = Math.sin(stopperRadians) * stopperRadius

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
                    className={`relative w-56 h-56 rounded-full ${isReturning ? 'transition-transform ease-out' : ''
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transitionDuration: isReturning ? '1000ms' : '0ms',
                        transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        background: `
                            radial-gradient(circle at 50% 50%, #f5e6c8 0%, #e8d4a8 40%, #d4c090 70%, #c4a870 100%)
                        `,
                        boxShadow: `
                            inset 0 2px 10px rgba(0, 0, 0, 0.3),
                            inset 0 -2px 5px rgba(255, 255, 255, 0.2),
                            0 4px 15px rgba(0, 0, 0, 0.4)
                        `,
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

                    {/* センターキャップ */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full z-10"
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

                    {/* 数字の穴 - サイズを小さく */}
                    {DIGIT_POSITIONS.map(({ digit, angle }) => {
                        const radians = (angle - 90) * (Math.PI / 180)
                        const radius = 85 // 中心からの距離を調整
                        const x = Math.cos(radians) * radius
                        const y = Math.sin(radians) * radius
                        const isSelected = selectedDigit === digit

                        return (
                            <div
                                key={digit}
                                className={`absolute w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-100`}
                                style={{
                                    left: `calc(50% + ${x}px - 16px)`,
                                    top: `calc(50% + ${y}px - 16px)`,
                                    transform: `rotate(${-rotation}deg)`,
                                    background: isSelected
                                        ? 'radial-gradient(circle, #1a1a1a 0%, #0a0a0a 100%)'
                                        : 'radial-gradient(circle, #2a2a2a 0%, #0a0a0a 100%)',
                                    boxShadow: isSelected
                                        ? 'inset 0 2px 8px rgba(0, 0, 0, 0.9), inset 0 -1px 2px rgba(80, 80, 80, 0.3)'
                                        : 'inset 0 3px 10px rgba(0, 0, 0, 0.8), inset 0 -1px 3px rgba(100, 100, 100, 0.2), 0 1px 2px rgba(0, 0, 0, 0.3)',
                                    border: '1px solid #0a0a0a',
                                }}
                                onMouseDown={(e) => handleDragStart(e.clientX, e.clientY, digit, angle)}
                                onTouchStart={(e) => {
                                    if (e.touches.length > 0) {
                                        handleDragStart(e.touches[0].clientX, e.touches[0].clientY, digit, angle)
                                    }
                                }}
                            >
                                <span
                                    className="text-sm font-bold"
                                    style={{
                                        color: isSelected ? '#d4c090' : '#f5e6c8',
                                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                                        fontFamily: 'serif',
                                    }}
                                >
                                    {digit}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* フィンガーストッパー - 5時方向 */}
                <div
                    className="absolute z-20"
                    style={{
                        left: `calc(50% + ${stopperX}px - 8px)`,
                        top: `calc(50% + ${stopperY}px - 20px)`,
                        transform: 'rotate(-30deg)',
                        width: '16px',
                        height: '40px',
                    }}
                >
                    {/* ストッパー本体 - 金属製タブ */}
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            background: `
                                linear-gradient(90deg, 
                                    #2a2a2a 0%, 
                                    #5a5a5a 15%, 
                                    #8a8a8a 30%, 
                                    #b0b0b0 45%, 
                                    #c8c8c8 50%, 
                                    #b0b0b0 55%, 
                                    #8a8a8a 70%, 
                                    #5a5a5a 85%, 
                                    #2a2a2a 100%
                                )
                            `,
                            borderRadius: '3px 3px 5px 5px',
                            boxShadow: `
                                inset 0 2px 4px rgba(255, 255, 255, 0.5),
                                inset 0 -2px 4px rgba(0, 0, 0, 0.4),
                                2px 4px 8px rgba(0, 0, 0, 0.6),
                                -1px -1px 3px rgba(255, 255, 255, 0.1)
                            `,
                            border: '1px solid #1a1a1a',
                        }}
                    />
                </div>
            </div>

            {/* 操作説明 */}
            <div className="text-center mt-6 text-gray-500 text-sm">
                {isDragging ? (
                    <span className="text-gray-700">
                        ストッパーまで回してください... ({Math.round((rotation / requiredRotation) * 100)}%)
                    </span>
                ) : isReturning ? (
                    <span className="text-gray-600">
                        カチカチカチ... ダイヤルが戻っています
                    </span>
                ) : (
                    <span>
                        数字穴に指を入れ、ストッパーまで回してください
                    </span>
                )}
            </div>

            {/* 回転状態インジケーター */}
            {isDragging && requiredRotation > 0 && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-64 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gray-600 transition-all duration-100"
                        style={{ width: `${Math.min((rotation / requiredRotation) * 100, 100)}%` }}
                    />
                </div>
            )}
        </div>
    )
}

export default RotaryDial
