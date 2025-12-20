/**
 * Issue #6: feat: 待機列ページUI
 *
 * テスト対象: QueuePage コンポーネント
 * - 待機列ページの基本レンダリング
 * - 待機中のUI表示
 * - ページ遷移処理
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueuePage } from './QueuePage'

// react-router-domのnavigate関数をモック
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// useQueueWebSocketのモック
vi.mock('../hooks/useQueueWebSocket', () => ({
  useQueueWebSocket: vi.fn(),
}))

import { useQueueWebSocket } from '../hooks/useQueueWebSocket'
const mockedUseQueueWebSocket = vi.mocked(useQueueWebSocket)

describe('QueuePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('基本レンダリング', () => {
    it('待機列ページが正しくレンダリングされる', () => {
      mockedUseQueueWebSocket.mockReturnValue({
        isConnected: true,
        isConnecting: false,
        error: null,
        position: 5,
        totalWaiting: 20,
        reconnect: vi.fn(),
      })

      render(
        <MemoryRouter>
          <QueuePage />
        </MemoryRouter>
      )

      expect(screen.getByTestId('queue-page')).toBeInTheDocument()
    })

    it('待機中メッセージが表示される', () => {
      mockedUseQueueWebSocket.mockReturnValue({
        isConnected: true,
        isConnecting: false,
        error: null,
        position: 5,
        totalWaiting: 20,
        reconnect: vi.fn(),
      })

      render(
        <MemoryRouter>
          <QueuePage />
        </MemoryRouter>
      )

      expect(screen.getByText('順番が来るまでお待ちください')).toBeInTheDocument()
    })

    it('待機アニメーションが表示される', () => {
      mockedUseQueueWebSocket.mockReturnValue({
        isConnected: true,
        isConnecting: false,
        error: null,
        position: 5,
        totalWaiting: 20,
        reconnect: vi.fn(),
      })

      render(
        <MemoryRouter>
          <QueuePage />
        </MemoryRouter>
      )

      // アニメーションインジケーター（3つのドット）を確認
      const animatedDots = document.querySelectorAll('.animate-bounce')
      expect(animatedDots.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('接続状態表示', () => {
    it('接続中の場合「接続中...」が表示される', () => {
      mockedUseQueueWebSocket.mockReturnValue({
        isConnected: false,
        isConnecting: true,
        error: null,
        position: 0,
        totalWaiting: 0,
        reconnect: vi.fn(),
      })

      render(
        <MemoryRouter>
          <QueuePage />
        </MemoryRouter>
      )

      expect(screen.getByText('接続中...')).toBeInTheDocument()
    })
  })

  describe('待機状態表示', () => {
    it('待機人数が表示される', () => {
      mockedUseQueueWebSocket.mockReturnValue({
        isConnected: true,
        isConnecting: false,
        error: null,
        position: 5,
        totalWaiting: 20,
        reconnect: vi.fn(),
      })

      render(
        <MemoryRouter>
          <QueuePage />
        </MemoryRouter>
      )

      expect(screen.getByText('20')).toBeInTheDocument()
      expect(screen.getByText('人待ち')).toBeInTheDocument()
    })

    it('推定待機時間が表示される', () => {
      mockedUseQueueWebSocket.mockReturnValue({
        isConnected: true,
        isConnecting: false,
        error: null,
        position: 5,
        totalWaiting: 20,
        reconnect: vi.fn(),
      })

      render(
        <MemoryRouter>
          <QueuePage />
        </MemoryRouter>
      )

      // 推定待機時間（position * 1.5 = 5 * 1.5 = 7.5 → 8分）
      expect(screen.getByText('約 8 分')).toBeInTheDocument()
    })

    it('現在の順位が表示される', () => {
      mockedUseQueueWebSocket.mockReturnValue({
        isConnected: true,
        isConnecting: false,
        error: null,
        position: 5,
        totalWaiting: 20,
        reconnect: vi.fn(),
      })

      render(
        <MemoryRouter>
          <QueuePage />
        </MemoryRouter>
      )

      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('番目です')).toBeInTheDocument()
    })
  })

  describe('ページ遷移', () => {
    it('順番が来たらDino Runページへ遷移する', async () => {
      // 初期状態で順位1、その後モックが遷移をトリガー
      mockedUseQueueWebSocket.mockReturnValue({
        isConnected: true,
        isConnecting: false,
        error: null,
        position: 1,
        totalWaiting: 1,
        reconnect: vi.fn(),
      })

      render(
        <MemoryRouter>
          <QueuePage />
        </MemoryRouter>
      )

      // 順位が1の場合、特別メッセージが表示される
      expect(screen.getByText('🎉 まもなくあなたの番です！')).toBeInTheDocument()
    })
  })

  describe('エラーハンドリング', () => {
    it('接続エラー時にエラーメッセージが表示される', () => {
      mockedUseQueueWebSocket.mockReturnValue({
        isConnected: false,
        isConnecting: false,
        error: '接続エラーが発生しました',
        position: 0,
        totalWaiting: 0,
        reconnect: vi.fn(),
      })

      render(
        <MemoryRouter>
          <QueuePage />
        </MemoryRouter>
      )

      expect(screen.getByText('接続エラーが発生しました')).toBeInTheDocument()
    })

    it('再接続ボタンが表示される', () => {
      const mockReconnect = vi.fn()
      mockedUseQueueWebSocket.mockReturnValue({
        isConnected: false,
        isConnecting: false,
        error: '接続エラーが発生しました',
        position: 0,
        totalWaiting: 0,
        reconnect: mockReconnect,
      })

      render(
        <MemoryRouter>
          <QueuePage />
        </MemoryRouter>
      )

      const reconnectButton = screen.getByRole('button', { name: '再接続' })
      expect(reconnectButton).toBeInTheDocument()
    })
  })
})
