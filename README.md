# Vite + React + TypeScript + Tailwind CSS

このプロジェクトはVite、React、TypeScript、Tailwind CSSを使用したフロントエンド開発環境です。

## 技術スタック

- **Vite** - 高速なビルドツール
- **React** - UIライブラリ
- **TypeScript** - 型付きJavaScript
- **Tailwind CSS v4** - ユーティリティファーストCSSフレームワーク

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
```

---

## プロジェクト構成

```
front/
├── public/           # 静的ファイル
├── src/
│   ├── assets/       # 画像などのアセット
│   ├── App.tsx       # メインコンポーネント
│   ├── main.tsx      # エントリーポイント
│   └── index.css     # Tailwind CSSのインポート
├── index.html        # HTMLテンプレート
├── vite.config.ts    # Vite設定
├── tsconfig.json     # TypeScript設定
└── package.json      # プロジェクト設定
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
