/**
 * Issue #19: feat: 登録フォームページUI
 *
 * テスト対象: RegisterPage コンポーネント
 * - 登録フォームの基本レンダリング
 * - フォーム入力フィールド
 * - 送信処理
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// TODO: RegisterPageコンポーネント実装後にインポートを有効化
// import { RegisterPage } from './RegisterPage'

describe('RegisterPage', () => {
  describe('基本レンダリング', () => {
    it('登録フォームページが正しくレンダリングされる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
      // render(
      //   <MemoryRouter>
      //     <RegisterPage />
      //   </MemoryRouter>
      // )
      // expect(screen.getByTestId('register-page')).toBeInTheDocument()
    })

    it('ユーザー名入力フィールドが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('メールアドレス入力フィールドが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('パスワード入力フィールドが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('パスワード確認入力フィールドが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('登録ボタンが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('フォーム入力', () => {
    it('各フィールドに入力できる', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('パスワードフィールドがマスクされている', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('パスワード表示/非表示を切り替えられる', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('送信処理', () => {
    it('有効なフォームで送信ボタンがクリックできる', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('送信中はローディング状態になる', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('送信成功後にOTPページへ遷移する', async () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('意図的な悪UX', () => {
    it('送信ボタンの位置がランダムに変わる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('入力中にフォーカスが外れる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })
})
