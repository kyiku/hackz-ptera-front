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
            className="min-h-screen bg-stone-50 flex items-center justify-center p-4"
        >
            <div className="bg-white border border-stone-200 rounded-sm p-10 w-full max-w-lg text-center">
                <h1 className="text-xl font-light text-stone-700 tracking-wide mb-6">サーバーエラー</h1>
                <div className="py-6 border-t border-b border-stone-100 mb-6">
                    <p className="text-stone-600 text-sm leading-relaxed">
                        サーバーエラーが発生しました。<br />
                        お手数ですが最初からやり直してください。
                    </p>
                </div>
                <p className="text-stone-400 text-xs">
                    {remainingSeconds}秒後にトップページへリダイレクトします...
                </p>
            </div>
        </div>
    )
}

export default CompletePage
