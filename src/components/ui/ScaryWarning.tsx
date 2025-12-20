/**
 * ScaryWarning - 恐怖の警告文コンポーネント
 * Issue #27: 恐怖の演出（警告文表示）
 * 
 * 機能:
 * - 赤文字の警告文表示
 * - CAPTCHA画面等に配置
 * - 恐怖を煽る演出
 */

import React from 'react'

export interface ScaryWarningProps {
    /** 警告メッセージ */
    message?: string
    /** アニメーションタイプ */
    animation?: 'pulse' | 'shake' | 'none'
    /** 警告レベル（段階的にエスカレート） */
    level?: 1 | 2 | 3
    /** カスタムクラス名 */
    className?: string
}

export const ScaryWarning: React.FC<ScaryWarningProps> = ({
    message = '※失敗すると待機列の最後尾に戻ります',
    animation = 'pulse',
    level = 1,
    className = '',
}) => {
    const animationClass = {
        pulse: 'animate-pulse',
        shake: 'animate-bounce',
        none: '',
    }[animation]

    const levelStyles = {
        1: 'text-xs text-stone-500',
        2: 'text-sm text-stone-600',
        3: 'text-sm text-stone-700',
    }[level]

    const bgStyles = {
        1: '',
        2: 'bg-stone-50 p-3 rounded-sm border border-stone-200',
        3: 'bg-stone-100 p-4 rounded-sm border border-stone-300',
    }[level]

    return (
        <div
            className={`flex items-center gap-2 ${bgStyles} ${animationClass} ${className}`}
            data-testid="scary-warning"
            role="alert"
            aria-live="polite"
        >
            <span
                className="text-lg text-stone-400"
                data-testid="warning-icon"
                aria-hidden="true"
            >
                !
            </span>
            <p className={levelStyles} data-testid="warning-message">
                {message}
            </p>
        </div>
    )
}

export default ScaryWarning
