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
    captcha: '/captcha',
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
    const statusIcon = isCompleted ? '○' : '×'

    return (
        <button
            data-testid={`task-card-${task.id}`}
            onClick={handleClick}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="button"
        >
            <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-gray-800">{displayName}</span>
                <span className="text-2xl" data-testid={`task-status-${task.id}`}>
                    {statusIcon}
                </span>
            </div>
        </button>
    )
}

export default TaskCard
