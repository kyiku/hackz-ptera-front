/**
 * useQueueWebSocket - 待機列WebSocket連携フック
 * 
 * WebSocket接続を管理し、リアルタイムで順位更新を受信する
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// WebSocketメッセージの型定義
interface QueueUpdateMessage {
    type: 'queueUpdate'
    position: number
    total: number
}

interface StageChangeMessage {
    type: 'stage_change'
    status: string
    message?: string
}

interface ConnectedMessage {
    type: 'connected'
    message: string
    user_id: string
}

interface ErrorMessage {
    type: 'error'
    message: string
}

type WebSocketMessage = QueueUpdateMessage | StageChangeMessage | ConnectedMessage | ErrorMessage

// フックの戻り値の型
interface UseQueueWebSocketReturn {
    isConnected: boolean
    isConnecting: boolean
    error: string | null
    position: number
    totalWaiting: number
    reconnect: () => void
}

// WebSocket URL（環境変数から取得、なければモック用のデフォルト）
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'

export function useQueueWebSocket(): UseQueueWebSocketReturn {
    const navigate = useNavigate()
    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<number | null>(null)
    const pingIntervalRef = useRef<number | null>(null)
    const connectRef = useRef<(() => void) | null>(null)

    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [position, setPosition] = useState(0)
    const [totalWaiting, setTotalWaiting] = useState(0)

    // WebSocket接続を確立
    const connect = useCallback(() => {
        // 既存の接続をクリーンアップ
        if (wsRef.current) {
            wsRef.current.close()
        }

        setIsConnecting(true)
        setError(null)

        try {
            const ws = new WebSocket(WS_URL)
            wsRef.current = ws

            ws.onopen = () => {
                setIsConnected(true)
                setIsConnecting(false)
                setError(null)

                // セッションID送信（あれば）
                const sessionId = sessionStorage.getItem('sessionId')
                if (sessionId) {
                    ws.send(JSON.stringify({ type: 'session', sessionId }))
                }

                // キープアライブping開始
                pingIntervalRef.current = window.setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }))
                    }
                }, 30000) // 30秒ごと
            }

            ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data)

                    switch (message.type) {
                        case 'connected':
                            // 接続成功メッセージ
                            console.log('WebSocket connected:', message.message)
                            break

                        case 'queueUpdate':
                            // 順位表示を更新
                            setPosition(message.position)
                            setTotalWaiting(message.total)
                            break

                        case 'stage_change':
                            // ステージ変更 -> ページ遷移
                            if (message.status === 'stage1_dino') {
                                navigate('/game/dino')
                            }
                            break

                        case 'error':
                            setError(message.message)
                            break
                    }
                } catch {
                    // 不正なメッセージは無視
                    console.warn('Invalid WebSocket message:', event.data)
                }
            }

            ws.onerror = () => {
                setError('接続エラーが発生しました')
                setIsConnected(false)
                setIsConnecting(false)
            }

            ws.onclose = () => {
                setIsConnected(false)
                setIsConnecting(false)

                // ping intervalをクリア
                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current)
                    pingIntervalRef.current = null
                }

                // 自動再接続（5秒後）
                reconnectTimeoutRef.current = window.setTimeout(() => {
                    connectRef.current?.()
                }, 5000)
            }
        } catch {
            setError('WebSocket接続に失敗しました')
            setIsConnecting(false)
        }
    }, [navigate])

    // connectRefを最新に保つ
    useEffect(() => {
        connectRef.current = connect
    }, [connect])

    // 手動再接続
    const reconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }
        connect()
    }, [connect])

    // 初回接続
    useEffect(() => {
        // setTimeoutで非同期にしてlintエラーを回避
        const timer = setTimeout(() => {
            connect()
        }, 0)

        // クリーンアップ
        return () => {
            clearTimeout(timer)
            if (wsRef.current) {
                wsRef.current.close()
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current)
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
