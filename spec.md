# フロントエンド開発仕様書：The Frustrating Registration Form v1

## 1. プロジェクト概要

「意図的に不便なUX」をコンセプトにしたハッカソンプロジェクトのフロントエンド。
ユーザーは会員登録するために、数々の理不尽な関門を突破しなければならない。

**鬼畜仕様:** すべての関門をクリアしても、最後に「サーバーエラー」で登録は永遠に完了しない。

## 2. 技術スタック

* **ビルドツール:** Vite
* **フレームワーク:** React 19
* **言語:** TypeScript
* **スタイリング:** Tailwind CSS v4
* **ルーティング:** React Router
* **テスト:** Vitest + React Testing Library

---

## 3. ユーザーフロー

### 3.1 全体フロー

```
┌─────────────────┐
│  サイトアクセス  │
└────────┬────────┘
         ▼
┌─────────────────┐
│   待機列表示    │ ← WebSocket接続
└────────┬────────┘
         ▼
┌─────────────────┐
│    Dino Run     │ ← アクションゲーム（激ムズ）
└────────┬────────┘
         │
    ┌────┴────┐
    │成功     │失敗 → 待機列の最後尾へ
    ▼
┌─────────────────┐
│ 登録ダッシュボード│ ← ハブ＆スポーク形式（8タスク）
└────────┬────────┘
         │ 全タスク完了 + 登録ボタン押下
         ▼
┌─────────────────┐
│  登録失敗       │ ← サーバーエラー演出（永遠に完了しない）
└─────────────────┘
```

### 3.2 登録ダッシュボード（ハブ＆スポーク形式）

登録フォームは**ハブ＆スポーク形式**を採用。中央のダッシュボード（ハブ）から各入力画面（スポーク）に遷移し、完了後にダッシュボードへ戻る。

```
┌─────────────────────────────────────┐
│         登録ダッシュボード            │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐│
│  │ ⚪︎ 名前  │  │ ❌ 生年月日│  │ ❌ 電話  ││
│  └─────────┘  └─────────┘  └─────────┘│
│                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐│
│  │ ❌ 住所  │  │ ❌ メール │  │ ❌ 利用規約││
│  └─────────┘  └─────────┘  └─────────┘│
│                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐│
│  │ ❌ パスワード│ │ ❌ CAPTCHA│  │ ❌ OTP  ││
│  └─────────┘  └─────────┘  └─────────┘│
│                                     │
│  ┌─────────────────────────────┐    │
│  │      登録する（disabled）     │    │
│  └─────────────────────────────┘    │
│  ※全タスク完了で有効化              │
└─────────────────────────────────────┘
```

**仕様:**
- タスクの実行順序は**自由**（どのカードからでもクリック可能）
- 各タスク完了で ⚪︎、未完了で ❌ を表示
- 全9タスクが ⚪︎ になると「登録する」ボタンが有効化
- 登録ボタン押下 → サーバーエラー演出へ

**9つのタスク:**
| ID | タスク名 | 入力画面 |
|----|---------|---------|
| name | 名前 | スロットマシンUI |
| birthday | 生年月日 | 横スクロールバー |
| phone | 電話番号 | 黒電話ダイヤルUI |
| address | 住所 | ストリートビュー風 |
| email | メールアドレス | 瞬きモールス信号UI |
| terms | 利用規約 | 音声認識読み上げ |
| password | パスワード | AI煽り付き入力 |
| captcha | CAPTCHA | ウォーリーを探せ風 |
| otp | OTP | 魚画像名前当て |

---

## 4. 画面仕様

### 4.1 待機列ページ

| 項目 | 内容 |
|------|------|
| **URL** | `/` または `/queue` |
| **機能** | 待機人数表示、自分の順位表示 |
| **通信** | WebSocket |
| **遷移条件** | 順番が来たらDino Runページへ自動遷移 |

### 4.2 Dino Runページ

| 項目 | 内容 |
|------|------|
| **URL** | `/dino` |
| **機能** | Chrome恐竜ゲーム風アクションゲーム |
| **操作** | スペースキーでジャンプ |
| **タイムアウト** | 3分 |
| **クリア条件** | 一定時間生存 |

### 4.3 名前入力ページ

| 項目 | 内容 |
|------|------|
| **URL** | `/register/name` |
| **UI** | スロットマシン式 |
| **仕様** | あ〜Z（ひらがな・カタカナ・アルファベット）がスロットで回転 |
| **操作** | ストップボタンで文字を確定 |

### 4.4 生年月日入力ページ

| 項目 | 内容 |
|------|------|
| **URL** | `/register/birthday` |
| **UI** | 横スクロールバー |
| **範囲** | 1年1月1日 〜 2025年12月21日 |
| **備考** | 閏年は考慮しない |

### 4.5 電話番号入力ページ

| 項目 | 内容 |
|------|------|
| **URL** | `/register/phone` |
| **UI** | 黒電話（ダイヤル式）UI |
| **操作** | ダイヤルを回して数字を入力 |

### 4.6 住所入力ページ

| 項目 | 内容 |
|------|------|
| **URL** | `/register/address` |
| **UI** | ストリートビュー風ナビゲーション |
| **スタート地点** | ハックツオフィス |
| **操作** | 自分の家まで歩いて移動 |

### 4.7 メールアドレス入力ページ

| 項目 | 内容 |
|------|------|
| **URL** | `/register/email` |
| **UI** | カメラ + 瞬き検出 + モールス信号入力 |
| **操作** | 瞬きでモールス信号を入力（短い瞬き=・、長い瞬き=−） |
| **技術** | TensorFlow.js / MediaPipe で瞬き検出 |

### 4.8 利用規約ページ

| 項目 | 内容 |
|------|------|
| **URL** | `/register/terms` |
| **UI** | 利用規約テキスト + 音声認識 |
| **操作** | ユーザーが利用規約を声に出して読み上げる |
| **検証** | 音声認識で内容を検証、間違えたらやり直し |

### 4.9 パスワード入力ページ

| 項目 | 内容 |
|------|------|
| **URL** | `/register/password` |
| **UI** | パスワード入力フォーム |
| **機能1** | リアルタイムでパスワードを音声読み上げ |
| **機能2** | AI（Bedrock）がパスワードを解析し煽りメッセージを表示 |

### 4.10 CAPTCHAページ

| 項目 | 内容 |
|------|------|
| **URL** | `/captcha` |
| **UI** | ウォーリーを探せ風画像 |
| **ターゲット** | ハックちゅう（オリジナルキャラクター） |
| **タイムアウト** | 3分 |
| **試行回数** | 3回まで |

### 4.11 OTPページ

| 項目 | 内容 |
|------|------|
| **URL** | `/otp` |
| **UI** | 魚画像表示 + 名前入力 |
| **フロー** | 魚画像表示 → 魚の名前を入力 |
| **試行回数** | 3回まで |

### 4.12 登録失敗ページ

| 項目 | 内容 |
|------|------|
| **URL** | `/register/complete` |
| **表示** | サーバーエラー演出 |
| **動作** | 3秒後にトップページへリダイレクト |

---

## 5. 全体UI/UX要件

### 5.1 スクロール挙動

| 項目 | 内容 |
|------|------|
| **慣性スクロール** | 無効化 |
| **スクロール速度** | 重め（通常より遅く） |
| **適用範囲** | 全ページ |

### 5.2 戻るボタン無効化

* ゲーム中（Dino Run、CAPTCHA）に「戻る」を押したら、即座にトップページ（待機列）へ飛ばす
* APIは叩かない

### 5.3 恐怖の演出

* 第2関門（CAPTCHA）の説明文に、赤文字で **「※失敗すると待機列の最後尾に戻ります」** と小さく表示

### 5.4 失敗時の自動リダイレクト

* `redirect_delay` が含まれるレスポンスを受け取ったら、指定秒数後にトップページへリダイレクト

### 5.5 ローディングスピナー

* API通信中はローディングスピナーを表示

### 5.6 失敗時モーダル

* 失敗時はモーダルでメッセージを表示してからリダイレクト

---

## 6. API連携

バックエンドAPIの詳細は `../back/spec.md` を参照。

### 主要エンドポイント

| エンドポイント | メソッド | 用途 |
|---------------|---------|------|
| `/ws` | WebSocket | 待機列接続 |
| `/api/game/dino/result` | POST | Dino Runゲーム結果送信 |
| `/api/captcha/generate` | GET | CAPTCHA画像生成 |
| `/api/captcha/verify` | POST | CAPTCHA検証 |
| `/api/password/analyze` | POST | AIパスワード煽り |
| `/api/otp/send` | POST | OTP魚画像取得 |
| `/api/otp/verify` | POST | OTP検証 |
| `/api/register` | POST | 会員登録（必ず失敗） |

---

## 7. 状態管理

### 7.1 概要

状態管理には **Zustand** を採用。軽量でTypeScriptとの相性が良い。

状態は責務ごとに**3つのストア**に分離:

```
┌─────────────────────────────────────────────────────────┐
│                    状態管理アーキテクチャ                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  sessionStore   │  │      registrationStore      │  │
│  │  ─────────────  │  │  ─────────────────────────  │  │
│  │  • sessionId    │  │  • tasks (8つの完了状態)     │  │
│  │  • status       │  │  • formData (入力データ)    │  │
│  │  • queuePosition│  │  • isAllCompleted           │  │
│  │  • registerToken│  │  • completedCount           │  │
│  └─────────────────┘  └─────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │                   uiStore                        │    │
│  │  ───────────────────────────────────────────    │    │
│  │  • isLoading • modalState • errorMessage        │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Session Store（セッション管理）

```typescript
// ステータス定義
type UserStatus =
  | 'idle'           // 初期状態
  | 'waiting'        // 待機列で待機中
  | 'stage1_dino'    // Dino Runプレイ中
  | 'registering'    // 登録フォーム入力中（ダッシュボード）

// 状態の型
interface SessionState {
  sessionId: string | null
  status: UserStatus
  queuePosition: number | null
  registerToken: string | null
  tokenExpiresAt: Date | null
}

// アクション
interface SessionActions {
  setSession: (sessionId: string) => void
  setStatus: (status: UserStatus) => void
  setQueuePosition: (position: number) => void
  setRegisterToken: (token: string, expiresAt: Date) => void
  reset: () => void  // 失敗時のリセット（待機列最後尾へ）
}
```

### 7.3 Registration Store（登録タスク管理）

```typescript
// タスクID（9つの登録タスク）
type TaskId =
  | 'name'      // 名前入力
  | 'birthday'  // 生年月日入力
  | 'phone'     // 電話番号入力
  | 'address'   // 住所入力
  | 'email'     // メールアドレス入力
  | 'terms'     // 利用規約
  | 'password'  // パスワード入力
  | 'captcha'   // CAPTCHA
  | 'otp'       // OTP

// タスクの状態
type TaskStatus = 'pending' | 'completed'

interface TaskState {
  id: TaskId
  status: TaskStatus
  label: string
}

// フォームデータ
interface FormData {
  name: string | null
  birthday: string | null      // "YYYY-MM-DD"形式
  phone: string | null
  address: string | null
  email: string | null         // 瞬きモールス信号で入力
  termsAccepted: boolean
  password: string | null
  captchaVerified: boolean
  otpVerified: boolean
}

// 状態の型
interface RegistrationState {
  tasks: Record<TaskId, TaskState>
  formData: FormData
  isAllCompleted: boolean      // 全タスク完了か（計算プロパティ）
  completedCount: number       // 完了タスク数（計算プロパティ）
}

// アクション
interface RegistrationActions {
  completeTask: (taskId: TaskId, data?: Partial<FormData>) => void
  resetTask: (taskId: TaskId) => void
  resetAllTasks: () => void
}
```

### 7.4 UI Store（UI状態管理）

```typescript
interface ModalState {
  isOpen: boolean
  type: 'error' | 'success' | 'warning' | null
  message: string | null
  redirectDelay: number | null
}

interface UIState {
  isLoading: boolean
  modalState: ModalState
}

interface UIActions {
  setLoading: (isLoading: boolean) => void
  showModal: (type: ModalState['type'], message: string, redirectDelay?: number) => void
  hideModal: () => void
}
```

### 7.5 状態遷移図

```
                    ┌──────────┐
                    │   idle   │
                    └────┬─────┘
                         │ WebSocket接続
                         ▼
                    ┌──────────┐
                    │ waiting  │ ←───────────────────────┐
                    └────┬─────┘                         │
                         │ 順番が来た                     │
                         ▼                               │
                    ┌──────────┐                         │
                    │stage1_dino│                        │
                    └────┬─────┘                         │
                         │                               │
              ┌──────────┴──────────┐                    │
              │成功                 │失敗                │
              ▼                     ▼                    │
        ┌───────────┐          最後尾へ ─────────────────┘
        │registering│
        └─────┬─────┘
              │
              │ ハブ＆スポーク
              │ （8タスク完了まで繰り返し）
              │
              ▼
        ┌───────────┐
        │ 登録ボタン │
        └─────┬─────┘
              │
              ▼
        ┌───────────┐
        │サーバーエラー│ → 最後尾へ
        └───────────┘
```

### 7.6 エラー防止設計

| 問題 | 解決策 |
|------|--------|
| 不正な状態遷移 | `status`の変更は専用アクションのみ許可 |
| 未完了タスクで登録 | `isAllCompleted`が`false`なら登録ボタン無効 |
| トークン期限切れ | `tokenExpiresAt`を監視し、期限切れで自動リダイレクト |
| 二重送信 | `isLoading`中はAPI呼び出しをブロック |
| 不整合なformData | タスク完了時のみ該当フィールドを更新 |
| リロード時の状態ロス | 永続化しない（仕様通り最後尾からやり直し） |

### 7.7 ストア間の依存関係

```
sessionStore ──────→ registrationStore
     │                      │
     │ status変更時         │ タスク完了/失敗時
     ▼                      ▼
  uiStore ←─────────── uiStore
  (ローディング表示)     (モーダル表示)
```

**重要:** ストア間の循環依存を避けるため、UIストアは他のストアから一方向でのみ参照される。

---

## 8. ディレクトリ構成

```
src/
├── api/             # APIクライアント
├── components/
│   ├── captcha/     # CAPTCHAコンポーネント
│   ├── common/      # 共通コンポーネント
│   ├── dino/        # Dino Runゲームコンポーネント
│   ├── otp/         # OTPコンポーネント
│   ├── queue/       # 待機列コンポーネント
│   ├── register/    # 登録フォームコンポーネント
│   │   ├── name/        # 名前入力（スロット）
│   │   ├── birthday/    # 生年月日入力
│   │   ├── phone/       # 電話番号入力（黒電話）
│   │   ├── address/     # 住所入力（ストリートビュー）
│   │   ├── terms/       # 利用規約（音声認識）
│   │   └── password/    # パスワード入力
│   └── ui/          # 汎用UIコンポーネント
├── hooks/           # カスタムフック
├── pages/           # ページコンポーネント
├── router/          # ルーティング設定
├── store/           # 状態管理
└── styles/          # グローバルスタイル
```

---

## 9. 関連ドキュメント

* バックエンド仕様書: `../back/spec.md`
* 開発ワークフロー: `./AGENT.md`
* README: `./README.md`

---

## 10. チーム開発フロー

### 10.1 チーム構成と担当領域

| メンバー | GitHub | 役割 | 工数 |
|---------|--------|------|------|
| **A** | @chihoyagi | 基盤・共通担当 | 12issue / 20点 |
| **B** | @Rozpring | ゲーム・検証担当 | 13issue / 26点 |
| **C** | @Umeno0923 | 登録フォーム担当 | 12issue / 26点 |

### 10.2 担当issue一覧

#### @chihoyagi（基盤・共通）
| Phase | Issue | 内容 | 難易度 |
|-------|-------|------|--------|
| 1 | #1 | ルーティング設定 | ★☆☆ |
| 1 | #2 | 共通レイアウト | ★☆☆ |
| 1 | #3 | WebSocket hook | ★★☆ |
| 1 | #4 | APIクライアント | ★★☆ |
| 1 | #5 | 状態管理（3ストア） | ★★★ |
| 2 | #26 | 戻るボタン無効化 | ★☆☆ |
| 2 | #27 | 恐怖の演出 | ★☆☆ |
| 2 | #28 | 自動リダイレクト | ★☆☆ |
| 2 | #29 | 失敗時モーダル | ★☆☆ |
| 2 | #30 | ローディングスピナー | ★☆☆ |
| 2 | #36 | スクロール挙動調整 | ★★☆ |
| 2 | #38 | メールアドレス（瞬きモールス） | ★★★★ |

#### @Rozpring（ゲーム・検証）
| Phase | Issue | 内容 | 難易度 |
|-------|-------|------|--------|
| 2 | #6 | 待機列ページUI | ★☆☆ |
| 2 | #7 | 待機順位表示 | ★☆☆ |
| 2 | #8 | 待機列WebSocket連携 | ★★☆ |
| 2 | #9 | Dino RunページUI | ★★☆ |
| 2 | #10 | 恐竜キャラクター描画・操作 | ★★★ |
| 2 | #11 | 障害物生成・移動 | ★★★ |
| 2 | #12 | 衝突判定・ゲームオーバー | ★★★ |
| 2 | #13 | スコア・タイマー表示 | ★★☆ |
| 2 | #14 | ゲーム結果API連携 | ★★☆ |
| 2 | #15 | CAPTCHAページUI | ★☆☆ |
| 2 | #16 | CAPTCHA画像・座標取得 | ★★☆ |
| 2 | #17 | CAPTCHA API連携 | ★★☆ |
| 2 | #18 | CAPTCHAタイマー | ★★☆ |

#### @Umeno0923（登録フォーム）
| Phase | Issue | 内容 | 難易度 |
|-------|-------|------|--------|
| 2 | #37 | 登録ダッシュボード | ★★☆ |
| 2 | #31 | 名前入力（スロット） | ★★☆ |
| 2 | #32 | 生年月日入力（横スクロール） | ★★☆ |
| 2 | #33 | 電話番号入力（黒電話） | ★★★ |
| 2 | #34 | 住所入力（ストリートビュー風） | ★★★★ |
| 2 | #35 | 利用規約（音声認識） | ★★★★ |
| 2 | #21 | AIパスワード煽り | ★★☆ |
| 2 | #22 | 魚OTP画像表示 | ★★☆ |
| 2 | #23 | 魚OTP API連携 | ★★☆ |
| 2 | #24 | 登録完了処理 | ★☆☆ |
| 2 | #25 | トークン有効期限 | ★★☆ |

### 10.3 開発フェーズ

```
Phase 1: 基盤構築
├── @chihoyagi: #1, #2, #3, #4, #5（状態管理含む）
├── @Rozpring: 技術調査（Canvas、ゲームループ）
└── @Umeno0923: 技術調査（音声認識、特殊UI）

    ↓ 基盤完成後にdevelopへマージ

Phase 2: 機能開発（並行）
├── @chihoyagi: #26-30, #36, #38 + レビュー対応
├── @Rozpring: #6-18（待機列、Dino Run、CAPTCHA）
└── @Umeno0923: #21-25, #31-35, #37（登録フォーム全般）

    ↓ 各機能完成後にdevelopへマージ

Phase 3: 統合テスト
└── 全員: 結合テスト、バグ修正、E2Eテスト
```

### 10.4 状態管理のルール

#### 変更権限

| 操作 | @chihoyagi | @Rozpring / @Umeno0923 |
|------|------------|------------------------|
| ストア構造の変更 | ✅ | ❌ |
| 新しいアクション追加 | ✅ | ❌（依頼する） |
| 型定義の変更 | ✅ | ❌（依頼する） |
| ストアの使用（参照） | ✅ | ✅ |
| アクションの呼び出し | ✅ | ✅ |

#### ストア拡張の依頼フロー

```
1. issueにコメントで依頼
   「registrationStoreに emailVerified: boolean を追加してほしい」

2. @chihoyagi がPRで実装

3. マージ後、依頼者が使用開始
```

#### コーディングルール

```typescript
// ❌ 禁止: コンポーネントから直接状態を操作
setState({ tasks: { ...tasks, name: { status: 'completed' } } })

// ✅ 許可: 定義済みアクションのみ使用
completeTask('name', { name: '田中太郎' })

// ❌ 禁止: ストア全体をsubscribe
const store = useRegistrationStore()

// ✅ 許可: 必要な部分だけselector
const tasks = useRegistrationStore((s) => s.tasks)
```

### 10.5 ファイル所有権

| ディレクトリ | 所有者 | 他者の編集 |
|-------------|--------|-----------|
| `src/store/` | @chihoyagi | ❌ 禁止 |
| `src/router/` | @chihoyagi | ❌ 禁止 |
| `src/api/` | @chihoyagi | ❌ 禁止 |
| `src/hooks/` | @chihoyagi | 依頼制 |
| `src/components/ui/` | @chihoyagi | 依頼制 |
| `src/components/queue/` | @Rozpring | ✅ |
| `src/components/dino/` | @Rozpring | ✅ |
| `src/components/captcha/` | @Rozpring | ✅ |
| `src/pages/QueuePage.tsx` | @Rozpring | ✅ |
| `src/pages/DinoPage.tsx` | @Rozpring | ✅ |
| `src/pages/CaptchaPage.tsx` | @Rozpring | ✅ |
| `src/components/register/` | @Umeno0923 | ✅ |
| `src/components/otp/` | @Umeno0923 | ✅ |
| `src/pages/RegisterDashboard.tsx` | @Umeno0923 | ✅ |
| `src/pages/OtpPage.tsx` | @Umeno0923 | ✅ |

### 10.6 ブランチ戦略

```
main（本番）
 └── develop（開発統合）
      ├── feat/phase1-routing      ← @chihoyagi
      ├── feat/phase1-store        ← @chihoyagi
      ├── feat/queue-page          ← @Rozpring
      ├── feat/dino-game           ← @Rozpring
      ├── feat/captcha             ← @Rozpring
      ├── feat/register-dashboard  ← @Umeno0923
      ├── feat/name-input          ← @Umeno0923
      └── ...
```

#### ブランチ命名規則
- `feat/issue-{番号}-{機能名}` または `feat/{機能名}`
- 例: `feat/issue-5-state-management`, `feat/dino-game`

#### マージルール
1. Phase 1完了 → `develop`にマージ → 全員pull
2. 各機能完了 → PRレビュー → `develop`にマージ
3. Phase 3完了 → `main`にマージ → デプロイ

### 10.7 コミュニケーション

#### 日次同期（推奨）
```
毎朝15分のスタンドアップ:
- 昨日やったこと
- 今日やること
- ブロッカーはあるか
- ストアへの追加依頼はあるか
```

#### ブロッカー発生時
1. issueにコメントで報告
2. Slackで@chihoyagiにメンション（基盤関連の場合）
3. 別タスクに着手して待機
