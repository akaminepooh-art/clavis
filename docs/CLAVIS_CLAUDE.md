# CLAVIS — Claude Code セッション仕様書 v2.0

## プロジェクト概要

**サービス名**: CLAVIS（クラビス）
**URL**: https://clavis.netlify.app/
**コンセプト**: 「人生の扉を開く鍵」— 診断・占い・生活改善・農園体験を束ねる一般向けライフナビゲーション
**姉妹サイト**: FACTUM（https://factum.netlify.app/）← データ分析・投資系

---

## 技術スタック（Supabase不使用）

```
フロントエンド:  React 19 + Vite + TypeScript
スタイリング:    Tailwind CSS v4
状態管理:       Zustand（グローバル）+ useState（ローカル）
データ管理:     JSON ファイル（/public/data/）
ユーザーデータ: localStorage / IndexedDB（端末内完結）
デプロイ:       Netlify（Git push で自動デプロイ）
サーバー機能:   Netlify Functions（Phase 2以降・必要時のみ）
```

### 設計原則：必要になるまで追加しない

| Phase | 追加する技術 | 追加する条件 |
|---|---|---|
| 1（今） | なし | JSON + フロントのみ |
| 2（必要時） | Netlify Functions | OGP画像生成・CORS回避が必要な時 |
| 3（将来） | Turso or Cloudflare KV | クロスデバイス同期が必要な時のみ |

外部DBは原則不使用。Supabase は採用しない。

---

## プロジェクト初期化（新規セッション時の手順）

```bash
npm create vite@latest clavis -- --template react-ts
cd clavis
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install zustand
npm run dev
```

`vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({ plugins: [react(), tailwindcss()] })
```

`netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## データ管理（JSON ファイル）

### ファイル構成

```
/public/data/
  contents.json       ← コンテンツ一覧・ステータス管理（唯一の真実）
```

### contents.json スキーマ

```typescript
type Content = {
  id: string
  title: string
  category: 'self' | 'health' | 'fun' | 'farm'
  type: 'webapp' | 'instant' | 'video' | 'external'
  status: 'live' | 'dev' | 'planned'
  url: string | null
  thumbnail_url: string | null  // デプロイ済みOGP画像URL直指定
  description: string
  disclaimer_required: boolean  // 占い系はtrue
  sort_order: number
  is_featured: boolean
  tags: string[]
}
```

### 初期データ（コピーして使う）

```json
[
  {
    "id": "fortune-today",
    "title": "今日の運勢",
    "category": "fun",
    "type": "instant",
    "status": "live",
    "url": "/apps/fortune",
    "thumbnail_url": "/images/default-fun.png",
    "description": "生年月日から今日の運勢を占う",
    "disclaimer_required": true,
    "sort_order": 1,
    "is_featured": true,
    "tags": ["占い", "運勢"]
  },
  {
    "id": "berrybody",
    "title": "BERRYBODY（姿勢分析）",
    "category": "self",
    "type": "webapp",
    "status": "dev",
    "url": null,
    "thumbnail_url": null,
    "description": "MediaPipeで姿勢・体幹を分析",
    "disclaimer_required": false,
    "sort_order": 3,
    "is_featured": false,
    "tags": ["診断", "姿勢", "スポーツ"]
  }
]
```

### コンテンツ更新方法

- VSCode で `public/data/contents.json` を直接編集 → Git push
- または GitHub Web UI から直接編集（どのPCからでも可能）
- Netlify が自動でデプロイ

### サムネイル運用

- `thumbnail_url` にはデプロイ済みOGP画像URLを直指定
  - 例: `https://berrybody.netlify.app/ogp.png`
- `null` → カテゴリ別デフォルト画像
  - `self`   → `/images/default-self.png`
  - `health` → `/images/default-health.png`
  - `fun`    → `/images/default-fun.png`
  - `farm`   → `/images/default-farm.png`
- `status: 'dev'` or `'planned'` → グレースケール表示

---

## コンテンツ構造

### カテゴリ1: 自己理解・健康・ヘルスケア

| コンテンツ | 種別 | ステータス |
|---|---|---|
| IQ診断 | webapp | planned |
| 性格診断 | webapp | planned |
| 美容タイプ診断 | webapp | planned |
| BERRYBODY（姿勢分析） | webapp | dev |
| AKIRA BODY CHECK（体幹分析） | webapp | dev |
| 防災チェックリスト | instant | planned |

### カテゴリ2: 娯楽・占い（免責表示必須）

| コンテンツ | 種別 | ステータス |
|---|---|---|
| 今日の運勢 | instant | live |
| 運勢相性診断 | instant | live |
| 夢診断 | instant | planned |
| ロト統計データ（娯楽） | instant | planned |

### カテゴリ3: あっきらきら農園 誘導

| コンテンツ | 種別 | ステータス |
|---|---|---|
| 農園体験予約案内 | external | planned |
| 農園タクティクスRPG | webapp | dev |

---

## サイト内軽量アプリ 詳細設計

`/src/apps/` 以下に実装。全てフロントのみ・外部サービス依存なし。

### アプリ1：今日の運勢（`/apps/fortune`）

**フロー**: 生年月日入力 → 日付シードでハッシュ生成 → スコア決定 → 結果表示 → シェア

```typescript
// /src/apps/fortune/logic.ts
const FARM_FRUITS = ['いちご', 'シャインマスカット', '桃', 'ブルーベリー', 'キウイ']

export function generateFortune(birthdate: string, today: string) {
  const hash = simpleHash(`${birthdate}-${today}`) % 100
  const luckyFood = LUCKY_FOODS[hash % LUCKY_FOODS.length]
  return {
    overall: Math.round(60 + hash * 0.4),  // 60〜100
    scores: {
      love:   deriveScore(hash, 'love'),
      work:   deriveScore(hash, 'work'),
      money:  deriveScore(hash, 'money'),
      health: deriveScore(hash, 'health'),
    },
    lucky: {
      color:  LUCKY_COLORS[hash % LUCKY_COLORS.length],
      food:   luckyFood,
      number: (hash % 9) + 1,
    },
    message: MESSAGES[hash % MESSAGES.length],
    // ラッキーフードが農園フルーツなら農園誘導バナーを強調
    showFarmBanner: FARM_FRUITS.includes(luckyFood),
  }
}
```

**農園誘導**: `showFarmBanner: true` の時に農園体験バナーを強調表示  
**シェア**: Canvas API で画像生成（`/src/utils/shareImage.ts`）、サーバー不要  
**保存**: `localStorage.setItem('fortune_last', JSON.stringify({ date, result }))`

---

### 共通ユーティリティ：シェア画像生成（`/src/utils/shareImage.ts`）

```typescript
export async function generateShareImage(params: {
  title: string
  scores: { label: string; value: number }[]
  siteUrl: string
}): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1200; canvas.height = 630
  const ctx = canvas.getContext('2d')!
  // 背景（ティール→白）
  // タイトル・結果テキスト（中央）
  // 4軸スコアバー
  // CLAVISロゴ（左上）、URL（右下）
  return new Promise(resolve => canvas.toBlob(b => resolve(b!)))
}
```

---

## ページ構成

```
/                    ← トップ（ヒーロー + カテゴリ + おすすめ）
/category/self       ← 自己理解一覧
/category/health     ← 健康・ヘルスケア一覧
/category/fun        ← 娯楽・占い一覧
/category/farm       ← 農園誘導一覧
/apps/fortune        ← 今日の運勢
/content/[id]        ← 個別ページ（外部リンクへの中継）
```

---

## ディレクトリ構成

```
/src/
  components/
    ContentCard.tsx        ← カード（ステータスバッジ付き）
    StatusBadge.tsx        ← live/dev/planned バッジ
    DisclaimerBanner.tsx   ← 占い系免責バナー（必須）
    FarmBanner.tsx         ← 農園誘導バナー
    SkeletonCard.tsx       ← ローディング用スケルトン
  apps/
    fortune/               ← 今日の運勢
  pages/
    TopPage.tsx
    CategoryPage.tsx
    ContentPage.tsx
  hooks/
    useContents.ts         ← contents.json を fetch して返す
  utils/
    shareImage.ts          ← Canvas API シェア画像生成
    storage.ts             ← localStorage/IndexedDB ラッパー
/public/
  data/
    contents.json          ← コンテンツ一覧（唯一の真実）
  images/                  ← 画像ファイル（生成後に配置）
```

---

## UIデザイントークン

```css
--cl-primary:        #0F6E56;
--cl-primary-mid:    #1D9E75;
--cl-primary-light:  #E1F5EE;
--cl-primary-border: #5DCAA5;
--cl-lavender:       #EEEDFE;
--cl-lavender-mid:   #7F77DD;
--cl-green:          #EAF3DE;
--cl-green-mid:      #639922;
--cl-green-dark:     #27500A;

--radius-card:  16px;
--radius-btn:   10px;
--radius-badge: 99px;
--font-ja: 'Hiragino Sans', 'Noto Sans JP', sans-serif;
--font-en: 'Geist', sans-serif;
```

---

## モバイルファースト・ブレークポイント

```typescript
// スマホ優先設計。カードグリッドの基本パターン：
// grid-cols-1（〜640px）→ sm:grid-cols-2（〜768px）→ lg:grid-cols-3（768px〜）
```

---

## エラー・ローディング状態の設計方針

- **ローディング**: スケルトンローダー（`<SkeletonCard />`、Cardと同じ寸法）
- **エラー**: インラインエラー表示（トースト不使用）
- **空状態**: 「コンテンツを準備中です」プレースホルダー
- **fetch失敗**: コンソールエラー + デフォルト空配列で表示継続

---

## 法的対応（必須実装・省略不可）

### 占い・娯楽コンテンツへの免責表示

```typescript
const DISCLAIMER = '本コンテンツは娯楽目的です。科学的根拠を持つものではありません。'
// disclaimer_required: true のコンテンツには必ず表示
```

### NGワード（コンテンツ説明・結果文に使用禁止）

`絶対当たる` / `必ず` / `100%` / `的中率保証` / `科学的に証明された占い`

---

## 各Webアプリへのサムネイル設定テンプレート

```html
<!-- 各Webアプリの index.html <head> に追加 -->
<meta property="og:title" content="【アプリ名】">
<meta property="og:description" content="【1行説明】">
<meta property="og:image" content="/ogp.png">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

`/public/ogp.png` を配置（1280×640px）→ デプロイ後にURLを確認 → `contents.json` に登録。

---

## 画像ファイル一覧と生成プロンプト（Midjourney v6）

`/public/images/` に配置。

**ヒーロー背景**（`hero-bg.png`、1280×640）:
```
A soft dreamy illustration of a glowing teal key floating above an open field of strawberries and colorful fruits, gentle light particles, pastel botanical elements, clean white background, flat vector style, minimal, no text --ar 2:1 --style raw --v 6
```

**診断デフォルト**（`default-self.png`、800×450）:
```
Minimal flat illustration, glowing brain with colorful neural connections, soft teal background, IQ and personality icons, clean modern design, no text --ar 16:9 --style raw --v 6
```

**健康・ヘルスケアデフォルト**（`default-health.png`、800×450）:
```
Minimal flat illustration of a human silhouette with glowing body scan overlay, posture alignment lines and health metric icons, soft blue-green gradient background, medical wellness aesthetic, clean modern design, no text --ar 16:9 --style raw --v 6
```

**占いデフォルト**（`default-fun.png`、800×450）:
```
Magical flat illustration, crystal ball glowing lavender and gold, floating stars and moon phases, dreamy pastel purple background, no text --ar 16:9 --v 6
```

**農園デフォルト**（`default-farm.png`、800×450）:
```
Warm flat illustration, sunny Japanese strawberry farm, rows of red strawberries, lush green leaves, clear blue sky, Oita countryside, soft watercolor vector, no text, golden hour --ar 16:9 --v 6
```

---

## フェーズロードマップ

### Phase 1（今すぐ）
- [ ] プロジェクト初期化（Vite + React 19 + TypeScript + Tailwind v4）
- [ ] `contents.json` 作成
- [ ] `useContents` hook（JSON fetch）
- [ ] トップページ（ヒーロー + カテゴリ + おすすめ）
- [ ] コンテンツ一覧（ステータスバッジ付き）
- [ ] 今日の運勢アプリ（`/apps/fortune`）
- [ ] Netlify デプロイ

### Phase 2（コンテンツが増えてから）
- [ ] Netlify Functions でOGP画像生成（必要時のみ）
- [ ] IndexedDB で診断履歴保存
- [ ] 季節コンテンツ連動
- [ ] SNSシェア機能強化

### Phase 3（ユーザー間同期が必要な時のみ）
- [ ] Turso（SQLite）or Cloudflare KV 導入判断
- [ ] Firebase Auth（ログインが必要な場合のみ）

---

## 姉妹サイト FACTUM との連携

- ヘッダー/フッターに `https://factum.netlify.app` へのリンク常時表示
- 「データ分析・投資分析はFACTUMへ →」誘導バナー

---

## 開発時の注意

1. **Supabaseは使用しない** — JSON + localStorage で完結させる
2. **免責表示は削除・省略しない** — `disclaimer_required: true` には必ず表示
3. **モバイルファースト** — `grid-cols-1` から始めてメディアクエリで拡張
4. **ステータスバッジを目立たせる** — 進捗把握が最優先
5. **FACTUM へのリンクを常に表示**
6. **農園誘導は自然に** — 文脈で引く・押しつけない
7. **サムネイルは `thumbnail_url` 直指定** — JSON編集のみで更新
8. **外部サービスを増やさない** — Phase 1はフロントのみで動くこと
