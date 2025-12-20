/**
 * Store Types - 状態管理の型定義
 * Issue #5: グローバル状態管理（ユーザー状態）
 */

/**
 * ユーザーステータス
 */
export type UserStatus =
    | 'idle' // 初期状態
    | 'waiting' // 待機列で待機中
    | 'stage1_dino' // Dino Runプレイ中
    | 'registering' // 登録フォーム入力中（ダッシュボード）

/**
 * タスクID（9つの登録タスク）
 */
export type TaskId =
    | 'name' // 名前入力
    | 'birthday' // 生年月日入力
    | 'phone' // 電話番号入力
    | 'address' // 住所入力
    | 'email' // メールアドレス入力
    | 'terms' // 利用規約
    | 'password' // パスワード入力
    | 'captcha' // CAPTCHA
    | 'otp' // OTP

/**
 * タスクステータス
 */
export type TaskStatus = 'pending' | 'completed'

/**
 * タスク状態
 */
export interface TaskState {
    id: TaskId
    status: TaskStatus
    label: string
}

/**
 * フォームデータ
 */
export interface FormData {
    name: string | null
    birthday: string | null // "YYYY-MM-DD"形式
    phone: string | null
    address: string | null
    email: string | null // 瞬きモールス信号で入力
    termsAccepted: boolean
    password: string | null
    captchaVerified: boolean
    otpVerified: boolean
}

/**
 * モーダル状態
 */
export interface ModalState {
    isOpen: boolean
    type: 'error' | 'success' | 'warning' | null
    message: string | null
    redirectDelay: number | null
}

/**
 * Session Store - セッション管理
 */
export interface SessionState {
    sessionId: string | null
    status: UserStatus
    queuePosition: number | null
    registerToken: string | null
    tokenExpiresAt: Date | null
}

export interface SessionActions {
    setSession: (sessionId: string) => void
    setStatus: (status: UserStatus) => void
    setQueuePosition: (position: number) => void
    setRegisterToken: (token: string, expiresAt: Date) => void
    reset: () => void // 失敗時のリセット（待機列最後尾へ）
}

export type SessionStore = SessionState & SessionActions

/**
 * Registration Store - 登録タスク管理
 */
export interface RegistrationState {
    tasks: Record<TaskId, TaskState>
    formData: FormData
    isAllCompleted: boolean // 全タスク完了か（計算プロパティ）
    completedCount: number // 完了タスク数（計算プロパティ）
}

export interface RegistrationActions {
    completeTask: (taskId: TaskId, data?: Partial<FormData>) => void
    resetTask: (taskId: TaskId) => void
    resetAllTasks: () => void
}

export type RegistrationStore = RegistrationState & RegistrationActions

/**
 * UI Store - UI状態管理
 */
export interface UIState {
    isLoading: boolean
    modalState: ModalState
}

export interface UIActions {
    setLoading: (isLoading: boolean) => void
    showModal: (
        type: ModalState['type'],
        message: string,
        redirectDelay?: number
    ) => void
    hideModal: () => void
}

export type UIStore = UIState & UIActions
