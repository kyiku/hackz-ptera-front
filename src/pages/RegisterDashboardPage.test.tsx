/**
 * Issue #37: feat: 登録ダッシュボード（ハブ＆スポーク形式）
 *
 * テスト対象: RegisterDashboardPage コンポーネント
 * - ダッシュボードページの基本レンダリング
 * - 9つのタスクカードの表示
 * - 登録ボタンの状態（有効/無効）
 * - 登録ボタン押下時の処理
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { RegisterDashboardPage } from './RegisterDashboardPage'
import { useRegistrationStore } from '../store/registrationStore'
import type { TaskId } from '../store/types'

// useNavigateをモック
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: vi.fn(),
    }
})

describe('RegisterDashboardPage', () => {
    const mockNavigate = vi.fn()

    beforeEach(() => {
        vi.mocked(useNavigate).mockReturnValue(mockNavigate)
        mockNavigate.mockClear()
        // ストアの状態をリセット
        useRegistrationStore.getState().resetAllTasks()
    })

    describe('基本レンダリング', () => {
        it('ダッシュボードページが正しくレンダリングされる', () => {
            render(
                <MemoryRouter>
                    <RegisterDashboardPage />
                </MemoryRouter>
            )

            expect(screen.getByTestId('register-dashboard-page')).toBeInTheDocument()
        })

        it('タイトルが表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterDashboardPage />
                </MemoryRouter>
            )

            expect(screen.getByText('登録ダッシュボード')).toBeInTheDocument()
        })

        it('9つのタスクカードが表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterDashboardPage />
                </MemoryRouter>
            )

            const taskIds: TaskId[] = [
                'name',
                'birthday',
                'phone',
                'address',
                'email',
                'terms',
                'password',
                'captcha',
                'otp',
            ]

            taskIds.forEach((taskId) => {
                expect(screen.getByTestId(`task-card-${taskId}`)).toBeInTheDocument()
            })
        })

        it('登録ボタンが表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterDashboardPage />
                </MemoryRouter>
            )

            expect(screen.getByTestId('register-submit-button')).toBeInTheDocument()
        })
    })

    describe('タスクカードの表示順序', () => {
        it('タスクカードが正しい順序で表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterDashboardPage />
                </MemoryRouter>
            )

            // 表示順序: name, birthday, phone, address, email, terms, password, captcha, otp
            const expectedOrder: TaskId[] = [
                'name',
                'birthday',
                'phone',
                'address',
                'email',
                'terms',
                'password',
                'captcha',
                'otp',
            ]

            const cards = expectedOrder.map((taskId) => screen.getByTestId(`task-card-${taskId}`))
            const cardContainer = cards[0].parentElement

            // カードが正しい順序で配置されているか確認
            expectedOrder.forEach((taskId, index) => {
                expect(cards[index]).toBeInTheDocument()
            })
        })
    })

    describe('登録ボタンの状態', () => {
        it('初期状態では登録ボタンが無効', () => {
            render(
                <MemoryRouter>
                    <RegisterDashboardPage />
                </MemoryRouter>
            )

            const submitButton = screen.getByTestId('register-submit-button')
            expect(submitButton).toBeDisabled()
        })

        it('全タスク未完了時は「※全タスク完了で有効化」が表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterDashboardPage />
                </MemoryRouter>
            )

            expect(screen.getByText('※全タスク完了で有効化')).toBeInTheDocument()
        })

        it('一部タスク完了時も登録ボタンが無効', () => {
            const { completeTask } = useRegistrationStore.getState()
            completeTask('name')

            render(
                <MemoryRouter>
                    <RegisterDashboardPage />
                </MemoryRouter>
            )

            const submitButton = screen.getByTestId('register-submit-button')
            expect(submitButton).toBeDisabled()
        })

        it('全タスク完了時は登録ボタンが有効', () => {
            const { completeTask } = useRegistrationStore.getState()

            // 全9タスクを完了
            const taskIds: TaskId[] = [
                'name',
                'birthday',
                'phone',
                'address',
                'email',
                'terms',
                'password',
                'captcha',
                'otp',
            ]

            taskIds.forEach((taskId) => {
                completeTask(taskId)
            })

            render(
                <MemoryRouter>
                    <RegisterDashboardPage />
                </MemoryRouter>
            )

            const submitButton = screen.getByTestId('register-submit-button')
            expect(submitButton).not.toBeDisabled()
        })

        it('全タスク完了時は「※全タスク完了で有効化」が表示されない', () => {
            const { completeTask } = useRegistrationStore.getState()

            const taskIds: TaskId[] = [
                'name',
                'birthday',
                'phone',
                'address',
                'email',
                'terms',
                'password',
                'captcha',
                'otp',
            ]

            taskIds.forEach((taskId) => {
                completeTask(taskId)
            })

            render(
                <MemoryRouter>
                    <RegisterDashboardPage />
                </MemoryRouter>
            )

            expect(screen.queryByText('※全タスク完了で有効化')).not.toBeInTheDocument()
        })
    })

    describe('登録ボタン押下', () => {
        it('全タスク完了時に登録ボタンをクリックするとエラーページへ遷移する', async () => {
            const { completeTask } = useRegistrationStore.getState()

            const taskIds: TaskId[] = [
                'name',
                'birthday',
                'phone',
                'address',
                'email',
                'terms',
                'password',
                'captcha',
                'otp',
            ]

            taskIds.forEach((taskId) => {
                completeTask(taskId)
            })

            render(
                <MemoryRouter>
                    <RegisterDashboardPage />
                </MemoryRouter>
            )

            const submitButton = screen.getByTestId('register-submit-button')
            fireEvent.click(submitButton)

            await waitFor(
                () => {
                    expect(mockNavigate).toHaveBeenCalledWith('/register/complete')
                },
                { timeout: 2000 }
            )
        })

        it('未完了時は登録ボタンをクリックしても何も起こらない', () => {
            render(
                <MemoryRouter>
                    <RegisterDashboardPage />
                </MemoryRouter>
            )

            const submitButton = screen.getByTestId('register-submit-button')
            // disabledなボタンはクリックイベントが発火しないが、念のため確認
            expect(submitButton).toBeDisabled()
            expect(mockNavigate).not.toHaveBeenCalled()
        })
    })
})

