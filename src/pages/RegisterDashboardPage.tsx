/**
 * RegisterDashboardPage - 登録ダッシュボードページ
 * Issue #37: 登録ダッシュボード（ハブ＆スポーク形式）
 *
 * 登録フォームのハブとなるダッシュボード画面
 * - 9つのタスクカードを表示
 * - 全タスク完了時に「登録する」ボタンを有効化
 * - 登録ボタン押下時にサーバーエラー演出
 */
import { useNavigate } from 'react-router-dom'
import { useRegistrationStore } from '../store/registrationStore'
import { TaskCard } from '../components/register/TaskCard'
import type { TaskId } from '../store/types'

/**
 * タスクの表示順序（3列×3行のグリッド）
 */
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

/**
 * 登録処理（サーバーエラー演出）
 * TODO: Issue #24で実装予定のregisterApiを使用する
 */
const handleRegister = async (): Promise<void> => {
    // サーバーエラー演出のため、意図的にエラーを発生させる
    // 実際の実装では、registerApiを使用してAPI呼び出しを行う
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
            // サーバーエラー演出 - エラーページへ遷移
            // TODO: エラーページの実装が完了したら遷移先を更新
            navigate('/register/complete')
        }
    }

    return (
        <div
            data-testid="register-dashboard-page"
            className="min-h-screen bg-gray-900 text-white py-8 px-4"
        >
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">登録ダッシュボード</h1>

                {/* タスクカードグリッド */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                        className={`px-8 py-3 rounded-lg font-bold text-lg transition-colors ${
                            isAllCompleted
                                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        type="button"
                    >
                        登録する
                    </button>
                    {!isAllCompleted && (
                        <p className="mt-2 text-sm text-gray-400">※全タスク完了で有効化</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RegisterDashboardPage

