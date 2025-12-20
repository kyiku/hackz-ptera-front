/**
 * Issue #34: feat: 住所入力 - ストリートビュー風ナビゲーション
 *
 * テスト対象: RegisterAddressPage コンポーネント
 * - ページの基本レンダリング
 * - 住所選択とタスク完了
 * - ダッシュボードへの戻り
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegisterAddressPage from './RegisterAddressPage'
import { useRegistrationStore } from '../store/registrationStore'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

describe('RegisterAddressPage', () => {
    beforeEach(() => {
        mockNavigate.mockClear()
        useRegistrationStore.getState().resetAllTasks()
    })

    describe('基本レンダリング', () => {
        it('住所入力ページが表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterAddressPage />
                </MemoryRouter>
            )
            expect(screen.getByTestId('register-address-page')).toBeInTheDocument()
        })

        it('タイトルが表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterAddressPage />
                </MemoryRouter>
            )
            expect(screen.getByText('住所入力')).toBeInTheDocument()
        })

        it('ストリートビュー風ナビゲーションが表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterAddressPage />
                </MemoryRouter>
            )
            expect(screen.getByTestId('street-view-navigation')).toBeInTheDocument()
        })
    })

    describe('住所選択', () => {
        it('住所を選択するとタスクが完了する', () => {
            render(
                <MemoryRouter>
                    <RegisterAddressPage />
                </MemoryRouter>
            )

            const northButton = screen.getByTestId('direction-north')
            fireEvent.click(northButton)

            // タスクが完了していることを確認
            expect(useRegistrationStore.getState().tasks.address.status).toBe('completed')
        })
    })

    describe('ナビゲーション', () => {
        it('戻るボタンでダッシュボードに戻る', () => {
            render(
                <MemoryRouter>
                    <RegisterAddressPage />
                </MemoryRouter>
            )

            const backButton = screen.getByTestId('back-to-dashboard-button')
            fireEvent.click(backButton)

            expect(mockNavigate).toHaveBeenCalledWith('/register')
        })
    })
})

