/**
 * Issue #31: feat: 名前入力 - スロットマシンUI
 *
 * テスト対象: NameSlotPage コンポーネント
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NameSlotPage from './NameSlotPage'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

describe('NameSlotPage', () => {
    beforeEach(() => {
        mockNavigate.mockClear()
        sessionStorage.clear()
        vi.useRealTimers()
    })


    describe('基本レンダリング', () => {
        it('名前入力ページが表示される', () => {
            render(
                <MemoryRouter>
                    <NameSlotPage />
                </MemoryRouter>
            )
            expect(screen.getByTestId('name-slot-page')).toBeInTheDocument()
        })

        it('見出しが表示される', () => {
            render(
                <MemoryRouter>
                    <NameSlotPage />
                </MemoryRouter>
            )
            expect(screen.getByText(/名前を入力/)).toBeInTheDocument()
        })

        it('スロットマシンが表示される', () => {
            render(
                <MemoryRouter>
                    <NameSlotPage />
                </MemoryRouter>
            )
            // SlotMachineAppコンポーネントが表示されていることを確認
            expect(screen.getByTestId('slot-reels')).toBeInTheDocument()
        })
    })

    describe('現在の名前表示', () => {
        it('スロットが表示される', () => {
            render(
                <MemoryRouter>
                    <NameSlotPage />
                </MemoryRouter>
            )
            // スロットのリールが表示されていることを確認（初期状態は'-'）
            const reels = screen.getAllByText('-')
            expect(reels.length).toBeGreaterThanOrEqual(3)
        })
    })
})

