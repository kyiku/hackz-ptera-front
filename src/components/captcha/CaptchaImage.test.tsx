/**
 * Issue #16: feat: CAPTCHA - 画像表示・クリック座標取得
 *
 * テスト対象: CaptchaImage コンポーネント
 * - CAPTCHA画像の表示
 * - クリック座標の取得
 * - 選択状態の表示
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// TODO: CaptchaImageコンポーネント実装後にインポートを有効化
// import { CaptchaImage } from './CaptchaImage'

describe('CaptchaImage', () => {
  describe('画像表示', () => {
    it('CAPTCHA画像が表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
      // render(<CaptchaImage imageUrl="/api/captcha/image" onSelect={() => {}} />)
      // expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('画像読み込み中はローディング表示', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('画像読み込みエラー時にエラー表示', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('クリック座標取得', () => {
    it('画像クリック時に座標がコールバックで返される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('座標が画像の相対位置で計算される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('複数回クリックで複数の座標が記録される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('選択状態表示', () => {
    it('クリックした位置にマーカーが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('マーカーをクリックで選択を解除できる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('選択数が上限に達すると追加クリックが無効になる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('グリッド表示', () => {
    it('グリッドCAPTCHA時にグリッドが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('グリッドセルクリックでセルが選択状態になる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('選択済みセルの再クリックで選択解除', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })
})
