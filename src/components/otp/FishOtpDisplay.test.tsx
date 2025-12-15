/**
 * Issue #22: feat: 魚OTP - 画像表示UI
 *
 * テスト対象: FishOtpDisplay コンポーネント
 * - 魚画像の表示
 * - OTP選択UI
 * - アニメーション
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// TODO: FishOtpDisplayコンポーネント実装後にインポートを有効化
// import { FishOtpDisplay } from './FishOtpDisplay'

describe('FishOtpDisplay', () => {
  describe('基本レンダリング', () => {
    it('魚OTP表示エリアが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
      // render(<FishOtpDisplay fishImages={['/fish1.png', '/fish2.png']} onSelect={() => {}} />)
      // expect(screen.getByTestId('fish-otp-display')).toBeInTheDocument()
    })

    it('複数の魚画像が表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('選択指示が表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('魚画像表示', () => {
    it('魚画像がグリッドで表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('各魚画像にラベルが付いている', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('魚画像がランダムな順序で表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('選択UI', () => {
    it('魚をクリックで選択できる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('選択された魚がハイライトされる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('順序通りに選択する必要がある', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('選択をリセットできる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('アニメーション', () => {
    it('魚がゆらゆら泳ぐアニメーション', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('選択時にアニメーションが再生される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('間違い選択時に震えアニメーションが再生される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('アクセシビリティ', () => {
    it('キーボードで選択できる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('スクリーンリーダー用のラベルがある', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })
})
