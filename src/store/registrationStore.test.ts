/**
 * Issue #5: feat: グローバル状態管理（ユーザー状態）
 *
 * テスト対象: Registration Store
 * - タスク管理
 * - フォームデータ管理
 * - 完了状態の計算
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useRegistrationStore } from './registrationStore'

describe('RegistrationStore', () => {
    beforeEach(() => {
        // ストアの状態をリセット
        useRegistrationStore.getState().resetAllTasks()
    })

    describe('初期状態', () => {
        it('すべてのタスクがpending状態', () => {
            const { tasks } = useRegistrationStore.getState()
            Object.values(tasks).forEach((task) => {
                expect(task.status).toBe('pending')
            })
        })

        it('isAllCompletedがfalse', () => {
            expect(useRegistrationStore.getState().isAllCompleted).toBe(false)
        })

        it('completedCountが0', () => {
            expect(useRegistrationStore.getState().completedCount).toBe(0)
        })
    })

    describe('タスク完了', () => {
        it('タスクを完了できる', () => {
            const { completeTask } = useRegistrationStore.getState()
            completeTask('name', { name: '田中太郎' })

            expect(useRegistrationStore.getState().tasks.name.status).toBe('completed')
            expect(useRegistrationStore.getState().formData.name).toBe('田中太郎')
        })

        it('複数のタスクを完了できる', () => {
            const { completeTask } = useRegistrationStore.getState()

            completeTask('name', { name: '田中太郎' })
            completeTask('birthday', { birthday: '1990-01-01' })
            completeTask('phone', { phone: '090-1234-5678' })

            expect(useRegistrationStore.getState().completedCount).toBe(3)
        })

        it('データなしでタスクを完了できる', () => {
            const { completeTask } = useRegistrationStore.getState()
            completeTask('captcha')

            expect(useRegistrationStore.getState().tasks.captcha.status).toBe('completed')
        })
    })

    describe('計算プロパティ', () => {
        it('completedCountが正しく計算される', () => {
            const { completeTask } = useRegistrationStore.getState()

            expect(useRegistrationStore.getState().completedCount).toBe(0)

            completeTask('name')
            expect(useRegistrationStore.getState().completedCount).toBe(1)

            completeTask('birthday')
            expect(useRegistrationStore.getState().completedCount).toBe(2)
        })

        it('すべてのタスク完了時にisAllCompletedがtrue', () => {
            const { completeTask } = useRegistrationStore.getState()

            // 9つすべてのタスクを完了
            completeTask('name')
            completeTask('birthday')
            completeTask('phone')
            completeTask('address')
            completeTask('email')
            completeTask('terms')
            completeTask('password')
            completeTask('captcha')
            completeTask('otp')

            expect(useRegistrationStore.getState().isAllCompleted).toBe(true)
            expect(useRegistrationStore.getState().completedCount).toBe(9)
        })
    })

    describe('タスクリセット', () => {
        it('個別のタスクをリセットできる', () => {
            const { completeTask, resetTask } = useRegistrationStore.getState()

            completeTask('name', { name: '田中太郎' })
            expect(useRegistrationStore.getState().tasks.name.status).toBe('completed')

            resetTask('name')
            expect(useRegistrationStore.getState().tasks.name.status).toBe('pending')
            // フォームデータは保持される
            expect(useRegistrationStore.getState().formData.name).toBe('田中太郎')
        })

        it('すべてのタスクをリセットできる', () => {
            const { completeTask, resetAllTasks } = useRegistrationStore.getState()

            completeTask('name', { name: '田中太郎' })
            completeTask('birthday', { birthday: '1990-01-01' })

            resetAllTasks()

            expect(useRegistrationStore.getState().completedCount).toBe(0)
            expect(useRegistrationStore.getState().formData.name).toBeNull()
            expect(useRegistrationStore.getState().formData.birthday).toBeNull()
        })
    })

    describe('フォームデータ', () => {
        it('複数のフィールドを同時に更新できる', () => {
            const { completeTask } = useRegistrationStore.getState()

            completeTask('name', {
                name: '田中太郎',
                birthday: '1990-01-01',
            })

            const { formData } = useRegistrationStore.getState()
            expect(formData.name).toBe('田中太郎')
            expect(formData.birthday).toBe('1990-01-01')
        })
    })
})
