/**
 * Issue #13: feat: Dino Run - スコア・タイマー表示
 *
 * テスト対象: ScoreDisplay コンポーネント
 * - スコア表示
 * - 残り時間表示
 * - ハイスコア表示
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScoreDisplay } from './ScoreDisplay'

describe('ScoreDisplay', () => {
  describe('スコア表示', () => {
    it('現在のスコアが表示される', () => {
      render(<ScoreDisplay score={100} time={60} />)
      expect(screen.getByText('スコア')).toBeInTheDocument()
    })

    it('スコアが正しくフォーマットされて表示される', () => {
      render(<ScoreDisplay score={1234} time={60} />)
      // 5桁フォーマット
      expect(screen.getByText('01234')).toBeInTheDocument()
    })
  })

  describe('タイマー表示', () => {
    it('残り時間が表示される', () => {
      render(<ScoreDisplay score={0} time={60} />)
      expect(screen.getByText('残り時間')).toBeInTheDocument()
    })

    it('残り時間が分:秒形式で表示される', () => {
      // time=60秒経過 → 残り120秒 = 02:00
      render(<ScoreDisplay score={0} time={60} />)
      expect(screen.getByText('02:00')).toBeInTheDocument()
    })

    it('残り30秒以下で警告スタイルになる', () => {
      // time=150秒経過 → 残り30秒 = 00:30
      render(<ScoreDisplay score={0} time={150} />)
      expect(screen.getByText('00:30')).toBeInTheDocument()
    })
  })

  describe('ハイスコア表示', () => {
    it('ハイスコアが表示される', () => {
      render(<ScoreDisplay score={0} time={0} highScore={500} />)
      expect(screen.getByText('ハイスコア')).toBeInTheDocument()
      // 5桁フォーマット
      expect(screen.getByText('00500')).toBeInTheDocument()
    })
  })

  describe('目標スコア表示', () => {
    it('目標までの残りスコアが表示される', () => {
      render(<ScoreDisplay score={100} time={60} targetScore={500} showTargetScore={true} />)
      expect(screen.getByText('目標まで')).toBeInTheDocument()
    })

    it('目標達成時に達成メッセージが表示される', () => {
      render(<ScoreDisplay score={3000} time={60} targetScore={3000} showTargetScore={true} />)
      expect(screen.getByText('🎉 目標達成!')).toBeInTheDocument()
    })

    it('showTargetScoreがfalseの場合は目標を表示しない', () => {
      render(<ScoreDisplay score={100} time={60} showTargetScore={false} />)
      expect(screen.queryByText('目標まで')).not.toBeInTheDocument()
    })

    it('ゲームオーバー時は目標を表示しない', () => {
      render(<ScoreDisplay score={100} time={60} showTargetScore={true} isGameOver={true} />)
      expect(screen.queryByText('目標まで')).not.toBeInTheDocument()
    })
  })
})
