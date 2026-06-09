# Sotto. — 多言語化（i18n）実装プラン

**作成日：** 2026年6月10日
**ステータス：** 設計段階（次セッションで実装）
**対象フェーズ：** Phase 1.6

---

## 1. 方針

Sotto. は日本発のブランドだが、AI 音楽は国境を持たない。
日本語と英語の2言語切替を Phase 1.6 で実装する。

---

## 2. 技術選択：next-intl

| 観点 | 判断 |
|---|---|
| **ライブラリ** | `next-intl` v3+（Next.js 16 App Router 公式推奨） |
| **URL 構造** | `/ja/` `/en/` をパスに含める（SEO に有利） |
| **既定言語** | 日本語（`/` → `/ja/` リダイレクト） |
| **言語検出** | ブラウザの `Accept-Language` を初回参照 |
| **切替UI** | ヘッダー右に「JA ⌇ EN」セグメント |
| **メッセージ管理** | `messages/ja.json` / `messages/en.json` |
| **SSR/SSG** | 完全対応、メタデータも翻訳可能 |

---

## 3. 期待される最終ファイル構造

```
sotto/
├── messages/
│   ├── ja.json         ← 日本語の全テキスト
│   └── en.json         ← 英語の全テキスト
├── src/
│   ├── i18n.ts         ← next-intl の設定
│   ├── middleware.ts   ← 言語検出・リダイレクト
│   └── app/
│       └── [locale]/   ← ロケール付きルート
│           ├── layout.tsx
│           ├── page.tsx
│           ├── letter/page.tsx
│           ├── signin/page.tsx
│           ├── me/page.tsx
│           ├── me/edit/page.tsx
│           ├── post/new/page.tsx
│           └── works/[id]/page.tsx
```

**重要：既存の `src/app/page.tsx` 等を `src/app/[locale]/` 配下に移動する。**

---

## 4. メッセージファイル構造（抜粋）

### messages/ja.json

```json
{
  "common": {
    "brand": "Sotto.",
    "tagline": "Quietly, soon.",
    "back": "戻る"
  },
  "nav": {
    "placeWork": "作品を置く",
    "myGallery": "My Gallery",
    "signIn": "サインイン",
    "signOut": "サインアウト"
  },
  "landing": {
    "heroMessage": "音楽が空間に届く。",
    "concept": "AIで作った1曲を「作品」として置く場所として。やがてその音楽がさまざまな空間へ流れるホームとして。クリエイターと場をつなぐ、新しい音楽の届けかた。",
    "forCreators": "For Creators",
    "creatorPitch": "あなたの1曲を、世界の空間へ。",
    "ctaSignIn": "— Sign in to share —",
    "ctaPlaceWork": "— Place a new work —",
    "forListeners": "For Listeners",
    "listenerPitch": "視聴は登録不要、間もなく公開。新着のお知らせを受け取る。",
    "waitlistPlaceholder": "your@email.com",
    "waitlistSubmit": "— SEND —",
    "letterLink": "Sotto.の想いを読む"
  },
  "letter": {
    "title": "Letter",
    "para1": "Sottoは、AIで作った1曲を「作品」として置く場所です。",
    "para2": "仕事でAIを毎日使う中で、AI音楽を作るクリエイターたちが自分の作品をどこに置けばいいか、自分の作品をもっと活かしたい、作った先は？と考えているのを目の当たりにしてきました。",
    "para3": "Sotto.をきっかけに、個性や才能である星と星、音と場が繋がり、輝いていただけたら嬉しいです。",
    "signature": "The Sotto Lounge Project"
  },
  "post": {
    "title": "新しい作品を置く",
    "subtitle": "1曲を、静かにここに置く。余白を残し、誠実に。",
    "fields": {
      "title": "タイトル",
      "concept": "コンセプト",
      "audio": "音源ファイル",
      "cover": "ジャケット画像",
      "aiTools": "使用したAIツール",
      "prompt": "プロンプト",
      "lyrics": "歌詞",
      "bts": "制作の背景",
      "tags": "タグ"
    },
    "submit": "— 作品を置く —"
  },
  "errors": {
    "audioTooLarge": "音源は 25MB 以下にしてください。",
    "coverTooLarge": "ジャケットは 5MB 以下にしてください。",
    "titleRequired": "タイトルを入力してください。"
  }
}
```

### messages/en.json

```json
{
  "common": {
    "brand": "Sotto.",
    "tagline": "Quietly, soon.",
    "back": "Back"
  },
  "nav": {
    "placeWork": "Place a work",
    "myGallery": "My Gallery",
    "signIn": "Sign in",
    "signOut": "Sign out"
  },
  "landing": {
    "heroMessage": "Music delivered to spaces.",
    "concept": "A place where a single song made by AI rests as a work. A home from which that music quietly travels to spaces around the world. A new way to deliver music — connecting creators and places.",
    "forCreators": "For Creators",
    "creatorPitch": "Your song. To spaces across the world.",
    "ctaSignIn": "— Sign in to share —",
    "ctaPlaceWork": "— Place a new work —",
    "forListeners": "For Listeners",
    "listenerPitch": "Listening is free, no sign-up. Opening soon. Subscribe to new releases.",
    "waitlistPlaceholder": "your@email.com",
    "waitlistSubmit": "— SEND —",
    "letterLink": "Read the letter"
  },
  "letter": {
    "title": "Letter",
    "para1": "Sotto. is a place where a single song made by AI rests as a work.",
    "para2": "Working with AI every day, I have watched creators ask: where can I place my songs, how can I bring them further, what comes after I create?",
    "para3": "Through Sotto., I hope that the stars — talents — and sounds and spaces meet, and shine together.",
    "signature": "The Sotto Lounge Project"
  },
  "post": {
    "title": "Place a new work",
    "subtitle": "Place a work, quietly. Leave space. Stay sincere.",
    "fields": {
      "title": "Title",
      "concept": "Concept",
      "audio": "Audio file",
      "cover": "Cover image",
      "aiTools": "AI tools used",
      "prompt": "Prompt",
      "lyrics": "Lyrics",
      "bts": "Behind the scenes",
      "tags": "Tags"
    },
    "submit": "— Place this work —"
  },
  "errors": {
    "audioTooLarge": "Audio must be 25MB or less.",
    "coverTooLarge": "Cover must be 5MB or less.",
    "titleRequired": "Please enter a title."
  }
}
```

---

## 5. 実装ステップ（次セッション用）

### Step 1：next-intl 導入（10 分）
```bash
cd ~/sotto
npm install next-intl
```

### Step 2：設定ファイル作成（15 分）
- `src/i18n.ts` で next-intl 設定
- `src/middleware.ts` でロケール検出・リダイレクト
- `next.config.ts` で next-intl プラグイン適用

### Step 3：ルート構造の移行（30 分）
- 既存の全ページを `src/app/[locale]/` 配下にコピー
- `src/app/page.tsx` → `src/app/[locale]/page.tsx`
- 全ページで `useTranslations` または `getTranslations` フックを使用

### Step 4：メッセージファイルの作成（45 分）
- `messages/ja.json` を作成し、既存のすべてのハードコード文字列を移植
- `messages/en.json` を作成し、英語訳を入れる
- 各ページで `t("nav.placeWork")` のように呼び出すように書き換え

### Step 5：言語切替UI（15 分）
- `SiteHeader.tsx` に「JA ⌇ EN」セグメントを追加
- クリックで `router.push(`/${otherLocale}${pathname.slice(3)}`)`

### Step 6：メタデータ多言語化（15 分）
- `layout.tsx` の `metadata` を `generateMetadata` 関数に変更
- ロケールに応じた title / description / OGP を返す

### Step 7：動作確認・コミット（20 分）
- `/ja` `/en` 両方で全画面確認
- `/` で `/ja` へのリダイレクト確認
- Vercel デプロイ確認

**合計所要時間：約 2.5 時間**

---

## 6. ブランド翻訳ポリシー

単純な翻訳ではなく、Sotto. の余白と静けさを英語でも保つ。

| 日本語 | 英語 | 哲学 |
|---|---|---|
| 音楽が空間に届く。 | Music delivered to spaces. | 動詞を強くしすぎない |
| 作品を置く | Place a work | "Post" や "Upload" は避ける |
| マイギャラリー | My Gallery | 既に英語との混在を許容 |
| 1曲を、静かにここに置く。 | Place a work, quietly. | 形容詞 + 動詞のシンプル構造 |
| 余白を残し、誠実に。 | Leave space. Stay sincere. | 2文に区切ってリズム |
| Sotto. の想いを読む | Read the letter | 主観的な「想い」は文化的に "letter" の方が伝わる |

---

## 7. 将来の拡張

- 韓国語（K-Beauty 系店舗市場が大きい）
- 中国語簡体字（インバウンド店舗向け）
- フランス語、スペイン語（ヨーロッパクリエイター）

→ `messages/ko.json` `messages/zh.json` 等を追加するだけで対応可能。next-intl の構造はこの拡張を前提に設計されている。

---

## 8. 関連 SEO 配慮

- `<link rel="alternate" hreflang="ja" href="..."/>` を `<head>` に追加（next-intl が自動生成）
- 各言語のサイトマップを `sitemap.xml` で個別宣言
- Google Search Console で各言語のターゲット国を設定

---

## 9. 注意事項

- **`metadataBase` の取扱い**：OGP 画像 URL も各ロケールで切り替わるよう `generateMetadata` 内で処理
- **`Cormorant Garamond` フォント**：日本語表示でも残る（ブランドマークのみ）
- **`Noto Serif JP` フォント**：英語ページでも基本書体として残す（混在許容）
- **絵文字使用は最小限**：本サービスのトーンに合わない

---

以上
