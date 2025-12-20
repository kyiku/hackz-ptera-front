/**
 * Issue #18: feat: CAPTCHA - タイマー・タイムアウト処理
 *
 * テスト対象: CaptchaTimer コンポーネント
 * - タイマー表示
 * - タイムアウト処理
 * - 警告表示
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CaptchaTimer } from './CaptchaTimer'
import { formatTime, DEFAULT_TIMEOUT_SECONDS, WARNING_THRESHOLD, CRITICAL_THRESHOLD } from './captchaTimerUtils'

describe('CaptchaTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('タイマー表示', () => {
    it('残り時間が表示される', () => {
      render(<CaptchaTimer duration={30} onTimeout={() => { }} />)
      expect(screen.getByText('00:30')).toBeInTheDocument()
    })

    it('タイマーがカウントダウンする', () => {
      render(<CaptchaTimer duration={30} onTimeout={() => { }} />)
      expect(screen.getByText('00:30')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(screen.getByText('00:25')).toBeInTheDocument()
    })

    it('タイマーがMM:SS形式で表示される', () => {
      render(<CaptchaTimer duration={125} onTimeout={() => { }} />)
      expect(screen.getByText('02:05')).toBeInTheDocument()
    })

    it('data-testidが正しく設定される', () => {
      render(<CaptchaTimer duration={30} onTimeout={() => { }} />)
      expect(screen.getByTestId('captcha-timer')).toBeInTheDocument()
    })
  })

  describe('タイムアウト処理', () => {
    it('時間切れでonTimeoutコールバックが呼ばれる', () => {
      const onTimeout = vi.fn()
      render(<CaptchaTimer duration={5} onTimeout={onTimeout} />)

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(onTimeout).toHaveBeenCalled()
    })

    it('タイムアウト時にタイマーが0になる', () => {
      render(<CaptchaTimer duration={3} onTimeout={() => { }} />)

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(screen.getByText('00:00')).toBeInTheDocument()
    })

    it('タイムアウト時に「時間切れ」が表示される', () => {
      render(<CaptchaTimer duration={2} onTimeout={() => { }} />)

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(screen.getByText('⏰ 時間切れ')).toBeInTheDocument()
    })
  })

  describe('警告表示', () => {
    it('残り30秒以下で警告メッセージが表示される', () => {
      render(<CaptchaTimer duration={35} onTimeout={() => { }} />)

      act(() => {
        vi.advanceTimersByTime(10000) // 残り25秒
      })

      expect(screen.getByText('⚠ 残り時間が少なくなっています')).toBeInTheDocument()
    })

    it('残り10秒以下で危険メッセージが表示される', () => {
      render(<CaptchaTimer duration={15} onTimeout={() => { }} />)

      act(() => {
        vi.advanceTimersByTime(10000) // 残り5秒
      })

      expect(screen.getByText('⚠ まもなくタイムアウトします！')).toBeInTheDocument()
    })
  })

  describe('タイマー制御', () => {
    it('isPausedがtrueの時はカウントダウンしない', () => {
      render(<CaptchaTimer duration={30} onTimeout={() => { }} isPaused={true} />)

      expect(screen.getByText('00:30')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      // 一時停止中なので変化しない
      expect(screen.getByText('00:30')).toBeInTheDocument()
    })

    it('一時停止中の表示がされる', () => {
      render(<CaptchaTimer duration={30} onTimeout={() => { }} isPaused={true} />)
      expect(screen.getByText('一時停止中')).toBeInTheDocument()
    })
  })

  describe('プログレスバー', () => {
    it('showProgressBarがtrueの時プログレスバーが表示される', () => {
      render(<CaptchaTimer duration={30} onTimeout={() => { }} showProgressBar={true} />)
      // プログレスバーの親要素を確認
      expect(screen.getByTestId('captcha-timer')).toBeInTheDocument()
    })
  })

  describe('コンパクト表示', () => {
    it('compactモードで簡潔な表示になる', () => {
      render(<CaptchaTimer duration={30} onTimeout={() => { }} compact={true} />)
      expect(screen.getByText('00:30')).toBeInTheDocument()
      // コンパクトモードでは警告メッセージは表示されない
      expect(screen.queryByText('残り時間')).not.toBeInTheDocument()
    })
  })
})

describe('formatTime', () => {
  it('秒数をMM:SS形式にフォーマットする', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(30)).toBe('00:30')
    expect(formatTime(60)).toBe('01:00')
    expect(formatTime(90)).toBe('01:30')
    expect(formatTime(180)).toBe('03:00')
  })
})
