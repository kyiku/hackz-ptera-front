/**
 * CaptchaImage - CAPTCHA画像表示・クリック座標取得コンポーネント
 * 
 * 画像を表示し、クリック座標を取得する
 * 仕様:
 * - 画像サイズ: 1024 x 768 px
 * - ターゲットサイズ: 5〜8 px（極小）
 */
import { useState, useRef, useCallback, useEffect } from 'react'

// 画像サイズ定数
export const IMAGE_WIDTH = 1024
export const IMAGE_HEIGHT = 768

// クリック座標の型
export interface ClickPosition {
    id: string
    x: number  // 画像上の相対X座標 (0-1024)
    y: number  // 画像上の相対Y座標 (0-768)
    displayX: number  // 表示上のX座標（%）
    displayY: number  // 表示上のY座標（%）
}

// コンポーネントProps
export interface CaptchaImageProps {
    imageUrl: string
    onSelect: (positions: ClickPosition[]) => void
    maxSelections?: number
    disabled?: boolean
    showGrid?: boolean
    gridSize?: number  // グリッドの分割数（3x3なら3）
}

type LoadingState = 'loading' | 'loaded' | 'error'

/**
 * CaptchaImage コンポーネント
 */
export function CaptchaImage({
    imageUrl,
    onSelect,
    maxSelections = 10,
    disabled = false,
    showGrid = false,
    gridSize = 3,
}: CaptchaImageProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)

    const [positions, setPositions] = useState<ClickPosition[]>([])
    const [loadingState, setLoadingState] = useState<LoadingState>('loading')
    const [selectedGridCells, setSelectedGridCells] = useState<Set<number>>(new Set())

    // 画像読み込み成功
    const handleImageLoad = useCallback(() => {
        setLoadingState('loaded')
    }, [])

    // 画像読み込みエラー
    const handleImageError = useCallback(() => {
        setLoadingState('error')
    }, [])

    // クリック座標を計算
    const calculatePosition = useCallback((
        clientX: number,
        clientY: number
    ): ClickPosition | null => {
        if (!containerRef.current || !imageRef.current) return null

        const rect = imageRef.current.getBoundingClientRect()

        // 画像内のクリック位置を計算
        const relativeX = clientX - rect.left
        const relativeY = clientY - rect.top

        // 画像外のクリックは無視
        if (relativeX < 0 || relativeY < 0 || relativeX > rect.width || relativeY > rect.height) {
            return null
        }

        // 画像サイズに正規化（1024x768基準）
        const x = Math.round((relativeX / rect.width) * IMAGE_WIDTH)
        const y = Math.round((relativeY / rect.height) * IMAGE_HEIGHT)

        // 表示用のパーセンテージ
        const displayX = (relativeX / rect.width) * 100
        const displayY = (relativeY / rect.height) * 100

        return {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            x,
            y,
            displayX,
            displayY,
        }
    }, [])

    // 画像クリックハンドラ
    const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled || loadingState !== 'loaded') return

        // グリッドモードの場合は処理しない
        if (showGrid) return

        // 最大選択数チェック
        if (positions.length >= maxSelections) return

        const position = calculatePosition(e.clientX, e.clientY)
        if (!position) return

        const newPositions = [...positions, position]
        setPositions(newPositions)
        onSelect(newPositions)
    }, [disabled, loadingState, showGrid, positions, maxSelections, calculatePosition, onSelect])

    // マーカー削除ハンドラ
    const handleMarkerClick = useCallback((e: React.MouseEvent, positionId: string) => {
        e.stopPropagation()
        if (disabled) return

        const newPositions = positions.filter(p => p.id !== positionId)
        setPositions(newPositions)
        onSelect(newPositions)
    }, [disabled, positions, onSelect])

    // グリッドセルクリックハンドラ
    const handleGridCellClick = useCallback((cellIndex: number) => {
        if (disabled || loadingState !== 'loaded') return

        const newSelected = new Set(selectedGridCells)
        if (newSelected.has(cellIndex)) {
            newSelected.delete(cellIndex)
        } else {
            if (newSelected.size >= maxSelections) return
            newSelected.add(cellIndex)
        }
        setSelectedGridCells(newSelected)

        // グリッドセルの中心座標を計算してコールバック
        const cellWidth = IMAGE_WIDTH / gridSize
        const cellHeight = IMAGE_HEIGHT / gridSize
        const cellPositions: ClickPosition[] = Array.from(newSelected).map(idx => {
            const col = idx % gridSize
            const row = Math.floor(idx / gridSize)
            return {
                id: `grid-${idx}`,
                x: Math.round(cellWidth * (col + 0.5)),
                y: Math.round(cellHeight * (row + 0.5)),
                displayX: (col + 0.5) * (100 / gridSize),
                displayY: (row + 0.5) * (100 / gridSize),
            }
        })
        onSelect(cellPositions)
    }, [disabled, loadingState, selectedGridCells, maxSelections, gridSize, onSelect])

    // 画像URLが変わったらリセット
    useEffect(() => {
        setPositions([])
        setSelectedGridCells(new Set())
        setLoadingState('loading')
    }, [imageUrl])

    return (
        <div
            ref={containerRef}
            data-testid="captcha-image-container"
            className="relative w-full max-w-4xl mx-auto select-none"
        >
            {/* ローディング表示 */}
            {loadingState === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-gray-400 text-sm">画像を読み込み中...</span>
                    </div>
                </div>
            )}

            {/* エラー表示 */}
            {loadingState === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                    <div className="flex flex-col items-center gap-3 text-red-400">
                        <span className="text-4xl">⚠️</span>
                        <span className="text-sm">画像の読み込みに失敗しました</span>
                    </div>
                </div>
            )}

            {/* 画像表示エリア */}
            <div
                className={`relative cursor-crosshair ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleImageClick}
            >
                <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="CAPTCHA画像"
                    className="w-full h-auto rounded-lg"
                    style={{ aspectRatio: `${IMAGE_WIDTH}/${IMAGE_HEIGHT}` }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    draggable={false}
                />

                {/* グリッドオーバーレイ */}
                {showGrid && loadingState === 'loaded' && (
                    <div
                        className="absolute inset-0 grid"
                        style={{
                            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                        }}
                    >
                        {Array.from({ length: gridSize * gridSize }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => handleGridCellClick(i)}
                                disabled={disabled}
                                className={`
                  border border-white/30 transition-all
                  ${selectedGridCells.has(i)
                                        ? 'bg-blue-500/50 border-blue-400'
                                        : 'hover:bg-white/10'
                                    }
                  ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
                            >
                                {selectedGridCells.has(i) && (
                                    <span className="text-white text-2xl">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* クリックマーカー */}
                {!showGrid && loadingState === 'loaded' && positions.map(pos => (
                    <button
                        key={pos.id}
                        onClick={(e) => handleMarkerClick(e, pos.id)}
                        className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 
                       bg-red-500 border-2 border-white rounded-full 
                       shadow-lg hover:bg-red-600 transition-colors
                       flex items-center justify-center text-white text-xs font-bold"
                        style={{
                            left: `${pos.displayX}%`,
                            top: `${pos.displayY}%`,
                        }}
                        title={`座標: (${pos.x}, ${pos.y}) - クリックで削除`}
                    >
                        ×
                    </button>
                ))}
            </div>

            {/* 選択数表示 */}
            {loadingState === 'loaded' && (
                <div className="mt-2 flex justify-between items-center text-sm text-gray-400">
                    <span>
                        クリックで位置を選択（クリックで削除）
                    </span>
                    <span>
                        {showGrid ? selectedGridCells.size : positions.length} / {maxSelections} 選択中
                    </span>
                </div>
            )}
        </div>
    )
}
