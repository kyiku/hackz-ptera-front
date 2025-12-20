/**
 * Store Index - すべてのストアをエクスポート
 * Issue #5: グローバル状態管理（ユーザー状態）
 */

export { useSessionStore } from './sessionStore'
export { useRegistrationStore } from './registrationStore'
export { useUIStore } from './uiStore'

export type {
    UserStatus,
    TaskId,
    TaskStatus,
    TaskState,
    FormData,
    ModalState,
    SessionState,
    SessionActions,
    SessionStore,
    RegistrationState,
    RegistrationActions,
    RegistrationStore,
    UIState,
    UIActions,
    UIStore,
} from './types'
