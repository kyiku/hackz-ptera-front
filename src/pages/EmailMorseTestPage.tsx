/**
 * EmailMorseTestPage - メールモールス入力テストページ
 * Issue #38のテスト用
 */
import { EmailMorseInput } from '../components/register/email/EmailMorseInput'

const EmailMorseTestPage = () => {
    const handleSubmit = (email: string) => {
        console.log('入力されたメールアドレス:', email)
        alert(`入力されたメールアドレス: ${email}`)
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">瞬き検出テスト</h1>
                <p className="text-gray-400 mb-8">
                    カメラで瞬きしてモールス信号を入力してみよう！
                </p>

                <EmailMorseInput
                    enableCamera={true}
                    onSubmit={handleSubmit}
                />
            </div>
        </div>
    )
}

export default EmailMorseTestPage
