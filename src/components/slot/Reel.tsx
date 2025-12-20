/**
 * Reel - シンプルなスロットリールコンポーネント
 */

export interface ReelProps {
    /** リールの値 */
    value: string
    /** スピン中かどうか */
    isSpinning: boolean
    /** 減速中かどうか */
    isSlowingDown?: boolean
    /** リールのインデックス */
    index: number
    /** カスタムクラス名 */
    className?: string
}

export const Reel = ({ value, isSpinning, isSlowingDown = false, index, className = '' }: ReelProps) => {
    return (
        <div
            className={`inline-block ${className}`}
            data-testid={`reel-${index}`}
        >
            {/* シンプルなリール筐体 */}
            <div
                className={`
                    relative w-24 h-36 bg-white
                    border-2 rounded overflow-hidden
                    ${isSpinning 
                        ? 'border-gray-800' 
                        : 'border-gray-400'
                    }
                `}
            >
                {/* リールの中身 */}
                <div
                    className={`
                        absolute inset-0 flex items-center justify-center
                        ${isSpinning ? (isSlowingDown ? 'reel-slowing-down' : 'reel-spinning') : ''}
                    `}
                >
                    {/* 表示文字 */}
                    <div
                        className={`
                            text-5xl font-bold
                            ${value !== '?' ? 'text-gray-900' : 'text-gray-400'}
                        `}
                    >
                        {value}
                    </div>
                </div>

                {/* 上部のシャドウ */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-white z-10 pointer-events-none" />
                {/* 下部のシャドウ */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-white z-10 pointer-events-none" />
                
                {/* 中央のガイドライン */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-800 transform -translate-y-1/2 z-10 pointer-events-none" />
            </div>
        </div>
    )
}

export default Reel
