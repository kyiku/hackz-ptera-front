/**
 * Issue #11: feat: Dino Run - 障害物生成・移動
 *
 * テスト対象: Obstacle クラス/ObstacleManager
 * - 障害物の生成
 * - 障害物の移動
 * - 障害物の種類
 */
import { describe, it, expect } from 'vitest'
import { Obstacle, ObstacleType, ObstacleManager } from './Obstacle'

describe('Obstacle', () => {
  describe('生成', () => {
    it('サボテン障害物を生成できる', () => {
      const obstacle = new Obstacle(ObstacleType.SMALL_CACTUS)
      expect(obstacle.type).toBe(ObstacleType.SMALL_CACTUS)
    })

    it('大きいサボテンを生成できる', () => {
      const obstacle = new Obstacle(ObstacleType.LARGE_CACTUS)
      expect(obstacle.type).toBe(ObstacleType.LARGE_CACTUS)
    })

    it('鳥障害物を生成できる', () => {
      const obstacle = new Obstacle(ObstacleType.BIRD)
      expect(obstacle.type).toBe(ObstacleType.BIRD)
    })

    it('初期位置が画面右端に設定される', () => {
      const canvasWidth = 800
      const obstacle = new Obstacle(ObstacleType.SMALL_CACTUS, canvasWidth)
      expect(obstacle.x).toBe(canvasWidth)
    })

    it('初期状態がアクティブになっている', () => {
      const obstacle = new Obstacle(ObstacleType.SMALL_CACTUS)
      expect(obstacle.isActive).toBe(true)
    })
  })

  describe('移動', () => {
    it('障害物が左に移動する', () => {
      const obstacle = new Obstacle(ObstacleType.SMALL_CACTUS, 800, 5)
      const initialX = obstacle.x
      obstacle.update()
      expect(obstacle.x).toBeLessThan(initialX)
    })

    it('画面外に出たら非アクティブになる', () => {
      const obstacle = new Obstacle(ObstacleType.SMALL_CACTUS, 100, 10)
      // 左端まで移動させる
      for (let i = 0; i < 50; i++) {
        obstacle.update()
      }
      expect(obstacle.isActive).toBe(false)
    })
  })

  describe('当たり判定', () => {
    it('正しい当たり判定領域を返す', () => {
      const obstacle = new Obstacle(ObstacleType.SMALL_CACTUS)
      const hitbox = obstacle.getHitbox()
      expect(hitbox.x).toBeDefined()
      expect(hitbox.y).toBeDefined()
      expect(hitbox.width).toBeGreaterThan(0)
      expect(hitbox.height).toBeGreaterThan(0)
    })
  })

  describe('ランダム生成', () => {
    it('ランダムな種類の障害物が生成される', () => {
      const obstacle = Obstacle.createRandom(800, 5)
      expect(Object.values(ObstacleType)).toContain(obstacle.type)
    })
  })
})

describe('ObstacleManager', () => {
  describe('初期化', () => {
    it('初期状態で障害物リストが空', () => {
      const manager = new ObstacleManager(800)
      expect(manager.obstacles.length).toBe(0)
    })
  })

  describe('障害物生成', () => {
    it('spawn時に障害物が追加される', () => {
      const manager = new ObstacleManager(800)
      manager.spawn(5)
      expect(manager.obstacles.length).toBe(1)
    })
  })

  describe('難易度上昇', () => {
    it('スコアに応じて速度が上がる', () => {
      const manager = new ObstacleManager(800)
      const lowScoreSpeed = manager.getCurrentSpeed(100)
      const highScoreSpeed = manager.getCurrentSpeed(1000)
      expect(highScoreSpeed).toBeGreaterThan(lowScoreSpeed)
    })
  })

  describe('リセット', () => {
    it('リセットで障害物がクリアされる', () => {
      const manager = new ObstacleManager(800)
      manager.spawn(5)
      manager.spawn(5)
      manager.reset()
      expect(manager.obstacles.length).toBe(0)
    })
  })
})
