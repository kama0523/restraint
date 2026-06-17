# 抑制積立

パチンコに行かない習慣を可視化し、行ってしまった時の後悔を未来の自分に残すための個人専用アプリ。Next.js (App Router) + Supabase。

## セットアップ

### 1. Supabase プロジェクトを作成する

1. [supabase.com](https://supabase.com) で新規プロジェクトを作成する
2. SQL Editor で `supabase/schema.sql` の内容を実行する(テーブル+RLS ポリシーが作成される)
3. Authentication > Users で自分用のユーザーを 1 人作成する(メール/パスワード。サインアップ画面は用意していないので、ここで直接作成する)
4. Project Settings > API から `Project URL` と `anon public` キーを取得する

### 2. 環境変数を設定する

`.env.local.example` を `.env.local` にコピーし、取得した値を入力する。

```bash
cp .env.local.example .env.local
```

### 3. ローカルで起動する

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開き、手順 1 で作成したアカウントでログインする。

### 4. デプロイ(Vercel)

Vercel にプロジェクトを import し、`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を環境変数に設定してデプロイする。デプロイ後、スマホのブラウザでアクセスし「ホーム画面に追加」すると PWA としてインストールできる。

## 機能

- 今日の記録(行かなかった / 行きたくなったが耐えた / 行ってしまった)を数秒で入力
- 積立額の自動計算(週あたり額または 1 日あたり額で設定)
- 後悔メモ(使用金額・負け金額・理由・気持ち・次回どうするか・自由記述)
- カレンダー表示(○ / ◎ / ×)とタップでの詳細確認
- 統計(累計積立額・累計成功日数・最長連続記録・月別成功率・理由ランキング)
- PWA 対応(ホーム画面追加、簡易オフラインキャッシュ)

## ディレクトリ構成

- `app/login` — ログイン画面
- `app/(app)` — ログイン後の画面(ホーム/カレンダー/統計/設定/後悔メモ入力)、下部タブナビ付き
- `lib/supabase` — Supabase クライアント(ブラウザ/サーバー/Proxy 用)
- `lib/data.ts` — Supabase へのデータアクセス関数
- `lib/streak.ts`, `lib/stats.ts`, `lib/savings.ts`, `lib/calendar.ts`, `lib/date.ts` — 集計・日付計算ロジック
- `supabase/schema.sql` — DB スキーマ(テーブル + RLS ポリシー)
- `proxy.ts` — 認証チェック(未ログイン時は`/login`へリダイレクト)

# restraint
