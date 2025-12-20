/**
 * Issue #7: feat: 待機順位表示コンポーネント
 *
 * テスト対象: QueuePosition コンポーネント
 * - 待機順位の表示
 * - 順位変動のアニメーション
 * - 順位更新処理
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueuePosition } from './QueuePosition'

describe('QueuePosition', () => {
  describe('基本レンダリング', () => {
    it('待機順位が表示される', () => {
      render(<QueuePosition position={5} totalWaiting={100} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('合計待機人数が表示される', () => {
      render(<QueuePosition position={5} totalWaiting={100} />)
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('人待ち')).toBeInTheDocument()
    })

    it('「○番目です」のフォーマットで表示される', () => {
      render(<QueuePosition position={3} totalWaiting={50} />)
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('番目です')).toBeInTheDocument()
    })

    it('data-testidが正しく設定される', () => {
      render(<QueuePosition position={5} totalWaiting={100} />)
      expect(screen.getByTestId('queue-position')).toBeInTheDocument()
    })
  })

  describe('順位更新', () => {
    it('順位が更新されると表示が変わる', () => {
      const { rerender } = render(<QueuePosition position={10} totalWaiting={100} />)
      expect(screen.getByText('10')).toBeInTheDocument()

      rerender(<QueuePosition position={5} totalWaiting={100} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('順位が1になると特別な表示になる', () => {
      render(<QueuePosition position={1} totalWaiting={10} />)
      expect(screen.getByText('🎉 まもなくあなたの番です！')).toBeInTheDocument()
    })

    it('順位が1以外の場合は特別なメッセージが表示されない', () => {
      render(<QueuePosition position={2} totalWaiting={10} />)
      expect(screen.queryByText('🎉 まもなくあなたの番です！')).not.toBeInTheDocument()
    })
  })

  describe('プログレスバー', () => {
    it('待機進捗がプログレスバーで表示される', () => {
      render(<QueuePosition position={50} totalWaiting={100} />)
      expect(screen.getByText('待機進捗')).toBeInTheDocument()
    })

    it('プログレスパーセンテージが表示される', () => {
      // position=50, total=100 -> progress = (100-50+1)/100 * 100 = 51%
      render(<QueuePosition position={50} totalWaiting={100} />)
      expect(screen.getByText('51%')).toBeInTheDocument()
    })

    it('順位が1の場合はプログレスが100%に近い', () => {
      // position=1, total=100 -> progress = (100-1+1)/100 * 100 = 100%
      render(<QueuePosition position={1} totalWaiting={100} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('順位に応じてプログレスバーが更新される', () => {
      const { rerender } = render(<QueuePosition position={80} totalWaiting={100} />)
      expect(screen.getByText('21%')).toBeInTheDocument()

      rerender(<QueuePosition position={20} totalWaiting={100} />)
      expect(screen.getByText('81%')).toBeInTheDocument()
    })
  })
})
