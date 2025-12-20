/**
 * TaskCard - 登録タスクカードコンポーネント
 * Issue #37: 登録ダッシュボード（ハブ＆スポーク形式）
 *
 * 登録ダッシュボードで表示する各タスクのカード
 * - タスク名の表示
 * - 完了状態の表示（○ 完了 / × 未完了）
 * - クリックでタスクページへ遷移
 */
import { useNavigate } from 'react-router-dom'
import type { TaskId, TaskState } from '../../store/types'

interface TaskCardProps {
    task: TaskState
}

/**
 * タスクIDから遷移先パスへのマッピング
 */
const TASK_ROUTES: Record<TaskId, string> = {
    name: '/register/name',
    birthday: '/register/birthday',
    phone: '/register/phone',
    address: '/register/address',
    email: '/register/email',
    terms: '/register/terms',
    password: '/register/password',
    captcha: '/register/captcha',
    otp: '/otp',
}

/**
 * タスクIDから表示名へのマッピング（issueのテーブルに基づく）
 */
const TASK_DISPLAY_NAMES: Record<TaskId, string> = {
    name: '名前',
    birthday: '生年月日',
    phone: '電話',
    address: '住所',
    email: 'メール',
    terms: '利用規約',
    password: 'パスワード',
    captcha: 'CAPTCHA',
    otp: 'OTP',
}

export const TaskCard = ({ task }: TaskCardProps) => {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(TASK_ROUTES[task.id])
    }

    const displayName = TASK_DISPLAY_NAMES[task.id]
    const isCompleted = task.status === 'completed'

    return (
        <button
            data-testid={`task-card-${task.id}`}
            onClick={handleClick}
            className="bg-white border border-stone-200 rounded-sm p-5 hover:bg-stone-50 transition-colors text-left w-full focus:outline-none focus:ring-1 focus:ring-stone-400 focus:ring-offset-2"
            type="button"
        >
            <div className="flex items-center justify-between">
                <span className="text-sm text-stone-700 tracking-wide">{displayName}</span>
                <span data-testid={`task-status-${task.id}`}>
                    {isCompleted ? (
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <div className="w-5 h-5 border border-stone-300 rounded-full" />
                    )}
                </span>
            </div>
        </button>
    )
}

export default TaskCard
