/**
 * useWebSocket - WebSocket接続管理カスタムhook
 * Issue #3: WebSocket接続カスタムhook
 * 
 * 機能:
 * - WebSocket接続の確立と管理
 * - メッセージの送受信
 * - 自動再接続（指数バックオフ）
 * - 接続状態の管理
 * - Ping送信（30秒間隔）
 */

import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * サーバーからのメッセージ型
 */
export type ServerMessage =
    | { type: 'queue_update'; position: number; total: number }
    | { type: 'stage_change'; status: string; message: string }
    | { type: 'error'; code: string; message: string }
    | { type: 'failure'; message: string; redirect_delay: number }
    | { type: 'pong' }

/**
 * クライアントからのメッセージ型
 */
export type ClientMessage =
    | { type: 'ping' }
    | { type: 'join_queue'; sessionId: string }

/**
 * 接続状態
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

/**
 * useWebSocketの戻り値
 */
export interface UseWebSocketReturn {
    status: ConnectionStatus
    sendMessage: (message: ClientMessage) => void
    lastMessage: ServerMessage | null
    error: Error | null
}

/**
 * useWebSocketのオプション
 */
export interface UseWebSocketOptions {
    onMessage?: (message: ServerMessage) => void
    onOpen?: () => void
    onClose?: () => void
    onError?: (error: Error) => void
    reconnect?: boolean
    reconnectAttempts?: number
    reconnectInterval?: number
}

const DEFAULT_OPTIONS: Required<UseWebSocketOptions> = {
    onMessage: () => { },
    onOpen: () => { },
    onClose: () => { },
    onError: () => { },
    reconnect: true,
    reconnectAttempts: 5,
    reconnectInterval: 1000,
}

/**
 * WebSocket接続管理hook
 */
export const useWebSocket = (
    url: string,
    options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
    const opts = { ...DEFAULT_OPTIONS, ...options }

    const [status, setStatus] = useState<ConnectionStatus>('connecting')
    const [lastMessage, setLastMessage] = useState<ServerMessage | null>(null)
    const [error, setError] = useState<Error | null>(null)

    const wsRef = useRef<WebSocket | null>(null)
    const reconnectCountRef = useRef(0)
    const reconnectTimeoutRef = useRef<number | undefined>(undefined)
    const pingIntervalRef = useRef<number | undefined>(undefined)
    const optsRef = useRef(opts)
    const connectRef = useRef<(() => void) | undefined>(undefined)

    // optsRefを最新の状態に保つ
    useEffect(() => {
        optsRef.current = opts
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opts.onMessage, opts.onOpen, opts.onClose, opts.onError, opts.reconnect, opts.reconnectAttempts, opts.reconnectInterval])

    /**
     * WebSocket接続を確立
     */
    const connect = useCallback(() => {
        try {
            const ws = new WebSocket(url)
            wsRef.current = ws

            ws.onopen = () => {
                setStatus('connected')
                setError(null)
                reconnectCountRef.current = 0
                optsRef.current.onOpen()

                // Ping送信を開始（30秒間隔）
                pingIntervalRef.current = window.setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }))
                    }
                }, 30000)
            }

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data) as ServerMessage
                    setLastMessage(message)
                    optsRef.current.onMessage(message)
                } catch (err) {
                    console.error('Failed to parse WebSocket message:', err)
                }
            }

            ws.onclose = () => {
                setStatus('disconnected')
                optsRef.current.onClose()

                // Ping送信を停止
                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current)
                }

                // 再接続を試みる
                if (
                    optsRef.current.reconnect &&
                    reconnectCountRef.current < optsRef.current.reconnectAttempts
                ) {
                    reconnectCountRef.current++
                    const delay =
                        optsRef.current.reconnectInterval *
                        Math.pow(2, reconnectCountRef.current - 1)

                    reconnectTimeoutRef.current = window.setTimeout(() => {
                        setStatus('connecting')
                        connectRef.current?.()
                    }, delay)
                }
            }

            ws.onerror = () => {
                const err = new Error('WebSocket error occurred')
                setError(err)
                optsRef.current.onError(err)
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error')
            setError(error)
            optsRef.current.onError(error)
        }
    }, [url])

    // connectRefを最新の状態に保つ
    useEffect(() => {
        connectRef.current = connect
    }, [connect])

    /**
     * メッセージを送信
     */
    const sendMessage = useCallback((message: ClientMessage) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message))
        } else {
            console.warn('WebSocket is not connected')
        }
    }, [])

    /**
     * 初回接続
     */
    useEffect(() => {
        connect()

        // クリーンアップ
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current)
            }
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [connect])

    return {
        status,
        sendMessage,
        lastMessage,
        error,
    }
}

export default useWebSocket
