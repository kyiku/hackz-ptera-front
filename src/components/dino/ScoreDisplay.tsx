/**
 * ScoreDisplay - 残り距離表示コンポーネント
 *
 * ゲーム中の残り距離（M）のみを表示
 */
import {
    TARGET_SCORE,
    getScoreRemaining,
    isTargetAchieved,
} from './scoreUtils'

export interface ScoreDisplayProps {
    score: number
    time: number  // 経過時間（秒）- 未使用だが互換性のため残す
    highScore?: number  // 未使用だが互換性のため残す
    targetScore?: number
    showTargetScore?: boolean
    isGameOver?: boolean
}

/**
 * ScoreDisplay コンポーネント
 */
export function ScoreDisplay({
    score,
    targetScore = TARGET_SCORE,
    showTargetScore = true,
    isGameOver = false,
}: ScoreDisplayProps) {
    const scoreRemaining = getScoreRemaining(score, targetScore)
    const achieved = isTargetAchieved(score, targetScore)

    // ゲームオーバー時や目標達成時は非表示
    if (isGameOver || !showTargetScore) {
        return null
    }

    return (
        <div className="flex justify-center mb-6">
            {/* 残り距離 */}
            <div className="text-center">
                {achieved ? (
                    <div className="text-4xl sm:text-5xl font-bold text-gray-800">
                        CLEAR!
                    </div>
                ) : (
                    <div className="text-4xl sm:text-5xl font-bold font-mono text-gray-800">
                        残り {scoreRemaining} M
                    </div>
                )}
            </div>
        </div>
    )
}
