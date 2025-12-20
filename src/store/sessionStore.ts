/**
 * Session Store - セッション管理
 * Issue #5: グローバル状態管理（ユーザー状態）
 * 
 * 機能:
 * - セッションID管理
 * - ユーザーステータス管理
 * - 待機列位置管理
 * - 登録トークン管理
 */

import { create } from 'zustand'
import type { SessionStore, UserStatus } from './types'

const initialState = {
    sessionId: null,
    status: 'idle' as UserStatus,
    queuePosition: null,
    registerToken: null,
    tokenExpiresAt: null,
}

export const useSessionStore = create<SessionStore>((set) => ({
    ...initialState,

    /**
     * セッションIDを設定
     */
    setSession: (sessionId: string) => {
        set({ sessionId })
    },

    /**
     * ユーザーステータスを設定
     */
    setStatus: (status: UserStatus) => {
        set({ status })
    },

    /**
     * 待機列位置を設定
     */
    setQueuePosition: (position: number) => {
        set({ queuePosition: position })
    },

    /**
     * 登録トークンを設定
     */
    setRegisterToken: (token: string, expiresAt: Date) => {
        set({
            registerToken: token,
            tokenExpiresAt: expiresAt,
        })
    },

    /**
     * 状態をリセット（失敗時に待機列最後尾へ）
     */
    reset: () => {
        set(initialState)
    },
}))

export default useSessionStore
