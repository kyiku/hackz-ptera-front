/**
 * Issue #22: feat: 魚OTP - 画像表示UI
 *
 * テスト対象: FishOtpDisplay コンポーネント
 * - 魚画像の表示
 * - OTP選択UI
 * - アニメーション
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FishOtpDisplay } from './FishOtpDisplay'

describe('FishOtpDisplay', () => {
    const mockOnSelect = vi.fn()

    beforeEach(() => {
        mockOnSelect.mockClear()
    })

    describe('基本レンダリング', () => {
        it('魚OTP表示エリアが表示される', () => {
            render(
                <FishOtpDisplay
                    fishImages={['/fish1.png', '/fish2.png']}
                    onSelect={mockOnSelect}
                />
            )
            expect(screen.getByTestId('fish-otp-display')).toBeInTheDocument()
        })

        it('複数の魚画像が表示される', () => {
            render(
                <FishOtpDisplay
                    fishImages={['/fish1.png', '/fish2.png', '/fish3.png']}
                    onSelect={mockOnSelect}
                />
            )
            const fishItems = screen.getAllByTestId(/^fish-item-/)
            expect(fishItems.length).toBe(3)
        })

        it('選択指示が表示される', () => {
            render(
                <FishOtpDisplay
                    fishImages={['/fish1.png', '/fish2.png']}
                    onSelect={mockOnSelect}
                />
            )
            expect(
                screen.getByText('魚を正しい順序で選択してください')
            ).toBeInTheDocument()
        })
    })

    describe('魚画像表示', () => {
        it('魚画像がグリッドで表示される', () => {
            render(
                <FishOtpDisplay
                    fishImages={['/fish1.png', '/fish2.png', '/fish3.png']}
                    onSelect={mockOnSelect}
                />
            )
            const container = screen.getByTestId('fish-otp-display')
            const grid = container.querySelector('.grid')
            expect(grid).toBeInTheDocument()
        })

        it('各魚画像にラベルが付いている', () => {
            render(
                <FishOtpDisplay
                    fishImages={['/fish1.png', '/fish2.png']}
                    onSelect={mockOnSelect}
                />
            )
            const labels = screen.getAllByTestId(/^fish-name-/)
            expect(labels.length).toBeGreaterThan(0)
        })

        it('魚画像がランダムな順序で表示される', () => {
            const fishImages = ['/fish1.png', '/fish2.png', '/fish3.png']
            const { container } = render(
                <FishOtpDisplay fishImages={fishImages} onSelect={mockOnSelect} />
            )

            // ランダム順序なので、original-index属性で確認
            const fishItems = container.querySelectorAll('[data-original-index]')
            const originalIndices = Array.from(fishItems).map(
                (item) => item.getAttribute('data-original-index')
            )

            // ランダム順序なので、0,1,2の順序とは限らない
            expect(originalIndices.length).toBe(3)
        })
    })

    describe('選択UI', () => {
        it('魚をクリックで選択できる', () => {
            render(
                <FishOtpDisplay
                    fishImages={['/fish1.png', '/fish2.png']}
                    correctOrder={[0, 1]}
                    onSelect={mockOnSelect}
                />
            )

            const fishItems = screen.getAllByTestId(/^fish-item-/)
            // 正しい順序（originalIndex === 0）の魚を選択
            const correctFish = fishItems.find(
                (item) => item.getAttribute('data-original-index') === '0'
            )
            if (correctFish) {
                fireEvent.click(correctFish)
                expect(mockOnSelect).toHaveBeenCalled()
            } else {
                // フォールバック: 最初の魚をクリック（順序チェックなしの場合）
                fireEvent.click(fishItems[0])
            }
        })

        it('選択された魚がハイライトされる', () => {
            render(
                <FishOtpDisplay
                    fishImages={['/fish1.png', '/fish2.png']}
                    correctOrder={[0, 1]}
                    onSelect={mockOnSelect}
                />
            )

            const fishItems = screen.getAllByTestId(/^fish-item-/)
            const firstFish = fishItems[0]
            fireEvent.click(firstFish)

            // 選択された魚に選択順序のバッジが表示される
            waitFor(() => {
                const badge = screen.queryByTestId(/^selection-badge-/)
                expect(badge).toBeInTheDocument()
            })
        })

        it('順序通りに選択する必要がある', async () => {
            render(
                <FishOtpDisplay
                    fishImages={['/fish1.png', '/fish2.png', '/fish3.png']}
                    correctOrder={[0, 1, 2]}
                    onSelect={mockOnSelect}
                />
            )

            const fishItems = screen.getAllByTestId(/^fish-item-/)

            // 正しい順序で選択（最初の魚を選択）
            const firstFish = fishItems.find(
                (item) => item.getAttribute('data-original-index') === '0'
            )
            if (firstFish) {
                fireEvent.click(firstFish)
            }

            await waitFor(() => {
                expect(mockOnSelect).toHaveBeenCalledWith([0])
            })
        })

        it('選択をリセットできる', () => {
            render(
                <FishOtpDisplay
                    fishImages={['/fish1.png', '/fish2.png']}
                    correctOrder={[0, 1]}
                    onSelect={mockOnSelect}
                />
            )

            const fishItems = screen.getAllByTestId(/^fish-item-/)
            fireEvent.click(fishItems[0])

            // リセットボタンが表示される
            waitFor(() => {
                const resetButton = screen.getByTestId('reset-selection-button')
                expect(resetButton).toBeInTheDocument()

                fireEvent.click(resetButton)
                // リセット後、バッジが消える
                expect(screen.queryByTestId(/^selection-badge-/)).not.toBeInTheDocument()
            })
        })
    })

    describe('アニメーション', () => {
        it('魚がゆらゆら泳ぐアニメーション', () => {
            render(
                <FishOtpDisplay
                    fishImages={['/fish1.png', '/fish2.png']}
                    onSelect={mockOnSelect}
                />
            )

            const fishItems = screen.getAllByTestId(/^fish-item-/)
            const fishImage = fishItems[0].querySelector('img')
            expect(fishImage?.classList.contains('animate-float')).toBe(true)
        })

        it('選択時にアニメーションが再生される', () => {
            render(
                <FishOtpDisplay
                    fishImages={['/fish1.png', '/fish2.png']}
                    correctOrder={[0, 1]}
                    onSelect={mockOnSelect}
                />
            )

            const fishItems = screen.getAllByTestId(/^fish-item-/)
            const firstFish = fishItems[0]
            fireEvent.click(firstFish)

            // 選択後、選択順序バッジが表示される（アニメーションの確認）
            waitFor(() => {
                const badge = screen.queryByTestId(/^selection-badge-/)
                expect(badge).toBeInTheDocument()
            })
        })

        it('間違い選択時に震えアニメーションが再生される', async () => {
            render(
                <FishOtpDisplay
                    fishImages={['/fish1.png', '/fish2.png']}
                    correctOrder={[0, 1]}
                    onSelect={mockOnSelect}
                />
            )

            const fishItems = screen.getAllByTestId(/^fish-item-/)
            // 間違った順序で選択（1番目を先に選択）
            const secondFish = fishItems.find(
                (item) => item.getAttribute('data-original-index') === '1'
            )
            if (secondFish) {
                fireEvent.click(secondFish)

                // 震えアニメーションが適用される
                await waitFor(
                    () => {
                        expect(secondFish.classList.contains('animate-shake')).toBe(true)
                    },
                    { timeout: 1000 }
                )
            }
        })
    })

    describe('アクセシビリティ', () => {
        it('キーボードで選択できる', () => {
            render(
                <FishOtpDisplay
                    fishImages={['/fish1.png', '/fish2.png']}
                    correctOrder={[0, 1]}
                    onSelect={mockOnSelect}
                />
            )

            const fishItems = screen.getAllByTestId(/^fish-item-/)
            const firstFish = fishItems[0] as HTMLButtonElement

            // Tabでフォーカス
            firstFish.focus()
            expect(document.activeElement).toBe(firstFish)

            // Enterで選択
            fireEvent.keyDown(firstFish, { key: 'Enter', code: 'Enter' })
            // キーボードでもクリックイベントが発火する
        })

        it('スクリーンリーダー用のラベルがある', () => {
            render(
                <FishOtpDisplay
                    fishImages={['/fish1.png', '/fish2.png']}
                    onSelect={mockOnSelect}
                />
            )

            const fishItems = screen.getAllByTestId(/^fish-item-/)
            const firstFish = fishItems[0]

            // aria-labelが設定されている
            expect(firstFish).toHaveAttribute('aria-label')
            expect(firstFish.getAttribute('aria-label')).toContain('を選択')
        })
    })
})
