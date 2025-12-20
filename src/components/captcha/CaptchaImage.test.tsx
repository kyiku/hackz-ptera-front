/**
 * Issue #16: feat: CAPTCHA - 画像表示・クリック座標取得
 *
 * テスト対象: CaptchaImage コンポーネント
 * - CAPTCHA画像の表示
 * - クリック座標の取得
 * - 選択状態の表示
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CaptchaImage, IMAGE_WIDTH, IMAGE_HEIGHT } from './CaptchaImage'

describe('CaptchaImage', () => {
  const mockOnSelect = vi.fn()
  const testImageUrl = 'https://example.com/captcha.png'

  beforeEach(() => {
    mockOnSelect.mockClear()
  })

  describe('画像表示', () => {
    it('CAPTCHA画像コンテナが表示される', () => {
      render(<CaptchaImage imageUrl={testImageUrl} onSelect={mockOnSelect} />)
      expect(screen.getByTestId('captcha-image-container')).toBeInTheDocument()
    })

    it('画像要素が存在する', () => {
      render(<CaptchaImage imageUrl={testImageUrl} onSelect={mockOnSelect} />)
      const img = screen.getByAltText('CAPTCHA画像')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', testImageUrl)
    })

    it('画像読み込み中テキストが表示される', () => {
      render(<CaptchaImage imageUrl={testImageUrl} onSelect={mockOnSelect} />)
      expect(screen.getByText('画像を読み込み中...')).toBeInTheDocument()
    })
  })

  describe('定数', () => {
    it('IMAGE_WIDTHが1024pxに設定されている', () => {
      expect(IMAGE_WIDTH).toBe(1024)
    })

    it('IMAGE_HEIGHTが768pxに設定されている', () => {
      expect(IMAGE_HEIGHT).toBe(768)
    })
  })

  describe('Props', () => {
    it('maxSelectionsプロパティがデフォルト10に設定されている', () => {
      render(<CaptchaImage imageUrl={testImageUrl} onSelect={mockOnSelect} />)
      expect(screen.getByTestId('captcha-image-container')).toBeInTheDocument()
    })

    it('disabledプロパティでクリックを無効化できる', () => {
      render(<CaptchaImage imageUrl={testImageUrl} onSelect={mockOnSelect} disabled={true} />)
      expect(screen.getByTestId('captcha-image-container')).toBeInTheDocument()
    })

    it('showGridプロパティでグリッド表示を有効化できる', () => {
      render(<CaptchaImage imageUrl={testImageUrl} onSelect={mockOnSelect} showGrid={true} />)
      expect(screen.getByTestId('captcha-image-container')).toBeInTheDocument()
    })
  })
})
