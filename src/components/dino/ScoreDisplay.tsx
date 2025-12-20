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
    const isHighScoreBeaten = score > highScore && highScore > 0

    // 100点ごとのハイライト判定
    const shouldHighlight = score > 0 && score % 100 === 0

    return (
        <div className="flex flex-wrap gap-4 sm:gap-8 mb-4 text-white justify-center">
            {/* スコア */}
            <div className={`bg-gray-800/80 px-4 sm:px-6 py-3 rounded-lg transition-transform ${shouldHighlight ? 'animate-pulse scale-105' : ''}`}>
                <span className="text-gray-400 text-xs sm:text-sm">スコア</span>
                <div className={`text-xl sm:text-2xl font-bold font-mono ${isHighScoreBeaten ? 'text-yellow-400' : 'text-green-400'}`}>
                    {formatScore(score)}
                </div>
            </div>

            {/* 残り時間 */}
            <div className={`bg-gray-800/80 px-4 sm:px-6 py-3 rounded-lg ${isCriticalTime ? 'animate-pulse bg-red-900/80' : isLowTime ? 'bg-yellow-900/80' : ''}`}>
                <span className="text-gray-400 text-xs sm:text-sm">残り時間</span>
                <div className={`text-xl sm:text-2xl font-bold font-mono ${isCriticalTime ? 'text-red-400' : isLowTime ? 'text-yellow-400' : 'text-blue-400'}`}>
                    {formatTime(remainingTime)}
                </div>
            </div>

            {/* ハイスコア */}
            <div className="bg-gray-800/80 px-4 sm:px-6 py-3 rounded-lg">
                <span className="text-gray-400 text-xs sm:text-sm">ハイスコア</span>
                <div className="text-xl sm:text-2xl font-bold font-mono text-yellow-400">
                    {formatScore(highScore)}
                </div>
            </div>

            {/* 目標スコア */}
            {showTargetScore && !isGameOver && (
                <div className={`bg-gray-800/80 px-4 sm:px-6 py-3 rounded-lg ${achieved ? 'bg-green-900/80' : ''}`}>
                    <span className="text-gray-400 text-xs sm:text-sm">
                        {achieved ? '🎉 目標達成!' : '目標まで'}
                    </span>
                    <div className={`text-xl sm:text-2xl font-bold font-mono ${achieved ? 'text-green-400' : 'text-purple-400'}`}>
                        {achieved ? '✓' : formatScore(scoreRemaining)}
                    </div>
                </div>
            )}
        </div>
    )
}
