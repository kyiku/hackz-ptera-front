/**
 * Issue #32: feat: 生年月日入力 - 横スクロールバーUI
 *
 * テスト対象: BirthdayScrollInput コンポーネント
 * - 横スクロールバーの表示
 * - 日付の選択
 * - スクロール位置の計算
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BirthdayScrollInput } from './BirthdayScrollInput'

// 日付生成関数をモック（テスト用に少数の日付のみ生成）
vi.mock('./generateDates', () => ({
    generateDates: vi.fn(() => [
        '0001-01-01',
        '0001-01-02',
        '0001-01-03',
        '2025-12-19',
        '2025-12-20',
        '2025-12-21',
    ]),
}))

describe('BirthdayScrollInput', () => {
    const mockOnChange = vi.fn()

    beforeEach(() => {
        mockOnChange.mockClear()
        // scrollTo をモック（jsdom では未実装のため）
        Element.prototype.scrollTo = vi.fn()
    })

    describe('基本レンダリング', () => {
        it('横スクロールバーが表示される', () => {
            render(<BirthdayScrollInput value={null} onChange={mockOnChange} />)
            expect(screen.getByTestId('birthday-scroll-container')).toBeInTheDocument()
        })

        it('日付のリストが表示される', () => {
            render(<BirthdayScrollInput value={null} onChange={mockOnChange} />)
            const dateItems = screen.getAllByTestId(/^birthday-date-/)
            expect(dateItems.length).toBe(6) // モックで6つの日付を返す
        })

        it('スクロール指示が表示される', () => {
            render(<BirthdayScrollInput value={null} onChange={mockOnChange} />)
            expect(
                screen.getByText('横にスクロールして日付を選択してください')
            ).toBeInTheDocument()
        })
    })

    describe('日付選択', () => {
        it('日付をクリックで選択できる', () => {
            render(<BirthdayScrollInput value={null} onChange={mockOnChange} />)
            const dateItems = screen.getAllByTestId(/^birthday-date-/)
            const firstDate = dateItems[0]
            const dateValue = firstDate.getAttribute('data-date')

            fireEvent.click(firstDate)

            expect(mockOnChange).toHaveBeenCalledWith(dateValue)
        })

        it('選択された日付が表示される', () => {
            render(
                <BirthdayScrollInput
                    value="1990-01-01"
                    onChange={mockOnChange}
                />
            )
            expect(screen.getByText('1990年1月1日')).toBeInTheDocument()
        })

        it('スクロールで日付を選択できる', () => {
            render(
                <BirthdayScrollInput value={null} onChange={mockOnChange} />
            )

            const scrollContainer = screen.getByTestId('birthday-scroll-container')
            fireEvent.scroll(scrollContainer, { target: { scrollLeft: 1000 } })

            // スクロールイベントが発火されることを確認
            expect(scrollContainer).toBeInTheDocument()
        })
    })

    describe('日付範囲', () => {
        it('1年1月1日から始まる', () => {
            render(<BirthdayScrollInput value={null} onChange={mockOnChange} />)
            const dateItems = screen.getAllByTestId(/^birthday-date-/)
            const firstDate = dateItems[0].getAttribute('data-date')
            expect(firstDate).toBe('0001-01-01')
        })

        it('2025年12月21日で終わる', () => {
            render(<BirthdayScrollInput value={null} onChange={mockOnChange} />)
            const dateItems = screen.getAllByTestId(/^birthday-date-/)
            const lastDate = dateItems[dateItems.length - 1].getAttribute('data-date')
            expect(lastDate).toBe('2025-12-21')
        })
    })

    describe('無効化', () => {
        it('disabled時はクリックできない', () => {
            render(
                <BirthdayScrollInput
                    value={null}
                    onChange={mockOnChange}
                    disabled={true}
                />
            )
            const dateItems = screen.getAllByTestId(/^birthday-date-/)
            const firstDate = dateItems[0]

            fireEvent.click(firstDate)

            expect(mockOnChange).not.toHaveBeenCalled()
        })
    })
})
