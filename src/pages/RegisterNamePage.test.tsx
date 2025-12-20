/**
 * Issue #31: feat: 名前入力 - スロットマシンUI
 *
 * テスト対象: RegisterNamePage コンポーネント
 * - ページの基本レンダリング
 * - 名前入力とタスク完了
 * - ダッシュボードへの戻り
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegisterNamePage from './RegisterNamePage'
import { useRegistrationStore } from '../store/registrationStore'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

describe('RegisterNamePage', () => {
    beforeEach(() => {
        mockNavigate.mockClear()
        useRegistrationStore.getState().resetAllTasks()
        vi.useRealTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('基本レンダリング', () => {
        it('名前入力ページが表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterNamePage />
                </MemoryRouter>
            )
            expect(screen.getByTestId('register-name-page')).toBeInTheDocument()
        })

        it('タイトルが表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterNamePage />
                </MemoryRouter>
            )
            expect(screen.getByText('名前入力')).toBeInTheDocument()
        })

        it('スロットマシンが表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterNamePage />
                </MemoryRouter>
            )
            expect(screen.getByTestId('slot-machine-input')).toBeInTheDocument()
        })
    })

    describe('名前入力', () => {
        it('名前を入力するとタスクが完了する', async () => {
            render(
                <MemoryRouter>
                    <RegisterNamePage />
                </MemoryRouter>
            )

            // スロットが回転するまで待つ
            await waitFor(() => {
                const firstStopButton = screen.getByTestId('stop-button-0')
                expect(firstStopButton).not.toBeDisabled()
            }, { timeout: 3000 })

            // 最初のスロットを停止
            fireEvent.click(screen.getByTestId('stop-button-0'))

            // タスクが完了していることを確認
            await waitFor(() => {
                expect(useRegistrationStore.getState().tasks.name.status).toBe('completed')
            }, { timeout: 3000 })
        })
    })

    describe('ナビゲーション', () => {
        it('戻るボタンでダッシュボードに戻る', () => {
            render(
                <MemoryRouter>
                    <RegisterNamePage />
                </MemoryRouter>
            )

            const backButton = screen.getByTestId('back-to-dashboard-button')
            fireEvent.click(backButton)

            expect(mockNavigate).toHaveBeenCalledWith('/register')
        })
    })
})
