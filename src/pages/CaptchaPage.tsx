/**
 * CaptchaPage - CAPTCHA認証ページ
 *
 * 画像選択型CAPTCHAの基本UI
 * - 説明文表示
 * - 画像選択エリア
 * - 残り試行回数表示
 */
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// CAPTCHA設定
const MAX_ATTEMPTS = 3
const GRID_SIZE = 9  // 3x3 グリッド
const TARGET_DESCRIPTION = '信号機を含む画像をすべて選択してください'

// モック画像データ
const MOCK_IMAGES = Array.from({ length: GRID_SIZE }, (_, i) => ({
    id: i,
    url: `https://picsum.photos/seed/${i + 1}/200/200`,
    isTarget: i === 0 || i === 3 || i === 7,  // モック: 特定の画像がターゲット
}))

type CaptchaState = 'idle' | 'verifying' | 'success' | 'error'

export function CaptchaPage() {
    const navigate = useNavigate()

    const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set())
    const [remainingAttempts, setRemainingAttempts] = useState(MAX_ATTEMPTS)
    const [captchaState, setCaptchaState] = useState<CaptchaState>('idle')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [images, setImages] = useState(MOCK_IMAGES)

    // 画像選択トグル
    const toggleImage = useCallback((imageId: number) => {
        if (captchaState === 'verifying' || captchaState === 'success') return

        setSelectedImages(prev => {
            const newSet = new Set(prev)
            if (newSet.has(imageId)) {
                newSet.delete(imageId)
            } else {
                newSet.add(imageId)
            }
            return newSet
        })
    }, [captchaState])

    // CAPTCHA検証
    const verifyCaptcha = useCallback(async () => {
        if (selectedImages.size === 0) {
            setErrorMessage('画像を選択してください')
            return
        }

        setCaptchaState('verifying')
        setErrorMessage('')

        // モック検証（1秒の遅延）
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 正解判定（モック）
        const correctImages = images.filter(img => img.isTarget).map(img => img.id)
        const isCorrect =
            correctImages.length === selectedImages.size &&
            correctImages.every(id => selectedImages.has(id))

        if (isCorrect) {
            setCaptchaState('success')
            // 2秒後に次のページへ遷移
            setTimeout(() => {
                navigate('/register')
            }, 2000)
        } else {
            const newAttempts = remainingAttempts - 1
            setRemainingAttempts(newAttempts)

            if (newAttempts <= 0) {
                setCaptchaState('error')
                setErrorMessage('試行回数の上限に達しました。ページを更新してやり直してください。')
            } else {
                setCaptchaState('idle')
                setErrorMessage(`不正解です。残り${newAttempts}回`)
                // 新しいCAPTCHA画像を読み込む（モック）
                setImages(MOCK_IMAGES.map(img => ({
                    ...img,
                    url: `https://picsum.photos/seed/${img.id + Date.now()}/200/200`,
                })))
                setSelectedImages(new Set())
            }
        }
    }, [selectedImages, images, remainingAttempts, navigate])

    // ページリセット
    const resetCaptcha = useCallback(() => {
        setSelectedImages(new Set())
        setRemainingAttempts(MAX_ATTEMPTS)
        setCaptchaState('idle')
        setErrorMessage('')
        setImages(MOCK_IMAGES.map(img => ({
            ...img,
            url: `https://picsum.photos/seed/${img.id + Date.now()}/200/200`,
        })))
    }, [])

    return (
        <div
            data-testid="captcha-page"
            className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4"
        >
            <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-lg">
                {/* ヘッダー */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        🤖 ロボットではないことを確認
                    </h1>
                    <p className="text-gray-400 text-sm">
                        以下の指示に従って画像を選択してください
                    </p>
                </div>

                {/* 残り試行回数 */}
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 text-sm">残り試行回数</span>
                    <div className="flex gap-1">
                        {Array.from({ length: MAX_ATTEMPTS }, (_, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full ${i < remainingAttempts ? 'bg-green-500' : 'bg-gray-600'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* 説明文 */}
                <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-6">
                    <p className="text-blue-300 font-medium text-center">
                        {TARGET_DESCRIPTION}
                    </p>
                </div>

                {/* 画像グリッド */}
                <div
                    data-testid="captcha-image-grid"
                    className="grid grid-cols-3 gap-2 mb-6"
                >
                    {images.map((image) => (
                        <button
                            key={image.id}
                            onClick={() => toggleImage(image.id)}
                            disabled={captchaState === 'verifying' || captchaState === 'success'}
                            className={`
                relative aspect-square rounded-lg overflow-hidden border-4 transition-all
                ${selectedImages.has(image.id)
                                    ? 'border-blue-500 ring-2 ring-blue-400'
                                    : 'border-transparent hover:border-gray-600'
                                }
                ${captchaState === 'verifying' || captchaState === 'success'
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'cursor-pointer'
                                }
              `}
                        >
                            <img
                                src={image.url}
                                alt={`CAPTCHA画像 ${image.id + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            {selectedImages.has(image.id) && (
                                <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                                    <span className="text-white text-3xl">✓</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* エラーメッセージ */}
                {errorMessage && (
                    <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 mb-4">
                        <p className="text-red-400 text-sm text-center">{errorMessage}</p>
                    </div>
                )}

                {/* 成功メッセージ */}
                {captchaState === 'success' && (
                    <div className="bg-green-900/50 border border-green-700 rounded-lg p-3 mb-4">
                        <p className="text-green-400 text-sm text-center">
                            ✓ 認証成功！登録ページへ移動します...
                        </p>
                    </div>
                )}

                {/* 送信ボタン */}
                {captchaState !== 'success' && remainingAttempts > 0 && (
                    <button
                        onClick={verifyCaptcha}
                        disabled={captchaState === 'verifying'}
                        className={`
              w-full py-3 rounded-lg font-bold text-white transition-colors
              ${captchaState === 'verifying'
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }
            `}
                    >
                        {captchaState === 'verifying' ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                検証中...
                            </span>
                        ) : (
                            '確認'
                        )}
                    </button>
                )}

                {/* リセットボタン（試行回数切れ時） */}
                {remainingAttempts <= 0 && (
                    <button
                        onClick={resetCaptcha}
                        className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition-colors"
                    >
                        やり直す
                    </button>
                )}

                {/* ヘルプテキスト */}
                <p className="text-gray-500 text-xs text-center mt-4">
                    画像が見えにくい場合は更新してください
                </p>
            </div>
        </div>
    )
}

export default CaptchaPage
