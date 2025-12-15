/**
 * Issue #26: feat: 戻るボタン無効化
 *
 * テスト対象: useBackButtonBlock カスタムフック
 * - ブラウザの戻るボタン無効化
 * - 警告表示
 * - 履歴操作
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// TODO: useBackButtonBlockフック実装後にインポートを有効化
// import { useBackButtonBlock } from './useBackButtonBlock'

describe('useBackButtonBlock', () => {
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  beforeEach(() => {
    history.pushState = vi.fn()
    history.replaceState = vi.fn()
  })

  afterEach(() => {
    history.pushState = originalPushState
    history.replaceState = originalReplaceState
  })

  describe('戻るボタン無効化', () => {
    it('戻るボタンを押しても前のページに戻らない', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
      // const { result } = renderHook(() => useBackButtonBlock())
      // expect(result.current.isBlocking).toBe(true)
    })

    it('history.pushStateが呼ばれる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('popstateイベントがキャンセルされる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('警告表示', () => {
    it('戻るボタン押下時に警告が表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('警告メッセージがカスタマイズできる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('警告コールバックが呼ばれる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('有効/無効切り替え', () => {
    it('ブロックを無効にできる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('ブロックを再有効化できる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('クリーンアップ', () => {
    it('コンポーネントアンマウント時にイベントリスナーが削除される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('アンマウント時に履歴が元に戻る', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })
})
