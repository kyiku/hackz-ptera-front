/**
 * Register API - 会員登録API
 * Issue #24: 登録完了処理（サーバーエラー演出）
 * 
 * 鬼畜仕様: すべてのバリデーションが成功しても、必ずサーバーエラーが返る。
 * 永遠に登録は完了しない。
 */

// --- 型定義 ---

/**
 * 登録リクエスト
 */
export interface RegisterRequest {
    // フォームデータ（すべて必須）
    name: string
    birthday: string // "YYYY-MM-DD"形式
    phone: string
    address: string
    email: string
    termsAccepted: boolean
    password: string
    captchaVerified: boolean
    otpVerified: boolean
}

/**
 * 登録レスポンス（必ずエラーを返す）
 */
export interface RegisterErrorResponse {
    error: true
    message: string
    redirect_delay: number
}

/**
 * Register APIエラー
 */
export class RegisterApiError extends Error {
    statusCode?: number
    response?: unknown

    constructor(
        message: string,
        statusCode?: number,
        response?: unknown
    ) {
        super(message)
        this.name = 'RegisterApiError'
        this.statusCode = statusCode
        this.response = response
    }
}

// --- API関数 ---

/**
 * 会員登録を送信
 * POST /api/register
 * 
 * 鬼畜仕様: 必ずサーバーエラーを返す
 */
export async function submitRegistration(
    request: RegisterRequest
): Promise<RegisterErrorResponse> {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
    const url = `${API_BASE_URL}/api/register`

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
            throw new RegisterApiError(
                `Registration failed: ${response.status}`,
                response.status
            )
        }

        const data: RegisterErrorResponse = await response.json()
        
        // 必ずエラーを返す（正常系は存在しない）
        if (!data.error) {
            // 万が一成功レスポンスが返ってきた場合も、エラーとして扱う
            throw new RegisterApiError('Unexpected success response')
        }

        return data
    } catch (error) {
        if (error instanceof RegisterApiError) {
            throw error
        }
        throw new RegisterApiError(
            error instanceof Error ? error.message : 'Unknown error occurred'
        )
    }
}

// --- モック関数（フロントエンド開発用） ---

/**
 * 会員登録送信（モック）
 * 
 * 鬼畜仕様: 必ずサーバーエラーを返す
 */
export async function submitRegistrationMock(): Promise<RegisterErrorResponse> {
    // 遅延をシミュレート（1秒待機してからエラーを返す）
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 必ずエラーを返す
    return {
        error: true,
        message: 'サーバーエラーが発生しました。お手数ですが最初からやり直してください。',
        redirect_delay: 3,
    }
}

