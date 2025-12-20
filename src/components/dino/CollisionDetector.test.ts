/**
 * Issue #12: feat: Dino Run - 衝突判定・ゲームオーバー
 *
 * テスト対象: CollisionDetector
 * - 矩形衝突判定
 * - 衝突時のゲームオーバー状態
 */
import { describe, it, expect, vi } from 'vitest'
import { checkCollision, checkTouch, CollisionDetector } from './CollisionDetector'
import type { Rect } from './CollisionDetector'

describe('checkCollision', () => {
  it('重なっている矩形で衝突を検出する', () => {
    const a: Rect = { x: 0, y: 0, width: 50, height: 50 }
    const b: Rect = { x: 25, y: 25, width: 50, height: 50 }
    expect(checkCollision(a, b)).toBe(true)
  })

  it('離れている矩形では衝突を検出しない', () => {
    const a: Rect = { x: 0, y: 0, width: 50, height: 50 }
    const b: Rect = { x: 100, y: 100, width: 50, height: 50 }
    expect(checkCollision(a, b)).toBe(false)
  })

  it('境界が接している矩形では衝突を検出しない', () => {
    const a: Rect = { x: 0, y: 0, width: 50, height: 50 }
    const b: Rect = { x: 50, y: 0, width: 50, height: 50 }
    expect(checkCollision(a, b)).toBe(false)
  })

  it('完全に内包されている矩形で衝突を検出する', () => {
    const a: Rect = { x: 0, y: 0, width: 100, height: 100 }
    const b: Rect = { x: 25, y: 25, width: 50, height: 50 }
    expect(checkCollision(a, b)).toBe(true)
  })
})

describe('checkTouch', () => {
  it('境界が接している矩形で接触を検出する', () => {
    const a: Rect = { x: 0, y: 0, width: 50, height: 50 }
    const b: Rect = { x: 50, y: 0, width: 50, height: 50 }
    expect(checkTouch(a, b)).toBe(true)
  })

  it('離れている矩形では接触を検出しない', () => {
    const a: Rect = { x: 0, y: 0, width: 50, height: 50 }
    const b: Rect = { x: 100, y: 100, width: 50, height: 50 }
    expect(checkTouch(a, b)).toBe(false)
  })
})

describe('CollisionDetector', () => {
  describe('初期状態', () => {
    it('ゲームオーバー状態がfalseで初期化される', () => {
      const detector = new CollisionDetector()
      expect(detector.getIsGameOver()).toBe(false)
    })

    it('ハイスコアを設定できる', () => {
      const detector = new CollisionDetector(100)
      expect(detector.getHighScore()).toBe(100)
    })
  })

  describe('衝突チェック', () => {
    it('衝突時にtrueを返す', () => {
      const detector = new CollisionDetector()
      const dinoHitbox: Rect = { x: 0, y: 0, width: 50, height: 50 }
      const obstacleHitboxes: Rect[] = [{ x: 25, y: 25, width: 50, height: 50 }]

      const result = detector.checkDinoObstacleCollision(dinoHitbox, obstacleHitboxes, 100, 60)
      expect(result).toBe(true)
      expect(detector.getIsGameOver()).toBe(true)
    })

    it('衝突なしでfalseを返す', () => {
      const detector = new CollisionDetector()
      const dinoHitbox: Rect = { x: 0, y: 0, width: 50, height: 50 }
      const obstacleHitboxes: Rect[] = [{ x: 100, y: 100, width: 50, height: 50 }]

      const result = detector.checkDinoObstacleCollision(dinoHitbox, obstacleHitboxes, 100, 60)
      expect(result).toBe(false)
    })
  })

  describe('ゲームオーバー処理', () => {
    it('ゲームオーバー時にコールバックが呼ばれる', () => {
      const callback = vi.fn()
      const detector = new CollisionDetector()
      detector.setOnGameOver(callback)

      detector.triggerGameOver(100, 60)

      expect(callback).toHaveBeenCalledWith({
        score: 100,
        time: 60,
        isHighScore: true, // 初期ハイスコア0より大きい
      })
    })

    it('ハイスコアを更新する', () => {
      const detector = new CollisionDetector(50)
      detector.triggerGameOver(100, 60)
      expect(detector.getHighScore()).toBe(100)
    })

    it('ハイスコアより低い場合は更新しない', () => {
      const detector = new CollisionDetector(200)
      detector.triggerGameOver(100, 60)
      expect(detector.getHighScore()).toBe(200)
    })
  })

  describe('リセット', () => {
    it('リセットでゲームオーバー状態がクリアされる', () => {
      const detector = new CollisionDetector()
      detector.triggerGameOver(100, 60)
      detector.reset()
      expect(detector.getIsGameOver()).toBe(false)
    })
  })
})
