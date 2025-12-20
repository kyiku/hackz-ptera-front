/**
 * 登録完了ページ
 * Issue #24: 登録完了処理（サーバーエラー演出）
 *
 * 鬼畜仕様: すべてのバリデーションが成功しても、必ずサーバーエラーが返る。
 * 永遠に登録は完了しない。
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/common/Layout'
import { submitRegistration, type RegisterRequest } from '../api/registerApi'

const CompletePage = () => {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    // ページマウント時に自動的に登録APIを呼び出す
    const handleRegistration = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        // TODO: 実際の実装では、状態管理から登録データを取得
        const registrationData: RegisterRequest = {
          token: 'dummy-token', // TODO: 実際のトークンを取得
          email: 'test@example.com',
          password: 'dummy-password',
        }

        const response = await submitRegistration(registrationData)

        // 鬼畜仕様: 必ずエラーが返る
        setErrorMessage(response.message)
        setCountdown(response.redirect_delay)

        // リダイレクトカウントダウン
        let remaining = response.redirect_delay
        const countdownInterval = setInterval(() => {
          remaining -= 1
          setCountdown(remaining)

          if (remaining <= 0) {
            clearInterval(countdownInterval)
            navigate('/', { replace: true })
          }
        }, 1000)
      } catch (error) {
        setErrorMessage('登録処理中にエラーが発生しました')
        console.error('Registration error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    handleRegistration()
  }, [navigate])

  return (
    <Layout>
      <div
        data-testid="complete-page"
        className="min-h-screen bg-gray-900 text-white flex items-center justify-center py-8 px-4"
      >
        <div className="max-w-2xl mx-auto text-center">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <h1 className="text-3xl font-bold mb-4">登録処理中...</h1>
              <p className="text-gray-400">しばらくお待ちください</p>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-4xl font-bold mb-4 text-red-500">
                  サーバーエラー
                </h1>
              </div>

              <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-6 mb-6">
                <p className="text-red-400 font-semibold text-lg mb-4">
                  {errorMessage ||
                    'サーバーエラーが発生しました。お手数ですが最初からやり直してください。'}
                </p>

                {countdown !== null && countdown > 0 && (
                  <p className="text-gray-300">
                    {countdown}秒後に待機列の最後尾へ戻ります...
                  </p>
                )}
              </div>

              <p className="text-gray-400 text-sm">
                ※ すべてのバリデーションが成功しても、必ずサーバーエラーが返ります。
                <br />
                永遠に登録は完了しません。
              </p>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default CompletePage

