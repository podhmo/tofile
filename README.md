# tofile

スマホから「送る」を使って選択されたテキストをテキストファイルとしてダウンロードするだけのworker。  
Cloudflare Workers を使う。

## セットアップ

### 必要なもの

- [Node.js](https://nodejs.org/) (v18 以上)
- [Cloudflare アカウント](https://dash.cloudflare.com/sign-up)

### インストール

```bash
npm install
```

## デプロイ

初回デプロイ前に Cloudflare へのログインが必要です。

```bash
# Cloudflare にログイン（初回のみ）
pnpm dlx wrangler login

# Workers へデプロイ
npm run deploy
```

デプロイ後、以下のような URL が発行されます:

```
https://tofile.<your-subdomain>.workers.dev
```

## API

### `POST /`

リクエストボディのテキストを `.txt` ファイルとしてダウンロードさせる。

| クエリパラメータ | 説明 |
| --- | --- |
| `filename` | ダウンロードファイル名（省略時はタイムスタンプ: `note-YYYYMMDD-HHmmss.txt`） |

```bash
# ファイル名を指定してダウンロード
curl -X POST "https://tofile.<your-subdomain>.workers.dev/?filename=memo" \
  -d "今日のメモ内容" -O -J

# ファイル名を省略（タイムスタンプ名になる）
curl -X POST "https://tofile.<your-subdomain>.workers.dev/" \
  -d "今日のメモ内容" -O -J
```

## ローカル開発

```bash
npm run dev
# → http://localhost:8787 で起動
```

```bash
# 動作確認
curl -X POST "http://localhost:8787/?filename=test" -d "hello" -O -J
```
