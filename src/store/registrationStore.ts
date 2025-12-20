/**
 * Registration Store - 登録タスク管理
 * Issue #5: グローバル状態管理（ユーザー状態）
 * 
 * 機能:
 * - 9つの登録タスクの完了状態管理
 * - フォームデータ管理
 * - タスク完了数の計算
 */

import { create } from 'zustand'
import type { RegistrationStore, TaskId, TaskState, FormData } from './types'

/**
 * 初期タスク定義
 */
const initialTasks: Record<TaskId, TaskState> = {
    name: { id: 'name', status: 'pending', label: '名前入力' },
    birthday: { id: 'birthday', status: 'pending', label: '生年月日入力' },
    phone: { id: 'phone', status: 'pending', label: '電話番号入力' },
    address: { id: 'address', status: 'pending', label: '住所入力' },
    email: { id: 'email', status: 'pending', label: 'メールアドレス入力' },
    terms: { id: 'terms', status: 'pending', label: '利用規約' },
    password: { id: 'password', status: 'pending', label: 'パスワード入力' },
    captcha: { id: 'captcha', status: 'pending', label: 'CAPTCHA' },
    otp: { id: 'otp', status: 'pending', label: 'OTP認証' },
}

/**
 * 初期フォームデータ
 */
const initialFormData: FormData = {
    name: null,
    birthday: null,
    phone: null,
    address: null,
    email: null,
    termsAccepted: false,
    password: null,
    captchaVerified: false,
    otpVerified: false,
}

export const useRegistrationStore = create<RegistrationStore>((set) => ({
    tasks: initialTasks,
    formData: initialFormData,
    isAllCompleted: false,
    completedCount: 0,

    /**
     * タスクを完了としてマーク
     */
    completeTask: (taskId: TaskId, data?: Partial<FormData>) => {
        set((state) => {
            const newTasks = {
                ...state.tasks,
                [taskId]: { ...state.tasks[taskId], status: 'completed' },
            }
            const newCompletedCount = Object.values(newTasks).filter(
                (task) => task.status === 'completed'
            ).length
            const newIsAllCompleted = Object.values(newTasks).every(
                (task) => task.status === 'completed'
            )

            return {
                tasks: newTasks,
                formData: data ? { ...state.formData, ...data } : state.formData,
                completedCount: newCompletedCount,
                isAllCompleted: newIsAllCompleted,
            }
        })
    },

    /**
     * タスクをリセット
     */
    resetTask: (taskId: TaskId) => {
        set((state) => {
            const newTasks = {
                ...state.tasks,
                [taskId]: { ...state.tasks[taskId], status: 'pending' },
            }
            const newCompletedCount = Object.values(newTasks).filter(
                (task) => task.status === 'completed'
            ).length
            const newIsAllCompleted = Object.values(newTasks).every(
                (task) => task.status === 'completed'
            )

            return {
                tasks: newTasks,
                completedCount: newCompletedCount,
                isAllCompleted: newIsAllCompleted,
            }
        })
    },

    /**
     * 全タスクをリセット
     */
    resetAllTasks: () => {
        set({
            tasks: initialTasks,
            formData: initialFormData,
            completedCount: 0,
            isAllCompleted: false,
        })
    },
}))

export default useRegistrationStore
