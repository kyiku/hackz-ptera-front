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
    /** 遷移までのカウントダウン秒数（null=カウントダウン中でない） */
    countdownSeconds: number | null
    /** 自分の番かどうか */
    isMyTurn: boolean
}

// WebSocket URL（環境変数から取得、なければモック用のデフォルト）
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'

// 自分の番になってから遷移するまでの秒数
const COUNTDOWN_SECONDS = 5

export function useQueueWebSocket(): UseQueueWebSocketReturn {
    const navigate = useNavigate()
    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<number | null>(null)
    const pingIntervalRef = useRef<number | null>(null)
    const connectRef = useRef<(() => void) | null>(null)
    const countdownIntervalRef = useRef<number | null>(null)

    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [position, setPosition] = useState(0)
    const [totalWaiting, setTotalWaiting] = useState(0)
    const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null)
    const countdownStartedRef = useRef(false)

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

                // セッション管理はCookieで行われるため、
                // sessionStorageからのセッションID送信は不要

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

    // 自分の番かどうか（派生状態）
    const isMyTurn = position === 1 && isConnected

    // position=1になったらカウントダウン開始、0秒で遷移
    useEffect(() => {
        if (isMyTurn) {
            // すでにカウントダウン中なら何もしない
            if (countdownStartedRef.current) {
                return
            }
            countdownStartedRef.current = true

            // カウントダウン開始（初期値をセット）
            let remaining = COUNTDOWN_SECONDS
            // isMyTurnの変化に応じて初期化する必要があるため、ここでのsetStateは必要
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCountdownSeconds(remaining)

            countdownIntervalRef.current = window.setInterval(() => {
                remaining -= 1
                if (remaining <= 0) {
                    // カウントダウン終了、遷移
                    if (countdownIntervalRef.current) {
                        clearInterval(countdownIntervalRef.current)
                        countdownIntervalRef.current = null
                    }
                    setCountdownSeconds(0)
                    navigate('/game/dino')
                } else {
                    setCountdownSeconds(remaining)
                }
            }, 1000)
        } else {
            // position が 1 以外ならカウントダウンをリセット
            countdownStartedRef.current = false
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current)
                countdownIntervalRef.current = null
            }
            setCountdownSeconds(null)
        }

        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current)
                countdownIntervalRef.current = null
            }
        }
    }, [isMyTurn, navigate])

    return {
        isConnected,
        isConnecting,
        error,
        position,
        totalWaiting,
        reconnect,
        countdownSeconds,
        isMyTurn,
    }
}
