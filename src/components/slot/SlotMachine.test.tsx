/**
 * Issue #31: feat: 名前入力 - スロットマシンUI
 *
 * テスト対象: SlotMachine コンポーネント
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SlotMachine } from './SlotMachine'

describe('SlotMachine', () => {
    const mockOnSpin = vi.fn()
    const mockOnConfirm = vi.fn()

    describe('基本レンダリング', () => {
        it('スロットマシンが表示される', () => {
            render(
                <SlotMachine
                    reels={['?', '?', '?']}
                    isSpinning={false}
                    onSpin={mockOnSpin}
                    onConfirm={mockOnConfirm}
                    canConfirm={false}
                    spinCount={0}
                />
            )
            expect(screen.getByTestId('slot-machine')).toBeInTheDocument()
        })

        it('3つのリールが表示される', () => {
            render(
                <SlotMachine
                    reels={['あ', 'い', 'う']}
                    isSpinning={false}
                    onSpin={mockOnSpin}
                    onConfirm={mockOnConfirm}
                    canConfirm={false}
                    spinCount={0}
                />
            )
            expect(screen.getByTestId('reel-0')).toBeInTheDocument()
            expect(screen.getByTestId('reel-1')).toBeInTheDocument()
            expect(screen.getByTestId('reel-2')).toBeInTheDocument()
        })

        it('SPINボタンが表示される', () => {
            render(
                <SlotMachine
                    reels={['?', '?', '?']}
                    isSpinning={false}
                    onSpin={mockOnSpin}
                    onConfirm={mockOnConfirm}
                    canConfirm={false}
                    spinCount={0}
                />
            )
            expect(screen.getByTestId('spin-button')).toBeInTheDocument()
        })

        it('確定ボタンが表示される', () => {
            render(
                <SlotMachine
                    reels={['?', '?', '?']}
                    isSpinning={false}
                    onSpin={mockOnSpin}
                    onConfirm={mockOnConfirm}
                    canConfirm={false}
                    spinCount={0}
                />
            )
            expect(screen.getByTestId('confirm-button')).toBeInTheDocument()
        })
    })

    describe('スピン回数表示', () => {
        it('スピン回数が表示される', () => {
            render(
                <SlotMachine
                    reels={['?', '?', '?']}
                    isSpinning={false}
                    onSpin={mockOnSpin}
                    onConfirm={mockOnConfirm}
                    canConfirm={false}
                    spinCount={3}
                />
            )
            expect(screen.getByText(/スピン回数: 3回/)).toBeInTheDocument()
        })

        it('スピン回数が正しく表示される', () => {
            render(
                <SlotMachine
                    reels={['?', '?', '?']}
                    isSpinning={false}
                    onSpin={mockOnSpin}
                    onConfirm={mockOnConfirm}
                    canConfirm={false}
                    spinCount={2}
                />
            )
            expect(screen.getByText(/スピン回数: 2回/)).toBeInTheDocument()
        })
    })
})

