/**
 * CollisionDetector - 衝突判定システム
 * 
 * 恐竜と障害物の衝突判定とゲームオーバー処理を担当
 */

// 矩形の型定義
export interface Rect {
    x: number
    y: number
    width: number
    height: number
}

// ゲームオーバー情報
export interface GameOverInfo {
    score: number
    time: number
    isHighScore: boolean
}

/**
 * 矩形同士の衝突判定（AABB = Axis-Aligned Bounding Box）
 * 
 * @param a 矩形A
 * @param b 矩形B
 * @returns 衝突している場合true
 */
export function checkCollision(a: Rect, b: Rect): boolean {
    // 両軸で重なりがある場合のみ衝突
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    )
}

/**
 * 矩形が接触しているか判定（境界線が触れている状態）
 * 
 * @param a 矩形A
 * @param b 矩形B
 * @returns 接触している場合true
 */
export function checkTouch(a: Rect, b: Rect): boolean {
    return (
        a.x <= b.x + b.width &&
        a.x + a.width >= b.x &&
        a.y <= b.y + b.height &&
        a.y + a.height >= b.y
    )
}

/**
 * 衝突判定と当たり判定領域のデバッグ描画
 */
export function drawHitbox(
    ctx: CanvasRenderingContext2D,
    rect: Rect,
    color: string = 'rgba(255, 0, 0, 0.5)'
): void {
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
}

/**
 * CollisionDetector クラス
 * 
 * ゲーム内の衝突判定を管理し、ゲームオーバー処理を実行
 */
export class CollisionDetector {
    private onGameOverCallback: ((info: GameOverInfo) => void) | null = null
    private isGameOver: boolean = false
    private finalScore: number = 0
    private finalTime: number = 0
    private highScore: number = 0

    constructor(highScore: number = 0) {
        this.highScore = highScore
    }

    /**
     * ゲームオーバー時のコールバックを設定
     */
    setOnGameOver(callback: (info: GameOverInfo) => void): void {
        this.onGameOverCallback = callback
    }

    /**
     * ハイスコアを更新
     */
    setHighScore(score: number): void {
        this.highScore = score
    }

    /**
     * 恐竜と障害物の衝突をチェック
     * 
     * @param dinoHitbox 恐竜の当たり判定領域
     * @param obstacleHitboxes 障害物の当たり判定領域配列
     * @param currentScore 現在のスコア
     * @param currentTime 現在の時間
     * @returns 衝突した場合true
     */
    checkDinoObstacleCollision(
        dinoHitbox: Rect,
        obstacleHitboxes: Rect[],
        currentScore: number,
        currentTime: number
    ): boolean {
        if (this.isGameOver) return true

        for (const obstacleHitbox of obstacleHitboxes) {
            if (checkCollision(dinoHitbox, obstacleHitbox)) {
                this.triggerGameOver(currentScore, currentTime)
                return true
            }
        }

        return false
    }

    /**
     * ゲームオーバーを発火
     */
    triggerGameOver(score: number, time: number): void {
        if (this.isGameOver) return

        this.isGameOver = true
        this.finalScore = score
        this.finalTime = time

        const isHighScore = score > this.highScore
        if (isHighScore) {
            this.highScore = score
        }

        const info: GameOverInfo = {
            score,
            time,
            isHighScore,
        }

        if (this.onGameOverCallback) {
            this.onGameOverCallback(info)
        }
    }

    /**
     * ゲームオーバー状態かどうか
     */
    getIsGameOver(): boolean {
        return this.isGameOver
    }

    /**
     * 最終スコアを取得
     */
    getFinalScore(): number {
        return this.finalScore
    }

    /**
     * 最終時間を取得
     */
    getFinalTime(): number {
        return this.finalTime
    }

    /**
     * ハイスコアを取得
     */
    getHighScore(): number {
        return this.highScore
    }

    /**
     * リセット（新しいゲーム開始時）
     */
    reset(): void {
        this.isGameOver = false
        this.finalScore = 0
        this.finalTime = 0
    }
}
