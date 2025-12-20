/**
 * Issue #32: feat: 生年月日入力 - 横スクロールバーUI
 *
 * テスト対象: RegisterBirthdayPage コンポーネント
 * - ページの基本レンダリング
 * - 日付選択とタスク完了
 * - ダッシュボードへの戻り
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegisterBirthdayPage from './RegisterBirthdayPage'
import { useRegistrationStore } from '../store/registrationStore'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

describe('RegisterBirthdayPage', () => {
    beforeEach(() => {
        mockNavigate.mockClear()
        useRegistrationStore.getState().resetAllTasks()
    })

    describe('基本レンダリング', () => {
        it('生年月日入力ページが表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterBirthdayPage />
                </MemoryRouter>
            )
            expect(screen.getByTestId('register-birthday-page')).toBeInTheDocument()
        })

        it('タイトルが表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterBirthdayPage />
                </MemoryRouter>
            )
            expect(screen.getByText('生年月日入力')).toBeInTheDocument()
        })

        it('横スクロールバーが表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterBirthdayPage />
                </MemoryRouter>
            )
            expect(screen.getByTestId('birthday-scroll-container')).toBeInTheDocument()
        })

        it('戻るボタンが表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterBirthdayPage />
                </MemoryRouter>
            )
            expect(screen.getByTestId('back-to-dashboard-button')).toBeInTheDocument()
        })
    })

    describe('日付選択', () => {
        it('日付を選択するとタスクが完了する', () => {
            render(
                <MemoryRouter>
                    <RegisterBirthdayPage />
                </MemoryRouter>
            )

            const dateItems = screen.getAllByTestId(/^birthday-date-/)
            const firstDate = dateItems[0]
            fireEvent.click(firstDate)

            // タスクが完了していることを確認
            expect(useRegistrationStore.getState().tasks.birthday.status).toBe('completed')
        })

        it('選択した日付がフォームデータに保存される', () => {
            render(
                <MemoryRouter>
                    <RegisterBirthdayPage />
                </MemoryRouter>
            )

            const dateItems = screen.getAllByTestId(/^birthday-date-/)
            const firstDate = dateItems[0]
            const dateValue = firstDate.getAttribute('data-date')

            fireEvent.click(firstDate)

            expect(useRegistrationStore.getState().formData.birthday).toBe(dateValue)
        })
    })

    describe('ナビゲーション', () => {
        it('戻るボタンでダッシュボードに戻る', () => {
            render(
                <MemoryRouter>
                    <RegisterBirthdayPage />
                </MemoryRouter>
            )

            const backButton = screen.getByTestId('back-to-dashboard-button')
            fireEvent.click(backButton)

            expect(mockNavigate).toHaveBeenCalledWith('/register')
        })
    })
})

