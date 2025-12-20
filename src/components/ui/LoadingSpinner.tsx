/**
 * LoadingSpinner - ローディングスピナーコンポーネント
 */

import React from 'react'

export interface LoadingSpinnerProps {
    /** スピナーのサイズ */
    size?: 'small' | 'medium' | 'large' | number
    /** ローディングテキスト */
    text?: string
    /** フルスクリーン表示 */
    fullscreen?: boolean
    /** カスタムクラス名 */
    className?: string
}

const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'medium',
    text,
    fullscreen = false,
    className = '',
}) => {
    const spinnerSize = typeof size === 'number' ? size : sizeMap[size]

    const spinnerElement = (
        <div
            className={`inline-block rounded-full border border-stone-300 border-t-stone-600 animate-spin ${className}`}
            style={{
                width: `${spinnerSize}px`,
                height: `${spinnerSize}px`,
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
            className="flex flex-col items-center gap-3"
            data-testid="loading-spinner-with-text"
        >
            {spinnerElement}
            <span className="text-sm text-stone-500">{text}</span>
        </div>
    ) : (
        spinnerElement
    )

    if (fullscreen) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-stone-50/80"
                data-testid="loading-spinner-overlay"
            >
                {content}
            </div>
        )
    }

    return content
}

export default LoadingSpinner
