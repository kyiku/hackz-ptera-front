/**
 * Password API - パスワード解析API
 * Issue #21: AIパスワード煽り機能
 * 
 * パスワードをAIで解析し、煽りメッセージを生成
 */

import { apiClient } from './client'

// --- 型定義 ---

/**
 * パスワード解析リクエスト
 */
export interface PasswordAnalyzeRequest {
    password: string
}

/**
 * パスワード解析レスポンス（バックエンド）
 */
interface PasswordAnalyzeRawResponse {
    error: boolean
    analysis?: string
    message?: string
    code?: string
}

/**
 * パスワード解析レスポンス（正規化後）
 */
export interface PasswordAnalyzeResponse {
    error: false
    message: string
}

/**
 * パスワードAPIエラー
 */
export class PasswordApiError extends Error {
    statusCode?: number
    response?: unknown

    constructor(
        message: string,
        statusCode?: number,
        response?: unknown
    ) {
        super(message)
        this.name = 'PasswordApiError'
        this.statusCode = statusCode
        this.response = response
    }
}

// --- API関数 ---

/**
 * パスワードを解析して煽りメッセージを取得
 * POST /api/password/analyze
 */
export async function analyzePassword(
    request: PasswordAnalyzeRequest
): Promise<PasswordAnalyzeResponse> {
    try {
        const rawResponse = await apiClient.post<PasswordAnalyzeRawResponse>(
            '/api/password/analyze',
            request
        )

        // エラーレスポンスの場合
        if (rawResponse.error) {
            throw new PasswordApiError(
                rawResponse.message || rawResponse.code || 'API error',
                undefined,
                rawResponse
            )
        }

        // analysisまたはmessageフィールドからメッセージを取得
        const message = rawResponse.analysis || rawResponse.message || ''
        if (!message) {
            throw new PasswordApiError('Empty response from API')
        }

        return {
            error: false,
            message,
        }
    } catch (error) {
        if (error instanceof PasswordApiError) {
            throw error
        }
        throw new PasswordApiError(
            error instanceof Error ? error.message : 'Unknown error occurred'
        )
    }
}

// --- モック関数（フロントエンド開発用） ---

/**
 * パスワード解析（モック）
 * パスワードの強度に応じて煽りメッセージを生成
 */
export async function analyzePasswordMock(
    request: PasswordAnalyzeRequest
): Promise<PasswordAnalyzeResponse> {
    // 遅延をシミュレート（500ms - 1.5sのランダム）
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))

    const { password } = request

    // よくある弱いパスワードのパターン
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123']
    const isCommon = commonPasswords.some(common => 
        password.toLowerCase().includes(common.toLowerCase())
    )

    // パスワード強度の簡易判定
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const length = password.length

    let message = ''

    if (isCommon) {
        message = `「${password}」ですか？そのパスワード、辞書攻撃で3秒で破られますよ...`
    } else if (length < 6) {
        message = `${length}文字？それ本当にパスワードですか？小学生でももっと長いの作れますよ。`
    } else if (length < 8 || (!hasUpper && !hasLower) || !hasNumber) {
        message = `そのパスワード、総当たり攻撃で${Math.floor(Math.random() * 10 + 1)}分で突破されます。もっと強くしましょう。`
    } else if (!hasSpecial || (!hasUpper || !hasLower)) {
        message = `まあまあですね。でも、特殊文字や大文字小文字を混ぜるともっと安全です。現状だと${Math.floor(Math.random() * 100 + 50)}時間で突破されそうです。`
    } else if (length < 12) {
        message = `悪くないですね。でも12文字以上にすると、突破までの時間が${Math.floor(Math.random() * 1000 + 1000)}倍になりますよ。`
    } else {
        message = `なかなか強いパスワードですね。でも、このパターンで${Math.floor(Math.random() * 5 + 1)}文字増やすだけで、さらに${Math.floor(Math.random() * 100 + 50)}倍安全になります。完璧を目指しましょう。`
    }

    return {
        error: false,
        message,
    }
}

