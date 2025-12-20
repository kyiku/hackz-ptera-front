/**
 * Layout - 共通レイアウトコンポーネント
 */

interface LayoutProps {
    children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div data-testid="layout" className="min-h-screen flex flex-col bg-stone-50 text-stone-800">
            {/* ヘッダー */}
            <header data-testid="header" className="bg-white border-b border-stone-200 px-4 py-4 md:px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* ロゴ */}
                        <div data-testid="logo" className="text-xl tracking-wide text-stone-700">
                            ptera
                        </div>
                    </div>
                </div>
            </header>

            {/* コンテンツエリア */}
            <main className="flex-1">
                {children}
            </main>

            {/* フッター */}
            <footer data-testid="footer" className="bg-white border-t border-stone-200 px-4 py-4 md:px-8">
                <div className="max-w-7xl mx-auto text-center text-xs text-stone-400">
                    <p data-testid="copyright">
                        © 2025 Hackz-Ptera
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default Layout
