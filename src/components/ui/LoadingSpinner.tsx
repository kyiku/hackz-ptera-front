/**
 * LoadingSpinner - ローディングスピナーコンポーネント
 * Issue #30: ローディングスピナーコンポーネント
 * 
 * 機能:
 * - API通信中などに表示するスピナー
 * - サイズバリエーション（small/medium/large）
 * - カラーバリエーション
 * - フルスクリーンオーバーレイ版
 * - インライン版
 */

import React from 'react'

export interface LoadingSpinnerProps {
    /** スピナーのサイズ */
    size?: 'small' | 'medium' | 'large' | number
    /** スピナーの色 */
    color?: 'primary' | 'secondary' | string
    /** ローディングテキスト */
    text?: string
    /** テキストの位置 */
    textPosition?: 'top' | 'bottom' | 'right' | 'left'
    /** フルスクリーン表示 */
    fullscreen?: boolean
    /** カスタムクラス名 */
    className?: string
}

const sizeMap = {
    small: 24,
    medium: 40,
    large: 64,
}

const colorMap = {
    primary: 'border-blue-500',
    secondary: 'border-gray-500',
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'medium',
    color = 'primary',
    text,
    textPosition = 'bottom',
    fullscreen = false,
    className = '',
}) => {
    const spinnerSize = typeof size === 'number' ? size : sizeMap[size]
    const spinnerColor = color in colorMap ? colorMap[color as keyof typeof colorMap] : ''
    const customColor = !(color in colorMap) ? color : undefined

    const spinnerElement = (
        <div
            className={`inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent ${spinnerColor} ${className}`}
            style={{
                width: `${spinnerSize}px`,
                height: `${spinnerSize}px`,
                borderColor: customColor ? `${customColor} transparent ${customColor} ${customColor}` : undefined,
            }}
            role="status"
            aria-label={text || 'Loading'}
            data-testid="loading-spinner"
        >
            <span className="sr-only">{text || 'Loading...'}</span>
        </div>
    )

    const content = text ? (
        <div
            className={`flex items-center gap-3 ${textPosition === 'top' || textPosition === 'bottom'
                    ? 'flex-col'
                    : 'flex-row'
                } ${textPosition === 'top' ? 'flex-col-reverse' : ''} ${textPosition === 'left' ? 'flex-row-reverse' : ''
                }`}
            data-testid="loading-spinner-with-text"
        >
            {spinnerElement}
            <span className="text-sm text-gray-600 dark:text-gray-300">{text}</span>
        </div>
    ) : (
        spinnerElement
    )

    if (fullscreen) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                data-testid="loading-spinner-overlay"
            >
                {content}
            </div>
        )
    }

    return content
}

export default LoadingSpinner
