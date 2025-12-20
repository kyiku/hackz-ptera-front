/**
 * Issue #31: feat: 名前入力 - スロットマシンUI
 *
 * テスト対象: SlotMachineInput コンポーネント
 * - スロットマシンの表示
 * - スロットの回転
 * - ストップボタンでの文字確定
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SlotMachineInput } from './SlotMachineInput'

describe('SlotMachineInput', () => {
    const mockOnChange = vi.fn()

    beforeEach(() => {
        mockOnChange.mockClear()
        vi.useRealTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('基本レンダリング', () => {
        it('スロットマシンが表示される', () => {
            render(<SlotMachineInput value="" onChange={mockOnChange} />)
            expect(screen.getByTestId('slot-machine-input')).toBeInTheDocument()
        })

        it('複数のスロットが表示される', () => {
            render(<SlotMachineInput value="" onChange={mockOnChange} maxLength={5} />)
            const slots = screen.getAllByTestId(/^slot-/)
            expect(slots.length).toBe(5)
        })

        it('ストップボタンが表示される', () => {
            render(<SlotMachineInput value="" onChange={mockOnChange} />)
            const stopButtons = screen.getAllByTestId(/^stop-button-/)
            expect(stopButtons.length).toBeGreaterThan(0)
        })
    })

    describe('スロットの回転', () => {
        it('最初のスロットが自動的に回転を開始する', async () => {
            render(<SlotMachineInput value="" onChange={mockOnChange} />)
            
            await waitFor(() => {
                const firstStopButton = screen.getByTestId('stop-button-0')
                expect(firstStopButton).not.toBeDisabled()
            }, { timeout: 3000 })
        })

        it('ストップボタンでスロットが停止する', async () => {
            render(<SlotMachineInput value="" onChange={mockOnChange} />)
            
            // スロットが回転するまで待つ
            await waitFor(() => {
                const firstStopButton = screen.getByTestId('stop-button-0')
                expect(firstStopButton).not.toBeDisabled()
            }, { timeout: 3000 })

            const firstStopButton = screen.getByTestId('stop-button-0')
            fireEvent.click(firstStopButton)

            // スロットが停止したことを確認
            await waitFor(() => {
                expect(firstStopButton).toBeDisabled()
            }, { timeout: 2000 })

            // onChangeが呼ばれたことを確認
            await waitFor(() => {
                expect(mockOnChange).toHaveBeenCalled()
            }, { timeout: 2000 })
        })
    })

    describe('名前の入力', () => {
        it('入力された名前が表示される', () => {
            render(<SlotMachineInput value="あ" onChange={mockOnChange} />)
            
            // 名前が表示されることを確認
            expect(screen.getByText('入力された名前')).toBeInTheDocument()
        })
    })

    describe('リセット', () => {
        it('リセットボタンでスロットがリセットされる', async () => {
            render(<SlotMachineInput value="あ" onChange={mockOnChange} />)
            
            const resetButton = screen.getByTestId('reset-button')
            fireEvent.click(resetButton)

            // onChangeが空文字列で呼ばれたことを確認
            await waitFor(() => {
                expect(mockOnChange).toHaveBeenCalledWith('')
            }, { timeout: 2000 })
        })
    })

    describe('無効化', () => {
        it('disabled時は操作できない', () => {
            render(
                <SlotMachineInput
                    value=""
                    onChange={mockOnChange}
                    disabled={true}
                />
            )

            const resetButton = screen.getByTestId('reset-button')
            expect(resetButton).toBeDisabled()
        })
    })
})
