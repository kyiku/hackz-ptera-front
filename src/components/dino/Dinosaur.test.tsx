/**
 * Issue #10: feat: Dino Run - 恐竜キャラクター描画・操作
 *
 * テスト対象: Dinosaur クラス
 * - 恐竜の描画
 * - ジャンプ操作
 * - アニメーション
 */
import { describe, it, expect } from 'vitest'
import { Dinosaur, GROUND_Y, DINO_HEIGHT, JUMP_FORCE } from './Dinosaur'

describe('Dinosaur', () => {
  describe('初期状態', () => {
    it('恐竜が地面に立っている状態で初期化される', () => {
      const dino = new Dinosaur()
      expect(dino.y).toBe(GROUND_Y - DINO_HEIGHT)
      expect(dino.isJumping).toBe(false)
    })

    it('初期位置が正しく設定される', () => {
      const dino = new Dinosaur(100)
      expect(dino.x).toBe(100)
    })

    it('初期状態がrunningになっている', () => {
      const dino = new Dinosaur()
      expect(dino.state).toBe('running')
    })
  })

  describe('ジャンプ操作', () => {
    it('ジャンプコマンドで恐竜がジャンプする', () => {
      const dino = new Dinosaur()
      const result = dino.jump()
      expect(result).toBe(true)
      expect(dino.isJumping).toBe(true)
      expect(dino.velocityY).toBe(JUMP_FORCE)
    })

    it('ジャンプ中は再ジャンプできない', () => {
      const dino = new Dinosaur()
      dino.jump()
      const result = dino.jump()
      expect(result).toBe(false)
    })

    it('ジャンプ後に着地する', () => {
      const dino = new Dinosaur()
      dino.jump()

      // 複数フレーム更新して着地させる
      for (let i = 0; i < 50; i++) {
        dino.update()
      }

      expect(dino.isJumping).toBe(false)
      expect(dino.y).toBe(GROUND_Y - DINO_HEIGHT)
    })

    it('ジャンプ中は状態がjumpingになる', () => {
      const dino = new Dinosaur()
      dino.jump()
      expect(dino.state).toBe('jumping')
    })
  })

  describe('しゃがみ操作', () => {
    it('しゃがみコマンドで恐竜がしゃがむ', () => {
      const dino = new Dinosaur()
      dino.duck()
      expect(dino.isDucking).toBe(true)
      expect(dino.state).toBe('ducking')
    })

    it('しゃがみ中は当たり判定が小さくなる', () => {
      const dino = new Dinosaur()
      dino.duck()
      expect(dino.height).toBe(DINO_HEIGHT / 2)
    })

    it('しゃがみ解除で元の状態に戻る', () => {
      const dino = new Dinosaur()
      dino.duck()
      dino.standUp()
      expect(dino.isDucking).toBe(false)
      expect(dino.height).toBe(DINO_HEIGHT)
      expect(dino.state).toBe('running')
    })

    it('ジャンプ中はしゃがめない', () => {
      const dino = new Dinosaur()
      dino.jump()
      dino.duck()
      expect(dino.isDucking).toBe(false)
    })
  })

  describe('当たり判定', () => {
    it('正しい当たり判定領域を返す', () => {
      const dino = new Dinosaur(80)
      const hitbox = dino.getHitbox()
      expect(hitbox.x).toBeGreaterThan(dino.x)
      expect(hitbox.width).toBeLessThan(dino.width)
    })

    it('しゃがみ中は当たり判定が変わる', () => {
      const dino = new Dinosaur()
      const normalHitbox = dino.getHitbox()
      dino.duck()
      const duckingHitbox = dino.getHitbox()
      expect(duckingHitbox.height).toBeLessThan(normalHitbox.height)
    })
  })

  describe('リセット', () => {
    it('リセットで初期状態に戻る', () => {
      const dino = new Dinosaur()
      dino.jump()
      dino.update()
      dino.reset()

      expect(dino.isJumping).toBe(false)
      expect(dino.velocityY).toBe(0)
      expect(dino.state).toBe('running')
    })
  })
})
