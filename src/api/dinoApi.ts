/**
 * Dino Game API
 * 
 * ゲーム結果の送信とレスポンス処理
 */

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// リクエスト型
export interface GameResultRequest {
    score: number
    survived: boolean
}

// 成功レスポンス型
export interface GameResultSuccessResponse {
    error: false
    next_stage: string  // "captcha" など
    message: string
}

// 失敗レスポンス型
export interface GameResultFailureResponse {
    error: true
    message: string
    redirect_delay: number  // 秒数（通常3秒）
}

// レスポンス共用型
export type GameResultResponse = GameResultSuccessResponse | GameResultFailureResponse

// API エラー
export class DinoApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public response?: unknown
    ) {
        super(message)
        this.name = 'DinoApiError'
    }
}

/**
 * ゲーム結果をAPIに送信
 * 
 * @param request ゲーム結果（スコア、生存フラグ）
 * @returns APIレスポンス
 */
export async function submitGameResult(
    request: GameResultRequest
): Promise<GameResultResponse> {
    const url = `${API_BASE_URL}/game/dino/result`

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',  // セッションCookie送信
            body: JSON.stringify(request),
        })

        if (!response.ok) {
            throw new DinoApiError(
                `API request failed with status ${response.status}`,
                response.status
            )
        }

        const data: GameResultResponse = await response.json()
        return data
    } catch (error) {
        if (error instanceof DinoApiError) {
            throw error
        }
        throw new DinoApiError(
            error instanceof Error ? error.message : 'Unknown error occurred'
        )
    }
}

/**
 * ゲーム結果を検証（クライアント側）
 * 
 * @param score スコア
 * @param targetScore 目標スコア
 * @returns 目標達成したかどうか
 */
export function validateGameResult(score: number, targetScore: number): boolean {
    return score >= targetScore
}

/**
 * モック用: ゲーム結果送信（API未接続時）
 * 
 * @param request ゲーム結果
 * @returns モックレスポンス
 */
export async function submitGameResultMock(
    request: GameResultRequest
): Promise<GameResultResponse> {
    // 1秒遅延をシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (request.survived) {
        // 成功レスポンス
        return {
            error: false,
            next_stage: 'captcha',
            message: 'ゲームクリア！次のステージへ進みます。',
        }
    } else {
        // 失敗レスポンス
        return {
            error: true,
            message: '残念！もう一度挑戦してください。',
            redirect_delay: 3,
        }
    }
}
