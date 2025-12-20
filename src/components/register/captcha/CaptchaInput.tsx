/**
 * CaptchaInput - ウォーリーを探せ風CAPTCHAコンポーネント
 *
 * 機能:
 * - CAPTCHA画像を生成・表示
 * - ターゲット画像を表示
 * - クリック位置を検証
 * - 3回失敗で待機列へ
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import {
    getCaptchaImage,
    verifyCaptcha,
    isVerifySuccess,
    isVerifyFinalFailure,
    isVerifyRetryableFailure,
    type CaptchaVerifyFailureResponse,
} from '../../../api/captchaApi'
import { LoadingSpinner } from '../../ui/LoadingSpinner'

interface CaptchaInputProps {
    /** 成功時のコールバック */
    onSuccess: () => void
    /** 最終失敗時のコールバック */
    onFinalFailure?: () => void
}

export const CaptchaInput = ({ onSuccess, onFinalFailure }: CaptchaInputProps) => {
    const [imageUrl, setImageUrl] = useState<string>('')
    const [targetImageUrl, setTargetImageUrl] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [message, setMessage] = useState<string>('')
    const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info')
    const [attemptsRemaining, setAttemptsRemaining] = useState(3)
    const [clickMarker, setClickMarker] = useState<{ x: number; y: number } | null>(null)

    const imageRef = useRef<HTMLImageElement>(null)

    // CAPTCHA画像を生成
    const generateCaptcha = useCallback(async () => {
        setIsLoading(true)
        setMessage('')
        setClickMarker(null)

        try {
            const response = await getCaptchaImage()

            if (response.error) {
                const errorMsg = 'message' in response ? response.message : 'CAPTCHA生成に失敗しました'
                const errorCode = 'code' in response ? response.code : ''
                console.error('CAPTCHA API error:', errorCode, errorMsg)
                setMessage(errorMsg + (errorCode ? ' (' + errorCode + ')' : ''))
                setMessageType('error')
                return
            }

            setImageUrl(response.image_url)
            setTargetImageUrl(response.target_image_url)
            setMessage('画像の中からターゲットを見つけてクリック！')
            setMessageType('info')
            setAttemptsRemaining(3)
        } catch (error) {
            console.error('CAPTCHA generation error:', error)
            const errMsg = error instanceof Error ? error.message : 'CAPTCHA生成に失敗しました'
            setMessage(errMsg)
            setMessageType('error')
        } finally {
            setIsLoading(false)
        }
    }, [])

    // 初回ロード時にCAPTCHA生成
    useEffect(() => {
        generateCaptcha()
    }, [generateCaptcha])

    // クリック処理
    const handleImageClick = useCallback(
        async (event: React.MouseEvent<HTMLImageElement>) => {
            if (isVerifying || !imageRef.current) return

            const img = imageRef.current
            const rect = img.getBoundingClientRect()

            // 画像の表示サイズと実際のサイズの比率を計算
            const scaleX = img.naturalWidth / rect.width
            const scaleY = img.naturalHeight / rect.height

            // クリック座標を実際の画像座標に変換
            const x = Math.round((event.clientX - rect.left) * scaleX)
            const y = Math.round((event.clientY - rect.top) * scaleY)

            // クリックマーカーを表示（表示座標）
            setClickMarker({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            })

            setIsVerifying(true)
            setMessage('検証中...')
            setMessageType('info')

            try {
                const response = await verifyCaptcha({ x, y })

                if (isVerifySuccess(response)) {
                    setMessage('正解！CAPTCHA認証成功！')
                    setMessageType('success')
                    setTimeout(() => {
                        onSuccess()
                    }, 1000)
                    return
                }

                if (isVerifyFinalFailure(response)) {
                    setMessage('3回失敗しました。待機列に戻ります...')
                    setMessageType('error')
                    setTimeout(() => {
                        onFinalFailure?.()
                    }, response.redirect_delay * 1000)
                    return
                }

                if (isVerifyRetryableFailure(response)) {
                    const failResponse = response as CaptchaVerifyFailureResponse
                    setAttemptsRemaining(failResponse.attempts_remaining)
                    setMessage('不正解！残り' + failResponse.attempts_remaining + '回')
                    setMessageType('error')

                    // 新しい画像があれば更新
                    if (failResponse.new_image_url) {
                        setImageUrl(failResponse.new_image_url)
                        setClickMarker(null)
                    }
                    if (failResponse.new_target_image_url) {
                        setTargetImageUrl(failResponse.new_target_image_url)
                    }
                }
            } catch (error) {
                console.error('CAPTCHA verification error:', error)
                setMessage('検証に失敗しました')
                setMessageType('error')
            } finally {
                setIsVerifying(false)
            }
        },
        [isVerifying, onSuccess, onFinalFailure]
    )

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* タイトル */}
            <h2 className="text-2xl font-bold text-center mb-4">
                ウォーリーを探せ！
            </h2>

            {/* 説明 */}
            <p className="text-center text-gray-600 mb-4">
                下の画像の中から、ターゲットを見つけてクリックしてください
            </p>

            {/* ターゲット画像 */}
            {targetImageUrl && (
                <div className="flex items-center justify-center gap-4 mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                    <span className="text-lg font-medium text-yellow-800">
                        この画像を探せ！ →
                    </span>
                    <img
                        src={targetImageUrl}
                        alt="ターゲット"
                        className="w-16 h-16 border-2 border-yellow-500 rounded-lg object-cover"
                    />
                </div>
            )}

            {/* CAPTCHA画像エリア */}
            <div className="relative border-4 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                {isLoading ? (
                    <div className="w-full h-96 flex items-center justify-center">
                        <LoadingSpinner size="large" />
                        <span className="ml-4 text-gray-600">CAPTCHA生成中...</span>
                    </div>
                ) : imageUrl ? (
                    <div className="relative">
                        <img
                            ref={imageRef}
                            src={imageUrl}
                            alt="CAPTCHA"
                            onClick={handleImageClick}
                            className={'w-full h-auto cursor-crosshair ' +
                                (isVerifying ? 'pointer-events-none opacity-70' : '')}
                        />
                        {/* クリックマーカー */}
                        {clickMarker && (
                            <div
                                className="absolute w-8 h-8 border-4 border-yellow-400 rounded-full animate-ping"
                                style={{
                                    left: clickMarker.x - 16,
                                    top: clickMarker.y - 16,
                                }}
                            />
                        )}
                        {/* 検証中オーバーレイ */}
                        {isVerifying && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                <LoadingSpinner size="large" color="white" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-96 flex items-center justify-center text-gray-500">
                        画像を読み込めませんでした
                    </div>
                )}
            </div>

            {/* メッセージ */}
            {message && (
                <div
                    className={'mt-4 p-4 rounded-lg text-center font-medium ' +
                        (messageType === 'success'
                            ? 'bg-green-100 text-green-800 border-2 border-green-400'
                            : messageType === 'error'
                              ? 'bg-red-100 text-red-800 border-2 border-red-400'
                              : 'bg-blue-100 text-blue-800 border-2 border-blue-400')}
                >
                    {message}
                </div>
            )}

            {/* 残り試行回数 */}
            <div className="mt-4 flex justify-between items-center">
                <span className="text-gray-600">
                    残り試行回数:{' '}
                    <span
                        className={'font-bold ' +
                            (attemptsRemaining <= 1 ? 'text-red-600' : 'text-gray-800')}
                    >
                        {attemptsRemaining}回
                    </span>
                </span>
                <button
                    onClick={generateCaptcha}
                    disabled={isLoading || isVerifying}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    別の画像を生成
                </button>
            </div>
        </div>
    )
}

export default CaptchaInput
