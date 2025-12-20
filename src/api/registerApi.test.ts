/**
 * Issue #24: feat: 登録完了処理（サーバーエラー演出）
 *
 * テスト対象: 登録API
 * - 登録リクエスト送信
 * - サーバーエラー演出（必ずエラーを返す）
 * - 完了処理
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { submitRegistration, submitRegistrationMock, RegisterApiError } from './registerApi'
import type { RegisterRequest } from './registerApi'

describe('RegisterApi', () => {
    const mockRegisterRequest: RegisterRequest = {
        name: 'テストユーザー',
        birthday: '1990-01-01',
        phone: '090-1234-5678',
        address: '東京都千代田区1-1-1',
        email: 'test@example.com',
        termsAccepted: true,
        password: 'TestPassword123!',
        captchaVerified: true,
        otpVerified: true,
    }

    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    describe('登録リクエスト', () => {
        it('登録情報をAPIに送信できる', async () => {
            const mockResponse = {
                error: true,
                message: 'サーバーエラーが発生しました。お手数ですが最初からやり直してください。',
                redirect_delay: 3,
            }

            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify(mockResponse), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            )

            const result = await submitRegistration(mockRegisterRequest)
            expect(result.error).toBe(true)
            expect(result.message).toBe(mockResponse.message)
            expect(result.redirect_delay).toBe(3)
        })

        it('すべての必須フィールドが送信される', async () => {
            const mockResponse = {
                error: true,
                message: 'サーバーエラーが発生しました。',
                redirect_delay: 3,
            }

            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify(mockResponse), { status: 200 })
            )

            await submitRegistration(mockRegisterRequest)

            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/register'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(mockRegisterRequest),
                })
            )
        })

        it('トークンがリクエストに含まれる（credentials: include）', async () => {
            const mockResponse = {
                error: true,
                message: 'サーバーエラーが発生しました。',
                redirect_delay: 3,
            }

            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify(mockResponse), { status: 200 })
            )

            await submitRegistration(mockRegisterRequest)

            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    credentials: 'include',
                })
            )
        })
    })

    describe('サーバーエラー演出', () => {
        it('必ずエラーレスポンスを返す', async () => {
            const mockResponse = {
                error: true,
                message: 'サーバーエラーが発生しました。お手数ですが最初からやり直してください。',
                redirect_delay: 3,
            }

            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify(mockResponse), { status: 200 })
            )

            const result = await submitRegistration(mockRegisterRequest)
            expect(result.error).toBe(true)
            expect(result.message).toBeDefined()
            expect(result.redirect_delay).toBe(3)
        })

        it('エラーメッセージが正しく返される', async () => {
            const expectedMessage = 'サーバーエラーが発生しました。お手数ですが最初からやり直してください。'
            const mockResponse = {
                error: true,
                message: expectedMessage,
                redirect_delay: 3,
            }

            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify(mockResponse), { status: 200 })
            )

            const result = await submitRegistration(mockRegisterRequest)
            expect(result.message).toBe(expectedMessage)
        })

        it('リダイレクト遅延時間が返される', async () => {
            const mockResponse = {
                error: true,
                message: 'サーバーエラーが発生しました。',
                redirect_delay: 3,
            }

            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify(mockResponse), { status: 200 })
            )

            const result = await submitRegistration(mockRegisterRequest)
            expect(result.redirect_delay).toBe(3)
        })
    })

    describe('モック関数', () => {
        it('submitRegistrationMockが正常に動作する', async () => {
            const result = await submitRegistrationMock()
            expect(result.error).toBe(true)
            expect(result.message).toBe('サーバーエラーが発生しました。お手数ですが最初からやり直してください。')
            expect(result.redirect_delay).toBe(3)
        })

        it('submitRegistrationMockは必ずエラーを返す', async () => {
            const result = await submitRegistrationMock()
            expect(result.error).toBe(true)
        })
    })

    describe('エラーハンドリング', () => {
        it('HTTPエラー時にエラーをスローする', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify({ error: true, message: 'Internal Server Error' }), {
                    status: 500,
                })
            )

            await expect(submitRegistration(mockRegisterRequest)).rejects.toThrow(RegisterApiError)
        })

        it('ネットワークエラー時にエラーをスローする', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

            await expect(submitRegistration(mockRegisterRequest)).rejects.toThrow(RegisterApiError)
        })

        it('予期しない成功レスポンス時にエラーをスローする', async () => {
            // 万が一成功レスポンスが返ってきた場合
            const mockResponse = {
                error: false,
                message: 'Success',
            }

            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify(mockResponse), { status: 200 })
            )

            await expect(submitRegistration(mockRegisterRequest)).rejects.toThrow(RegisterApiError)
        })
    })
})
