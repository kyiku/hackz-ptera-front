/**
 * 登録完了ページ（サーバーエラー演出）
 * Issue #24: 登録完了処理（サーバーエラー演出）
 * 
 * 鬼畜仕様: すべてのバリデーションが成功しても、必ずサーバーエラーが返る。
 * 永遠に登録は完了しない。
 */
import { useAutoRedirect } from '../hooks/useAutoRedirect'

const CompletePage = () => {
    // 3秒後にトップページ（待機列）へリダイレクト
    const { remainingSeconds } = useAutoRedirect({
        to: '/',
        delay: 3000,
        autoStart: true,
    })

    return (
        <div
            data-testid="complete-page"
            className="min-h-screen bg-gray-900 text-white flex items-center justify-center"
        >
            <div className="text-center max-w-2xl px-4">
                <h1 className="text-4xl font-bold mb-6 text-red-500">サーバーエラー</h1>
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 mb-6">
                    <p className="text-lg text-red-300 mb-4">
                        サーバーエラーが発生しました。お手数ですが最初からやり直してください。
                    </p>
                </div>
                <p className="text-gray-400 text-sm">
                    {remainingSeconds}秒後にトップページへリダイレクトします...
                </p>
            </div>
        </div>
    )
}

export default CompletePage
