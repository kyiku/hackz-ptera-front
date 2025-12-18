# Hackz-Ptera Frontend

「意図的に不便なUX」をコンセプトにしたハッカソンプロジェクトのフロントエンドです。

> **Note:** UXは意図的に悪くしていますが、コード品質はプロダクショングレード（クリーン、型付き、メンテナブル）を維持しています。

## 技術スタック

- **Vite** - 高速なビルドツール
- **React 19** - UIライブラリ
- **TypeScript** - 型付きJavaScript
- **Tailwind CSS v4** - ユーティリティファーストCSSフレームワーク
- **React Router** - ルーティング
- **Vitest** - テストフレームワーク
- **React Testing Library** - コンポーネントテスト

---

## 環境構築手順

### 前提条件

- Node.js (v18以上推奨)
- npm または yarn

---

## Mac での環境構築

### 1. Node.jsのインストール

#### Homebrewを使用する場合
```bash
# Homebrewがインストールされていない場合は先にインストール
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.jsをインストール
brew install node
```

#### nvm (Node Version Manager) を使用する場合
```bash
# nvmをインストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# ターミナルを再起動するか、以下を実行
source ~/.zshrc

# Node.jsをインストール
nvm install --lts
nvm use --lts
```

### 2. プロジェクトのセットアップ
```bash
# リポジトリをクローン
git clone <repository-url>
cd front

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

---

## Windows での環境構築

### 1. Node.jsのインストール

#### 公式インストーラーを使用する場合
1. [Node.js公式サイト](https://nodejs.org/)にアクセス
2. LTS版をダウンロード
3. インストーラーを実行し、指示に従ってインストール

#### wingetを使用する場合 (Windows 10/11)
```powershell
winget install OpenJS.NodeJS.LTS
```

#### Chocolateyを使用する場合
```powershell
# Chocolateyがインストールされていない場合は先にインストール
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

# Node.jsをインストール
choco install nodejs-lts
```

### 2. プロジェクトのセットアップ

PowerShellまたはコマンドプロンプトで以下を実行：

```powershell
# リポジトリをクローン
git clone <repository-url>
cd front

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

---

## 利用可能なスクリプト

```bash
# 開発サーバーを起動 (http://localhost:5173)
npm run dev

# TypeScriptの型チェックとプロダクションビルド
npm run build

# ビルド成果物をプレビュー
npm run preview

# ESLintでコードチェック
npm run lint

# テストをウォッチモードで実行
npm run test

# テストを一度だけ実行
npm run test:run

# カバレッジ付きでテストを実行
npm run test:coverage
```

---

## プロジェクト構成

```
front/
├── public/              # 静的ファイル
├── src/
│   ├── api/             # APIクライアント
│   ├── components/      # UIコンポーネント
│   │   ├── captcha/     # CAPTCHAコンポーネント
│   │   ├── common/      # 共通コンポーネント
│   │   ├── dino/        # Dino Runゲームコンポーネント
│   │   ├── otp/         # OTPコンポーネント
│   │   ├── queue/       # 待機列コンポーネント
│   │   ├── register/    # 登録フォームコンポーネント
│   │   └── ui/          # 汎用UIコンポーネント
│   ├── hooks/           # カスタムフック
│   ├── pages/           # ページコンポーネント
│   ├── router/          # ルーティング設定
│   ├── store/           # 状態管理
│   ├── test/            # テストセットアップ
│   ├── App.tsx          # メインコンポーネント
│   ├── main.tsx         # エントリーポイント
│   └── index.css        # Tailwind CSSのインポート
├── AGENT.md             # 開発ワークフロー
├── index.html           # HTMLテンプレート
├── vite.config.ts       # Vite設定
├── tsconfig.json        # TypeScript設定
└── package.json         # プロジェクト設定
```

---

## ゼロからプロジェクトを作成する場合

新しくプロジェクトを作成する場合の手順：

```bash
# Viteプロジェクトを作成
npm create vite@latest my-app -- --template react-ts
cd my-app

# 依存関係をインストール
npm install

# Tailwind CSSをインストール
npm install -D tailwindcss @tailwindcss/vite

# vite.config.tsを編集してTailwindプラグインを追加
```

**vite.config.ts** を以下のように編集：
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**src/index.css** を以下のように編集：
```css
@import "tailwindcss";
```

---

## トラブルシューティング

### `npm install` でエラーが発生する場合
```bash
# キャッシュをクリアして再試行
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### ポート5173が既に使用されている場合
```bash
# 別のポートで起動
npm run dev -- --port 3000
```

### Windowsで「実行ポリシー」のエラーが出る場合
PowerShellを管理者として開き、以下を実行：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## CI/CD

### ブランチ戦略

| ブランチ | 環境 | 動作 |
|---------|------|------|
| `main` | 本番 | S3 + CloudFront に自動デプロイ |
| `develop` | 開発 | CI (テスト・Lint・ビルド) のみ |
| `feat/*` | 機能開発 | developから作成 |
| `fix/*` | バグ修正 | developから作成 |

#### ブランチ運用ルール

```
main (本番環境)
  ↑ マージ (PR必須)
develop (開発・統合)
  ↑ マージ (PR必須)
feat/xxx または fix/xxx (作業ブランチ)
```

1. **機能開発時**: `develop` から `feat/機能名` ブランチを作成
2. **バグ修正時**: `develop` から `fix/バグ名` ブランチを作成
3. **作業完了後**: `develop` へPRを作成してマージ
4. **リリース時**: `develop` から `main` へPRを作成してマージ → 自動デプロイ

#### コマンド例

```bash
# 新機能開発を始める
git checkout develop
git pull origin develop
git checkout -b feat/add-new-component

# 作業完了後
git add .
git commit -m "feat: 新しいコンポーネントを追加"
git push -u origin feat/add-new-component
# → GitHub でPRを作成

# developへマージ後、本番リリース
git checkout develop
git pull origin develop
git checkout main
git pull origin main
git merge develop
git push origin main
# → 自動でS3にデプロイ + CloudFrontキャッシュ無効化
```

### GitHub Actions

- **CI** (`ci.yml`): push/PR時にテスト・Lint・型チェック・ビルド確認
- **CD** (`deploy.yml`): mainブランチへのpush時にS3へデプロイ + CloudFrontキャッシュ無効化

### 本番環境

| リソース | 値 |
|---------|-----|
| **本番URL** | `https://d3qfj76e9d3p81.cloudfront.net` |
| **API URL** | `https://d3qfj76e9d3p81.cloudfront.net/api` |
| **WebSocket URL** | `wss://d3qfj76e9d3p81.cloudfront.net/ws` |
| **S3 Bucket** | `hackz-ptera-frontend-202606334122` |
| **CloudFront ID** | `ESIJNHR2MKSQD` |

### GitHub Secrets (設定済み)

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `VITE_API_URL`
- `VITE_WS_URL`

### ローカル開発 (docker-compose)

プロジェクトルートで以下を実行：

```bash
cd /path/to/hackz-ptera
docker-compose up
```

- フロントエンド: http://localhost:5173
- バックエンド: http://localhost:8080

---

## 開発ワークフロー

このプロジェクトはissueベースの開発フローを採用しています。詳細は [AGENT.md](./AGENT.md) を参照してください。

### 基本フロー

1. **Issue確認** - GitHubのissueを確認し、対応するタスクを選択
2. **ブランチ作成** - `feat/issue-{番号}-feature-name` 形式でブランチを作成
3. **実装** - issueに記載されているテストファイルを参照しながら実装
4. **テスト実行** - `npm run test:run` でテストがすべてpassすることを確認
5. **PR作成** - テストがpassしたらPull Requestを作成

### 完了条件

- [ ] Lintエラーがないこと (`npm run lint`)
- [ ] 型エラーがないこと (`npm run build`)
- [ ] テストがすべてpassすること (`npm run test:run`)
- [ ] PRがレビューされApproveされること
