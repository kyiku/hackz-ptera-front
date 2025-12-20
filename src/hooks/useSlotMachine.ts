/**
 * useSlotMachine - スロットマシンの状態管理カスタムフック
 */

import { useState, useCallback, useRef } from 'react'
import { SLOT_ALPHABET } from '../lib/slot/slotAlphabet'
import { randomChoice, randomIntBetween } from '../lib/slot/rng'

const SPIN_DURATION_MIN = 1800 // 1.8秒
const SPIN_DURATION_MAX = 3500 // 3.5秒
const COMMUNICATION_ERROR_PROBABILITY = 0.15 // 15%の確率で通信エラー

export interface UseSlotMachineOptions {
    /** リール数（3〜6） */
    reelCount?: number
    /** スピン時間の最小値（ミリ秒） */
    spinDurationMin?: number
    /** スピン時間の最大値（ミリ秒） */
    spinDurationMax?: number
    /** 通信エラーの確率（0〜1） */
    communicationErrorProbability?: number
}

export interface UseSlotMachineReturn {
    /** 現在のリールの値 */
    reels: string[]
    /** スピン回数 */
    spinCount: number
    /** スピン中かどうか */
    isSpinning: boolean
    /** 減速中かどうか */
    isSlowingDown: boolean
    /** 通信エラーが発生したか */
    error: string | null
    /** 確定可能かどうか */
    canConfirm: boolean
    /** 現在の名前 */
    name: string
    /** スピン開始 */
    spin: () => void
    /** 確定 */
    confirm: () => string
    /** リセット */
    reset: () => void
}

export const useSlotMachine = ({
    reelCount = 3,
    spinDurationMin = SPIN_DURATION_MIN,
    spinDurationMax = SPIN_DURATION_MAX,
    communicationErrorProbability = COMMUNICATION_ERROR_PROBABILITY,
}: UseSlotMachineOptions = {}): UseSlotMachineReturn => {
    const [reels, setReels] = useState<string[]>(() => Array(reelCount).fill('?'))
    const [spinCount, setSpinCount] = useState(0)
    const [isSpinning, setIsSpinning] = useState(false)
    const [isSlowingDown, setIsSlowingDown] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const timeoutRef = useRef<number | undefined>(undefined)
    const intervalRef = useRef<number | undefined>(undefined)
    const slowdownTimeoutRef = useRef<number | undefined>(undefined)

    // ランダムなリール値を生成
    const generateRandomReels = useCallback((): string[] => {
        return Array(reelCount).fill(0).map(() => randomChoice(SLOT_ALPHABET))
    }, [reelCount])

    // スピン開始
    const spin = useCallback(() => {
        if (isSpinning) return

        setError(null)
        setIsSpinning(true)
        setIsSlowingDown(false)

        // 既存のタイムアウトとインターバルをクリア
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
        if (slowdownTimeoutRef.current) {
            clearTimeout(slowdownTimeoutRef.current)
        }

        // スピン時間を決定（1.8〜3.5秒）
        const baseDuration = randomIntBetween(spinDurationMin, spinDurationMax)
        // 減速開始までの時間（最後の1.0秒前から減速開始）
        const slowdownStart = baseDuration - 1000

        // スピン中はランダムな文字を表示（ゆっくり回転）
        const updateReels = () => {
            setReels(generateRandomReels())
        }

        // 通常スピン（ゆっくり）
        intervalRef.current = window.setInterval(() => {
            updateReels()
        }, 200)

        // 減速開始
        slowdownTimeoutRef.current = window.setTimeout(() => {
            setIsSlowingDown(true)
            
            // インターバルをクリアして減速スピンに切り替え
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }

            // 減速スピン（徐々に遅くなって最終的に停止）
            const slowdownIntervals = [250, 300, 400, 500, 600, 800, 1000, 1500, 2000, 3000, 5000]
            let currentSlowdownIndex = 0
            
            const applySlowdownInterval = () => {
                if (currentSlowdownIndex >= slowdownIntervals.length) {
                    // 減速完了、完全停止
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current)
                    }
                    setReels(generateRandomReels())
                    setSpinCount((prev) => prev + 1)
                    setIsSpinning(false)
                    setIsSlowingDown(false)

                    // 一定確率で通信エラー（嘘）
                    if (Math.random() < communicationErrorProbability) {
                        setTimeout(() => {
                            setError('通信に失敗しました')
                        }, 0)
                    }
                    return
                }
                
                updateReels()
                
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                }
                
                const nextInterval = slowdownIntervals[currentSlowdownIndex]
                intervalRef.current = window.setInterval(() => {
                    currentSlowdownIndex++
                    applySlowdownInterval()
                }, nextInterval)
            }
            
            applySlowdownInterval()
        }, Math.max(0, slowdownStart))

        // フォールバック: 最大時間経過後に強制停止（減速が正常に完了しない場合の保険）
        timeoutRef.current = window.setTimeout(() => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
            // まだスピン中の場合は強制停止
            setIsSpinning((prev) => {
                if (prev) {
                    setReels(generateRandomReels())
                    setSpinCount((count) => count + 1)
                    setIsSlowingDown(false)

                    // 一定確率で通信エラー（嘘）
                    if (Math.random() < communicationErrorProbability) {
                        setTimeout(() => {
                            setError('通信に失敗しました')
                        }, 0)
                    }
                    return false
                }
                return prev
            })
        }, baseDuration + 5000) // 減速時間を考慮して余裕を持たせる
    }, [isSpinning, spinDurationMin, spinDurationMax, communicationErrorProbability, generateRandomReels])

    // 確定
    const confirm = useCallback((): string => {
        const confirmedName = reels.join('')
        return confirmedName
    }, [reels])

    // リセット
    const reset = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
        if (slowdownTimeoutRef.current) {
            clearTimeout(slowdownTimeoutRef.current)
        }
        setReels(Array(reelCount).fill('?'))
        setSpinCount(0)
        setIsSpinning(false)
        setIsSlowingDown(false)
        setError(null)
    }, [reelCount])

    // スピン回数無制限: 1回以上スピンしていれば確定可能
    const canConfirm = spinCount >= 1 && !isSpinning
    const name = reels.join('').replace(/\?/g, '')

    return {
        reels,
        spinCount,
        isSpinning,
        isSlowingDown,
        error,
        canConfirm,
        name,
        spin,
        confirm,
        reset,
    }
}

