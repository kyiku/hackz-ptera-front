/**
 * DinoPage - Dino Run ゲームページ（プレースホルダー）
 * Issue #1: ルーティング設定
 *
 * 待機列から遷移してくるゲームページ
 */
export function DinoPage() {
    return (
        <div
            data-testid="dino-page"
            className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4"
        >
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-center">
                <h1 className="text-4xl font-bold text-white mb-4">
                    🦖 Dino Run
                </h1>
                <p className="text-gray-400 text-lg mb-8">
                    ゲームページ（開発中）
                </p>
                <div className="text-6xl animate-bounce">
                    🏃
                </div>
                <p className="text-gray-500 text-sm mt-8">
                    スペースキーでジャンプ！
                </p>
            </div>
        </div>
    )
}

export default DinoPage
