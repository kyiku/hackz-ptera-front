/**
 * Layout - 共通レイアウトコンポーネント
 * Issue #2: 共通レイアウトコンポーネント
 * 
 * 全ページで使用する共通レイアウト
 * - ヘッダー（アプリタイトル、ロゴ）
 * - コンテンツエリア
 * - フッター（コピーライト）
 */

interface LayoutProps {
    children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div data-testid="layout" className="min-h-screen flex flex-col bg-gray-900 text-white">
            {/* ヘッダー */}
            <header data-testid="header" className="bg-gray-800 border-b border-gray-700 px-4 py-4 md:px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* ロゴ */}
                        <div data-testid="logo" className="text-2xl">
                            ptera
                        </div>
                        {/* アプリタイトル */}
                        <h1 className="text-xl md:text-2xl font-bold">
                            The Frustrating Registration Form
                        </h1>
                    </div>
                </div>
            </header>

            {/* コンテンツエリア */}
            <main className="flex-1">
                {children}
            </main>

            {/* フッター */}
            <footer data-testid="footer" className="bg-gray-800 border-t border-gray-700 px-4 py-4 md:px-8">
                <div className="max-w-7xl mx-auto text-center text-sm text-gray-400">
                    <p data-testid="copyright">
                        © 2025 Hackz-Ptera. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default Layout
