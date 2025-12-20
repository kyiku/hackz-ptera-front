/**
 * Issue #35: feat: 利用規約 - 音声認識読み上げ・検証
 *
 * テスト対象: RegisterTermsPage コンポーネント
 * - ページの基本レンダリング
 * - 音声認識検証とタスク完了
 * - ダッシュボードへの戻り
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegisterTermsPage from './RegisterTermsPage'
import { useRegistrationStore } from '../store/registrationStore'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

// SpeechRecognitionをモック
const mockRecognition = {
    lang: 'ja-JP',
    continuous: true,
    interimResults: true,
    start: vi.fn(),
    stop: vi.fn(),
    onstart: null,
    onresult: null,
    onerror: null,
    onend: null,
}

vi.stubGlobal('SpeechRecognition', vi.fn(() => mockRecognition))
vi.stubGlobal('webkitSpeechRecognition', vi.fn(() => mockRecognition))

// SpeechRecognitionをモック
class MockSpeechRecognition {
    lang = 'ja-JP'
    continuous = true
    interimResults = true
    start = vi.fn()
    stop = vi.fn()
    onstart: ((event: Event) => void) | null = null
    onresult: ((event: SpeechRecognitionEvent) => void) | null = null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null = null
    onend: (() => void) | null = null
}

vi.stubGlobal('SpeechRecognition', MockSpeechRecognition)
vi.stubGlobal('webkitSpeechRecognition', MockSpeechRecognition)

describe('RegisterTermsPage', () => {
    beforeEach(() => {
        mockNavigate.mockClear()
        useRegistrationStore.getState().resetAllTasks()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    describe('基本レンダリング', () => {
        it('利用規約ページが表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterTermsPage />
                </MemoryRouter>
            )
            expect(screen.getByTestId('register-terms-page')).toBeInTheDocument()
        })

        it('タイトルが表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterTermsPage />
                </MemoryRouter>
            )
            expect(screen.getByText('利用規約')).toBeInTheDocument()
        })

        it('音声認識コンポーネントが表示される', () => {
            render(
                <MemoryRouter>
                    <RegisterTermsPage />
                </MemoryRouter>
            )
            expect(screen.getByTestId('voice-recognition-terms')).toBeInTheDocument()
        })
    })
})

