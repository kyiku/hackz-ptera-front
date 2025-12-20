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
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-500',
        textColor: 'text-red-700 dark:text-red-300',
        title: 'エラー',
    },
    success: {
        icon: '✅',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-500',
        textColor: 'text-green-700 dark:text-green-300',
        title: '成功',
    },
    warning: {
        icon: '!',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-700 dark:text-yellow-300',
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fadeIn"
            onClick={handleOverlayClick}
            data-testid="failure-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className={`relative max-w-md w-full mx-4 p-6 rounded-lg shadow-xl border-2 ${config.bgColor} ${config.borderColor} animate-scaleIn`}
                onClick={handleModalClick}
                data-testid="failure-modal"
            >
                {/* 閉じるボタン */}
                {closeable && onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label="閉じる"
                        data-testid="close-button"
                    >
                        ✕
                    </button>
                )}

                {/* アイコンとタイトル */}
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl" data-testid="modal-icon">
                        {config.icon}
                    </span>
                    <h2
                        id="modal-title"
                        className={`text-xl font-bold ${config.textColor}`}
                        data-testid="modal-title"
                    >
                        {config.title}
                    </h2>
                </div>

                {/* メッセージ */}
                <p
                    className={`text-base mb-2 ${config.textColor}`}
                    data-testid="modal-message"
                >
                    {message}
                </p>

                {/* 詳細メッセージ */}
                {detail && (
                    <p
                        className="text-sm text-gray-600 dark:text-gray-400 mb-4"
                        data-testid="modal-detail"
                    >
                        {detail}
                    </p>
                )}

                {/* リトライ回数 */}
                {onRetry && (
                    <p
                        className="text-sm text-gray-600 dark:text-gray-400 mb-4"
                        data-testid="retry-count"
                    >
                        リトライ回数: {retryCount}/{maxRetries}
                    </p>
                )}

                {/* リダイレクトカウントダウン */}
                {redirectDelay && (
                    <p
                        className="text-sm text-gray-600 dark:text-gray-400 mb-4"
                        data-testid="redirect-countdown"
                    >
                        {redirectDelay}秒後にリダイレクトします...
                    </p>
                )}

                {/* アクションボタン */}
                <div className="flex gap-3 justify-end">
                    {canRetry && (
                        <button
                            onClick={onRetry}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            data-testid="retry-button"
                        >
                            リトライ
                        </button>
                    )}
                    {!canRetry && onRetry && (
                        <button
                            disabled
                            className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
                            data-testid="retry-button-disabled"
                        >
                            リトライ上限
                        </button>
                    )}
                    {closeable && onClose && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
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
