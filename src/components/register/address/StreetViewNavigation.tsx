/**
 * StreetViewNavigation - Google Maps ストリートビューナビゲーション
 * Issue #34: 住所入力 - ストリートビュー風ナビゲーション
 *
 * 機能:
 * - Google Maps Street View APIを使用
 * - LEXUS GARDEN 箱崎タワーズ EASTからスタート
 * - 実際のストリートビューで移動
 * - 「ここが住所です」ボタンで現在地を住所として確定
 */

import { useState, useEffect, useCallback, useRef } from 'react'

// Google Maps 型定義
declare global {
    interface Window {
        google: typeof google
    }
}

declare namespace google {
    namespace maps {
        class StreetViewPanorama {
            constructor(container: HTMLElement, options?: StreetViewPanoramaOptions)
            getPosition(): LatLng | null
            setPosition(position: LatLng | LatLngLiteral): void
            addListener(event: string, handler: () => void): void
        }
        class StreetViewService {
            getPanorama(
                request: StreetViewLocationRequest,
                callback: (data: StreetViewPanoramaData | null, status: StreetViewStatus) => void
            ): void
        }
        class Geocoder {
            geocode(
                request: GeocoderRequest,
                callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
            ): void
        }
        class LatLng {
            lat(): number
            lng(): number
        }
        interface LatLngLiteral {
            lat: number
            lng: number
        }
        interface StreetViewPanoramaOptions {
            position?: LatLng | LatLngLiteral
            pov?: { heading: number; pitch: number }
            zoom?: number
            addressControl?: boolean
            showRoadLabels?: boolean
            zoomControl?: boolean
            panControl?: boolean
            linksControl?: boolean
            fullscreenControl?: boolean
        }
        interface StreetViewLocationRequest {
            location: LatLngLiteral
            radius: number
            preference?: StreetViewPreference
        }
        interface StreetViewPanoramaData {
            location?: {
                latLng?: LatLng
            }
        }
        interface GeocoderRequest {
            location: LatLng
        }
        interface GeocoderResult {
            formatted_address: string
        }
        enum StreetViewStatus {
            OK = 'OK',
        }
        enum StreetViewPreference {
            NEAREST = 'nearest',
        }
        enum GeocoderStatus {
            OK = 'OK',
        }
        namespace event {
            function clearInstanceListeners(instance: object): void
        }
    }
}

export interface StreetViewNavigationProps {
    /** 選択された住所 */
    value?: string | null
    /** 住所選択時のコールバック */
    onChange?: (address: string) => void
    /** 住所確定時のコールバック */
    onConfirm?: (address: string) => void
    /** 無効化されているか */
    disabled?: boolean
    /** カスタムクラス名 */
    className?: string
}

// LEXUS GARDEN 箱崎タワーズ EAST
const START_LOCATION = {
    lat: 33.6362811,
    lng: 130.4215023,
}

/**
 * ストリートビューナビゲーションコンポーネント
 */
export const StreetViewNavigation = ({
    value,
    onChange,
    onConfirm,
    disabled = false,
    className = '',
}: StreetViewNavigationProps) => {
    const streetViewRef = useRef<HTMLDivElement>(null)
    const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null)
    const geocoderRef = useRef<google.maps.Geocoder | null>(null)

    const [currentAddress, setCurrentAddress] = useState<string>(value || '')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Google Maps APIの読み込み
    useEffect(() => {
        const loadGoogleMaps = () => {
            // 既にロード済みの場合
            if (window.google?.maps) {
                initStreetView()
                return
            }

            // スクリプトが既にあるか確認
            const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
            if (existingScript) {
                existingScript.addEventListener('load', initStreetView)
                return
            }

            // Google Maps APIをロード
            const script = document.createElement('script')
            script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`
            script.async = true
            script.defer = true
            script.onload = initStreetView
            script.onerror = () => {
                setError('Google Maps APIの読み込みに失敗しました')
                setIsLoading(false)
            }
            document.head.appendChild(script)
        }

        const initStreetView = () => {
            if (!streetViewRef.current || !window.google?.maps) {
                setError('Street View の初期化に失敗しました')
                setIsLoading(false)
                return
            }

            try {
                // StreetViewServiceで近くのパノラマを検索
                const streetViewService = new google.maps.StreetViewService()

                streetViewService.getPanorama(
                    {
                        location: START_LOCATION,
                        radius: 100,
                        preference: google.maps.StreetViewPreference.NEAREST,
                    },
                    (data, status) => {
                        if (status === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
                            // パノラマを作成
                            panoramaRef.current = new google.maps.StreetViewPanorama(
                                streetViewRef.current!,
                                {
                                    position: data.location.latLng,
                                    pov: { heading: 0, pitch: 0 },
                                    zoom: 1,
                                    addressControl: false,
                                    showRoadLabels: true,
                                    zoomControl: true,
                                    panControl: true,
                                    linksControl: true,
                                    fullscreenControl: false,
                                }
                            )

                            // Geocoderを初期化
                            geocoderRef.current = new google.maps.Geocoder()

                            // 初期住所を取得
                            updateAddress(data.location.latLng)

                            // 位置変更時のリスナー
                            panoramaRef.current.addListener('position_changed', () => {
                                const pos = panoramaRef.current?.getPosition()
                                if (pos) {
                                    updateAddress(pos)
                                }
                            })

                            setIsLoading(false)
                        } else {
                            setError('この場所のストリートビューは利用できません')
                            setIsLoading(false)
                        }
                    }
                )
            } catch (err) {
                setError('Street View の初期化中にエラーが発生しました')
                setIsLoading(false)
            }
        }

        loadGoogleMaps()

        return () => {
            // クリーンアップ
            if (panoramaRef.current) {
                google.maps.event.clearInstanceListeners(panoramaRef.current)
            }
        }
    }, [])

    // 住所を更新
    const updateAddress = useCallback((position: google.maps.LatLng) => {
        if (!geocoderRef.current) return

        geocoderRef.current.geocode({ location: position }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
                const address = results[0].formatted_address
                setCurrentAddress(address)
                onChange?.(address)
            }
        })
    }, [onChange])

    // 住所確定
    const handleConfirm = useCallback(() => {
        if (disabled || !currentAddress) return
        onConfirm?.(currentAddress)
    }, [disabled, currentAddress, onConfirm])

    // スタート地点に戻る
    const handleReset = useCallback(() => {
        if (disabled || !panoramaRef.current) return

        const streetViewService = new google.maps.StreetViewService()
        streetViewService.getPanorama(
            {
                location: START_LOCATION,
                radius: 100,
                preference: google.maps.StreetViewPreference.NEAREST,
            },
            (data, status) => {
                if (status === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
                    panoramaRef.current?.setPosition(data.location.latLng)
                }
            }
        )
    }, [disabled])

    return (
        <div className={`${className}`} data-testid="street-view-navigation">
            {/* 現在の住所表示 */}
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-500 mb-1">現在の住所</p>
                <p className="text-lg font-medium text-gray-800">
                    {currentAddress || '読み込み中...'}
                </p>
            </div>

            {/* ストリートビュー */}
            <div className="relative rounded-lg overflow-hidden border border-gray-300 mb-4">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                        <div className="text-center">
                            <div className="w-10 h-10 border-2 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-gray-600">読み込み中...</p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                        <div className="text-center text-red-600">
                            <p>{error}</p>
                        </div>
                    </div>
                )}
                <div
                    ref={streetViewRef}
                    className="w-full h-[400px]"
                    data-testid="street-view-container"
                />
            </div>

            {/* 操作説明 */}
            <div className="text-center text-sm text-gray-500 mb-4">
                <p>ストリートビュー内でドラッグして方向を変更</p>
                <p>矢印をクリックして移動してください</p>
            </div>

            {/* ボタン */}
            <div className="flex flex-col gap-3">
                {/* 住所確定ボタン */}
                <button
                    data-testid="confirm-address-button"
                    onClick={handleConfirm}
                    disabled={disabled || !currentAddress || isLoading}
                    className={`
                        w-full px-6 py-4 text-lg font-medium rounded-lg transition-colors
                        ${disabled || !currentAddress || isLoading
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-800 hover:bg-gray-700 text-white'
                        }
                    `}
                    type="button"
                >
                    ここが住所です
                </button>

                {/* リセットボタン */}
                <button
                    data-testid="reset-button"
                    onClick={handleReset}
                    disabled={disabled || isLoading}
                    className={`
                        w-full px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg
                        transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500
                        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    type="button"
                >
                    スタート地点に戻る
                </button>
            </div>
        </div>
    )
}

export default StreetViewNavigation
