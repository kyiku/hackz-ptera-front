/**
 * RotaryDial - レトロ黒電話ダイヤルコンポーネント
 * Issue #33: 電話番号入力UI
 *
 * 正しい黒電話の使い方を再現:
 * - 数字の穴に指を入れてストッパーまでダイヤルを回す
 * - 指を離すとダイヤルがバネで戻る
 * - 戻り切った時点で数字が確定
 */
import { useState, useRef, useCallback, useEffect } from 'react'

interface RotaryDialProps {
    onDigitComplete: (digit: string) => void
    disabled?: boolean
}

// ダイヤル穴の位置（0-9、時計回りに配置）
// 黒電話は1が右上、0が右下
const DIGIT_POSITIONS = [
    { digit: '1', angle: -135 },
    { digit: '2', angle: -108 },
    { digit: '3', angle: -81 },
    { digit: '4', angle: -54 },
    { digit: '5', angle: -27 },
    { digit: '6', angle: 0 },
    { digit: '7', angle: 27 },
    { digit: '8', angle: 54 },
    { digit: '9', angle: 81 },
    { digit: '0', angle: 108 },
]

// ストッパー位置（ダイヤルを止める位置）
const STOPPER_ANGLE = 150

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

    // ドラッグ中
    const handleDragMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging || !selectedDigit) return

        const currentAngle = calculateAngle(clientX, clientY)
        let delta = currentAngle - startAngleRef.current

        // 角度の正規化（-180〜180度）
        if (delta > 180) delta -= 360
        if (delta < -180) delta += 360

        // 時計回りのみ許可（正の回転）
        const newRotation = Math.max(0, Math.min(STOPPER_ANGLE, startRotationRef.current + delta))
        setRotation(newRotation)
    }, [isDragging, selectedDigit, calculateAngle])

    // ドラッグ終了
    const handleDragEnd = useCallback(() => {
        if (!isDragging || !selectedDigit) return

        setIsDragging(false)

        // ストッパーまで回されていた場合のみ数字を確定
        if (rotation >= STOPPER_ANGLE - 10) {
            setIsReturning(true)
            // ダイヤルが戻るアニメーション後に数字を確定
            const returnDuration = 500 + (rotation / STOPPER_ANGLE) * 300

            // アニメーション開始
            setRotation(0)

            setTimeout(() => {
                if (selectedDigit) {
                    onDigitComplete(selectedDigit)
                }
                setIsReturning(false)
                setSelectedDigit(null)
            }, returnDuration)
        } else {
            // ストッパーまで回されなかった場合は戻すだけ
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
            {/* 電話機本体（外枠） */}
            <div className="w-80 h-80 rounded-full bg-gradient-to-br from-gray-800 via-gray-900 to-black shadow-2xl border-8 border-gray-700 flex items-center justify-center">

                {/* 回転するダイヤル盤 */}
                <div
                    ref={dialRef}
                    className={`relative w-64 h-64 rounded-full bg-gradient-to-br from-amber-100 via-amber-50 to-amber-200 shadow-inner ${isReturning ? 'transition-transform duration-500 ease-out' : ''
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {/* センターキャップ */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 shadow-lg border-4 border-gray-600 z-10" />

                    {/* 数字の穴 */}
                    {DIGIT_POSITIONS.map(({ digit, angle }) => {
                        const radians = (angle - 90) * (Math.PI / 180)
                        const radius = 100 // 中心からの距離
                        const x = Math.cos(radians) * radius
                        const y = Math.sin(radians) * radius
                        const isSelected = selectedDigit === digit

                        return (
                            <div
                                key={digit}
                                className={`absolute w-12 h-12 rounded-full flex items-center justify-center cursor-pointer 
                  ${isSelected
                                        ? 'bg-gray-600 shadow-inner'
                                        : 'bg-gray-800 hover:bg-gray-700 shadow-lg'
                                    }
                  border-2 border-gray-600 transition-colors`}
                                style={{
                                    left: `calc(50% + ${x}px - 24px)`,
                                    top: `calc(50% + ${y}px - 24px)`,
                                    transform: `rotate(${-rotation}deg)`, // 数字は常に上向き
                                }}
                                onMouseDown={(e) => handleDragStart(e.clientX, e.clientY, digit)}
                                onTouchStart={(e) => {
                                    if (e.touches.length > 0) {
                                        handleDragStart(e.touches[0].clientX, e.touches[0].clientY, digit)
                                    }
                                }}
                            >
                                <span className={`text-xl font-bold ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                                    {digit}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* ストッパー（固定） */}
                <div
                    className="absolute w-4 h-12 bg-gray-600 rounded-sm"
                    style={{
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }}
                />
            </div>

            {/* 操作説明 */}
            <div className="text-center mt-4 text-gray-400 text-sm">
                {isDragging ? (
                    <span className="text-amber-400">ストッパーまで回してください...</span>
                ) : isReturning ? (
                    <span className="text-green-400">ダイヤルが戻っています...</span>
                ) : (
                    <span>数字の穴をドラッグして右のストッパーまで回してください</span>
                )}
            </div>
        </div>
    )
}

export default RotaryDial
