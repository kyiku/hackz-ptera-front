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

// よくある名前パターン
const COMMON_NAMES = [
    'yuki', 'hana', 'sora', 'rin', 'miku', 'yui', 'ai', 'mei', 'sakura', 'taro',
    'ken', 'ryo', 'yuto', 'sota', 'haruto', 'takumi', 'kenta', 'daiki', 'shota',
    'akira', 'hiroshi', 'kenji', 'masaki', 'naoki', 'ryota', 'kazuki', 'tomoya',
    'love', 'happy', 'angel', 'candy', 'honey', 'baby', 'sweet', 'cute', 'princess',
]

// 誕生日パターンを検出
function detectBirthday(password: string): string | null {
    // YYYYMMDD, YYMMDD, MMDD パターン
    const patterns = [
        /(?:19|20)(\d{2})(\d{2})(\d{2})/, // 19YYMMDD or 20YYMMDD
        /(\d{2})(\d{2})(\d{2})/, // YYMMDD
        /(\d{2})(\d{2})$/, // MMDD at end
    ]

    for (const pattern of patterns) {
        const match = password.match(pattern)
        if (match) {
            if (match.length === 4) {
                const [, , mm, dd] = match
                const month = parseInt(mm)
                const day = parseInt(dd)
                if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                    return `${month}月${day}日`
                }
            } else if (match.length === 3) {
                const [, mm, dd] = match
                const month = parseInt(mm)
                const day = parseInt(dd)
                if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                    return `${month}月${day}日`
                }
            }
        }
    }
    return null
}

// 名前パターンを検出
function detectName(password: string): string | null {
    const lower = password.toLowerCase()
    for (const name of COMMON_NAMES) {
        if (lower.includes(name)) {
            return name.charAt(0).toUpperCase() + name.slice(1)
        }
    }
    // 連続する英字を名前として推測
    const nameMatch = password.match(/[a-zA-Z]{3,}/)
    if (nameMatch) {
        return nameMatch[0]
    }
    return null
}

/**
 * パスワード解析（モック）
 * 煽りメッセージ＋誕生日・名前推測
 */
export async function analyzePasswordMock(
    request: PasswordAnalyzeRequest
): Promise<PasswordAnalyzeResponse> {
    // 遅延をシミュレート（300ms - 800ms）
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 300))

    const { password } = request
    const birthday = detectBirthday(password)
    const name = detectName(password)

    const taunts: string[] = []

    // 誕生日推測
    if (birthday) {
        taunts.push(
            `おっと、${birthday}生まれですか？誕生日をパスワードに使うなんて、ハッカーに「どうぞ突破してください」って言ってるようなものですよ。`,
            `${birthday}...あなたの誕生日か、大切な人の誕生日ですね？SNSを3分見れば分かりますよ、そんなの。`,
            `誕生日${birthday}を使ってますね。世界中のハッカーが最初に試すパターンですよ、それ。`,
        )
    }

    // 名前推測
    if (name) {
        taunts.push(
            `「${name}」さん、ですか？自分の名前や恋人の名前をパスワードに入れるの、バレバレですよ？`,
            `${name}...誰の名前ですか？彼氏？彼女？ペット？どれにしても危険すぎます。`,
            `「${name}」って入ってますね。名前ベースのパスワードは辞書攻撃で一瞬で破られますよ。`,
        )
    }

    // よくある弱いパスワード
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'iloveyou', 'admin', 'letmein']
    if (commonPasswords.some(cp => password.toLowerCase().includes(cp))) {
        taunts.push(
            `えっ...本気ですか？そのパスワード、世界で最も使われてるパスワードリストに載ってますよ。`,
            `ちょっと待って。それ、ハッカーが最初の0.1秒で試すパスワードですよ？`,
            `そのパスワード、小学生でも破れます。いや、幼稚園児でも無理かな...`,
        )
    }

    // 数字だけ
    if (/^\d+$/.test(password)) {
        taunts.push(
            `数字だけ？電話番号ですか？それともPINコード？どちらにしても危険すぎます。`,
            `数字オンリーは論外です。10種類の文字しかないんですよ？`,
        )
    }

    // 短すぎる
    if (password.length < 8) {
        taunts.push(
            `${password.length}文字...？それパスワードじゃなくて暗証番号ですよね？`,
            `たった${password.length}文字？私のAI処理で${Math.floor(Math.random() * 5 + 1)}秒で解読できちゃいますよ。`,
        )
    }

    // デフォルトの煽り
    if (taunts.length === 0) {
        taunts.push(
            `まあまあですね。でも私なら${Math.floor(Math.random() * 24 + 1)}時間で突破できそうです。`,
            `悪くはないですが、もっと意味不明な文字列にしたほうがいいですよ。人間が覚えられるパスワードは弱いんです。`,
            `このパスワード、あなたの性格が透けて見えますね。几帳面...いや、面倒くさがり？`,
        )
    }

    // ランダムに1つ選択
    const message = taunts[Math.floor(Math.random() * taunts.length)]

    return {
        error: false,
        message,
    }
}

