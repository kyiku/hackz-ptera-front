/**
 * AppRouter - アプリケーションのルーティング設定
 * Issue #1: ルーティング設定（React Router）
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import QueuePage from '../pages/QueuePage'
import DinoPage from '../pages/DinoPage'
import CaptchaPage from '../pages/CaptchaPage'
import RegisterPage from '../pages/RegisterPage'
import OtpPage from '../pages/OtpPage'
import CompletePage from '../pages/CompletePage'
import NotFoundPage from '../pages/NotFoundPage'

/**
 * ルートガード: 認証が必要なルートを保護
 * TODO: Issue #5で状態管理実装後に実際の認証ロジックを追加
 */
interface ProtectedRouteProps {
    children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    // TODO: 実際の認証状態を状態管理から取得
    const isAuthenticated = false // プレースホルダー

    if (!isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

/**
 * AppRoutesコンポーネント - ルート定義のみ
 * テストで使用可能
 */
export const AppRoutes = () => {
    return (
        <Routes>
            {/* 公開ルート */}
            <Route path="/" element={<QueuePage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/dino" element={<DinoPage />} />
            <Route path="/game/dino" element={<DinoPage />} />
            <Route path="/captcha" element={<CaptchaPage />} />

            {/* 保護されたルート（認証が必要） */}
            <Route
                path="/register"
                element={
                    <ProtectedRoute>
                        <RegisterPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/otp"
                element={
                    <ProtectedRoute>
                        <OtpPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/complete"
                element={
                    <ProtectedRoute>
                        <CompletePage />
                    </ProtectedRoute>
                }
            />

            {/* 404ページ */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}

/**
 * AppRouterコンポーネント - BrowserRouterでラップ
 */
export const AppRouter = () => {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    )
}

export default AppRouter
