/**
 * 404 Not Foundページ
 * Issue #1: ルーティング設定
 */
import { Link } from 'react-router-dom'

const NotFoundPage = () => {
    return (
        <div data-testid="not-found-page" className="min-h-screen bg-white text-gray-800 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <p className="text-2xl mb-8">ページが見つかりません</p>
                <Link
                    to="/"
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                    トップページへ戻る
                </Link>
            </div>
        </div>
    )
}

export default NotFoundPage
