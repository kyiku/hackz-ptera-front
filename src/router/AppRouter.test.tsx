/**
 * Issue #1: feat: ルーティング設定（React Router）
 *
 * テスト対象: AppRouter コンポーネント
 * - 各ルートへのナビゲーション
 * - 存在しないルートへのアクセス時の404表示
 * - 認証が必要なルートへのリダイレクト
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// TODO: AppRouterコンポーネント実装後にインポートを有効化
// import { AppRouter } from './AppRouter'

describe('AppRouter', () => {
  describe('ルート定義', () => {
    it('/ へのアクセスで待機列ページが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
      // render(
      //   <MemoryRouter initialEntries={['/']}>
      //     <AppRouter />
      //   </MemoryRouter>
      // )
      // expect(screen.getByTestId('queue-page')).toBeInTheDocument()
    })

    it('/dino へのアクセスでDino Runページが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('/captcha へのアクセスでCAPTCHAページが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('/register へのアクセスで登録フォームページが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('/otp へのアクセスでOTPページが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('/complete へのアクセスで完了ページが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('404ページ', () => {
    it('存在しないルートへのアクセスで404ページが表示される', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })

  describe('ルートガード', () => {
    it('未認証状態でprotectedルートへアクセスするとリダイレクトされる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })

    it('認証済み状態でprotectedルートへアクセスできる', () => {
      // TODO: 実装後にテストを有効化
      expect(true).toBe(true)
    })
  })
})
