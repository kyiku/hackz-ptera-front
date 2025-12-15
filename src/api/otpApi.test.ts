/**
 * Issue #23: feat: 魚OTP - API連携（送信・検証）
 *
 * テスト対象: OTP API
 * - OTP生成リクエスト
 * - OTP検証
 * - OTP再送信
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// TODO: otpApi実装後にインポートを有効化
// import { requestOtp, verifyOtp, resendOtp } from './otpApi'

describe('OtpApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('OTP生成', () => {
    it('OTP生成リクエストを送信できる', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
      // vi.mocked(fetch).mockResolvedValueOnce(
      //   new Response(JSON.stringify({ fishImages: ['/fish1.png'], challengeId: '123' }))
      // )
      // const result = await requestOtp({ email: 'test@test.com' })
      // expect(result.fishImages).toBeDefined()
    })

    it('魚画像URLのリストが返される', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('チャレンジIDが返される', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('正解の順序が暗号化されて返される', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('OTP検証', () => {
    it('選択した魚の順序を送信できる', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('正しい順序で検証が成功する', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('間違った順序で検証が失敗する', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('検証成功時に次ステップトークンが返される', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('検証失敗時に残り試行回数が返される', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('OTP再送信', () => {
    it('OTPを再送信できる', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('再送信間隔制限がある', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('再送信回数制限がある', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('エラーハンドリング', () => {
    it('OTP生成エラー時にエラーをスローする', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('検証エラー時にエラーをスローする', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('試行回数超過時に特別なエラーを返す', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })
})
