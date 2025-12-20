/**
 * useBlinkDetector - 瞬き検出カスタムフック
 * Issue #38: メールアドレス入力 - 瞬きモールス信号UI
 *
 * 機能:
 * - MediaPipe Face Meshを使用した瞬き検出
 * - EAR (Eye Aspect Ratio) による瞬き判定
 * - 瞬き時間の計測
 * - モールス信号への変換（ドット・ダッシュ）
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision'

/**
 * 瞬きイベント
 */
export interface BlinkEvent {
    /** モールス信号タイプ */
    type: 'dot' | 'dash'
    /** 瞬き時間（ミリ秒） */
    duration: number
    /** タイムスタンプ */
    timestamp: number
}

/**
 * フックのオプション
 */
export interface UseBlinkDetectorOptions {
    /** ビデオ要素のref */
    videoRef: React.RefObject<HTMLVideoElement | null>
    /** 瞬き検出時のコールバック */
    onBlinkDetected?: (event: BlinkEvent) => void
    /** 文字確定時のコールバック */
    onCharacterComplete?: () => void
    /** ドットの最大時間（ミリ秒）- これより短いとドット */
    dotMaxMs?: number
    /** ダッシュの最大時間（ミリ秒）- これより長いと無効 */
    dashMaxMs?: number
    /** 最小瞬き時間（ミリ秒）- これより短いとノイズとして無視 */
    minBlinkMs?: number
    /** 文字確定の間隔（ミリ秒） */
    charGapMs?: number
    /** EARの閾値（瞬き判定）- 低いほど厳しい */
    earThreshold?: number
    /** デバッグモード */
    debug?: boolean
}

/**
 * フックの戻り値
 */
export interface UseBlinkDetectorReturn {
    /** 検出が有効かどうか */
    isDetecting: boolean
    /** エラーメッセージ */
    error: string | null
    /** 検出を開始 */
    start: () => Promise<void>
    /** 検出を停止 */
    stop: () => void
    /** 現在のEAR値（デバッグ用） */
    currentEAR: number
    /** 瞬き中かどうか */
    isBlinking: boolean
    /** キャリブレーション中かどうか */
    isCalibrating: boolean
    /** キャリブレーション開始 */
    startCalibration: () => void
    /** キャリブレーション状態 */
    calibrationStatus: string
    /** 現在の閾値 */
    currentThreshold: number
    /** 瞬き進行中の時間（ms） */
    blinkProgress: number
}

// 目のランドマークインデックス（MediaPipe Face Mesh - 改良版）
// より正確な瞬き検出のため、6点を使用
const LEFT_EYE = {
    top: [159, 158],      // 上まぶた
    bottom: [145, 153],   // 下まぶた
    left: 33,             // 目頭
    right: 133,           // 目尻
}

const RIGHT_EYE = {
    top: [386, 387],      // 上まぶた
    bottom: [374, 380],   // 下まぶた
    left: 362,            // 目頭
    right: 263,           // 目尻
}

/**
 * EAR (Eye Aspect Ratio) を計算
 * 目が開いている時は大きな値、閉じている時は小さな値
 */
function calculateEAR(
    landmarks: { x: number; y: number; z: number }[],
    eye: typeof LEFT_EYE
): number {
    // 垂直距離（2本の線の平均）
    const v1 = Math.abs(landmarks[eye.top[0]].y - landmarks[eye.bottom[0]].y)
    const v2 = Math.abs(landmarks[eye.top[1]].y - landmarks[eye.bottom[1]].y)
    const verticalAvg = (v1 + v2) / 2

    // 水平距離
    const horizontal = Math.abs(landmarks[eye.left].x - landmarks[eye.right].x)

    // EAR = 垂直 / 水平
    if (horizontal === 0) return 0
    return verticalAvg / horizontal
}

/**
 * 瞬き検出カスタムフック
 */
export const useBlinkDetector = ({
    videoRef,
    onBlinkDetected,
    onCharacterComplete,
    dotMaxMs = 350,       // 350ms以下でドット
    dashMaxMs = 1500,     // 1500ms以下でダッシュ（それ以上は無効）
    minBlinkMs = 80,      // 80ms以下はノイズ
    charGapMs = 1500,     // 1.5秒入力がなければ文字確定
    earThreshold = 0.25,  // デフォルト閾値（より寛容に）
    debug = false,
}: UseBlinkDetectorOptions): UseBlinkDetectorReturn => {
    const [isDetecting, setIsDetecting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentEAR, setCurrentEAR] = useState(0.3)
    const [isBlinking, setIsBlinking] = useState(false)
    const [isCalibrating, setIsCalibrating] = useState(false)
    const [calibrationStatus, setCalibrationStatus] = useState('')
    const [dynamicThreshold, setDynamicThreshold] = useState(earThreshold)
    const [blinkProgress, setBlinkProgress] = useState(0)

    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)
    const animationFrameRef = useRef<number | null>(null)
    const blinkStartTimeRef = useRef<number | null>(null)
    const lastBlinkTimeRef = useRef<number>(0)
    const detectBlinksRef = useRef<(() => void) | null>(null)
    const hasInputRef = useRef<boolean>(false)

    // EAR履歴（スムージング用）
    const earHistoryRef = useRef<number[]>([])
    const EAR_HISTORY_SIZE = 3

    const [calibrationData, setCalibrationData] = useState<number[]>([])
    const [calibrationStartTime, setCalibrationStartTime] = useState<number | null>(null)
    const CALIBRATION_DURATION = 5000 // 5秒間

    // 初期化時にlastBlinkTimeを設定
    useEffect(() => {
        lastBlinkTimeRef.current = Date.now()
    }, [])

    /**
     * EARのスムージング（ノイズ除去）
     */
    const smoothEAR = useCallback((newEAR: number): number => {
        earHistoryRef.current.push(newEAR)
        if (earHistoryRef.current.length > EAR_HISTORY_SIZE) {
            earHistoryRef.current.shift()
        }
        const sum = earHistoryRef.current.reduce((a, b) => a + b, 0)
        return sum / earHistoryRef.current.length
    }, [])

    /**
     * MediaPipe Face Landmarkerの初期化
     */
    const initializeFaceLandmarker = useCallback(async () => {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
            )

            const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                    delegate: 'GPU'
                },
                runningMode: 'VIDEO',
                numFaces: 1,
            })

            faceLandmarkerRef.current = faceLandmarker
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '瞬き検出の初期化に失敗しました'
            setError(errorMessage)
            throw err
        }
    }, [])

    /**
     * キャリブレーション終了・計算
     */
    const finishCalibration = useCallback(() => {
        setIsCalibrating(false)
        setCalibrationStartTime(null)

        const sorted = [...calibrationData].sort((a, b) => a - b)
        if (sorted.length < 10) {
            setCalibrationStatus('データ不足です。もう一度試してください。')
            return
        }

        // 下位20%を「閉じた状態」、上位80%を「開いた状態」
        const closedIndex = Math.floor(sorted.length * 0.2)
        const openIndex = Math.floor(sorted.length * 0.8)

        const closedEAR = sorted[closedIndex]
        const openEAR = sorted[openIndex]

        if (debug) {
            console.log(`📊 キャリブレーション: Closed(20%)=${closedEAR.toFixed(3)}, Open(80%)=${openEAR.toFixed(3)}`)
        }

        // 差が小さすぎる場合
        if (openEAR - closedEAR < 0.03) {
            setCalibrationStatus('瞬きが検出されませんでした。大きく瞬きしてください。')
            return
        }

        // 閾値 = 閉じた状態 + (差の40%)
        // より閉じた状態に近い値を閾値にする
        const newThreshold = closedEAR + (openEAR - closedEAR) * 0.4
        setDynamicThreshold(newThreshold)
        setCalibrationStatus(`調整完了！閾値: ${newThreshold.toFixed(3)}`)

        if (debug) console.log(`🎉 新しい閾値: ${newThreshold.toFixed(3)}`)
    }, [calibrationData, debug])

    /**
     * 瞬き検出ループ
     */
    useEffect(() => {
        detectBlinksRef.current = () => {
            const video = videoRef.current
            const faceLandmarker = faceLandmarkerRef.current

            if (!video || !faceLandmarker || video.readyState !== video.HAVE_ENOUGH_DATA) {
                if (detectBlinksRef.current) {
                    animationFrameRef.current = requestAnimationFrame(detectBlinksRef.current)
                }
                return
            }

            try {
                const result: FaceLandmarkerResult = faceLandmarker.detectForVideo(video, Date.now())

                if (result.faceLandmarks && result.faceLandmarks.length > 0) {
                    const landmarks = result.faceLandmarks[0]

                    // 左右の目のEARを計算
                    const leftEAR = calculateEAR(landmarks, LEFT_EYE)
                    const rightEAR = calculateEAR(landmarks, RIGHT_EYE)
                    const rawEAR = (leftEAR + rightEAR) / 2

                    // スムージング
                    const avgEAR = smoothEAR(rawEAR)
                    setCurrentEAR(avgEAR)

                    const now = Date.now()

                    // キャリブレーションモード
                    if (isCalibrating && calibrationStartTime) {
                        const elapsed = now - calibrationStartTime
                        const remaining = Math.max(0, Math.ceil((CALIBRATION_DURATION - elapsed) / 1000))

                        setCalibrationStatus(`計測中... 残り${remaining}秒 (自然に瞬きをしてください)`)
                        setCalibrationData(prev => [...prev, avgEAR])

                        if (elapsed >= CALIBRATION_DURATION) {
                            finishCalibration()
                        } else {
                            if (detectBlinksRef.current) {
                                animationFrameRef.current = requestAnimationFrame(detectBlinksRef.current)
                            }
                            return
                        }
                    }

                    // 通常の瞬き検出モード
                    if (!isCalibrating) {
                        // 瞬き中の進捗を更新
                        if (blinkStartTimeRef.current) {
                            setBlinkProgress(now - blinkStartTimeRef.current)
                        } else {
                            setBlinkProgress(0)
                        }

                        // 瞬き検出: EARが閾値以下
                        if (avgEAR < dynamicThreshold) {
                            if (!blinkStartTimeRef.current) {
                                // 瞬き開始
                                blinkStartTimeRef.current = now
                                setIsBlinking(true)
                                if (debug) console.log(`👁️ 瞬き開始 (EAR: ${avgEAR.toFixed(3)})`)
                            }
                        } else {
                            // 目が開いている
                            if (blinkStartTimeRef.current) {
                                // 瞬き終了
                                const blinkDuration = now - blinkStartTimeRef.current
                                setIsBlinking(false)
                                setBlinkProgress(0)

                                if (debug) console.log(`瞬き終了: ${blinkDuration}ms`)

                                // 瞬き時間を判定
                                if (blinkDuration >= minBlinkMs && blinkDuration <= dashMaxMs) {
                                    const blinkType: BlinkEvent['type'] = blinkDuration <= dotMaxMs ? 'dot' : 'dash'
                                    const event: BlinkEvent = {
                                        type: blinkType,
                                        duration: blinkDuration,
                                        timestamp: now,
                                    }

                                    if (debug) console.log(`✅ ${blinkType === 'dot' ? '・' : '−'} (${blinkDuration}ms)`)
                                    onBlinkDetected?.(event)
                                    lastBlinkTimeRef.current = now
                                    hasInputRef.current = true
                                } else if (blinkDuration < minBlinkMs) {
                                    if (debug) console.log(`❌ 短すぎ: ${blinkDuration}ms`)
                                } else {
                                    if (debug) console.log(`❌ 長すぎ: ${blinkDuration}ms`)
                                }

                                blinkStartTimeRef.current = null
                            } else {
                                // 文字確定のチェック（入力があった場合のみ）
                                if (hasInputRef.current) {
                                    const timeSinceLastBlink = now - lastBlinkTimeRef.current
                                    if (timeSinceLastBlink >= charGapMs) {
                                        if (debug) console.log('🔤 文字確定')
                                        onCharacterComplete?.()
                                        hasInputRef.current = false
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('瞬き検出エラー:', err)
            }

            if (detectBlinksRef.current) {
                animationFrameRef.current = requestAnimationFrame(detectBlinksRef.current)
            }
        }
    }, [videoRef, onBlinkDetected, onCharacterComplete, dotMaxMs, dashMaxMs, minBlinkMs, charGapMs, debug, isCalibrating, calibrationStartTime, dynamicThreshold, finishCalibration, smoothEAR])

    /**
     * 検出開始
     */
    const start = useCallback(async () => {
        try {
            setError(null)
            earHistoryRef.current = []
            hasInputRef.current = false

            if (!faceLandmarkerRef.current) {
                await initializeFaceLandmarker()
            }

            setIsDetecting(true)
            if (detectBlinksRef.current) {
                detectBlinksRef.current()
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '瞬き検出の開始に失敗しました'
            setError(errorMessage)
        }
    }, [initializeFaceLandmarker])

    /**
     * 検出停止
     */
    const stop = useCallback(() => {
        setIsDetecting(false)
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
            animationFrameRef.current = null
        }
        blinkStartTimeRef.current = null
        lastBlinkTimeRef.current = 0
        hasInputRef.current = false
        earHistoryRef.current = []
        setIsBlinking(false)
        setBlinkProgress(0)
        setIsCalibrating(false)
        setCalibrationStartTime(null)
    }, [])

    /**
     * キャリブレーション開始
     */
    const startCalibration = useCallback(() => {
        setCalibrationData([])
        setCalibrationStartTime(Date.now())
        setIsCalibrating(true)
        setCalibrationStatus('計測開始... 自然に瞬きしてください')
        if (debug) console.log('🎯 キャリブレーション開始')
    }, [debug])

    /**
     * クリーンアップ
     */
    useEffect(() => {
        return () => {
            stop()
            if (faceLandmarkerRef.current) {
                faceLandmarkerRef.current.close()
                faceLandmarkerRef.current = null
            }
        }
    }, [stop])

    return {
        isDetecting,
        error,
        start,
        stop,
        currentEAR,
        isBlinking,
        isCalibrating,
        startCalibration,
        calibrationStatus,
        currentThreshold: dynamicThreshold,
        blinkProgress,
    }
}

export default useBlinkDetector
