/**
 * Issue #34: feat: 住所入力 - ストリートビュー風ナビゲーション
 *
 * テスト対象: StreetViewNavigation コンポーネント
 * - ストリートビュー風ナビゲーションの表示
 * - 方向キーでの移動
 * - ボタンクリックでの移動
 * - 住所の生成
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StreetViewNavigation } from './StreetViewNavigation'

describe('StreetViewNavigation', () => {
    const mockOnChange = vi.fn()

    beforeEach(() => {
        mockOnChange.mockClear()
    })

    describe('基本レンダリング', () => {
        it('ストリートビュー風ナビゲーションが表示される', () => {
            render(<StreetViewNavigation value={null} onChange={mockOnChange} />)
            expect(screen.getByTestId('street-view-navigation')).toBeInTheDocument()
        })

        it('現在位置が表示される', () => {
            render(<StreetViewNavigation value={null} onChange={mockOnChange} />)
            expect(screen.getByText('現在地')).toBeInTheDocument()
            const officeTexts = screen.getAllByText(/ハックツオフィス/)
            expect(officeTexts.length).toBeGreaterThan(0)
        })

        it('方向ボタンが表示される', () => {
            render(<StreetViewNavigation value={null} onChange={mockOnChange} />)
            expect(screen.getByTestId('direction-north')).toBeInTheDocument()
            expect(screen.getByTestId('direction-south')).toBeInTheDocument()
            expect(screen.getByTestId('direction-east')).toBeInTheDocument()
            expect(screen.getByTestId('direction-west')).toBeInTheDocument()
        })
    })

    describe('移動', () => {
        it('方向ボタンをクリックで移動できる', () => {
            render(<StreetViewNavigation value={null} onChange={mockOnChange} />)
            const northButton = screen.getByTestId('direction-north')
            fireEvent.click(northButton)
            expect(mockOnChange).toHaveBeenCalled()
        })

        it('移動すると歩数が増える', () => {
            render(<StreetViewNavigation value={null} onChange={mockOnChange} />)
            const northButton = screen.getByTestId('direction-north')
            fireEvent.click(northButton)
            expect(screen.getByText(/歩数: 1歩/)).toBeInTheDocument()
        })

        it('リセットボタンでスタート地点に戻る', () => {
            render(<StreetViewNavigation value={null} onChange={mockOnChange} />)
            const northButton = screen.getByTestId('direction-north')
            fireEvent.click(northButton)
            expect(screen.getByText(/歩数: 1歩/)).toBeInTheDocument()

            const resetButton = screen.getByTestId('reset-button')
            fireEvent.click(resetButton)
            expect(screen.getByText(/歩数: 0歩/)).toBeInTheDocument()
        })
    })

    describe('無効化', () => {
        it('disabled時はクリックできない', () => {
            render(
                <StreetViewNavigation
                    value={null}
                    onChange={mockOnChange}
                    disabled={true}
                />
            )
            const northButton = screen.getByTestId('direction-north')
            fireEvent.click(northButton)
            expect(mockOnChange).not.toHaveBeenCalled()
        })
    })
})

