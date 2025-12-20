/**
 * Issue #28: feat: 自動リダイレクト機能
 *
 * テスト対象: useAutoRedirect カスタムフック
 * - 自動リダイレクト処理
 * - カウントダウン表示
 * - リダイレクトキャンセル
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoRedirect } from './useAutoRedirect'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

describe('useAutoRedirect', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockNavigate.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('自動リダイレクト', () => {
    it('指定時間後にリダイレクトする', async () => {
      renderHook(() => useAutoRedirect({ to: '/next', delay: 5000 }))

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/next')
    })

    it('リダイレクト先を指定できる', () => {
      renderHook(() => useAutoRedirect({ to: '/custom', delay: 3000 }))

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/custom')
    })

    it('遅延時間を指定できる', () => {
      renderHook(() => useAutoRedirect({ to: '/next', delay: 10000 }))

      act(() => {
        vi.advanceTimersByTime(9999)
      })
      expect(mockNavigate).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(mockNavigate).toHaveBeenCalled()
    })
  })

  describe('カウントダウン', () => {
    it('残り秒数を返す', () => {
      const { result } = renderHook(() =>
        useAutoRedirect({ to: '/next', delay: 5000 })
      )
      expect(result.current.remainingSeconds).toBe(5)
    })

    it('1秒ごとにカウントダウンする', () => {
      const { result } = renderHook(() =>
        useAutoRedirect({ to: '/next', delay: 5000 })
      )

      expect(result.current.remainingSeconds).toBe(5)

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.remainingSeconds).toBe(4)

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.remainingSeconds).toBe(3)
    })

    it('0になったらリダイレクトする', async () => {
      const { result } = renderHook(() =>
        useAutoRedirect({ to: '/next', delay: 3000 })
      )

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(result.current.remainingSeconds).toBe(0)
      expect(mockNavigate).toHaveBeenCalledWith('/next')
    })
  })

  describe('リダイレクトキャンセル', () => {
    it('キャンセル関数でリダイレクトをキャンセルできる', () => {
      const { result } = renderHook(() =>
        useAutoRedirect({ to: '/next', delay: 5000 })
      )

      act(() => {
        result.current.cancel()
      })

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('キャンセル後はカウントダウンが停止する', () => {
      const { result } = renderHook(() =>
        useAutoRedirect({ to: '/next', delay: 5000 })
      )

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(result.current.remainingSeconds).toBe(4)

      act(() => {
        result.current.cancel()
      })

      act(() => {
        vi.advanceTimersByTime(2000)
      })
      expect(result.current.remainingSeconds).toBe(4) // 停止している
    })

    it('キャンセル後に再開できる', () => {
      const { result } = renderHook(() =>
        useAutoRedirect({ to: '/next', delay: 5000, autoStart: false })
      )

      act(() => {
        result.current.start()
      })
      expect(result.current.isRedirecting).toBe(true)

      act(() => {
        result.current.cancel()
      })
      expect(result.current.isRedirecting).toBe(false)

      act(() => {
        result.current.start()
      })
      expect(result.current.isRedirecting).toBe(true)
    })
  })

  describe('コールバック', () => {
    it('リダイレクト前にコールバックが呼ばれる', () => {
      const onBeforeRedirect = vi.fn()
      renderHook(() =>
        useAutoRedirect({ to: '/next', delay: 3000, onBeforeRedirect })
      )

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(onBeforeRedirect).toHaveBeenCalled()
    })

    it('コールバックでリダイレクトをキャンセルできる', () => {
      const onBeforeRedirect = vi.fn(() => false)
      renderHook(() =>
        useAutoRedirect({ to: '/next', delay: 3000, onBeforeRedirect })
      )

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(onBeforeRedirect).toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  describe('クリーンアップ', () => {
    it('コンポーネントアンマウント時にタイマーがクリアされる', () => {
      const { unmount } = renderHook(() =>
        useAutoRedirect({ to: '/next', delay: 5000 })
      )

      unmount()

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})

