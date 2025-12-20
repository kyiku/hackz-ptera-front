/**
 * ScoreDisplay - スコア・タイマー表示コンポーネント
 *
 * ゲーム中のスコアと残り時間を表示
 * タイムアウト: 3分（180秒）
 */
import {
    TARGET_SCORE,
    formatScore,
    formatTime,
    getRemainingTime,
    getScoreRemaining,
    isTargetAchieved,
} from './scoreUtils'

export interface ScoreDisplayProps {
    score: number
    time: number  // 経過時間（秒）
    highScore?: number
    targetScore?: number
    showTargetScore?: boolean
    isGameOver?: boolean
}

/**
 * ScoreDisplay コンポーネント
 */
export function ScoreDisplay({
    score,
    time,
    highScore = 0,
    targetScore = TARGET_SCORE,
    showTargetScore = true,
    isGameOver = false,
}: ScoreDisplayProps) {
    const remainingTime = getRemainingTime(time)
    const isLowTime = remainingTime <= 30  // 残り30秒以下で警告
    const isCriticalTime = remainingTime <= 10  // 残り10秒以下で危険
    const scoreRemaining = getScoreRemaining(score, targetScore)
    const achieved = isTargetAchieved(score, targetScore)

    // 100点ごとのハイライト判定
    const shouldHighlight = score > 0 && score % 100 === 0

    return (
        <div className="flex flex-wrap gap-8 sm:gap-12 mb-6 justify-center">
            {/* スコア */}
            <div className={`text-center ${shouldHighlight ? 'animate-pulse' : ''}`}>
                <span className="text-gray-500 text-xs uppercase tracking-wide">SCORE</span>
                <div className="text-3xl sm:text-4xl font-light font-mono text-gray-800 mt-1">
                    {formatScore(score)}
                </div>
            </div>

            {/* 残り時間 */}
            <div className={`text-center ${isCriticalTime ? 'animate-pulse' : ''}`}>
                <span className="text-gray-500 text-xs uppercase tracking-wide">TIME</span>
                <div className={`text-3xl sm:text-4xl font-light font-mono mt-1 ${isCriticalTime ? 'text-red-500' : isLowTime ? 'text-gray-600' : 'text-gray-800'}`}>
                    {formatTime(remainingTime)}
                </div>
            </div>

            {/* ハイスコア */}
            <div className="text-center">
                <span className="text-gray-500 text-xs uppercase tracking-wide">HI</span>
                <div className="text-3xl sm:text-4xl font-light font-mono text-gray-800 mt-1">
                    {formatScore(highScore)}
                </div>
            </div>

            {/* 目標スコア */}
            {showTargetScore && !isGameOver && (
                <div className="text-center">
                    <span className="text-gray-500 text-xs uppercase tracking-wide">
                        {achieved ? 'CLEAR!' : 'TARGET'}
                    </span>
                    <div className={`text-3xl sm:text-4xl font-light font-mono mt-1 ${achieved ? 'text-gray-800' : 'text-gray-800'}`}>
                        {achieved ? '✓' : formatScore(scoreRemaining)}
                    </div>
                </div>
            )}
        </div>
    )
}
