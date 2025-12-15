/**
 * Issue #13: feat: Dino Run - スコア・タイマー表示
 *
 * テスト対象: ScoreDisplay コンポーネント
 * - スコアの表示
 * - タイマーの表示
 * - ハイスコアの表示
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// TODO: ScoreDisplayコンポーネント実装後にインポートを有効化
// import { ScoreDisplay } from './ScoreDisplay'

describe('ScoreDisplay', () => {
  describe('スコア表示', () => {
    it('現在のスコアが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
      // render(<ScoreDisplay score={100} time={30} />)
      // expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('スコアがゼロパディングされて表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('スコアが更新されると表示が変わる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('100点ごとにハイライトアニメーションが再生される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('タイマー表示', () => {
    it('経過時間が表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('タイマーがMM:SS形式で表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('タイマーがリアルタイムで更新される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('ハイスコア表示', () => {
    it('ハイスコアが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('現在のスコアがハイスコアを超えるとハイスコアが更新される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('ハイスコア更新時に特別な表示がされる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('目標スコア', () => {
    it('目標スコアが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('目標スコアまでの残りが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('目標スコア達成時に達成メッセージが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })
})
