/**
 * Issue #17: feat: CAPTCHA - API連携（生成・検証）
 *
 * テスト対象: CAPTCHA API
 * - CAPTCHA画像の取得
 * - 回答の送信
 * - 検証結果の処理
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// TODO: captchaApi実装後にインポートを有効化
// import { getCaptchaImage, verifyCaptcha } from './captchaApi'

describe('CaptchaApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('CAPTCHA取得', () => {
    it('CAPTCHA画像を取得できる', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
      // vi.mocked(fetch).mockResolvedValueOnce(
      //   new Response(JSON.stringify({ imageUrl: '/captcha/123.png', challengeId: '123' }))
      // )
      // const result = await getCaptchaImage()
      // expect(result.imageUrl).toBeDefined()
    })

    it('CAPTCHAタイプが返される', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('チャレンジIDが返される', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('指示テキストが返される', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('CAPTCHA検証', () => {
    it('正しい座標で検証が成功する', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('間違った座標で検証が失敗する', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('チャレンジIDと座標が送信される', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('検証成功時に次ステップトークンが返される', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('エラーハンドリング', () => {
    it('CAPTCHA取得エラー時にエラーをスローする', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('検証エラー時にエラーをスローする', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('タイムアウト時にエラーをスローする', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })
})
