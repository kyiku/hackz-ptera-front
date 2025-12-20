/**
 * OTP API - 魚OTP認証API
 * Issue #23: 魚OTP - API連携（送信・検証）
 * 
 * 魚画像の取得と回答検証
 */

// API呼び出しは直接fetchを使用（エラーレスポンスも正常なレスポンスとして扱うため）

// --- 型定義 ---

/**
 * OTP送信リクエスト（空のリクエストボディ）
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface OtpSendRequest {
    // リクエストボディは空（認証はCookieで行う）
}

/**
 * OTP送信レスポンス
 */
export interface OtpSendResponse {
    error: false
    image_url: string
    message: string
}

/**
 * OTP検証リクエスト
 */
export interface OtpVerifyRequest {
    answer: string // 魚の名前（ひらがな/カタカナ許容）
}

/**
 * OTP検証成功レスポンス
 */
export interface OtpVerifySuccessResponse {
    error: false
    message: string
}

/**
 * OTP検証失敗レスポンス（1-2回目）
 */
export interface OtpVerifyFailureResponse {
    error: true
    message: string
    attempts_remaining: number
    new_image_url: string
}

/**
 * OTP検証最終失敗レスポンス（3回目）
 */
export interface OtpVerifyFinalFailureResponse {
    error: true
    message: string
    redirect_delay: number
}

/**
 * OTP検証レスポンス共用型
 */
export type OtpVerifyResponse =
    | OtpVerifySuccessResponse
    | OtpVerifyFailureResponse
    | OtpVerifyFinalFailureResponse

/**
 * OTP APIエラー
 */
export class OtpApiError extends Error {
    statusCode?: number
    response?: unknown

    constructor(
        message: string,
        statusCode?: number,
        response?: unknown
    ) {
        super(message)
        this.name = 'OtpApiError'
        this.statusCode = statusCode
        this.response = response
    }
}

// --- API関数 ---

/**
 * OTP魚画像を取得
 * POST /api/otp/send
 */
export async function sendOtp(): Promise<OtpSendResponse> {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    const url = `${API_BASE_URL}/api/otp/send`

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({}),
        })

        if (!response.ok) {
            throw new OtpApiError(
                `Failed to send OTP: ${response.status}`,
                response.status
            )
        }

        const data: OtpSendResponse = await response.json()
        return data
    } catch (error) {
        if (error instanceof OtpApiError) {
            throw error
        }
        throw new OtpApiError(
            error instanceof Error ? error.message : 'Unknown error occurred'
        )
    }
}

/**
 * OTP回答を検証
 * POST /api/otp/verify
 */
export async function verifyOtp(
    request: OtpVerifyRequest
): Promise<OtpVerifyResponse> {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    const url = `${API_BASE_URL}/api/otp/verify`

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(request),
        })

        if (!response.ok) {
            throw new OtpApiError(
                `OTP verification failed: ${response.status}`,
                response.status
            )
        }

        const data: OtpVerifyResponse = await response.json()
        return data
    } catch (error) {
        if (error instanceof OtpApiError) {
            throw error
        }
        throw new OtpApiError(
            error instanceof Error ? error.message : 'Unknown error occurred'
        )
    }
}

// --- ヘルパー関数 ---

/**
 * レスポンスが成功かどうかを判定
 */
export function isVerifySuccess(
    response: OtpVerifyResponse
): response is OtpVerifySuccessResponse {
    return response.error === false
}

/**
 * レスポンスが最終失敗かどうかを判定
 */
export function isVerifyFinalFailure(
    response: OtpVerifyResponse
): response is OtpVerifyFinalFailureResponse {
    return response.error === true && 'redirect_delay' in response
}

/**
 * レスポンスがリトライ可能な失敗かどうかを判定
 */
export function isVerifyRetryableFailure(
    response: OtpVerifyResponse
): response is OtpVerifyFailureResponse {
    return response.error === true && 'attempts_remaining' in response
}

// --- モック関数（フロントエンド開発用） ---

let mockAttemptsRemaining = 3

/**
 * OTP送信（モック）
 */
export async function sendOtpMock(): Promise<OtpSendResponse> {
    // 遅延をシミュレート
    await new Promise(resolve => setTimeout(resolve, 500))

    mockAttemptsRemaining = 3

    return {
        error: false,
        image_url: `https://picsum.photos/seed/fish-${Date.now()}/400/300`,
        message: '魚の名前を入力してください。ひらがな・カタカナ両方で入力できます。',
    }
}

/**
 * OTP検証（モック）
 * 正解は「さば」または「サバ」
 */
export async function verifyOtpMock(
    request: OtpVerifyRequest
): Promise<OtpVerifyResponse> {
    // 遅延をシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000))

    // ひらがな/カタカナの正規化（「さば」「サバ」を同じとみなす）
    const normalizedAnswer = request.answer.toLowerCase().trim()
    const correctAnswers = ['さば', 'サバ', 'saba']

    const isCorrect = correctAnswers.some(
        correct => normalizedAnswer === correct.toLowerCase()
    )

    if (isCorrect) {
        return {
            error: false,
            message: '認証に成功しました！',
        }
    }

    mockAttemptsRemaining--

    if (mockAttemptsRemaining <= 0) {
        return {
            error: true,
            message: '試行回数の上限に達しました。',
            redirect_delay: 3,
        }
    }

    return {
        error: true,
        message: `不正解です。残り${mockAttemptsRemaining}回`,
        attempts_remaining: mockAttemptsRemaining,
        new_image_url: `https://picsum.photos/seed/fish-${Date.now()}/400/300`,
    }
}

