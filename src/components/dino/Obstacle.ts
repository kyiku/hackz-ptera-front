/**
 * Obstacle - 障害物クラス
 * 
 * 恐竜が避けるべき障害物（サボテン、鳥など）
 */
import { GROUND_Y } from './Dinosaur'

// 障害物の種類
export const ObstacleType = {
    SMALL_CACTUS: 'small_cactus',
    LARGE_CACTUS: 'large_cactus',
    BIRD: 'bird',
} as const

export type ObstacleType = typeof ObstacleType[keyof typeof ObstacleType]

// 障害物のサイズ定義
const OBSTACLE_SIZES: Record<ObstacleType, { width: number; height: number }> = {
    [ObstacleType.SMALL_CACTUS]: { width: 20, height: 35 },
    [ObstacleType.LARGE_CACTUS]: { width: 30, height: 50 },
    [ObstacleType.BIRD]: { width: 40, height: 30 },
}

// 鳥の飛ぶ高さパターン
const BIRD_HEIGHTS = [
    GROUND_Y - 30,   // 低い（ジャンプで避ける）
    GROUND_Y - 60,   // 中間（しゃがみ or ジャンプ）
    GROUND_Y - 100,  // 高い（しゃがみで避ける）
]

export interface ObstacleHitbox {
    x: number
    y: number
    width: number
    height: number
}

export class Obstacle {
    type: ObstacleType
    x: number
    y: number
    width: number
    height: number
    speed: number
    isActive: boolean
    animationFrame: number
    animationTimer: number
    baseY: number = 0  // 鳥用の基準Y座標

    constructor(type: ObstacleType, canvasWidth: number = 800, speed: number = 5) {
        this.type = type
        this.x = canvasWidth  // 画面右端から開始
        this.speed = speed
        this.isActive = true
        this.animationFrame = 0
        this.animationTimer = 0

        // サイズを設定
        const size = OBSTACLE_SIZES[type]
        this.width = size.width
        this.height = size.height

        // Y座標を設定
        if (type === ObstacleType.BIRD) {
            // 鳥はランダムな高さ
            this.baseY = BIRD_HEIGHTS[Math.floor(Math.random() * BIRD_HEIGHTS.length)]
            this.y = this.baseY
        } else {
            // サボテンは地面に設置
            this.y = GROUND_Y - this.height
        }
    }

    /**
     * 障害物を左方向に移動
     */
    update(): void {
        if (!this.isActive) return

        // 左方向に移動
        this.x -= this.speed

        // 画面外に出たら非アクティブ化
        if (this.x + this.width < 0) {
            this.isActive = false
        }

        // 鳥の上下揺れアニメーション
        if (this.type === ObstacleType.BIRD) {
            this.animationTimer++
            if (this.animationTimer >= 10) {
                this.animationTimer = 0
                this.animationFrame = (this.animationFrame + 1) % 2
            }
            // 上下に揺れる
            this.y = this.baseY + Math.sin(this.x / 20) * 5
        }
    }

    /**
     * 障害物を描画
     */
    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isActive) return

        ctx.save()

        switch (this.type) {
            case ObstacleType.SMALL_CACTUS:
                this.drawCactus(ctx, false)
                break
            case ObstacleType.LARGE_CACTUS:
                this.drawCactus(ctx, true)
                break
            case ObstacleType.BIRD:
                this.drawBird(ctx)
                break
        }

        ctx.restore()
    }

    /**
     * サボテンを描画
     */
    private drawCactus(ctx: CanvasRenderingContext2D, isLarge: boolean): void {
        ctx.fillStyle = '#22c55e'  // 緑

        // メインの幹
        const trunkWidth = isLarge ? 12 : 8
        ctx.fillRect(
            this.x + (this.width - trunkWidth) / 2,
            this.y,
            trunkWidth,
            this.height
        )

        // 左の枝
        const branchWidth = isLarge ? 10 : 6
        const branchHeight = isLarge ? 20 : 15
        ctx.fillRect(
            this.x,
            this.y + this.height * 0.3,
            branchWidth,
            branchHeight
        )
        ctx.fillRect(
            this.x,
            this.y + this.height * 0.3,
            (this.width - trunkWidth) / 2,
            branchWidth
        )

        // 右の枝
        ctx.fillRect(
            this.x + this.width - branchWidth,
            this.y + this.height * 0.5,
            branchWidth,
            branchHeight
        )
        ctx.fillRect(
            this.x + (this.width + trunkWidth) / 2,
            this.y + this.height * 0.5,
            (this.width - trunkWidth) / 2,
            branchWidth
        )
    }

    /**
     * 鳥を描画
     */
    private drawBird(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#ef4444'  // 赤

        // 体
        ctx.fillRect(this.x + 10, this.y + 10, 20, 15)

        // 頭
        ctx.fillRect(this.x + 25, this.y + 5, 15, 15)

        // くちばし
        ctx.fillStyle = '#fbbf24'
        ctx.fillRect(this.x + 35, this.y + 10, 8, 5)

        // 翼（アニメーション）
        ctx.fillStyle = '#ef4444'
        if (this.animationFrame === 0) {
            // 翼を上げた状態
            ctx.fillRect(this.x + 12, this.y, 16, 10)
        } else {
            // 翼を下げた状態
            ctx.fillRect(this.x + 12, this.y + 20, 16, 10)
        }

        // 目
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(this.x + 32, this.y + 8, 4, 4)
    }

    /**
     * 当たり判定領域を取得
     */
    getHitbox(): ObstacleHitbox {
        // 当たり判定を少し小さくして理不尽さを軽減
        const padding = 5
        return {
            x: this.x + padding,
            y: this.y + padding,
            width: this.width - padding * 2,
            height: this.height - padding * 2,
        }
    }

    /**
     * ランダムな種類の障害物を生成
     */
    static createRandom(canvasWidth: number, speed: number): Obstacle {
        const types = [
            ObstacleType.SMALL_CACTUS,
            ObstacleType.LARGE_CACTUS,
            ObstacleType.BIRD,
        ]
        // サボテンの出現確率を高くする（鳥は難しいため）
        const weights = [0.4, 0.4, 0.2]
        const random = Math.random()
        let cumulative = 0
        let selectedType = types[0]

        for (let i = 0; i < types.length; i++) {
            cumulative += weights[i]
            if (random < cumulative) {
                selectedType = types[i]
                break
            }
        }

        return new Obstacle(selectedType, canvasWidth, speed)
    }
}

/**
 * 障害物マネージャー
 * 障害物の生成、更新、削除を管理
 */
export class ObstacleManager {
    obstacles: Obstacle[]
    spawnTimer: number
    spawnInterval: number
    minSpawnInterval: number
    baseSpeed: number
    speedIncreaseRate: number
    canvasWidth: number

    constructor(canvasWidth: number = 800) {
        this.obstacles = []
        this.spawnTimer = 0
        this.spawnInterval = 100  // 初期スポーン間隔（フレーム数）
        this.minSpawnInterval = 40  // 最小スポーン間隔
        this.baseSpeed = 5
        this.speedIncreaseRate = 0.001  // スコアによる速度増加率
        this.canvasWidth = canvasWidth
    }

    /**
     * 現在の速度を計算（難易度上昇）
     */
    getCurrentSpeed(score: number): number {
        return this.baseSpeed + score * this.speedIncreaseRate
    }

    /**
     * 障害物の更新
     */
    update(score: number): void {
        const currentSpeed = this.getCurrentSpeed(score)

        // スポーンタイマー更新
        this.spawnTimer++

        // 難易度に応じてスポーン間隔を短縮
        const adjustedInterval = Math.max(
            this.minSpawnInterval,
            this.spawnInterval - Math.floor(score / 500)
        )

        // ランダムな間隔で障害物を生成
        if (this.spawnTimer >= adjustedInterval + Math.random() * 50) {
            this.spawn(currentSpeed)
            this.spawnTimer = 0
        }

        // 各障害物を更新
        for (const obstacle of this.obstacles) {
            obstacle.speed = currentSpeed
            obstacle.update()
        }

        // 画面外に出た障害物を削除
        this.obstacles = this.obstacles.filter(obstacle => obstacle.isActive)
    }

    /**
     * 障害物を生成
     */
    spawn(speed: number): void {
        const obstacle = Obstacle.createRandom(this.canvasWidth, speed)
        this.obstacles.push(obstacle)
    }

    /**
     * 全障害物を描画
     */
    draw(ctx: CanvasRenderingContext2D): void {
        for (const obstacle of this.obstacles) {
            obstacle.draw(ctx)
        }
    }

    /**
     * リセット
     */
    reset(): void {
        this.obstacles = []
        this.spawnTimer = 0
    }
}
