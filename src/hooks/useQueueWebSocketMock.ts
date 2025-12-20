/**
 * useQueueWebSocketMock - 待機列WebSocket連携フック（モック版）
 * 
 * フロントエンド開発用にWebSocket接続をシミュレートする
 * 本番では useQueueWebSocket を使用
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

interface UseQueueWebSocketReturn {
    isConnected: boolean
    isConnecting: boolean
    error: string | null
    position: number
    totalWaiting: number
    reconnect: () => void
}

export function useQueueWebSocketMock(): UseQueueWebSocketReturn {
    const navigate = useNavigate()
    const intervalRef = useRef<number | null>(null)

    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [position, setPosition] = useState(15)
    const [totalWaiting, setTotalWaiting] = useState(50)

    // 接続シミュレーション
    const connect = useCallback(() => {
        setIsConnecting(true)
        setError(null)

        // 2秒後に接続完了
        setTimeout(() => {
            setIsConnected(true)
            setIsConnecting(false)

            // 順位更新シミュレーション（3秒ごと）
            intervalRef.current = window.setInterval(() => {
                setPosition(prev => {
                    const newPosition = prev - 1

                    // 順位が0になったらDinoゲームへ遷移
                    if (newPosition <= 0) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current)
                        }
                        // stage_change(status: "stage1_dino") -> /game/dino へ遷移
                        navigate('/game/dino')
                        return 0
                    }

                    return newPosition
                })

                setTotalWaiting(prev => Math.max(prev - 1, 10))
            }, 3000)
        }, 2000)
    }, [navigate])

    // 手動再接続
    const reconnect = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        setPosition(15)
        setTotalWaiting(50)
        connect()
    }, [connect])

    // 初回接続
    useEffect(() => {
        connect()

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [connect])

    return {
        isConnected,
        isConnecting,
        error,
        position,
        totalWaiting,
        reconnect,
    }
}
