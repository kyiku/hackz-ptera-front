/**
 * Issue #23: feat: 魚OTP - API連携（送信・検証）
 *
 * テスト対象: OTP API
 * - OTP画像取得
 * - OTP検証
 * - エラーハンドリング
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendOtp, verifyOtp, sendOtpMock, verifyOtpMock, isVerifySuccess, isVerifyFinalFailure, isVerifyRetryableFailure } from './otpApi'
import type { OtpVerifyResponse } from './otpApi'

describe('OtpApi', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    describe('OTP送信', () => {
        it('OTP送信リクエストを送信できる', async () => {
            const mockResponse = {
                error: false,
                image_url: '/fish1.png',
                message: '魚の名前を入力してください。',
            }

            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify(mockResponse), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            )

            const result = await sendOtp()
            expect(result.error).toBe(false)
            expect(result.image_url).toBe('/fish1.png')
            expect(result.message).toBe('魚の名前を入力してください。')
        })

        it('魚画像URLが返される', async () => {
            const mockResponse = {
                error: false,
                image_url: '/fish/salmon.png',
                message: '魚の名前を入力してください。',
            }

            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify(mockResponse), { status: 200 })
            )

            const result = await sendOtp()
            expect(result.image_url).toBeDefined()
            expect(typeof result.image_url).toBe('string')
        })

        it('メッセージが返される', async () => {
            const mockResponse = {
                error: false,
                image_url: '/fish1.png',
                message: '魚の名前を入力してください。',
            }

            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify(mockResponse), { status: 200 })
            )

            const result = await sendOtp()
            expect(result.message).toBeDefined()
            expect(typeof result.message).toBe('string')
        })
    })

    describe('OTP検証', () => {
        it('回答を送信できる', async () => {
            const mockResponse = {
                error: false,
                message: '認証に成功しました！',
            }

            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify(mockResponse), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            )

            const result = await verifyOtp({ answer: 'さば' })
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/otp/verify'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ answer: 'さば' }),
                })
            )
        })

        it('正しい回答で検証が成功する', async () => {
            const mockResponse = {
                error: false,
                message: '認証に成功しました！',
            }

            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify(mockResponse), { status: 200 })
            )

            const result = await verifyOtp({ answer: 'さば' })
            expect(result.error).toBe(false)
            expect(isVerifySuccess(result)).toBe(true)
            if (isVerifySuccess(result)) {
                expect(result.message).toBe('認証に成功しました！')
            }
        })

        it('間違った回答で検証が失敗する', async () => {
            const mockResponse = {
                error: true,
                message: '不正解です。残り2回',
                attempts_remaining: 2,
                new_image_url: '/fish2.png',
            }

            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify(mockResponse), { status: 200 })
            )

            const result = await verifyOtp({ answer: 'まぐろ' })
            expect(result.error).toBe(true)
            expect(isVerifyRetryableFailure(result)).toBe(true)
            if (isVerifyRetryableFailure(result)) {
                expect(result.attempts_remaining).toBe(2)
                expect(result.new_image_url).toBeDefined()
            }
        })

        it('検証成功時にメッセージが返される', async () => {
            const mockResponse = {
                error: false,
                message: '認証に成功しました！',
            }

            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify(mockResponse), { status: 200 })
            )

            const result = await verifyOtp({ answer: 'さば' })
            if (isVerifySuccess(result)) {
                expect(result.message).toBe('認証に成功しました！')
            }
        })

        it('検証失敗時に残り試行回数が返される', async () => {
            const mockResponse = {
                error: true,
                message: '不正解です。残り1回',
                attempts_remaining: 1,
                new_image_url: '/fish3.png',
            }

            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify(mockResponse), { status: 200 })
            )

            const result = await verifyOtp({ answer: 'まぐろ' })
            if (isVerifyRetryableFailure(result)) {
                expect(result.attempts_remaining).toBe(1)
            }
        })
    })

    describe('試行回数超過', () => {
        it('3回目の失敗時にリダイレクト情報が返される', async () => {
            const mockResponse = {
                error: true,
                message: '試行回数の上限に達しました。',
                redirect_delay: 3,
            }

            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify(mockResponse), { status: 200 })
            )

            const result = await verifyOtp({ answer: 'まぐろ' })
            expect(result.error).toBe(true)
            expect(isVerifyFinalFailure(result)).toBe(true)
            if (isVerifyFinalFailure(result)) {
                expect(result.redirect_delay).toBe(3)
            }
        })
    })

    describe('エラーハンドリング', () => {
        it('OTP送信エラー時にエラーをスローする', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify({ error: true, message: 'サーバーエラー' }), {
                    status: 500,
                })
            )

            await expect(sendOtp({})).rejects.toThrow()
        })

        it('検証エラー時にエラーをスローする', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify({ error: true, message: 'サーバーエラー' }), {
                    status: 500,
                })
            )

            await expect(verifyOtp({ answer: 'さば' })).rejects.toThrow()
        })

        it('ネットワークエラー時にエラーをスローする', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

            await expect(sendOtp({})).rejects.toThrow()
        })
    })

    describe('モック関数', () => {
        it('sendOtpMockが正常に動作する', async () => {
            const result = await sendOtpMock({})
            expect(result.error).toBe(false)
            expect(result.image_url).toBeDefined()
            expect(result.message).toBeDefined()
        })

        it('verifyOtpMockが正しい回答で成功する', async () => {
            const result = await verifyOtpMock({ answer: 'さば' })
            expect(isVerifySuccess(result)).toBe(true)
        })

        it('verifyOtpMockが間違った回答で失敗する', async () => {
            const result = await verifyOtpMock({ answer: 'まぐろ' })
            expect(result.error).toBe(true)
            expect(isVerifyRetryableFailure(result)).toBe(true)
        })

        it('verifyOtpMockがカタカナでも正解と判定する', async () => {
            const result = await verifyOtpMock({ answer: 'サバ' })
            expect(isVerifySuccess(result)).toBe(true)
        })

        it('verifyOtpMockが3回失敗でリダイレクト情報を返す', async () => {
            // 1回目: 失敗
            await verifyOtpMock({ answer: 'まぐろ' })
            // 2回目: 失敗
            await verifyOtpMock({ answer: 'まぐろ' })
            // 3回目: 最終失敗
            const result = await verifyOtpMock({ answer: 'まぐろ' })
            expect(isVerifyFinalFailure(result)).toBe(true)
        })
    })

    describe('ヘルパー関数', () => {
        it('isVerifySuccessが成功レスポンスを正しく判定する', () => {
            const successResponse: OtpVerifyResponse = {
                error: false,
                message: '成功',
            }
            expect(isVerifySuccess(successResponse)).toBe(true)
        })

        it('isVerifyFinalFailureが最終失敗レスポンスを正しく判定する', () => {
            const finalFailureResponse: OtpVerifyResponse = {
                error: true,
                message: '失敗',
                redirect_delay: 3,
            }
            expect(isVerifyFinalFailure(finalFailureResponse)).toBe(true)
        })

        it('isVerifyRetryableFailureがリトライ可能な失敗レスポンスを正しく判定する', () => {
            const retryableFailureResponse: OtpVerifyResponse = {
                error: true,
                message: '失敗',
                attempts_remaining: 2,
                new_image_url: '/fish2.png',
            }
            expect(isVerifyRetryableFailure(retryableFailureResponse)).toBe(true)
        })
    })
})
