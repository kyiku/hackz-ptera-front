/**
 * Dinosaur - 恐竜クラス
 * 
 * プレイヤーが操作する恐竜キャラクター
 * ジャンプ、重力、地面との衝突判定を実装
 */

// ゲーム定数
export const GROUND_Y = 260  // 地面のY座標（CanvasのサイズによるY）
export const DINO_WIDTH = 44
export const DINO_HEIGHT = 47
export const GRAVITY = 0.6
export const JUMP_FORCE = -12

// 恐竜の状態
export type DinoState = 'running' | 'jumping' | 'ducking'

export interface DinoHitbox {
    x: number
    y: number
    width: number
    height: number
}

export class Dinosaur {
    x: number
    y: number
    width: number
    height: number
    velocityY: number
    isJumping: boolean
    isDucking: boolean
    state: DinoState
    animationFrame: number
    animationTimer: number

    constructor(x: number = 80) {
        this.x = x
        this.y = GROUND_Y - DINO_HEIGHT
        this.width = DINO_WIDTH
        this.height = DINO_HEIGHT
        this.velocityY = 0
        this.isJumping = false
        this.isDucking = false
        this.state = 'running'
        this.animationFrame = 0
        this.animationTimer = 0
    }

    /**
     * ジャンプを開始
     */
    jump(): boolean {
        // ジャンプ中は再ジャンプできない
        if (this.isJumping) {
            return false
        }

        this.isJumping = true
        this.velocityY = JUMP_FORCE
        this.state = 'jumping'
        return true
    }

    /**
     * しゃがみを開始
     */
    duck(): void {
        if (!this.isJumping) {
            this.isDucking = true
            this.state = 'ducking'
            // しゃがみ中は高さが半分になる
            this.height = DINO_HEIGHT / 2
            this.y = GROUND_Y - this.height
        }
    }

    /**
     * しゃがみを解除
     */
    standUp(): void {
        this.isDucking = false
        this.state = 'running'
        this.height = DINO_HEIGHT
        this.y = GROUND_Y - this.height
    }

    /**
     * 毎フレームの更新処理
     */
    update(): void {
        // 重力を適用
        if (this.isJumping) {
            this.velocityY += GRAVITY
            this.y += this.velocityY

            // 地面との衝突判定
            if (this.y >= GROUND_Y - this.height) {
                this.y = GROUND_Y - this.height
                this.velocityY = 0
                this.isJumping = false
                this.state = this.isDucking ? 'ducking' : 'running'
            }
        }

        // アニメーション更新
        this.animationTimer++
        if (this.animationTimer >= 6) {
            this.animationTimer = 0
            this.animationFrame = (this.animationFrame + 1) % 2
        }
    }

    /**
     * 恐竜をCanvasに描画
     */
    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save()

        // 恐竜の色（状態で変化）
        if (this.state === 'jumping') {
            ctx.fillStyle = '#34d399' // 緑（ジャンプ中）
        } else if (this.state === 'ducking') {
            ctx.fillStyle = '#fbbf24' // 黄色（しゃがみ中）
        } else {
            ctx.fillStyle = '#10b981' // 緑（通常）
        }

        // 恐竜の体を描画（簡易スプライト）
        const bodyX = this.x
        const bodyY = this.y

        // 胴体
        ctx.fillRect(bodyX, bodyY + 10, this.width - 10, this.height - 20)

        // 頭
        ctx.fillRect(bodyX + this.width - 20, bodyY, 20, 20)

        // 目
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(bodyX + this.width - 10, bodyY + 5, 5, 5)
        ctx.fillStyle = '#000000'
        ctx.fillRect(bodyX + this.width - 8, bodyY + 6, 3, 3)

        // 足（走行アニメーション）
        ctx.fillStyle = this.state === 'ducking' ? '#fbbf24' : '#10b981'
        if (this.state === 'running') {
            if (this.animationFrame === 0) {
                // 左足前
                ctx.fillRect(bodyX + 5, bodyY + this.height - 10, 8, 10)
                ctx.fillRect(bodyX + 20, bodyY + this.height - 5, 8, 5)
            } else {
                // 右足前
                ctx.fillRect(bodyX + 5, bodyY + this.height - 5, 8, 5)
                ctx.fillRect(bodyX + 20, bodyY + this.height - 10, 8, 10)
            }
        } else if (this.state === 'jumping') {
            // ジャンプ中は足を揃える
            ctx.fillRect(bodyX + 8, bodyY + this.height - 8, 8, 8)
            ctx.fillRect(bodyX + 18, bodyY + this.height - 8, 8, 8)
        } else {
            // しゃがみ中
            ctx.fillRect(bodyX + 5, bodyY + this.height - 5, 10, 5)
            ctx.fillRect(bodyX + 20, bodyY + this.height - 5, 10, 5)
        }

        // 尻尾
        ctx.fillStyle = this.state === 'ducking' ? '#fbbf24' : '#10b981'
        ctx.fillRect(bodyX - 8, bodyY + 15, 12, 8)

        ctx.restore()
    }

    /**
     * 当たり判定領域を取得
     */
    getHitbox(): DinoHitbox {
        // しゃがみ中は当たり判定が小さくなる
        const hitboxReduction = this.isDucking ? 5 : 8
        return {
            x: this.x + hitboxReduction,
            y: this.y + hitboxReduction,
            width: this.width - hitboxReduction * 2,
            height: this.height - hitboxReduction,
        }
    }

    /**
     * 位置をリセット
     */
    reset(): void {
        this.y = GROUND_Y - DINO_HEIGHT
        this.height = DINO_HEIGHT
        this.velocityY = 0
        this.isJumping = false
        this.isDucking = false
        this.state = 'running'
        this.animationFrame = 0
        this.animationTimer = 0
    }
}
