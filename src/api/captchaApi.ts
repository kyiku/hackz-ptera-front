/**
 * CAPTCHA API
 * 
 * CAPTCHA画像の取得と回答検証
 */

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// --- 型定義 ---

// CAPTCHA生成レスポンス（成功）
export interface CaptchaGenerateSuccessResponse {
    error: false
    image_url: string
    target_image_url: string
}

// CAPTCHA生成レスポンス（エラー）
export interface CaptchaGenerateErrorResponse {
    error: true
    message: string
    code?: string
}

// CAPTCHA生成レスポンス
export type CaptchaGenerateResponse = CaptchaGenerateSuccessResponse | CaptchaGenerateErrorResponse

// CAPTCHA検証リクエスト
export interface CaptchaVerifyRequest {
    x: number
    y: number
}

// CAPTCHA検証成功レスポンス
export interface CaptchaVerifySuccessResponse {
    error: false
    next_stage: string
    message: string
}

// CAPTCHA検証失敗レスポンス（1-2回目）
export interface CaptchaVerifyFailureResponse {
    error: true
    message: string
    attempts_remaining: number
    new_image_url: string
    new_target_image_url: string
}

// CAPTCHA検証最終失敗レスポンス（3回目）
export interface CaptchaVerifyFinalFailureResponse {
    error: true
    message: string
    redirect_delay: number
}

// CAPTCHA検証レスポンス共用型
export type CaptchaVerifyResponse =
    | CaptchaVerifySuccessResponse
    | CaptchaVerifyFailureResponse
    | CaptchaVerifyFinalFailureResponse

// APIエラー
export class CaptchaApiError extends Error {
    statusCode?: number
    response?: unknown

    constructor(
        message: string,
        statusCode?: number,
        response?: unknown
    ) {
        super(message)
        this.name = 'CaptchaApiError'
        this.statusCode = statusCode
        this.response = response
    }
}

// --- API関数 ---

/**
 * CAPTCHA画像を取得
 * GET /api/captcha/generate
 */
export async function getCaptchaImage(): Promise<CaptchaGenerateResponse> {
    const url = `${API_BASE_URL}/api/captcha/generate`

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({}),
        })

        // CloudFront対策: バックエンドは常に200を返すため、
        // HTTPステータスチェックは行わず、レスポンスボディのerrorフィールドで判定

        // Check content type before parsing
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text()
            console.error('Unexpected response:', text.substring(0, 200))
            throw new CaptchaApiError(
                `Expected JSON but received ${contentType}`,
                response.status
            )
        }

        const data: CaptchaGenerateResponse = await response.json()
        return data
    } catch (error) {
        if (error instanceof CaptchaApiError) {
            throw error
        }
        throw new CaptchaApiError(
            error instanceof Error ? error.message : 'Unknown error occurred'
        )
    }
}

/**
 * CAPTCHA回答を検証
 * POST /api/captcha/verify
 */
export async function verifyCaptcha(
    request: CaptchaVerifyRequest
): Promise<CaptchaVerifyResponse> {
    const url = `${API_BASE_URL}/api/captcha/verify`

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(request),
        })

        // CloudFront対策: バックエンドは常に200を返すため、
        // HTTPステータスチェックは行わず、レスポンスボディのerrorフィールドで判定

        // Check content type before parsing
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text()
            console.error('Unexpected response:', text.substring(0, 200))
            throw new CaptchaApiError(
                `Expected JSON but received ${contentType}`,
                response.status
            )
        }

        const data: CaptchaVerifyResponse = await response.json()
        return data
    } catch (error) {
        if (error instanceof CaptchaApiError) {
            throw error
        }
        throw new CaptchaApiError(
            error instanceof Error ? error.message : 'Unknown error occurred'
        )
    }
}

// --- モック関数（フロントエンド開発用） ---

// モック用ターゲット座標（実際のAPIでは不要）
let mockTargetX = 512
let mockTargetY = 384
let mockAttemptsRemaining = 3

/**
 * CAPTCHA画像取得（モック）
 */
export async function getCaptchaImageMock(): Promise<CaptchaGenerateSuccessResponse> {
    // 遅延をシミュレート
    await new Promise(resolve => setTimeout(resolve, 500))

    // ランダムなターゲット位置を設定
    mockTargetX = Math.floor(Math.random() * 900) + 62  // 62-962
    mockTargetY = Math.floor(Math.random() * 650) + 59  // 59-709
    mockAttemptsRemaining = 3

    return {
        error: false,
        image_url: `https://picsum.photos/seed/${Date.now()}/1024/768`,
        target_image_url: `https://picsum.photos/seed/${Date.now() + 1}/100/100`,
    }
}

/**
 * CAPTCHA検証（モック）
 * ターゲット座標から±50px以内なら成功
 */
export async function verifyCaptchaMock(
    request: CaptchaVerifyRequest
): Promise<CaptchaVerifyResponse> {
    // 遅延をシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000))

    const tolerance = 50
    const isCorrect =
        Math.abs(request.x - mockTargetX) <= tolerance &&
        Math.abs(request.y - mockTargetY) <= tolerance

    if (isCorrect) {
        return {
            error: false,
            next_stage: 'registering',
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

    // 新しいターゲット位置を設定
    mockTargetX = Math.floor(Math.random() * 900) + 62
    mockTargetY = Math.floor(Math.random() * 650) + 59

    return {
        error: true,
        message: `不正解です。残り${mockAttemptsRemaining}回`,
        attempts_remaining: mockAttemptsRemaining,
        new_image_url: `https://picsum.photos/seed/${Date.now()}/1024/768`,
        new_target_image_url: `https://picsum.photos/seed/${Date.now() + 1}/100/100`,
    }
}

// --- ヘルパー関数 ---

/**
 * レスポンスが成功かどうかを判定
 */
export function isVerifySuccess(
    response: CaptchaVerifyResponse
): response is CaptchaVerifySuccessResponse {
    return response.error === false
}

/**
 * レスポンスが最終失敗かどうかを判定
 */
export function isVerifyFinalFailure(
    response: CaptchaVerifyResponse
): response is CaptchaVerifyFinalFailureResponse {
    return response.error === true && 'redirect_delay' in response
}

/**
 * レスポンスがリトライ可能な失敗かどうかを判定
 */
export function isVerifyRetryableFailure(
    response: CaptchaVerifyResponse
): response is CaptchaVerifyFailureResponse {
    return response.error === true && 'attempts_remaining' in response
}

/**
 * トークンをローカルストレージに保存
 */
export function saveCaptchaToken(token: string): void {
    localStorage.setItem('captcha_token', token)
}

/**
 * トークンをローカルストレージから取得
 */
export function getCaptchaToken(): string | null {
    return localStorage.getItem('captcha_token')
}
