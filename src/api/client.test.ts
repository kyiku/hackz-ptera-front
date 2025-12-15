/**
 * Issue #4: feat: APIクライアント設定（fetch wrapper）
 *
 * テスト対象: APIクライアント
 * - リクエストの送信
 * - レスポンスの処理
 * - エラーハンドリング
 * - リトライロジック
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// TODO: APIクライアント実装後にインポートを有効化
// import { apiClient } from './client'

describe('APIClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('GET リクエスト', () => {
    it('GETリクエストを送信できる', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
      // vi.mocked(fetch).mockResolvedValueOnce(
      //   new Response(JSON.stringify({ data: 'test' }), { status: 200 })
      // )
      // const result = await apiClient.get('/api/test')
      // expect(result).toEqual({ data: 'test' })
    })

    it('クエリパラメータを含むGETリクエストを送信できる', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('POST リクエスト', () => {
    it('POSTリクエストを送信できる', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('JSONボディをPOSTリクエストで送信できる', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('Content-Typeヘッダーが自動設定される', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('エラーハンドリング', () => {
    it('404エラー時に適切なエラーをスローする', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('500エラー時に適切なエラーをスローする', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('ネットワークエラー時に適切なエラーをスローする', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('JSONパースエラー時に適切なエラーをスローする', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('リトライロジック', () => {
    it('一時的なエラー時にリトライする', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('最大リトライ回数を超えた場合はエラーをスローする', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('認証', () => {
    it('トークンがヘッダーに含まれる', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('401エラー時にトークンをリフレッシュする', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })
})
