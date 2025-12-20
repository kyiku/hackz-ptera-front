/**
 * useBackButtonBlock - ブラウザの戻るボタン無効化hook
 * Issue #26: 戻るボタン無効化
 * 
 * 機能:
 * - ブラウザの戻るボタンを無効化
 * - 戻るボタン押下時に指定のパスへリダイレクト
 * - popstateイベントのハンドリング
 */

import { useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export interface UseBackButtonBlockOptions {
    /** 戻るボタン押下時のリダイレクト先 */
    redirectTo?: string
    /** 戻るボタン押下時のコールバック */
    onBackButtonPressed?: () => void
    /** ブロックを有効にするか */
    enabled?: boolean
}

export interface UseBackButtonBlockReturn {
    /** ブロックが有効かどうか */
    isBlocking: boolean
    /** ブロックを有効化 */
    enable: () => void
    /** ブロックを無効化 */
    disable: () => void
}

export const useBackButtonBlock = ({
    redirectTo = '/',
    onBackButtonPressed,
    enabled = true,
}: UseBackButtonBlockOptions = {}): UseBackButtonBlockReturn => {
    const navigate = useNavigate()
    const [isBlocking, setIsBlocking] = useState(enabled)

    const enable = useCallback(() => {
        setIsBlocking(true)
    }, [])

    const disable = useCallback(() => {
        setIsBlocking(false)
    }, [])

    useEffect(() => {
        if (!isBlocking) return

        // 現在のページを履歴に追加（戻るボタンを押しても同じページに留まるため）
        window.history.pushState(null, '', window.location.href)

        const handlePopState = (event: PopStateEvent) => {
            // 戻るボタンが押された
            event.preventDefault()

            // コールバックを呼ぶ
            if (onBackButtonPressed) {
                onBackButtonPressed()
            }

            // 履歴を再度追加（戻るボタンを無効化し続ける）
            window.history.pushState(null, '', window.location.href)

            // 指定のパスへリダイレクト
            navigate(redirectTo, { replace: true })
        }

        window.addEventListener('popstate', handlePopState)

        return () => {
            window.removeEventListener('popstate', handlePopState)
        }
    }, [isBlocking, navigate, redirectTo, onBackButtonPressed])

    return {
        isBlocking,
        enable,
        disable,
    }
}

export default useBackButtonBlock
