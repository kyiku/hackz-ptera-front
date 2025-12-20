/**
 * FailureModal - 失敗時フィードバックモーダル
 * Issue #29: 失敗時フィードバックUI（モーダル）
 * 
 * 機能:
 * - 失敗時のフィードバック表示
 * - エラーメッセージ表示
 * - リトライオプション
 * - カウントダウン表示
 * - 背景オーバーレイ
 */

import React, { useEffect, useCallback } from 'react'

export interface FailureModalProps {
    /** モーダルの表示状態 */
    isOpen: boolean
    /** エラーメッセージ */
    message: string
    /** 詳細メッセージ（オプション） */
    detail?: string
    /** モーダルのタイプ */
    type?: 'error' | 'success' | 'warning'
    /** リトライコールバック */
    onRetry?: () => void
    /** 閉じるコールバック */
    onClose?: () => void
    /** 現在のリトライ回数 */
    retryCount?: number
    /** 最大リトライ回数 */
    maxRetries?: number
    /** 閉じることができるか */
    closeable?: boolean
    /** 自動リダイレクトまでの秒数 */
    redirectDelay?: number
}

const typeConfig = {
    error: {
        icon: 'X',
        bgColor: 'bg-white',
        borderColor: 'border-stone-200',
        textColor: 'text-stone-700',
        title: 'エラー',
    },
    success: {
        icon: '',
        bgColor: 'bg-white',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-600',
        title: '成功',
    },
    warning: {
        icon: '!',
        bgColor: 'bg-white',
        borderColor: 'border-stone-200',
        textColor: 'text-stone-600',
        title: '警告',
    },
}

export const FailureModal: React.FC<FailureModalProps> = ({
    isOpen,
    message,
    detail,
    type = 'error',
    onRetry,
    onClose,
    retryCount = 0,
    maxRetries = 3,
    closeable = true,
    redirectDelay,
}) => {
    const config = typeConfig[type]
    const canRetry = onRetry && retryCount < maxRetries

    // Escキーでモーダルを閉じる
    const handleEscKey = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape' && closeable && onClose) {
                onClose()
            }
        },
        [closeable, onClose]
    )

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscKey)
            return () => {
                document.removeEventListener('keydown', handleEscKey)
            }
        }
    }, [isOpen, handleEscKey])

    // オーバーレイクリックでモーダルを閉じる
    const handleOverlayClick = () => {
        if (closeable && onClose) {
            onClose()
        }
    }

    // モーダル内クリックで伝播を止める
    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 animate-fadeIn"
            onClick={handleOverlayClick}
            data-testid="failure-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className={`relative max-w-md w-full mx-4 p-8 rounded-sm border ${config.bgColor} ${config.borderColor} animate-scaleIn`}
                onClick={handleModalClick}
                data-testid="failure-modal"
            >
                {/* 閉じるボタン */}
                {closeable && onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
                        aria-label="閉じる"
                        data-testid="close-button"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* アイコンとタイトル */}
                <div className="flex items-center gap-3 mb-6">
                    {config.icon && (
                        <span className="text-2xl text-stone-400" data-testid="modal-icon">
                            {config.icon}
                        </span>
                    )}
                    <h2
                        id="modal-title"
                        className={`text-lg font-light tracking-wide ${config.textColor}`}
                        data-testid="modal-title"
                    >
                        {config.title}
                    </h2>
                </div>

                {/* メッセージ */}
                <p
                    className="text-sm text-stone-600 mb-2"
                    data-testid="modal-message"
                >
                    {message}
                </p>

                {/* 詳細メッセージ */}
                {detail && (
                    <p
                        className="text-xs text-stone-400 mb-4"
                        data-testid="modal-detail"
                    >
                        {detail}
                    </p>
                )}

                {/* リトライ回数 */}
                {onRetry && (
                    <p
                        className="text-xs text-stone-400 mb-4"
                        data-testid="retry-count"
                    >
                        リトライ回数: {retryCount}/{maxRetries}
                    </p>
                )}

                {/* リダイレクトカウントダウン */}
                {redirectDelay && (
                    <p
                        className="text-xs text-stone-400 mb-4"
                        data-testid="redirect-countdown"
                    >
                        {redirectDelay}秒後にリダイレクトします...
                    </p>
                )}

                {/* アクションボタン */}
                <div className="flex gap-3 justify-end mt-6">
                    {canRetry && (
                        <button
                            onClick={onRetry}
                            className="px-5 py-2 bg-stone-800 text-white text-sm tracking-wide rounded-sm hover:bg-stone-700 transition-colors"
                            data-testid="retry-button"
                        >
                            リトライ
                        </button>
                    )}
                    {!canRetry && onRetry && (
                        <button
                            disabled
                            className="px-5 py-2 bg-stone-200 text-stone-400 text-sm rounded-sm cursor-not-allowed"
                            data-testid="retry-button-disabled"
                        >
                            リトライ上限
                        </button>
                    )}
                    {closeable && onClose && (
                        <button
                            onClick={onClose}
                            className="px-5 py-2 border border-stone-300 text-stone-600 text-sm tracking-wide rounded-sm hover:bg-stone-50 transition-colors"
                            data-testid="close-action-button"
                        >
                            閉じる
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FailureModal
