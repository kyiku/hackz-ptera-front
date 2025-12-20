/**
 * RegisterDashboardPage - 登録ダッシュボードページ
 */
import { useNavigate } from 'react-router-dom'
import { useRegistrationStore } from '../store/registrationStore'
import { TaskCard } from '../components/register/TaskCard'
import type { TaskId } from '../store/types'

const TASK_ORDER: TaskId[] = [
    'name',
    'birthday',
    'phone',
    'address',
    'email',
    'terms',
    'password',
    'captcha',
    'otp',
]

const handleRegister = async (): Promise<void> => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('サーバーエラー: 登録に失敗しました'))
        }, 1000)
    })
}

export const RegisterDashboardPage = () => {
    const navigate = useNavigate()
    const { tasks, isAllCompleted } = useRegistrationStore()

    const handleSubmit = async () => {
        if (!isAllCompleted) {
            return
        }

        try {
            await handleRegister()
        } catch {
            navigate('/register/complete')
        }
    }

    return (
        <div
            data-testid="register-dashboard-page"
            className="min-h-screen bg-stone-50 text-stone-800 py-12 px-4"
        >
            <div className="max-w-4xl mx-auto">
                <h1 className="text-xl text-center text-stone-700 tracking-wide mb-10">
                    登録ダッシュボード
                </h1>

                {/* タスクカードグリッド */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    {TASK_ORDER.map((taskId) => {
                        const task = tasks[taskId]
                        return <TaskCard key={taskId} task={task} />
                    })}
                </div>

                {/* 登録ボタン */}
                <div className="text-center">
                    <button
                        data-testid="register-submit-button"
                        onClick={handleSubmit}
                        disabled={!isAllCompleted}
                        className={`px-10 py-4 rounded-sm text-sm tracking-wide transition-colors ${isAllCompleted
                                ? 'bg-stone-800 hover:bg-stone-700 text-white cursor-pointer'
                                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            } focus:outline-none focus:ring-1 focus:ring-stone-500 focus:ring-offset-2`}
                        type="button"
                    >
                        登録する
                    </button>
                    {!isAllCompleted && (
                        <p className="mt-3 text-xs text-stone-400">全タスク完了で有効化</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RegisterDashboardPage
