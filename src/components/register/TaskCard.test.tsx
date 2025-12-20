/**
 * Issue #37: feat: 登録ダッシュボード（ハブ＆スポーク形式）
 *
 * テスト対象: TaskCard コンポーネント
 * - タスクカードの基本レンダリング
 * - 状態表示（完了/未完了）
 * - クリック時のナビゲーション
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { TaskCard } from './TaskCard'
import type { TaskState } from '../../store/types'

// useNavigateをモック
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: vi.fn(),
    }
})

describe('TaskCard', () => {
    const mockNavigate = vi.fn()

    beforeEach(() => {
        vi.mocked(useNavigate).mockReturnValue(mockNavigate)
        mockNavigate.mockClear()
    })

    describe('基本レンダリング', () => {
        it('タスクカードが正しくレンダリングされる', () => {
            const task: TaskState = {
                id: 'name',
                status: 'pending',
                label: '名前入力',
            }

            render(
                <MemoryRouter>
                    <TaskCard task={task} />
                </MemoryRouter>
            )

            expect(screen.getByTestId('task-card-name')).toBeInTheDocument()
        })

        it('タスク名が表示される', () => {
            const task: TaskState = {
                id: 'name',
                status: 'pending',
                label: '名前入力',
            }

            render(
                <MemoryRouter>
                    <TaskCard task={task} />
                </MemoryRouter>
            )

            expect(screen.getByText('名前')).toBeInTheDocument()
        })

        it('各タスクIDに対して正しい表示名が表示される', () => {
            const tasks: TaskState[] = [
                { id: 'name', status: 'pending', label: '名前入力' },
                { id: 'birthday', status: 'pending', label: '生年月日入力' },
                { id: 'phone', status: 'pending', label: '電話番号入力' },
                { id: 'address', status: 'pending', label: '住所入力' },
                { id: 'email', status: 'pending', label: 'メールアドレス入力' },
                { id: 'terms', status: 'pending', label: '利用規約' },
                { id: 'password', status: 'pending', label: 'パスワード入力' },
                { id: 'captcha', status: 'pending', label: 'CAPTCHA' },
                { id: 'otp', status: 'pending', label: 'OTP認証' },
            ]

            const displayNames = ['名前', '生年月日', '電話', '住所', 'メール', '利用規約', 'パスワード', 'CAPTCHA', 'OTP']

            tasks.forEach((task, index) => {
                const { unmount } = render(
                    <MemoryRouter>
                        <TaskCard task={task} />
                    </MemoryRouter>
                )
                expect(screen.getByText(displayNames[index])).toBeInTheDocument()
                unmount()
            })
        })
    })

    describe('状態表示', () => {
        it('未完了タスクには❌が表示される', () => {
            const task: TaskState = {
                id: 'name',
                status: 'pending',
                label: '名前入力',
            }

            render(
                <MemoryRouter>
                    <TaskCard task={task} />
                </MemoryRouter>
            )

            const statusIcon = screen.getByTestId('task-status-name')
            expect(statusIcon).toHaveTextContent('❌')
        })

        it('完了タスクには⚪︎が表示される', () => {
            const task: TaskState = {
                id: 'name',
                status: 'completed',
                label: '名前入力',
            }

            render(
                <MemoryRouter>
                    <TaskCard task={task} />
                </MemoryRouter>
            )

            const statusIcon = screen.getByTestId('task-status-name')
            expect(statusIcon).toHaveTextContent('⚪︎')
        })
    })

    describe('ナビゲーション', () => {
        it('カードクリックで正しいルートに遷移する', () => {
            const task: TaskState = {
                id: 'name',
                status: 'pending',
                label: '名前入力',
            }

            render(
                <MemoryRouter>
                    <TaskCard task={task} />
                </MemoryRouter>
            )

            const card = screen.getByTestId('task-card-name')
            fireEvent.click(card)

            expect(mockNavigate).toHaveBeenCalledWith('/register/name')
        })

        it('各タスクIDに対して正しいルートに遷移する', () => {
            const tasks: TaskState[] = [
                { id: 'name', status: 'pending', label: '名前入力' },
                { id: 'birthday', status: 'pending', label: '生年月日入力' },
                { id: 'phone', status: 'pending', label: '電話番号入力' },
                { id: 'address', status: 'pending', label: '住所入力' },
                { id: 'email', status: 'pending', label: 'メールアドレス入力' },
                { id: 'terms', status: 'pending', label: '利用規約' },
                { id: 'password', status: 'pending', label: 'パスワード入力' },
                { id: 'captcha', status: 'pending', label: 'CAPTCHA' },
                { id: 'otp', status: 'pending', label: 'OTP認証' },
            ]

            const expectedRoutes = [
                '/register/name',
                '/register/birthday',
                '/register/phone',
                '/register/address',
                '/register/email',
                '/register/terms',
                '/register/password',
                '/captcha',
                '/otp',
            ]

            tasks.forEach((task, index) => {
                mockNavigate.mockClear()
                const { unmount } = render(
                    <MemoryRouter>
                        <TaskCard task={task} />
                    </MemoryRouter>
                )

                const card = screen.getByTestId(`task-card-${task.id}`)
                fireEvent.click(card)

                expect(mockNavigate).toHaveBeenCalledWith(expectedRoutes[index])
                unmount()
            })
        })
    })
})

