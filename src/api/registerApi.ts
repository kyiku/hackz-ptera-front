/**
 * Issue #24: feat: 登録完了処理（サーバーエラー演出）
 *
 * 登録APIクライアント
 * - 登録リクエスト送信 (POST /api/register)
 * - サーバーエラー演出（永遠に登録は完了しない）
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

/**
 * 登録リクエスト
 */
export interface RegisterRequest {
  token: string
  username?: string
  name?: string
  email: string
  password: string
  birthday?: string
  phone?: string
  address?: string
  termsAccepted?: boolean
}

/**
 * 登録レスポンス（必ずエラー）
 */
export interface RegisterResponse {
  error: true
  message: string
  redirect_delay: number
}

/**
 * 登録情報を送信する（必ずサーバーエラーが返る）
 */
export async function submitRegistration(
  data: RegisterRequest
): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Cookieを送信
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    // HTTPエラーの場合も同じ形式で返す
    if (response.status === 500) {
      const errorData = (await response.json()) as RegisterResponse
      return errorData
    }
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = (await response.json()) as RegisterResponse

  // 鬼畜仕様: 必ずエラーが返る
  if (result.error !== true) {
    throw new Error('予期しないレスポンス形式')
  }

  return result
}

