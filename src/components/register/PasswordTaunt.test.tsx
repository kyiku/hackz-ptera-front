/**
 * Issue #21: feat: AIパスワード煽り機能
 *
 * テスト対象: PasswordTaunt コンポーネント
 * - パスワード強度に応じた煽りメッセージ表示
 * - AIによるパスワード評価
 * - デバウンス処理
 * - ローディング表示
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { PasswordTaunt } from './PasswordTaunt'
import * as passwordApi from '../../api/passwordApi'

// APIをモック
vi.mock('../../api/passwordApi', () => ({
    analyzePasswordMock: vi.fn(),
}))

describe('PasswordTaunt', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('基本レンダリング', () => {
        it('パスワードが空の時は表示されない', () => {
            const { container } = render(<PasswordTaunt password="" />)
            expect(container.firstChild).toBeNull()
        })

        it('パスワードが設定されている時は表示される', async () => {
            vi.mocked(passwordApi.analyzePasswordMock).mockResolvedValueOnce({
                error: false,
                message: 'テストメッセージ',
            })

            render(<PasswordTaunt password="test" />)

            // デバウンス中なので、ローディングが表示される
            expect(screen.getByTestId('password-taunt')).toBeInTheDocument()
            expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

            // デバウンス時間とAPI呼び出しが完了するまで待つ
            await waitFor(
                () => {
                    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
                    expect(screen.getByTestId('taunt-message')).toBeInTheDocument()
                },
                { timeout: 2000 }
            )
        })
    })

    describe('AI煽りメッセージ', () => {
        it('AIが生成した煽りメッセージを表示する', async () => {
            const mockMessage = 'そのパスワード、3秒で破られますよ...'
            vi.mocked(passwordApi.analyzePasswordMock).mockResolvedValueOnce({
                error: false,
                message: mockMessage,
            })

            render(<PasswordTaunt password="weak123" />)

            await waitFor(
                () => {
                    expect(screen.getByTestId('taunt-message')).toHaveTextContent(mockMessage)
                },
                { timeout: 2000 }
            )

            expect(passwordApi.analyzePasswordMock).toHaveBeenCalledWith({
                password: 'weak123',
            })
        })

        it('AI応答待ちの間はローディング表示', async () => {
            let resolvePromise: (value: passwordApi.PasswordAnalyzeResponse) => void
            const promise = new Promise<passwordApi.PasswordAnalyzeResponse>((resolve) => {
                resolvePromise = resolve
            })

            vi.mocked(passwordApi.analyzePasswordMock).mockReturnValueOnce(promise)

            render(<PasswordTaunt password="test" />)

            // ローディングが表示されるまで待つ
            await waitFor(
                () => {
                    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
                    expect(screen.getByText('AIがパスワードを解析中...')).toBeInTheDocument()
                },
                { timeout: 1000 }
            )

            // レスポンスを返す
            resolvePromise!({
                error: false,
                message: 'テストメッセージ',
            })

            await waitFor(
                () => {
                    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
                    expect(screen.getByTestId('taunt-message')).toBeInTheDocument()
                },
                { timeout: 2000 }
            )
        })

        it('AIエラー時はデフォルトの煽りを表示', async () => {
            vi.mocked(passwordApi.analyzePasswordMock).mockRejectedValueOnce(
                new Error('API Error')
            )

            render(<PasswordTaunt password="test" />)

            await waitFor(
                () => {
                    const messageElement = screen.getByTestId('taunt-message')
                    expect(messageElement).toBeInTheDocument()
                    // デフォルトメッセージのいずれかが表示される
                    expect(
                        messageElement.textContent === 'そのパスワード、大丈夫ですか？' ||
                            messageElement.textContent === 'もっと強力なパスワードにしましょう。' ||
                            messageElement.textContent === 'パスワード強度が低いようです。'
                    ).toBe(true)
                },
                { timeout: 2000 }
            )
        })
    })

    describe('デバウンス処理', () => {
        it('パスワード変更時にデバウンスが機能する', async () => {
            vi.mocked(passwordApi.analyzePasswordMock).mockResolvedValue({
                error: false,
                message: 'テストメッセージ',
            })

            const { rerender } = render(<PasswordTaunt password="test1" />)

            // すぐにはAPIが呼ばれない
            expect(passwordApi.analyzePasswordMock).not.toHaveBeenCalled()

            // パスワードを変更
            rerender(<PasswordTaunt password="test2" />)

            // まだAPIが呼ばれない（デバウンス中）
            expect(passwordApi.analyzePasswordMock).not.toHaveBeenCalled()

            await waitFor(
                () => {
                    expect(passwordApi.analyzePasswordMock).toHaveBeenCalledTimes(1)
                    expect(passwordApi.analyzePasswordMock).toHaveBeenCalledWith({
                        password: 'test2',
                    })
                },
                { timeout: 2000 }
            )
        })

        it('パスワードが短時間で複数回変更された場合、最後の値のみでAPIが呼ばれる', async () => {
            vi.mocked(passwordApi.analyzePasswordMock).mockResolvedValue({
                error: false,
                message: 'テストメッセージ',
            })

            const { rerender } = render(<PasswordTaunt password="test1" />)

            // パスワードを短時間で複数回変更
            rerender(<PasswordTaunt password="test2" />)
            await new Promise(resolve => setTimeout(resolve, 100))
            rerender(<PasswordTaunt password="test3" />)
            await new Promise(resolve => setTimeout(resolve, 100))
            rerender(<PasswordTaunt password="test4" />)

            // まだAPIが呼ばれない（デバウンス中）
            expect(passwordApi.analyzePasswordMock).not.toHaveBeenCalled()

            await waitFor(
                () => {
                    // 最後の値（test4）のみでAPIが呼ばれる
                    expect(passwordApi.analyzePasswordMock).toHaveBeenCalledTimes(1)
                    expect(passwordApi.analyzePasswordMock).toHaveBeenCalledWith({
                        password: 'test4',
                    })
                },
                { timeout: 2000 }
            )
        })
    })

    describe('パスワード強度評価', () => {
        it('弱いパスワードで適切な煽りが表示される', async () => {
            vi.mocked(passwordApi.analyzePasswordMock).mockResolvedValueOnce({
                error: false,
                message: 'そのパスワード、3秒で破られますよ...',
            })

            render(<PasswordTaunt password="12345" />)

            await waitFor(
                () => {
                    expect(screen.getByTestId('taunt-message')).toBeInTheDocument()
                },
                { timeout: 2000 }
            )
        })

        it('よくあるパスワードを検出して特別な煽りを表示する', async () => {
            vi.mocked(passwordApi.analyzePasswordMock).mockResolvedValueOnce({
                error: false,
                message: '「password」ですか？そのパスワード、辞書攻撃で3秒で破られますよ...',
            })

            render(<PasswordTaunt password="password" />)

            await waitFor(
                () => {
                    const message = screen.getByTestId('taunt-message')
                    expect(message.textContent).toContain('password')
                },
                { timeout: 2000 }
            )
        })
    })
})
