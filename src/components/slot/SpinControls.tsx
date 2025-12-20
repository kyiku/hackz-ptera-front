/**
 * SpinControls - シンプルな操作コントロール
 */

export interface SpinControlsProps {
    /** スピン開始時のコールバック */
    onSpin: () => void
    /** 確定時のコールバック */
    onConfirm: () => void
    /** 確定可能かどうか */
    canConfirm: boolean
    /** スピン回数 */
    spinCount: number
    /** スピン中かどうか */
    isSpinning: boolean
    /** カスタムクラス名 */
    className?: string
}

export const SpinControls = ({
    onSpin,
    onConfirm,
    canConfirm,
    spinCount,
    isSpinning,
    className = '',
}: SpinControlsProps) => {
    return (
        <div className={`${className}`} data-testid="spin-controls">
            {/* カウンター表示 */}
            <div className="bg-gray-100 border border-gray-400 p-2 mb-3 rounded inline-block">
                <div className="text-gray-900 text-base font-bold">
                    スピン回数: {spinCount}回
                </div>
            </div>

            {/* SPINボタン */}
            <div className="mb-3">
                <button
                    data-testid="spin-button"
                    onClick={onSpin}
                    disabled={isSpinning}
                    className={`
                        px-12 py-4 font-bold text-xl rounded
                        transition-all duration-200
                        border-2
                        ${isSpinning 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300' 
                            : 'bg-white hover:bg-gray-50 active:scale-95 cursor-pointer border-gray-800 text-gray-900'
                        }
                    `}
                    type="button"
                >
                    SPIN
                </button>
            </div>

            {/* 確定ボタン（小さい） */}
            <div className="text-center">
                <button
                    data-testid="confirm-button"
                    onClick={onConfirm}
                    disabled={!canConfirm}
                    className={`
                        px-2 py-1 font-bold rounded border
                        transition-all duration-200
                        ${canConfirm
                            ? 'bg-gray-800 hover:bg-gray-900 text-white active:scale-95 cursor-pointer border-gray-900'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300'
                        }
                    `}
                    style={{
                        fontSize: '10px',
                        padding: '3px 6px',
                    }}
                    type="button"
                >
                    確定
                </button>
                {!canConfirm && (
                    <div className="text-gray-500 text-xs mt-1">
                        (ロック中)
                    </div>
                )}
            </div>
        </div>
    )
}

export default SpinControls
