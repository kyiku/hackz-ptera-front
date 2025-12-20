/**
 * API Client - REST API呼び出し用のクライアント
 * Issue #4: APIクライアント設定（fetch wrapper）
 * 
 * 機能:
 * - fetch wrapperの提供
 * - ベースURL設定（環境変数対応）
 * - credentials: "include"（Cookie送信）
 * - エラーハンドリング共通化
 * - レスポンス型定義
 */

/**
 * API共通レスポンス型
 */
export type APIResponse<T = unknown> =
    | ({ error: false } & T)
    | { error: true; message: string; redirect_delay?: number }

/**
 * APIエラークラス
 */
export class APIError extends Error {
    public status?: number
    public redirectDelay?: number

    constructor(
        message: string,
        status?: number,
        redirectDelay?: number
    ) {
        super(message)
        this.name = 'APIError'
        this.status = status
        this.redirectDelay = redirectDelay
    }
}

/**
 * APIクライアント設定
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

/**
 * fetch wrapper - 共通のHTTPリクエスト処理
 */
async function fetchWrapper<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const defaultOptions: RequestInit = {
        credentials: 'include', // Cookie送信
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    }

    try {
        const response = await fetch(url, defaultOptions)

        // レスポンスのJSONパース
        let data: APIResponse<T>
        try {
            data = await response.json()
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
            throw new APIError(
                'Failed to parse response JSON',
                response.status
            )
        }

        // HTTPステータスエラーチェック
        if (!response.ok) {
            if (data && 'error' in data && data.error) {
                throw new APIError(
                    data.message,
                    response.status,
                    data.redirect_delay
                )
            }
            throw new APIError(
                `HTTP Error: ${response.status}`,
                response.status
            )
        }

        // APIエラーレスポンスチェック
        if (data && 'error' in data && data.error) {
            throw new APIError(
                data.message,
                response.status,
                data.redirect_delay
            )
        }

        return data as T
    } catch (error) {
        // ネットワークエラーまたはその他のエラー
        if (error instanceof APIError) {
            throw error
        }
        throw new APIError(
            error instanceof Error ? error.message : 'Network error occurred'
        )
    }
}

/**
 * APIクライアント
 */
export const apiClient = {
    /**
     * GET リクエスト
     */
    get: async <T>(endpoint: string, params?: Record<string, string>): Promise<T> => {
        let url = endpoint
        if (params) {
            const queryString = new URLSearchParams(params).toString()
            url = `${endpoint}?${queryString}`
        }
        return fetchWrapper<T>(url, { method: 'GET' })
    },

    /**
     * POST リクエスト
     */
    post: async <T>(endpoint: string, body?: unknown): Promise<T> => {
        return fetchWrapper<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        })
    },

    /**
     * PUT リクエスト
     */
    put: async <T>(endpoint: string, body?: unknown): Promise<T> => {
        return fetchWrapper<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        })
    },

    /**
     * DELETE リクエスト
     */
    delete: async <T>(endpoint: string): Promise<T> => {
        return fetchWrapper<T>(endpoint, { method: 'DELETE' })
    },
}

export default apiClient
