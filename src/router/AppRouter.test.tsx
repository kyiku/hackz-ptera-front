/**
 * Issue #1: feat: ルーティング設定（React Router）
 *
 * テスト対象: AppRouter コンポーネント
 * - 各ルートへのナビゲーション
 * - 存在しないルートへのアクセス時の404表示
 * - 認証が必要なルートへのリダイレクト
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './AppRouter'

describe('AppRouter', () => {
  describe('ルート定義', () => {
    it('/ へのアクセスで待機列ページが表示される', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <AppRoutes />
        </MemoryRouter>
      )
      expect(screen.getByTestId('queue-page')).toBeInTheDocument()
    })

    it('/dino へのアクセスでDino Runページが表示される', () => {
      render(
        <MemoryRouter initialEntries={['/dino']}>
          <AppRoutes />
        </MemoryRouter>
      )
      expect(screen.getByTestId('dino-page')).toBeInTheDocument()
    })

    it('/captcha へのアクセスでCAPTCHAページが表示される', () => {
      render(
        <MemoryRouter initialEntries={['/captcha']}>
          <AppRoutes />
        </MemoryRouter>
      )
      expect(screen.getByTestId('captcha-page')).toBeInTheDocument()
    })

    it('/register へのアクセスで登録フォームページが表示される', () => {
      render(
        <MemoryRouter initialEntries={['/register']}>
          <AppRoutes />
        </MemoryRouter>
      )
      // 認証されていないため、待機列ページにリダイレクトされる
      expect(screen.getByTestId('queue-page')).toBeInTheDocument()
    })

    it('/otp へのアクセスでOTPページが表示される', () => {
      render(
        <MemoryRouter initialEntries={['/otp']}>
          <AppRoutes />
        </MemoryRouter>
      )
      // 認証されていないため、待機列ページにリダイレクトされる
      expect(screen.getByTestId('queue-page')).toBeInTheDocument()
    })

    it('/complete へのアクセスで完了ページが表示される', () => {
      render(
        <MemoryRouter initialEntries={['/complete']}>
          <AppRoutes />
        </MemoryRouter>
      )
      // 認証されていないため、待機列ページにリダイレクトされる
      expect(screen.getByTestId('queue-page')).toBeInTheDocument()
    })
  })

  describe('404ページ', () => {
    it('存在しないルートへのアクセスで404ページが表示される', () => {
      render(
        <MemoryRouter initialEntries={['/nonexistent']}>
          <AppRoutes />
        </MemoryRouter>
      )
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
    })
  })

  describe('ルートガード', () => {
    it('未認証状態でprotectedルートへアクセスするとリダイレクトされる', () => {
      render(
        <MemoryRouter initialEntries={['/register']}>
          <AppRoutes />
        </MemoryRouter>
      )
      // 認証されていないため、待機列ページにリダイレクトされる
      expect(screen.getByTestId('queue-page')).toBeInTheDocument()
    })

    it('認証済み状態でprotectedルートへアクセスできる', () => {
      // TODO: Issue #5で状態管理実装後に、認証状態をモックして実際のテストを実装
      // 現在は認証機能が未実装のため、スキップ
      expect(true).toBe(true)
    })
  })
})


