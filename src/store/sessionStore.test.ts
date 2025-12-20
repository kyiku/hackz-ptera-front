/**
 * Issue #5: feat: グローバル状態管理（ユーザー状態）
 *
 * テスト対象: Session Store
 * - セッション管理
 * - ステータス管理
 * - トークン管理
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useSessionStore } from './sessionStore'

describe('SessionStore', () => {
    beforeEach(() => {
        // ストアの状態をリセット
        useSessionStore.getState().reset()
    })

    describe('セッション管理', () => {
        it('セッションIDを設定できる', () => {
            const { setSession } = useSessionStore.getState()
            setSession('test-session-id')
            expect(useSessionStore.getState().sessionId).toBe('test-session-id')
        })

        it('初期状態ではsessionIdがnull', () => {
            expect(useSessionStore.getState().sessionId).toBeNull()
        })
    })

    describe('ステータス管理', () => {
        it('初期状態はidle', () => {
            expect(useSessionStore.getState().status).toBe('idle')
        })

        it('ステータスをwaitingに変更できる', () => {
            const { setStatus } = useSessionStore.getState()
            setStatus('waiting')
            expect(useSessionStore.getState().status).toBe('waiting')
        })

        it('ステータスをstage1_dinoに変更できる', () => {
            const { setStatus } = useSessionStore.getState()
            setStatus('stage1_dino')
            expect(useSessionStore.getState().status).toBe('stage1_dino')
        })

        it('ステータスをregisteringに変更できる', () => {
            const { setStatus } = useSessionStore.getState()
            setStatus('registering')
            expect(useSessionStore.getState().status).toBe('registering')
        })
    })

    describe('待機列管理', () => {
        it('待機列位置を設定できる', () => {
            const { setQueuePosition } = useSessionStore.getState()
            setQueuePosition(42)
            expect(useSessionStore.getState().queuePosition).toBe(42)
        })

        it('初期状態ではqueuePositionがnull', () => {
            expect(useSessionStore.getState().queuePosition).toBeNull()
        })
    })

    describe('トークン管理', () => {
        it('登録トークンを設定できる', () => {
            const { setRegisterToken } = useSessionStore.getState()
            const expiresAt = new Date('2025-12-31')
            setRegisterToken('test-token', expiresAt)

            expect(useSessionStore.getState().registerToken).toBe('test-token')
            expect(useSessionStore.getState().tokenExpiresAt).toEqual(expiresAt)
        })

        it('初期状態ではregisterTokenがnull', () => {
            expect(useSessionStore.getState().registerToken).toBeNull()
            expect(useSessionStore.getState().tokenExpiresAt).toBeNull()
        })
    })

    describe('リセット', () => {
        it('reset()で全状態が初期化される', () => {
            const { setSession, setStatus, setQueuePosition, setRegisterToken, reset } =
                useSessionStore.getState()

            // 状態を設定
            setSession('test-session')
            setStatus('registering')
            setQueuePosition(10)
            setRegisterToken('test-token', new Date())

            // リセット
            reset()

            // 初期状態に戻ることを確認
            expect(useSessionStore.getState().sessionId).toBeNull()
            expect(useSessionStore.getState().status).toBe('idle')
            expect(useSessionStore.getState().queuePosition).toBeNull()
            expect(useSessionStore.getState().registerToken).toBeNull()
            expect(useSessionStore.getState().tokenExpiresAt).toBeNull()
        })
    })
})
