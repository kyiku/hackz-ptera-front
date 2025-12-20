/**
 * scoreUtils - スコア・タイム関連のユーティリティ関数と定数
 */

// ゲーム時間の定数
export const GAME_DURATION = 180  // 3分 = 180秒
export const TARGET_SCORE = 3000  // 目標スコア

/**
 * 数値を5桁のゼロパディング文字列に変換
 */
export function formatScore(score: number): string {
    return String(score).padStart(5, '0')
}

/**
 * 秒数をMM:SS形式に変換
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * 残り時間を計算（3分タイムアウト）
 */
export function getRemainingTime(elapsedTime: number): number {
    return Math.max(0, GAME_DURATION - elapsedTime)
}

/**
 * タイムアウト判定
 */
export function isTimeout(elapsedTime: number): boolean {
    return elapsedTime >= GAME_DURATION
}

/**
 * 目標スコアまでの残りを計算
 */
export function getScoreRemaining(score: number, targetScore: number = TARGET_SCORE): number {
    return Math.max(0, targetScore - score)
}

/**
 * 目標スコア達成判定
 */
export function isTargetAchieved(score: number, targetScore: number = TARGET_SCORE): boolean {
    return score >= targetScore
}
