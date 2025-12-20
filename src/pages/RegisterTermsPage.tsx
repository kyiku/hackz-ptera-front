/**
 * RegisterTermsPage - 利用規約ページ
 * Issue #35: 利用規約 - 音声認識読み上げ・検証
 *
 * 機能:
 * - 利用規約テキストを表示
 * - 音声認識で読み上げを検証
 * - 検証成功時にタスク完了としてマーク
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRegistrationStore } from '../store/registrationStore'
import { VoiceRecognitionTerms } from '../components/register/terms/VoiceRecognitionTerms'

/**
 * 利用規約テキスト（早口言葉ベースの免責条項）
 */
const TERMS_TEXT = `利用規約
第1条 本利用規約（以下「本規約」といいます）に同意することにより、あなたは、以下の免責事項および非義務条項を熟読し、これらを遵守する必要がないことを確認したものとみなされます。
第2条 すなわち、あなたは、次の各号に掲げる事項について同意するものとします。
生麦生米生卵を三回連続、かつ淀みなく発声する滑舌能力がなくても本サービスへの登録が拒否されないこと
赤巻紙青巻紙黄巻紙の色彩を識別し、それらを迅速かつ正確に巻く物理的作業に従事しなくても良いこと
隣の客はよく柿食う客であることを認識しつつも、客観的立場を維持し、自身が柿アレルギーであるか否かに関わらず、当該客の食生活に干渉、あるいは同調して柿を摂取する義務を負わないこと
バスガス爆発等の危険な語彙を連呼させられることにより、公安または周囲の乗客から不要な誤解を招くリスクを回避できること
東京特許許可局という実在しない官庁に対し、架空の特許申請を行うために出向く必要が一切ないこと
第3条 前条に加え、以下の事項についても完全に免除されることを理解するものとします。
カエルぴょこぴょこ三ぴょこぴょこにおいて、合わせてぴょこぴょこ六ぴょこぴょこであるかどうかの厳密な計算および跳躍の動作確認を行わなくても良いこと
坊主が屏風に上手に坊主の絵を描いたか否かの芸術的評価を下す必要がなく、また自身が屏風に絵を描く技術を有していなくても問題ないこと
スモモも桃も桃のうちであるという植物学的分類について、学術的な抗弁を行う必要がないこと
庭には二羽ニワトリがいる状況下において、そのニワトリが本当に二羽であるか、あるいはワニであるかの生態調査を行う義務がないこと
竹屋の竹薮に竹立てかけた理由について、竹屋に対する事情聴取を行う必要がないこと
新春シャンソンショーにおける出演者の身元確認、およびシャンソン歌手による新春早々のショーの観覧を強制されないこと
この釘はひきぬきにくい釘であることを知りながら、あえて指先を負傷するリスクを冒してまで引き抜く労役を課されないこと
魔術師が魔術修行中である現場に遭遇した場合でも、その修行の進捗管理および監督責任を負わないこと
骨粗鬆症訴訟勝訴などの極めて発音困難な法的用語を法廷で陳述する必要がないこと。
第4条 以上、甲（あなた）は乙（運営者）に対し、これらの不可能に近い、あるいは無意味な早口言葉および行動規範からの解放を享受できることを深く理解し、これをもって心からの感謝の意を表明するものとします。`

const RegisterTermsPage = () => {
    const navigate = useNavigate()
    const { completeTask } = useRegistrationStore()

    // 検証成功時のハンドラ
    const handleVerified = useCallback(() => {
        // タスクを完了としてマーク
        completeTask('terms', { termsAccepted: true })
    }, [completeTask])

    // 戻るボタン（ダッシュボードへ）
    const handleBack = useCallback(() => {
        navigate('/register')
    }, [navigate])

    return (
        <div
            data-testid="register-terms-page"
            className="min-h-screen bg-white text-gray-800 py-8 px-4"
        >
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-light text-center mb-8">利用規約</h1>

                {/* 音声認識読み上げ */}
                <VoiceRecognitionTerms
                    termsText={TERMS_TEXT}
                    onVerified={handleVerified}
                />

                {/* 戻るボタン */}
                <div className="text-center mt-8">
                    <button
                        data-testid="back-to-dashboard-button"
                        onClick={handleBack}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="button"
                    >
                        ダッシュボードに戻る
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RegisterTermsPage
