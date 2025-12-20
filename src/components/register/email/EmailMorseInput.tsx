/**
 * EmailMorseInput - メールアドレス入力（モールス信号）
 * Issue #38: メールアドレス入力 - 瞬きモールス信号UI
 * 
 * 機能:
 * - モールス信号でメールアドレスを入力
 * - カメラプレビュー機能
 * - モールス信号ヘルプ表示
 */

import React, { useState } from 'react'
import { MorseDecoder } from './MorseDecoder'
import { useCamera } from '../../../hooks/useCamera'
import { useBlinkDetector } from '../../../hooks/useBlinkDetector'
import type { BlinkEvent } from '../../../hooks/useBlinkDetector'

export interface EmailMorseInputProps {
    /** 入力完了時のコールバック */
    onSubmit?: (email: string) => void
    /** 初期値 */
    defaultValue?: string
    /** カメラ機能を有効にするか */
    enableCamera?: boolean
}

export const EmailMorseInput: React.FC<EmailMorseInputProps> = ({
    onSubmit,
    defaultValue = '',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    enableCamera: _enableCamera = false,
}) => {
    const [currentMorse, setCurrentMorse] = useState('')
    const [email, setEmail] = useState(defaultValue)
    const [showHelp, setShowHelp] = useState(false)
    const [useBlinkMode, setUseBlinkMode] = useState(false)

    // カメラ機能
    const { videoRef, isActive, error: cameraError, start, stop } = useCamera()

    // 瞬き検出機能
    const {
        isDetecting,
        error: blinkError,
        start: startBlinkDetection,
        stop: stopBlinkDetection,
        currentEAR,
        isBlinking,
        isCalibrating,
        startCalibration,
        calibrationStatus,
        currentThreshold,
    } = useBlinkDetector({
        videoRef,
        onBlinkDetected: (event: BlinkEvent) => {
            // 瞬き検出時のハンドラ
            if (event.type === 'dot') {
                setCurrentMorse((prev) => prev + '.')
            } else {
                setCurrentMorse((prev) => prev + '-')
            }
        },
        onCharacterComplete: () => {
            // 文字確定時のハンドラ
            handleSpace()
        },
        earThreshold: 0.38, // ユーザー要望により調整 (default: 0.2 -> 0.38)
        debug: true,
    })

    const handleDot = () => {
        setCurrentMorse((prev) => prev + '.')
    }

    const handleDash = () => {
        setCurrentMorse((prev) => prev + '-')
    }

    const handleSpace = () => {
        if (currentMorse) {
            const char = MorseDecoder.decode(currentMorse)
            if (char) {
                setEmail((prev) => prev + char)
            }
            setCurrentMorse('')
        }
    }

    const handleBackspace = () => {
        if (currentMorse) {
            setCurrentMorse((prev) => prev.slice(0, -1))
        } else {
            setEmail((prev) => prev.slice(0, -1))
        }
    }

    const handleSubmit = () => {
        if (onSubmit && email) {
            onSubmit(email)
        }
    }

    const handleClear = () => {
        setCurrentMorse('')
        setEmail('')
    }

    return (
        <div className="max-w-2xl mx-auto p-6" data-testid="email-morse-input">
            <h2 className="text-2xl font-bold mb-4">メールアドレス入力</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                モールス信号でメールアドレスを入力してください
            </p>

            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-semibold">カメラプレビュー</div>
                    <div className="flex gap-2">
                        {/* キャリブレーションボタン */}
                        {isActive && (
                            <button
                                onClick={() => {
                                    if (isCalibrating) {
                                        stopBlinkDetection() // 停止
                                    } else {
                                        startCalibration()
                                        // 強制的にBlinkModeにする
                                        if (!useBlinkMode) {
                                            setUseBlinkMode(true)
                                            startBlinkDetection()
                                        }
                                    }
                                }}
                                className={`px-3 py-1 text-xs rounded ${isCalibrating
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-indigo-500 text-white'
                                    }`}
                                disabled={!isActive}
                            >
                                {isCalibrating ? '計測中止' : '感度調整'}
                            </button>
                        )}

                        {/* モード切替ボタン */}
                        <button
                            onClick={() => {
                                const newMode = !useBlinkMode
                                setUseBlinkMode(newMode)
                                if (newMode && isActive) {
                                    startBlinkDetection()
                                } else {
                                    stopBlinkDetection()
                                }
                            }}
                            className={`px-3 py-1 text-xs rounded ${useBlinkMode
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-600 text-white'
                                } ${!isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                            data-testid="blink-mode-toggle"
                            disabled={!isActive}
                            title={!isActive ? 'カメラを起動してください' : ''}
                        >
                            {useBlinkMode ? '瞬き検出ON' : '手動入力'}
                        </button>

                        {!isActive ? (
                            <button
                                onClick={async () => {
                                    await start()
                                    if (useBlinkMode) {
                                        await startBlinkDetection()
                                    }
                                }}
                                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                                data-testid="camera-start-button"
                            >
                                カメラ起動
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    stop()
                                    stopBlinkDetection()
                                }}
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                data-testid="camera-stop-button"
                            >
                                カメラ停止
                            </button>
                        )}
                    </div>
                </div>

                <div className="relative bg-black rounded overflow-hidden" style={{ aspectRatio: '4/3' }}>
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        data-testid="camera-video"
                        playsInline
                        muted
                    />
                    {!isActive && (
                        <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-800">
                            {cameraError ? (
                                <div className="text-center p-4">
                                    <div className="text-red-400 mb-2 text-4xl">!</div>
                                    <div className="text-sm">{cameraError}</div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="mb-2 text-6xl">[ ]</div>
                                    <div className="text-sm">カメラ起動ボタンを押してください</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 瞬き検出インジケーター */}
                    {isActive && (
                        <div className="absolute top-2 left-2 right-2">
                            {/* キャリブレーション中の表示 */}
                            {isCalibrating && (
                                <div className="bg-yellow-500 bg-opacity-90 rounded p-4 text-white text-center mb-2 animate-pulse">
                                    <div className="font-bold text-lg mb-1">感度調整中</div>
                                    <div>{calibrationStatus}</div>
                                </div>
                            )}

                            {/* 検出状態表示 */}
                            {useBlinkMode && isDetecting && !isCalibrating && (
                                <div className="bg-black bg-opacity-70 rounded p-2 text-white text-xs flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${isBlinking ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-green-500'}`} />
                                        <span className="font-bold font-mono">{isBlinking ? 'BLINK!' : 'OPEN'}</span>
                                    </div>
                                    <div className="text-right font-mono text-[10px]">
                                        <div>EAR: {currentEAR.toFixed(3)}</div>
                                        <div className="text-gray-400">TH : {currentThreshold.toFixed(3)}</div>
                                    </div>
                                </div>
                            )}

                            {/* エラー表示 */}
                            {blinkError && (
                                <div className="bg-red-500 bg-opacity-90 rounded p-2 text-white text-xs mt-2">
                                    {blinkError}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                    {useBlinkMode
                        ? '短く瞬きで「・」、長く瞬きで「−」が入力されます。反応が悪い場合は「感度調整」を試してください。'
                        : '※ 瞬き検出を有効にするには「瞬き検出ON」ボタンを押してください'}
                </p>
            </div>
            {/* 入力中のモールス信号 */}
            <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    入力中のモールス信号:
                </div>
                <div
                    className="text-2xl font-mono min-h-[40px]"
                    data-testid="current-morse"
                >
                    {currentMorse || <span className="text-gray-400">（なし）</span>}
                </div>
            </div>

            {/* 変換結果 */}
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    入力結果:
                </div>
                <div
                    className="text-xl font-mono min-h-[32px]"
                    data-testid="email-result"
                >
                    {email || <span className="text-gray-400">（なし）</span>}
                </div>
            </div>

            {/* 入力ボタン */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                    onClick={handleDot}
                    className="px-6 py-4 bg-blue-500 text-white rounded hover:bg-blue-600 text-xl font-bold"
                    data-testid="dot-button"
                >
                    ・（ドット）
                </button>
                <button
                    onClick={handleDash}
                    className="px-6 py-4 bg-blue-500 text-white rounded hover:bg-blue-600 text-xl font-bold"
                    data-testid="dash-button"
                >
                    −（ダッシュ）
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                    onClick={handleSpace}
                    className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
                    data-testid="space-button"
                >
                    文字確定（スペース）
                </button>
                <button
                    onClick={handleBackspace}
                    className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600"
                    data-testid="backspace-button"
                >
                    削除
                </button>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    data-testid="help-button"
                >
                    {showHelp ? 'ヘルプを閉じる' : 'モールス表を見る'}
                </button>
                <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    data-testid="clear-button"
                >
                    クリア
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!email}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    data-testid="submit-button"
                >
                    確定する
                </button>
            </div>

            {/* モールス信号ヘルプ */}
            {
                showHelp && (
                    <div
                        className="p-4 bg-gray-100 dark:bg-gray-800 rounded"
                        data-testid="morse-help"
                    >
                        <h3 className="font-bold mb-2">モールス信号対応表</h3>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>a: ・−</div>
                            <div>b: −・・・</div>
                            <div>c: −・−・</div>
                            <div>d: −・・</div>
                            <div>e: ・</div>
                            <div>f: ・・−・</div>
                            <div>g: −−・</div>
                            <div>h: ・・・・</div>
                            <div>i: ・・</div>
                            <div>j: ・−−−</div>
                            <div>k: −・−</div>
                            <div>l: ・−・・</div>
                            <div>m: −−</div>
                            <div>n: −・</div>
                            <div>o: −−−</div>
                            <div>p: ・−−・</div>
                            <div>q: −−・−</div>
                            <div>r: ・−・</div>
                            <div>s: ・・・</div>
                            <div>t: −</div>
                            <div>u: ・・−</div>
                            <div>v: ・・・−</div>
                            <div>w: ・−−</div>
                            <div>x: −・・−</div>
                            <div>y: −・−−</div>
                            <div>z: −−・・</div>
                            <div>@: ・−−・−・</div>
                            <div>.: ・−・−・−</div>
                            <div>0-9: 標準</div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}

export default EmailMorseInput
