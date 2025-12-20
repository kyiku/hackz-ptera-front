/**
 * UI Store - UI状態管理
 * Issue #5: グローバル状態管理（ユーザー状態）
 * 
 * 機能:
 * - ローディング状態管理
 * - モーダル表示管理
 */

import { create } from 'zustand'
import type { UIStore, ModalState } from './types'

const initialModalState: ModalState = {
    isOpen: false,
    type: null,
    message: null,
    redirectDelay: null,
}

export const useUIStore = create<UIStore>((set) => ({
    isLoading: false,
    modalState: initialModalState,

    /**
     * ローディング状態を設定
     */
    setLoading: (isLoading: boolean) => {
        set({ isLoading })
    },

    /**
     * モーダルを表示
     */
    showModal: (
        type: ModalState['type'],
        message: string,
        redirectDelay?: number
    ) => {
        set({
            modalState: {
                isOpen: true,
                type,
                message,
                redirectDelay: redirectDelay || null,
            },
        })
    },

    /**
     * モーダルを非表示
     */
    hideModal: () => {
        set({ modalState: initialModalState })
    },
}))

export default useUIStore
