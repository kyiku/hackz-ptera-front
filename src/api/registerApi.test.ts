/**
 * Issue #24: feat: 登録完了処理（サーバーエラー演出）
 *
 * テスト対象: 登録API
 * - 登録リクエスト送信
 * - サーバーエラー演出
 * - 完了処理
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { submitRegistration, type RegisterRequest } from './registerApi'

describe('RegisterApi', () => {
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
        new Response(JSON.stringify(mockResponse), { status: 500 })
      )

      const requestData: RegisterRequest = {
        token: 'test-token',
        email: 'test@test.com',
        password: 'Test123!',
      }

      const result = await submitRegistration(requestData)

      expect(result.error).toBe(true)
      expect(result.message).toBe(
        'サーバーエラーが発生しました。お手数ですが最初からやり直してください。'
      )
      expect(result.redirect_delay).toBe(3)
    })

    it('すべての必須フィールドが送信される', async () => {
      const mockResponse = {
        error: true,
        message: 'サーバーエラーが発生しました。',
        redirect_delay: 3,
      }

      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 500 })
      )

      const requestData: RegisterRequest = {
        token: 'test-token',
        email: 'test@test.com',
        password: 'Test123!',
        name: 'テストユーザー',
        birthday: '1990-01-01',
        phone: '090-1234-5678',
        address: '東京都渋谷区',
        termsAccepted: true,
      }

      await submitRegistration(requestData)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/register'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
        })
      )
    })

    it('トークンがリクエストに含まれる', async () => {
      const mockResponse = {
        error: true,
        message: 'サーバーエラーが発生しました。',
        redirect_delay: 3,
      }

      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 500 })
      )

      const requestData: RegisterRequest = {
        token: 'test-token-123',
        email: 'test@test.com',
        password: 'Test123!',
      }

      await submitRegistration(requestData)

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)

      expect(body.token).toBe('test-token-123')
    })
  })

  describe('サーバーエラー演出', () => {
    it('必ずサーバーエラーが返る（鬼畜仕様）', async () => {
      const mockResponse = {
        error: true,
        message: 'サーバーエラーが発生しました。お手数ですが最初からやり直してください。',
        redirect_delay: 3,
      }

      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 500 })
      )

      const requestData: RegisterRequest = {
        token: 'test-token',
        email: 'test@test.com',
        password: 'Test123!',
      }

      const result = await submitRegistration(requestData)

      expect(result.error).toBe(true)
      expect(result.message).toContain('サーバーエラー')
      expect(result.redirect_delay).toBe(3)
    })

    it('リダイレクト遅延時間が返される', async () => {
      const mockResponse = {
        error: true,
        message: 'サーバーエラーが発生しました。',
        redirect_delay: 5,
      }

      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 500 })
      )

      const requestData: RegisterRequest = {
        token: 'test-token',
        email: 'test@test.com',
        password: 'Test123!',
      }

      const result = await submitRegistration(requestData)

      expect(result.redirect_delay).toBe(5)
    })

    it('エラーメッセージが返される', async () => {
      const mockResponse = {
        error: true,
        message: 'サーバーエラーが発生しました。お手数ですが最初からやり直してください。',
        redirect_delay: 3,
      }

      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockResponse), { status: 500 })
      )

      const requestData: RegisterRequest = {
        token: 'test-token',
        email: 'test@test.com',
        password: 'Test123!',
      }

      const result = await submitRegistration(requestData)

      expect(result.message).toBe(
        'サーバーエラーが発生しました。お手数ですが最初からやり直してください。'
      )
    })
  })

  describe('エラーハンドリング', () => {
    it('HTTPエラー時にエラーをスローする', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: true }), { status: 400 })
      )

      const requestData: RegisterRequest = {
        token: 'test-token',
        email: 'test@test.com',
        password: 'Test123!',
      }

      await expect(submitRegistration(requestData)).rejects.toThrow(
        'HTTP error! status: 400'
      )
    })

    it('ネットワークエラー時にエラーをスローする', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      const requestData: RegisterRequest = {
        token: 'test-token',
        email: 'test@test.com',
        password: 'Test123!',
      }

      await expect(submitRegistration(requestData)).rejects.toThrow('Network error')
    })

    it('予期しないレスポンス形式でエラーをスローする', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: false }), { status: 200 })
      )

      const requestData: RegisterRequest = {
        token: 'test-token',
        email: 'test@test.com',
        password: 'Test123!',
      }

      await expect(submitRegistration(requestData)).rejects.toThrow(
        '予期しないレスポンス形式'
      )
    })
  })
})
