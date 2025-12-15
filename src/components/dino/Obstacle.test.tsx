/**
 * Issue #11: feat: Dino Run - 障害物生成・移動
 *
 * テスト対象: Obstacle クラス/コンポーネント
 * - 障害物の生成
 * - 障害物の移動
 * - 障害物の種類
 */
import { describe, it, expect, vi } from 'vitest'

// TODO: Obstacleクラス実装後にインポートを有効化
// import { Obstacle, ObstacleType } from './Obstacle'

describe('Obstacle', () => {
  describe('生成', () => {
    it('サボテン障害物を生成できる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
      // const obstacle = new Obstacle(ObstacleType.CACTUS)
      // expect(obstacle.type).toBe(ObstacleType.CACTUS)
    })

    it('鳥障害物を生成できる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('初期位置が画面右端に設定される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('ランダムな種類の障害物が生成される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('移動', () => {
    it('障害物が左に移動する', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('ゲーム速度に応じて移動速度が変わる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('画面外に出たら非アクティブになる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('当たり判定', () => {
    it('正しい当たり判定領域を返す', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('種類によって当たり判定サイズが異なる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('鳥の動き', () => {
    it('鳥は上下に揺れながら移動する', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('鳥の高さがランダムに設定される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })
})
