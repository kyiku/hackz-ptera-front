/**
 * AppRouter - アプリケーションのルーティング設定
 * Issue #1: ルーティング設定（React Router）
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSessionStore } from '../store/sessionStore'
import QueuePage from '../pages/QueuePage'
import DinoPage from '../pages/DinoPage'
import CaptchaPage from '../pages/CaptchaPage'
import RegisterPage from '../pages/RegisterPage'
import RegisterNamePage from '../pages/RegisterNamePage'
import RegisterBirthdayPage from '../pages/RegisterBirthdayPage'
import RegisterPhonePage from '../pages/RegisterPhonePage'
import RegisterAddressPage from '../pages/RegisterAddressPage'
import RegisterEmailPage from '../pages/RegisterEmailPage'
import RegisterTermsPage from '../pages/RegisterTermsPage'
import RegisterPasswordPage from '../pages/RegisterPasswordPage'
import OtpPage from '../pages/OtpPage'
import CompletePage from '../pages/CompletePage'
import NotFoundPage from '../pages/NotFoundPage'
import EmailMorseTestPage from '../pages/EmailMorseTestPage'

/**
 * ルートガード: 認証が必要なルートを保護
 * セッションストアのステータスで認証状態を判定
 */
interface ProtectedRouteProps {
    children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const status = useSessionStore((state) => state.status)
    // idle以外のステータス（waiting, stage1_dino, registering）は認証済みとみなす
    const isAuthenticated = status !== 'idle'

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

            {/* テストページ */}
            <Route path="/test/email-morse" element={<EmailMorseTestPage />} />

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
                path="/register/name"
                element={
                    <ProtectedRoute>
                        <RegisterNamePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/register/birthday"
                element={
                    <ProtectedRoute>
                        <RegisterBirthdayPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/register/phone"
                element={
                    <ProtectedRoute>
                        <RegisterPhonePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/register/address"
                element={
                    <ProtectedRoute>
                        <RegisterAddressPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/register/email"
                element={
                    <ProtectedRoute>
                        <RegisterEmailPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/register/terms"
                element={
                    <ProtectedRoute>
                        <RegisterTermsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/register/password"
                element={
                    <ProtectedRoute>
                        <RegisterPasswordPage />
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
                path="/register/complete"
                element={
                    <ProtectedRoute>
                        <CompletePage />
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
