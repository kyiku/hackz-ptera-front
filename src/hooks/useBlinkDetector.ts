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
    /** ドットの閾値（ミリ秒） */
    dotThreshold?: number
    /** ダッシュの閾値（ミリ秒） */
    dashThreshold?: number
    /** 文字確定の間隔（ミリ秒） */
    charGapMs?: number
    /** EARの閾値（瞬き判定） */
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
}

// 目のランドマークインデックス（MediaPipe Face Mesh）
const LEFT_EYE_INDICES = {
    upper: [159, 145],
    lower: [144, 133],
    left: [33],
    right: [133],
}

const RIGHT_EYE_INDICES = {
    upper: [386, 374],
    lower: [373, 362],
    left: [362],
    right: [263],
}

/**
 * EAR (Eye Aspect Ratio) を計算
 * 目が開いている時は大きな値、閉じている時は小さな値
 */
function calculateEAR(landmarks: { x: number; y: number; z: number }[], eyeIndices: typeof LEFT_EYE_INDICES): number {
    const p1 = landmarks[eyeIndices.upper[0]]
    const p2 = landmarks[eyeIndices.upper[1]]
    const p3 = landmarks[eyeIndices.lower[0]]
    const p4 = landmarks[eyeIndices.lower[1]]
    const p5 = landmarks[eyeIndices.left[0]]
    const p6 = landmarks[eyeIndices.right[0]]

    // 垂直距離
    const vertical1 = Math.sqrt(
        Math.pow(p1.x - p3.x, 2) + Math.pow(p1.y - p3.y, 2)
    )
    const vertical2 = Math.sqrt(
        Math.pow(p2.x - p4.x, 2) + Math.pow(p2.y - p4.y, 2)
    )

    // 水平距離
    const horizontal = Math.sqrt(
        Math.pow(p5.x - p6.x, 2) + Math.pow(p5.y - p6.y, 2)
    )

    // EAR計算
    return (vertical1 + vertical2) / (2.0 * horizontal)
}

/**
 * 瞬き検出カスタムフック
 */
export const useBlinkDetector = ({
    videoRef,
    onBlinkDetected,
    onCharacterComplete,
    dotThreshold = 200,
    dashThreshold = 1000,
    charGapMs = 1000,
    earThreshold = 0.2,
    debug = false,
}: UseBlinkDetectorOptions): UseBlinkDetectorReturn => {
    const [isDetecting, setIsDetecting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentEAR, setCurrentEAR] = useState(0.3)
    const [isBlinking, setIsBlinking] = useState(false)

    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null)
    const animationFrameRef = useRef<number | null>(null)
    const blinkStartTimeRef = useRef<number | null>(null)
    const lastBlinkTimeRef = useRef<number>(0)
    const detectBlinksRef = useRef<(() => void) | null>(null)

    // 初期化時にlastBlinkTimeを設定
    useEffect(() => {
        lastBlinkTimeRef.current = Date.now()
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
                    const leftEAR = calculateEAR(landmarks, LEFT_EYE_INDICES)
                    const rightEAR = calculateEAR(landmarks, RIGHT_EYE_INDICES)
                    const avgEAR = (leftEAR + rightEAR) / 2

                    setCurrentEAR(avgEAR)

                    // デバッグ: EAR値を定期的に表示
                    if (debug && Math.random() < 0.05) {  // 5%の確率で表示（フレームレート60fpsだと約3回/秒）
                        console.log(`👁️ EAR: ${avgEAR.toFixed(3)} (閾値: ${earThreshold})`)
                    }

                    const now = Date.now()

                    // 瞬き検出: EARが閾値以下
                    if (avgEAR < earThreshold) {
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

                            if (debug) console.log(`瞬き終了: ${blinkDuration}ms`)

                            // 瞬き時間を判定
                            // 50ms以上1000ms未満を有効な瞬きとして認識
                            if (blinkDuration >= 50 && blinkDuration < dashThreshold) {
                                const blinkType: BlinkEvent['type'] = blinkDuration < dotThreshold ? 'dot' : 'dash'
                                const event: BlinkEvent = {
                                    type: blinkType,
                                    duration: blinkDuration,
                                    timestamp: now,
                                }

                                if (debug) console.log(`✅ 瞬き検出: ${blinkType}, ${blinkDuration}ms`)
                                onBlinkDetected?.(event)
                                lastBlinkTimeRef.current = now
                            } else {
                                if (debug) console.log(`❌ 瞬き無効: ${blinkDuration}ms (範囲外)`)
                            }

                            blinkStartTimeRef.current = null
                        } else {
                            // 文字確定のチェック
                            const timeSinceLastBlink = now - lastBlinkTimeRef.current
                            if (timeSinceLastBlink >= charGapMs && lastBlinkTimeRef.current > 0) {
                                if (debug) console.log('🔤 文字確定')
                                onCharacterComplete?.()
                                lastBlinkTimeRef.current = 0  // リセット
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
    }, [videoRef, onBlinkDetected, onCharacterComplete, dotThreshold, dashThreshold, charGapMs, earThreshold, debug])

    /**
     * 検出開始
     */
    const start = useCallback(async () => {
        try {
            setError(null)

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
        setIsBlinking(false)
    }, [])

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
    }
}

export default useBlinkDetector
