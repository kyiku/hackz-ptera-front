/**
 * Issue #25: feat: 登録フォーム - トークン有効期限管理
 *
 * テスト対象: useTokenExpiry カスタムフック
 * - トークン有効期限の監視
 * - 期限切れ警告
 * - 自動リダイレクト
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTokenExpiry } from './useTokenExpiry'

describe('useTokenExpiry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('有効期限監視', () => {
    it('トークンの有効期限を監視する', () => {
      const expiresAt = new Date(Date.now() + 60000) // 1分後

      const { result } = renderHook(() =>
        useTokenExpiry({
          token: 'test-token',
          expiresAt,
        })
      )

      expect(result.current.isExpired).toBe(false)
      expect(result.current.remainingSeconds).toBeGreaterThan(0)
    })

    it('残り時間を返す', () => {
      const expiresAt = new Date(Date.now() + 120000) // 2分後

      const { result } = renderHook(() =>
        useTokenExpiry({
          token: 'test-token',
          expiresAt,
        })
      )

      expect(result.current.remainingSeconds).toBeGreaterThan(100)
      expect(result.current.remainingMinutes).toBeGreaterThanOrEqual(1)
    })

    it('期限切れ時にisExpiredがtrueになる', async () => {
      const baseTime = Date.now()
      vi.setSystemTime(baseTime)
      const expiresAt = new Date(baseTime - 1000) // 1秒前（期限切れ）

      const { result } = renderHook(() =>
        useTokenExpiry({
          token: 'test-token',
          expiresAt,
        })
      )

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000)
      })

      expect(result.current.isExpired).toBe(true)
    })
  })

  describe('期限切れ警告', () => {
    it('残り1分で警告状態になる', async () => {
      const baseTime = Date.now()
      vi.setSystemTime(baseTime)
      const expiresAt = new Date(baseTime + 50000) // 50秒後

      const { result } = renderHook(() =>
        useTokenExpiry({
          token: 'test-token',
          expiresAt,
        })
      )

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000)
      })

      expect(result.current.isWarning).toBe(true)
      expect(result.current.remainingSeconds).toBeLessThanOrEqual(60)
    })

    it('残り30秒で危険状態になる', async () => {
      const baseTime = Date.now()
      vi.setSystemTime(baseTime)
      const expiresAt = new Date(baseTime + 25000) // 25秒後

      const { result } = renderHook(() =>
        useTokenExpiry({
          token: 'test-token',
          expiresAt,
        })
      )

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000)
      })

      expect(result.current.isDanger).toBe(true)
      expect(result.current.remainingSeconds).toBeLessThanOrEqual(30)
    })

    it('警告時にコールバックが呼ばれる', async () => {
      const onWarning = vi.fn()
      const baseTime = Date.now()
      vi.setSystemTime(baseTime)
      const expiresAt = new Date(baseTime + 50000) // 50秒後

      renderHook(() =>
        useTokenExpiry({
          token: 'test-token',
          expiresAt,
          onWarning,
        })
      )

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000)
      })

      expect(onWarning).toHaveBeenCalled()
    })
  })

  describe('自動リダイレクト', () => {
    it('期限切れ時にリダイレクトコールバックが呼ばれる', async () => {
      const onExpired = vi.fn()
      const baseTime = Date.now()
      vi.setSystemTime(baseTime)
      const expiresAt = new Date(baseTime - 1000) // 期限切れ

      renderHook(() =>
        useTokenExpiry({
          token: 'test-token',
          expiresAt,
          onExpired,
        })
      )

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000)
      })

      expect(onExpired).toHaveBeenCalled()
    })
  })

  describe('トークン更新', () => {
    it('新しいトークンで有効期限が更新される', async () => {
      const baseTime = Date.now()
      vi.setSystemTime(baseTime)
      const firstExpiresAt = new Date(baseTime + 30000) // 30秒後
      const { result, rerender } = renderHook(
        ({ token, expiresAt }) =>
          useTokenExpiry({
            token,
            expiresAt,
          }),
        {
          initialProps: {
            token: 'test-token-1',
            expiresAt: firstExpiresAt,
          },
        }
      )

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000)
      })

      expect(result.current.remainingSeconds).toBeLessThanOrEqual(30)

      const newExpiresAt = new Date(baseTime + 120000) // 2分後
      rerender({
        token: 'test-token-2',
        expiresAt: newExpiresAt,
      })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000)
      })

      expect(result.current.remainingSeconds).toBeGreaterThan(100)
    })

    it('無効なトークンで即座に期限切れになる', () => {
      const { result } = renderHook(() =>
        useTokenExpiry({
          token: null,
          expiresAt: null,
        })
      )

      expect(result.current.isExpired).toBe(true)
      expect(result.current.remainingSeconds).toBe(0)
    })
  })

  describe('クリーンアップ', () => {
    it('コンポーネントアンマウント時にタイマーがクリアされる', () => {
      const expiresAt = new Date(Date.now() + 60000) // 1分後
      const clearIntervalSpy = vi.spyOn(window, 'clearInterval')

      const { unmount } = renderHook(() =>
        useTokenExpiry({
          token: 'test-token',
          expiresAt,
        })
      )

      unmount()

      expect(clearIntervalSpy).toHaveBeenCalled()
      clearIntervalSpy.mockRestore()
    })
  })
})
