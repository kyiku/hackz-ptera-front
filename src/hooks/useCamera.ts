/**
 * useCamera - カメラアクセスカスタムhook
 * Issue #38: メールアドレス入力 - 瞬きモールス信号UI
 * 
 * 機能:
 * - カメラへのアクセス
 * - ビデオストリームの管理
 * - クリーンアップ処理
 */

import { useState, useEffect, useRef } from 'react'

export interface UseCameraOptions {
    /** 自動開始するか */
    autoStart?: boolean
    /** ビデオの幅 */
    width?: number
    /** ビデオの高さ */
    height?: number
}

export interface UseCameraReturn {
    /** ビデオ要素のref */
    videoRef: React.RefObject<HTMLVideoElement | null>
    /** カメラが起動中かどうか */
    isActive: boolean
    /** エラーメッセージ */
    error: string | null
    /** カメラを開始 */
    start: () => Promise<void>
    /** カメラを停止 */
    stop: () => void
}

export const useCamera = ({
    autoStart = false,
    width = 640,
    height = 480,
}: UseCameraOptions = {}): UseCameraReturn => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const [isActive, setIsActive] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const start = async () => {
        try {
            setError(null)

            // カメラへのアクセスを要求
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: width },
                    height: { ideal: height },
                    facingMode: 'user',
                },
            })

            streamRef.current = stream

            // ビデオ要素にストリームを設定
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()
                setIsActive(true)
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'カメラへのアクセスに失敗しました'
            setError(errorMessage)
            console.error('Camera error:', err)
        }
    }

    const stop = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null
        }

        setIsActive(false)
    }

    useEffect(() => {
        if (autoStart) {
            // 非同期関数を即時実行（ESLint set-state-in-effect対策）
            const initCamera = async () => {
                await start()
            }
            void initCamera()
        }

        return () => {
            stop()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        videoRef,
        isActive,
        error,
        start,
        stop,
    }
}

export default useCamera
