/**
 * SlotMachine - シンプルなスロットマシンコンポーネント
 */

import { Reel } from './Reel'
import { SpinControls } from './SpinControls'

export interface SlotMachineProps {
    /** リールの値の配列 */
    reels: string[]
    /** スピン中かどうか */
    isSpinning: boolean
    /** 減速中かどうか */
    isSlowingDown?: boolean
    /** スピン開始時のコールバック */
    onSpin: () => void
    /** 確定時のコールバック */
    onConfirm: () => void
    /** 確定可能かどうか */
    canConfirm: boolean
    /** スピン回数 */
    spinCount: number
    /** カスタムクラス名 */
    className?: string
}

export const SlotMachine = ({
    reels,
    isSpinning,
    isSlowingDown = false,
    onSpin,
    onConfirm,
    canConfirm,
    spinCount,
    className = '',
}: SlotMachineProps) => {
    return (
        <div className={`${className}`} data-testid="slot-machine">
            {/* シンプルなスロットマシンの筐体 */}
            <div className="bg-gray-100 border-2 border-gray-400 rounded p-6 mb-3">
                {/* タイトル */}
                <div className="text-center mb-4">
                    <div className="text-gray-900 text-lg font-bold inline-block px-4 py-2 bg-white rounded border border-gray-400">
                        スロットマシン
                    </div>
                </div>

                {/* リールエリア */}
                <div className="flex justify-center gap-3 mb-4">
                    {reels.map((value, index) => (
                        <Reel
                            key={index}
                            value={value}
                            isSpinning={isSpinning}
                            isSlowingDown={isSlowingDown}
                            index={index}
                        />
                    ))}
                </div>

                {/* 操作コントロール */}
                <div className="flex flex-col items-center">
                    <SpinControls
                        onSpin={onSpin}
                        onConfirm={onConfirm}
                        canConfirm={canConfirm}
                        spinCount={spinCount}
                        isSpinning={isSpinning}
                    />
                </div>
            </div>
        </div>
    )
}

export default SlotMachine
