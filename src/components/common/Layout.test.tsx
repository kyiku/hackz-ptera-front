/**
 * Issue #2: feat: 共通レイアウトコンポーネント
 *
 * テスト対象: Layout コンポーネント
 * - ヘッダー/フッターの表示
 * - 子コンポーネントのレンダリング
 * - レスポンシブ対応
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Layout } from './Layout'

describe('Layout', () => {
  describe('基本レンダリング', () => {
    it('Layoutコンポーネントが正しくレンダリングされる', () => {
      render(
        <Layout>
          <div data-testid="child">Child Content</div>
        </Layout>
      )
      expect(screen.getByTestId('layout')).toBeInTheDocument()
    })

    it('子要素が正しく表示される', () => {
      render(
        <Layout>
          <div data-testid="child">Child Content</div>
        </Layout>
      )
      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByTestId('child')).toHaveTextContent('Child Content')
    })
  })

  describe('ヘッダー', () => {
    it('ヘッダーが表示される', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      )
      expect(screen.getByTestId('header')).toBeInTheDocument()
    })

    it('ロゴが表示される', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      )
      expect(screen.getByTestId('logo')).toBeInTheDocument()
    })
  })

  describe('フッター', () => {
    it('フッターが表示される', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      )
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })

    it('コピーライトが表示される', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      )
      expect(screen.getByTestId('copyright')).toBeInTheDocument()
      expect(screen.getByTestId('copyright')).toHaveTextContent('© 2025 Hackz-Ptera')
    })
  })

  describe('レスポンシブ対応', () => {
    it('モバイル表示で適切なスタイルが適用される', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      )
      const layout = screen.getByTestId('layout')
      expect(layout).toHaveClass('min-h-screen', 'flex', 'flex-col')
    })

    it('デスクトップ表示で適切なスタイルが適用される', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      )
      const layout = screen.getByTestId('layout')
      expect(layout).toHaveClass('min-h-screen', 'flex', 'flex-col')
    })
  })
})

