/**
 * Issue #5: feat: グローバル状態管理（ユーザー状態）
 *
 * テスト対象: UI Store
 * - ローディング状態管理
 * - モーダル表示管理
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from './uiStore'

describe('UIStore', () => {
    beforeEach(() => {
        // ストアの状態をリセット
        useUIStore.setState({
            isLoading: false,
            modalState: {
                isOpen: false,
                type: null,
                message: null,
                redirectDelay: null,
            },
        })
    })

    describe('ローディング状態', () => {
        it('初期状態ではisLoadingがfalse', () => {
            expect(useUIStore.getState().isLoading).toBe(false)
        })

        it('ローディング状態を設定できる', () => {
            const { setLoading } = useUIStore.getState()
            setLoading(true)
            expect(useUIStore.getState().isLoading).toBe(true)
        })

        it('ローディング状態を解除できる', () => {
            const { setLoading } = useUIStore.getState()
            setLoading(true)
            setLoading(false)
            expect(useUIStore.getState().isLoading).toBe(false)
        })
    })

    describe('モーダル表示', () => {
        it('初期状態ではモーダルが非表示', () => {
            const { modalState } = useUIStore.getState()
            expect(modalState.isOpen).toBe(false)
            expect(modalState.type).toBeNull()
            expect(modalState.message).toBeNull()
        })

        it('エラーモーダルを表示できる', () => {
            const { showModal } = useUIStore.getState()
            showModal('error', 'エラーが発生しました')

            const { modalState } = useUIStore.getState()
            expect(modalState.isOpen).toBe(true)
            expect(modalState.type).toBe('error')
            expect(modalState.message).toBe('エラーが発生しました')
        })

        it('成功モーダルを表示できる', () => {
            const { showModal } = useUIStore.getState()
            showModal('success', '成功しました')

            const { modalState } = useUIStore.getState()
            expect(modalState.isOpen).toBe(true)
            expect(modalState.type).toBe('success')
            expect(modalState.message).toBe('成功しました')
        })

        it('警告モーダルを表示できる', () => {
            const { showModal } = useUIStore.getState()
            showModal('warning', '警告です')

            const { modalState } = useUIStore.getState()
            expect(modalState.isOpen).toBe(true)
            expect(modalState.type).toBe('warning')
            expect(modalState.message).toBe('警告です')
        })

        it('リダイレクト遅延を設定できる', () => {
            const { showModal } = useUIStore.getState()
            showModal('error', 'エラーが発生しました', 3000)

            const { modalState } = useUIStore.getState()
            expect(modalState.redirectDelay).toBe(3000)
        })

        it('モーダルを非表示にできる', () => {
            const { showModal, hideModal } = useUIStore.getState()

            showModal('error', 'エラーが発生しました')
            expect(useUIStore.getState().modalState.isOpen).toBe(true)

            hideModal()
            expect(useUIStore.getState().modalState.isOpen).toBe(false)
            expect(useUIStore.getState().modalState.type).toBeNull()
            expect(useUIStore.getState().modalState.message).toBeNull()
        })
    })

    describe('複合操作', () => {
        it('ローディングとモーダルを同時に管理できる', () => {
            const { setLoading, showModal } = useUIStore.getState()

            setLoading(true)
            showModal('error', 'エラーが発生しました')

            expect(useUIStore.getState().isLoading).toBe(true)
            expect(useUIStore.getState().modalState.isOpen).toBe(true)
        })
    })
})
