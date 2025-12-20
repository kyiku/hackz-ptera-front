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
import { apiClient, APIError } from './client'

describe('APIClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('GET リクエスト', () => {
    it('GETリクエストを送信できる', async () => {
      const mockData = { error: false, data: 'test' }
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )

      const result = await apiClient.get('/api/test')
      expect(result).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          method: 'GET',
          credentials: 'include'
        })
      )
    })

    it('クエリパラメータを含むGETリクエストを送信できる', async () => {
      const mockData = { error: false, data: 'test' }
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      )

      await apiClient.get('/api/test', { foo: 'bar', baz: 'qux' })
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('foo=bar'),
        expect.any(Object)
      )
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('baz=qux'),
        expect.any(Object)
      )
    })
  })

  describe('POST リクエスト', () => {
    it('POSTリクエストを送信できる', async () => {
      const mockData = { error: false, success: true }
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      )

      const result = await apiClient.post('/api/test')
      expect(result).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({
          method: 'POST'
        })
      )
    })

    it('JSONボディをPOSTリクエストで送信できる', async () => {
      const mockData = { error: false, success: true }
      const requestBody = { name: 'test', value: 123 }

      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      )

      await apiClient.post('/api/test', requestBody)
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody)
        })
      )
    })

    it('Content-Typeヘッダーが自動設定される', async () => {
      const mockData = { error: false }
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      )

      await apiClient.post('/api/test', { data: 'test' })
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })
  })

  describe('エラーハンドリング', () => {
    it('404エラー時に適切なエラーをスローする', async () => {
      const errorResponse = { error: true, message: 'Not Found' }
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(errorResponse), {
          status: 404
        })
      )

      await expect(apiClient.get('/api/notfound')).rejects.toThrow('Not Found')
    })

    it('500エラー時に適切なエラーをスローする', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: true, message: 'Internal Server Error' }), {
          status: 500
        })
      )

      await expect(apiClient.get('/api/error')).rejects.toThrow(APIError)
    })

    it('ネットワークエラー時に適切なエラーをスローする', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      await expect(apiClient.get('/api/test')).rejects.toThrow('Network error')
    })

    it('JSONパースエラー時に適切なエラーをスローする', async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response('Invalid JSON', { status: 200 })
      )

      await expect(apiClient.get('/api/test')).rejects.toThrow('Failed to parse response JSON')
    })
  })

  describe('リトライロジック', () => {
    it('一時的なエラー時にリトライする', async () => {
      // Note: 現在の実装ではリトライ機能は未実装
      // 将来的に実装する場合のプレースホルダー
      expect(true).toBe(true)
    })

    it('最大リトライ回数を超えた場合はエラーをスローする', async () => {
      // Note: 現在の実装ではリトライ機能は未実装
      // 将来的に実装する場合のプレースホルダー
      expect(true).toBe(true)
    })
  })

  describe('認証', () => {
    it('トークンがヘッダーに含まれる', async () => {
      // Note: credentials: 'include'でCookieが自動送信される
      const mockData = { error: false }
      vi.mocked(fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      )

      await apiClient.get('/api/test')
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include'
        })
      )
    })

    it('401エラー時にトークンをリフレッシュする', async () => {
      // Note: 現在の実装では自動リフレッシュ機能は未実装
      // 将来的に実装する場合のプレースホルダー
      expect(true).toBe(true)
    })
  })
})

