# PORTAKEY — Claude Code セッション仕様書 v1.0

## プロジェクト概要

**サービス名**: PORTAKEY（ポータキー）
**URL**: https://portakey.netlify.app/（仮。ドメイン確定後に更新）
**コンセプト**: 診断・健康・占いを軸にした自己理解プラットフォーム。科学的診断から娯楽占いまでを一箇所で提供する。
**姉妹サイト**: FACTUM後継サイト（データ分析・AI BLACK）← URL確定後に更新

### ブランド方針

- 農園・地域色は出さない。純粋に「診断・健康・占いの情報プラットフォーム」として立つ
- 農園は**コンテンツの題材・被写体**として自然に登場する（全体の20%程度）。運営者表記は不要
- 「このサイト、あの農園のこと詳しいんだ」と読者が感じる程度の登場頻度が理想

---

## 技術スタック（Supabase不使用）

```
フロントエンド:  React 19 + Vite + TypeScript
スタイリング:    Tailwind CSS v4
状態管理:       Zustand（グローバル）+ useState（ローカル）
データ管理:     JSON ファイル（/public/data/）
ユーザーデータ: localStorage（端末内完結）
天気データ:     気象庁JSON API + Open-Meteo（APIキー不要・商用利用可）
デプロイ:       Netlify（Git push で自動デプロイ）
サーバー機能:   Netlify Functions（Phase 2以降・必要時のみ）
PWA:           manifest.json + Service Worker（Phase 1から対応）
```

### 設計原則：必要になるまで追加しない

| Phase | 追加技術 | 条件 |
|---|---|---|
| 1（今） | なし | JSON + localStorage のみ |
| 2（必要時） | Netlify Functions | 外部API CORS回避・OGP画像生成が必要な時 |
| 3（将来） | Cloudflare KV or Turso | クロスデバイス同期が必要な時のみ |

外部DBは原則不使用。Supabaseは採用しない。ニュースAPIも採用しない（商用利用可能な日本語ニュースAPIが存在しないため）。

---

## プロジェクト初期化

```bash
npm create vite@latest portakey -- --template react-ts
cd portakey
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
  contents.json     ← コンテンツ一覧・ステータス管理（唯一の真実）
  columns.json      ← コラム60本以上（季節・天気・カテゴリで絞り込み）
```

### contents.json スキーマ

```typescript
type Content = {
  id: string
  title: string
  category: 'self' | 'health' | 'fun'
  type: 'webapp' | 'instant' | 'video' | 'external'
  status: 'live' | 'dev' | 'planned'
  url: string | null
  thumbnail_url: string | null
  description: string
  disclaimer_required: boolean
  sort_order: number
  is_featured: boolean
  tags: string[]
}
```

### contents.json 初期データ

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
    "id": "inniq",
    "title": "INNIQ性格診断",
    "category": "self",
    "type": "webapp",
    "status": "dev",
    "url": null,
    "thumbnail_url": null,
    "description": "Big5理論ベースの25タイプ本格性格分析",
    "disclaimer_required": false,
    "sort_order": 2,
    "is_featured": true,
    "tags": ["診断", "性格", "Big5"]
  },
  {
    "id": "berrybody",
    "title": "BERRYBODY（姿勢分析）",
    "category": "health",
    "type": "webapp",
    "status": "dev",
    "url": null,
    "thumbnail_url": null,
    "description": "カメラで姿勢・体幹バランスを分析",
    "disclaimer_required": false,
    "sort_order": 3,
    "is_featured": false,
    "tags": ["健康", "姿勢", "体幹"]
  }
]
```

### columns.json スキーマ

```typescript
type Column = {
  id: string
  category: 'health' | 'self' | 'nature' | 'science' | 'seasonal'
  title: string
  desc: string           // 2〜3行
  season: ('spring' | 'summer' | 'autumn' | 'winter' | 'any')[]
  weather: ('sunny' | 'rainy' | 'cloudy' | 'any')[]
  tags: string[]
  related_app?: string   // 関連アプリID（任意）
}
```

60本以上を内蔵する。カテゴリ内訳：
- 健康×自然（農園が題材として自然に登場）: 12本
- 健康×体（姿勢・体幹・ストレス）: 12本
- 自己理解・診断コラム: 12本
- 雨の日向け内省系: 8本
- 晴れの日向け行動系: 8本
- 季節の豆知識: 8本

Claude Codeへの生成指示：
```
/public/data/columns.json を作成してください。
上記スキーマに従い、上記カテゴリ内訳で合計60本のコラムを生成してください。
農園が登場するコラムは「大分の農園」という表現にとどめ、農園名・運営者情報は一切含めないこと。
```

### コンテンツ更新方法

- `public/data/contents.json` を直接編集 → Git push → Netlify 自動デプロイ
- GitHub Web UI からも編集可能（どのPCからでも）

### サムネイル運用

- `thumbnail_url` にはデプロイ済みOGP画像URLを直指定
- `null` → カテゴリ別デフォルト画像
  - `self`   → `/images/default-self.png`
  - `health` → `/images/default-health.png`
  - `fun`    → `/images/default-fun.png`
- `status: 'dev'` or `'planned'` → グレースケール表示

---

## コンテンツ構造

### カテゴリ1: 自己理解・診断

| コンテンツ | 種別 | ステータス |
|---|---|---|
| INNIQ性格診断 | webapp | dev |
| IQ診断 | webapp | planned |
| 美容タイプ診断 | webapp | planned |
| ワークタイプ診断 | webapp | planned |
| 星つむぎ（四柱推命） | webapp | dev |
| 決断力診断 | instant | planned |

### カテゴリ2: 健康・ヘルスケア

| コンテンツ | 種別 | ステータス |
|---|---|---|
| BERRYBODY（姿勢分析） | webapp | dev |
| AKIRA BODY CHECK | webapp | dev |
| ストレスチェッカー | instant | planned |

### カテゴリ3: 娯楽・占い（免責表示必須）

| コンテンツ | 種別 | ステータス |
|---|---|---|
| 今日の運勢 | instant | live |
| 相性診断 | instant | planned |
| 夢診断 | instant | planned |
| ロト統計（娯楽） | instant | planned |

---

## 自動変化システム（更新作業ゼロで毎日変化）

### 日付シードによるローテーション

```typescript
// /src/utils/seed.ts
export function hashDate(date: Date): number {
  const str = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function shuffleSeed<T>(arr: T[], seed: number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.abs(seed ^ (seed >> (i % 16))) % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
```

### 毎日変わる要素

| 要素 | トリガー | 実装 |
|---|---|---|
| 本日のピックアップ（3件） | 日付シード | `shuffleSeed(contents, seed).slice(0,3)` |
| ヒーローキャッチコピー | 天気 × 季節 | `COPIES[weather][season]` |
| コラム表示順 | 日付シード × 興味スコア | `shuffleSeed(filtered, seed)` |
| 今日の運勢スコア | 生年月日 × 日付 | `deriveScore(hash, category)` |
| 週替わり特集見出し | 週番号シード | `FEATURES[weekNum % FEATURES.length]` |

### 季節判定

```typescript
// /src/utils/season.ts
export function getSeason() {
  const m = new Date().getMonth() + 1
  if (m >= 3 && m <= 5)  return { key: 'spring', label: '春', emoji: '🌸' }
  if (m >= 6 && m <= 8)  return { key: 'summer', label: '夏', emoji: '☀️' }
  if (m >= 9 && m <= 11) return { key: 'autumn', label: '秋', emoji: '🍂' }
  return { key: 'winter', label: '冬', emoji: '❄️' }
}
```

### 天気連動ヒーローコピー（12パターン）

```typescript
// /src/data/heroCopies.ts
export const HERO_COPIES: Record<string, Record<string, string>> = {
  sunny: {
    spring: '澄んだ空気が、思考を鋭くする日。',
    summer: '強い光の下で、自分の輪郭を確かめる日。',
    autumn: '乾いた風が、余分なものを払う日。',
    winter: '冷えた空気の中で、本質だけが残る日。',
  },
  rainy: {
    spring: '雨音の中で、内側と向き合う日。',
    summer: '雨粒が、思考をゆっくりと整理する。',
    autumn: '静かな雨が、感情を言語化する手伝いをする。',
    winter: '雨に打たれながら、冬の自分を見つめる。',
  },
  cloudy: {
    spring: '曇り空の下で、静かに自分を整理する日。',
    summer: '影の中で、冷静な判断力が働く日。',
    autumn: '灰色の空が、深い思考を誘う。',
    winter: '厚い雲の向こうに、光を探す日。',
  },
}
```

---

## 天気データ（APIキー不要・商用利用可）

### 推奨構成

| 用途 | データソース | 理由 |
|---|---|---|
| 大分県の天気（固定） | 気象庁JSON API | 最高精度・日本語・出典明記で商用可 |
| ユーザー地域（任意） | Open-Meteo | APIキー不要・CORS解放・緯度経度指定可 |

### 気象庁JSON API（大分県）

```typescript
// エリアコード 440000 = 大分県
const JMA_URL = 'https://www.jma.go.jp/bosai/forecast/data/forecast/440000.json'

const res = await fetch(JMA_URL)
const data = await res.json()
const weather = data[0].timeSeries[0].areas[0].weathers[0]  // 例：「晴れ」
const pops = data[0].timeSeries[1].areas[0].pops            // 降水確率配列
```

出典表記必須（画面下部に1行）：`気象情報：気象庁`

### Open-Meteo（ユーザー地域）

```typescript
// APIキー不要・CORS解放済み
const url = `https://api.open-meteo.com/v1/forecast`
  + `?latitude=${lat}&longitude=${lon}`
  + `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max`
  + `&timezone=Asia/Tokyo&forecast_days=3`

const res = await fetch(url)
const data = await res.json()
```

出典表記必須：`Weather data by Open-Meteo`

### 天気コードから状態へのマッピング

```typescript
export function getWeatherState(code: number): 'sunny' | 'cloudy' | 'rainy' {
  if (code <= 1) return 'sunny'
  if (code <= 3) return 'cloudy'
  return 'rainy'
}
```

---

## ユーザー興味検知システム（localStorage完結）

### インターフェース

```typescript
// /src/utils/interest.ts
type InterestMap = {
  self:   number  // 自己理解・診断
  health: number  // 健康・ヘルスケア
  fun:    number  // 娯楽・占い
}

export const interest = {
  get: (): InterestMap =>
    JSON.parse(localStorage.getItem('pk_interest') || '{"self":0,"health":0,"fun":0}'),
  add: (category: keyof InterestMap, weight = 1) => {
    const m = interest.get()
    m[category] = (m[category] || 0) + weight
    localStorage.setItem('pk_interest', JSON.stringify(m))
  },
  reset: () => localStorage.removeItem('pk_interest'),
  top: (): keyof InterestMap =>
    Object.entries(interest.get()).sort(([,a],[,b]) => b-a)[0][0] as keyof InterestMap,
  total: (): number =>
    Object.values(interest.get()).reduce((a, b) => a + b, 0),
}
```

### 記録タイミングと重み

| アクション | カテゴリ | 重み |
|---|---|---|
| コンテンツカードをクリック | そのカテゴリ | +1 |
| コンテンツページ10秒以上滞在 | そのカテゴリ | +2 |
| 診断を最後まで完了 | そのカテゴリ | +5 |
| URLパラメータで戻ってきた（`?from=xxx`） | app に対応するカテゴリ | +5 |

### 表示への反映

```typescript
// /src/hooks/usePersonalized.ts
export function usePersonalized() {
  const top = interest.top()
  const seed = hashDate(new Date())

  // コラムを興味カテゴリ優先でソート
  const sortedColumns = allColumns
    .map(c => ({ ...c, score: c.tags.includes(top) ? 2 : 0 }))
    .sort((a, b) => b.score - a.score)

  // アプリも興味カテゴリを上位に
  const sortedApps = [
    ...allApps.filter(a => a.category === top),
    ...allApps.filter(a => a.category !== top),
  ]

  return { sortedColumns, sortedApps, topCategory: top }
}
```

### 「あなたへのおすすめ」セクション

クリック合計3回以上の場合のみ表示する。

```typescript
if (interest.total() >= 3) {
  // トップページに「あなたへのおすすめ」セクションを挿入
}
```

### プライバシー表記（必須・フッターに常時表示）

```
おすすめ表示はこの端末内の閲覧履歴のみを使用しています。外部への送信は一切行いません。
[履歴をリセット]
```

---

## 外部Webアプリとのポータル連携

### 方針

- Phase 1：リンクで飛ばすだけ（連携なし）
- Phase 2以降：URLパラメータで診断結果を受け取り、興味スコアと「おすすめ表示」に反映

### URLパラメータ仕様

```
https://portakey.netlify.app/?result=[タイプ]&from=[app-id]
```

| アプリ | `from` 値 | `result` 例 | 対応カテゴリ |
|---|---|---|---|
| INNIQ性格診断 | `inniq` | `INFP` / `ENTJ` | `self` |
| IQ診断 | `iq` | `high` / `mid` | `self` |
| 美容タイプ診断 | `beauty` | `natural` / `cool` | `self` |
| ワークタイプ診断 | `work` | `creative` / `analyst` | `self` |
| 星つむぎ | `hoshi` | `ox` / `tiger` | `fun` |

### ポータル側の受信処理

```typescript
// TopPage.tsx の useEffect で1回だけ実行
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const result = params.get('result')
  const from   = params.get('from')

  if (result && from) {
    const category = APP_CATEGORY_MAP[from] ?? 'self'
    interest.add(category, 5)
    setReturnMessage({ result, from })
    // URLをクリーンに（履歴に残さない）
    window.history.replaceState({}, '', window.location.pathname)
  }
}, [])
```

### 各Webアプリへの追加実装（最小限）

各アプリの結果画面に以下を1箇所追加するだけ。

```typescript
const PORTAL_URL = 'https://portakey.netlify.app'
const portalLink = `${PORTAL_URL}/?result=${resultType}&from=[app-id]`

<a href={portalLink}>
  あなたのタイプにおすすめのコンテンツを見る →
</a>
```

対象アプリ：INNIQ・IQ診断・美容タイプ・ワークタイプ・星つむぎの5本のみ。
BERRYBODY・AKIRA BODY CHECK・ストレスチェッカーは対象外（スコア型のため）。

---

## サイト内軽量アプリ

### 今日の運勢（`/apps/fortune`）

フロントのみ。サーバー不要。

```typescript
// /src/apps/fortune/logic.ts
const FARM_FRUITS = ['いちご', 'シャインマスカット', '桃', 'ブルーベリー', 'キウイ']
const LUCKY_COLORS = ['赤', '青', '緑', '白', '金', '紫', '橙', '黄']
const LUCKY_FOODS  = ['いちご', 'ナッツ', '豆腐', '柑橘類', '玄米', 'ハーブティー', '桃', 'ブルーベリー']

export function generateFortune(birthdate: string, today: string) {
  const hash = hashStr(`${birthdate}-${today}`) % 100
  const luckyFood = LUCKY_FOODS[hash % LUCKY_FOODS.length]
  return {
    overall: Math.round(60 + hash * 0.4),
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
    // ラッキーフードが農園フルーツの場合にコラムで大分の農園が登場する文脈を作る
    farmContext: FARM_FRUITS.includes(luckyFood),
  }
}
```

保存：`localStorage.setItem('pk_fortune_last', JSON.stringify({ date, result }))`

---

## 追加機能一覧（Phase別）

### Phase 1（初期リリース時に含める）

**PWA化**
ブックマークより強力。ホーム画面にアイコン追加でアプリ感を演出。

```json
// /public/manifest.json
{
  "name": "PORTAKEY",
  "short_name": "PORTAKEY",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0F6E56",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

```typescript
// /src/main.tsx に追加
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

**診断結果シェア画像生成**
Canvas APIでサーバー不要。結果画面に「画像でシェア」ボタンを設置。

```typescript
// /src/utils/shareImage.ts
export async function generateShareImage(params: {
  title: string
  scores: { label: string; value: number }[]
  siteUrl: string
}): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1200; canvas.height = 630
  const ctx = canvas.getContext('2d')!
  // 背景（ティール）→ タイトル → スコアバー → PORTAKEYロゴ → URL
  return new Promise(resolve => canvas.toBlob(b => resolve(b!)))
}
```

**検索機能**
`contents.json` と `columns.json` をキーワードで横断検索。フロントのみ。

```typescript
// /src/hooks/useSearch.ts
export function useSearch(query: string) {
  if (!query.trim()) return { contents: [], columns: [] }
  const q = query.toLowerCase()
  return {
    contents: allContents.filter(c =>
      c.title.includes(q) || c.description.includes(q) || c.tags.some(t => t.includes(q))
    ),
    columns: allColumns.filter(c =>
      c.title.includes(q) || c.desc.includes(q) || c.tags.some(t => t.includes(q))
    ),
  }
}
```

### Phase 2

**診断履歴の保存と比較**
過去の結果を保存し「3ヶ月前と比べてどう変わったか」を表示。localStorageのみ。

```typescript
// /src/utils/history.ts
type HistoryEntry = {
  app_id: string
  result: string
  date: string
  scores?: Record<string, number>
}
// localStorage キー: 'pk_history'
```

**週間カレンダービュー**
週単位でラッキーデー・テーマを表示。日付シードで自動生成。コスト不要。

**人気コンテンツランキング**
クリック数をlocalStorageで集計。「今週人気の診断」を表示。端末内のみ。

**相性診断（2人の生年月日入力）**
URLパラメータで相手と共有できる設計が拡散につながる。

```typescript
// 結果URLを生成してシェア
const url = `/apps/compatibility?a=${myBirth}&b=${partnerBirth}`
```

### Phase 3

**Web Pushプッシュ通知**
許可したユーザーに毎朝「今日のひとこと」を配信。Netlify Functions + Web Push API。

**Cloudflare KV or Turso**
クロスデバイス同期が必要な時のみ導入を判断。

---

## ページ構成

```
/                    ← トップ（天気×季節ヒーロー + ピックアップ + 各カテゴリ）
/category/self       ← 自己理解・診断一覧
/category/health     ← 健康・ヘルスケア一覧
/category/fun        ← 娯楽・占い一覧
/apps/fortune        ← 今日の運勢（サイト内軽量アプリ）
/content/[id]        ← 個別ページ（外部リンクへの中継）
/search              ← 検索結果ページ
```

---

## ディレクトリ構成

```
/src/
  apps/
    fortune/               ← 今日の運勢
  components/
    ContentCard.tsx        ← カード（ステータスバッジ付き）
    StatusBadge.tsx        ← live/dev/planned バッジ
    DisclaimerBanner.tsx   ← 占い系免責バナー（必須）
    SkeletonCard.tsx       ← ローディング用スケルトン
    WeatherWidget.tsx      ← 天気表示ウィジェット
  hooks/
    useContents.ts         ← contents.json を fetch
    useColumns.ts          ← columns.json を fetch・フィルタ
    usePersonalized.ts     ← 興味スコアに応じたソート
    useSearch.ts           ← 横断検索
    useWeather.ts          ← 気象庁JSON + Open-Meteo
  pages/
    TopPage.tsx
    CategoryPage.tsx
    ContentPage.tsx
    SearchPage.tsx
  utils/
    seed.ts                ← hashDate・shuffleSeed
    season.ts              ← getSeason・getWeatherState
    interest.ts            ← 興味スコアの読み書き
    shareImage.ts          ← Canvas API シェア画像生成
  data/
    heroCopies.ts          ← 天気×季節 12パターンコピー
/public/
  data/
    contents.json
    columns.json
  images/
  icons/                   ← PWA用アイコン（192×192 / 512×512）
  manifest.json            ← PWA設定
  sw.js                    ← Service Worker
```

---

## UIデザイントークン

```css
--pk-primary:        #0F6E56;
--pk-primary-mid:    #1D9E75;
--pk-primary-light:  #E1F5EE;
--pk-primary-border: #5DCAA5;
--pk-lavender:       #EEEDFE;
--pk-lavender-mid:   #7F77DD;
--pk-blue:           #E6F1FB;
--pk-blue-mid:       #185FA5;

--radius-card:  16px;
--radius-btn:   10px;
--radius-badge: 99px;
--font-ja: 'Hiragino Sans', 'Noto Sans JP', sans-serif;
--font-en: 'Geist', sans-serif;
```

---

## モバイルファースト・ブレークポイント

```
grid-cols-1（〜640px）→ sm:grid-cols-2（〜768px）→ lg:grid-cols-3（768px〜）
```

---

## エラー・ローディング状態の設計方針

- ローディング：スケルトンローダー（Cardと同じ寸法）
- エラー：インラインエラー表示（トースト不使用）
- fetch失敗：デフォルト空配列で表示継続
- 天気API失敗：天気ウィジェットを非表示にして他要素には影響させない

---

## 法的対応（必須実装・省略不可）

### 占い・娯楽コンテンツへの免責表示

```typescript
const DISCLAIMER = '本コンテンツは娯楽目的です。科学的根拠を持つものではありません。'
// disclaimer_required: true のコンテンツには必ず表示
```

### NGワード

`絶対当たる` / `必ず` / `100%` / `的中率保証` / `科学的に証明された占い`

---

## 画像ファイル一覧と生成プロンプト（Midjourney v6）

`/public/images/` に配置。

**ヒーロー背景**（`hero-bg.png`、1280×640）:
```
A soft dreamy illustration of a glowing teal key floating above an open landscape with soft light particles, pastel botanical elements, clean white background, flat vector style, minimal, no text --ar 2:1 --style raw --v 6
```

**自己理解デフォルト**（`default-self.png`、800×450）:
```
Minimal flat illustration, glowing brain with colorful neural connections, soft teal background, IQ and personality icons, clean modern design, no text --ar 16:9 --style raw --v 6
```

**健康デフォルト**（`default-health.png`、800×450）:
```
Minimal flat illustration of a human silhouette with body scan overlay, posture alignment lines and health metric icons, soft blue-green background, medical wellness aesthetic, no text --ar 16:9 --style raw --v 6
```

**娯楽・占いデフォルト**（`default-fun.png`、800×450）:
```
Magical flat illustration, crystal ball glowing lavender and gold, floating stars and moon phases, dreamy pastel purple background, no text --ar 16:9 --v 6
```

---

## OGP設定テンプレート（各Webアプリ用）

```html
<meta property="og:title" content="【アプリ名】">
<meta property="og:description" content="【1行説明】">
<meta property="og:image" content="/ogp.png">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

`/public/ogp.png` を配置（1280×640px）→ デプロイ後URLを確認 → `contents.json` の `thumbnail_url` に登録。

---

## フェーズロードマップ

### Phase 1（今すぐ）
- [ ] プロジェクト初期化（Vite + React 19 + TypeScript + Tailwind v4）
- [ ] `contents.json` + `columns.json`（60本）作成
- [ ] `useContents` / `useColumns` hook
- [ ] 自動変化システム（hashDate・shuffleSeed・getSeason）
- [ ] 天気ウィジェット（気象庁JSON）
- [ ] トップページ（天気×季節ヒーロー + ピックアップ + カテゴリ）
- [ ] コンテンツ一覧（ステータスバッジ付き）
- [ ] 今日の運勢（`/apps/fortune`）
- [ ] 検索機能
- [ ] 興味検知システム（interest.ts）
- [ ] シェア画像生成（Canvas API）
- [ ] PWA化（manifest.json + sw.js）
- [ ] Netlify デプロイ

### Phase 2
- [ ] 診断履歴の保存と比較
- [ ] 週間カレンダービュー
- [ ] 人気コンテンツランキング（localStorage集計）
- [ ] 相性診断（URLパラメータ共有）
- [ ] URLパラメータ連携受信（`?result=xxx&from=xxx`）
- [ ] Open-Meteo でユーザー地域の天気表示

### Phase 3
- [ ] Web Pushプッシュ通知
- [ ] Cloudflare KV or Turso（クロスデバイス同期が必要な時のみ）

---

## トップページ レイアウト仕様（重要・必ず遵守）

「有益な情報がたくさんある」と感じさせるマガジン型レイアウトを採用する。
カード3枚の単純グリッドにしてはいけない。以下の構造を必ず守ること。

### トップページの構造（上から順に）

```
1. ナビゲーションバー
   └── ロゴ / 検索ボックス / APERISへのリンク

2. ヒーローセクション（天気×季節で自動変化）
   └── 季節バッジ（春🌸 / 夏☀️ / 秋🍂 / 冬❄️）
   └── キャッチコピー（天気×季節の12パターンから自動選択）
   └── 天気ウィジェット（気象庁JSON / 今日の気温・降水確率・出典表記）
   └── 統計バー：「20+ コンテンツ ／ 4 カテゴリ ／ 無料 ／ 随時追加中」

3. カテゴリフィルタータブ
   └── すべて ／ 自己理解（N件）／ 健康・体（N件）／ 娯楽・占い（N件）
   └── 件数はcontents.jsonから動的に集計する

4. 本日のピックアップ（日付シードで毎日3件自動変化）
   └── 淡いグラデーション背景のカードエリア
   └── 「✦ 本日のピックアップ」ラベル付き
   └── 3件を横並びで表示

5. 今日の運勢ウィジェット（インライン表示）
   └── 生年月日入力済みの場合：4軸スコア・ラッキー3点を表示
   └── 未入力の場合：「生年月日を入力して占う」ボタン表示
   └── 免責表示（必須）

6. 自己理解・診断セクション
   └── 大カード2枚（grid 1fr 1fr）+ 小カード3枚（grid repeat(3,1fr)）
   └── 大カードにはアイキャッチ画像・タグ・タイトル・説明・ステータスバッジ
   └── 小カードはタイトル・タグ・ステータスバッジのみ（高さ節約）

7. 健康・ヘルスケアセクション
   └── リスト型（アイコン + タイトル + 説明 + バッジ）で3件表示

8. 今季のコラム（columns.jsonから天気・季節・興味に応じて2件）
   └── 記事カード型（カバー画像エリア + カテゴリラベル + タイトル + 概要）
   └── 農園は「健康×自然」の題材として自然に登場

9. 娯楽・占いセクション
   └── 小カード3枚横並び
   └── 免責表示（必須）

10. 追加予定コンテンツ（ピル型タグで列挙）
    └── 背景色付きエリア（グレー系）
    └── 「追加予定のコンテンツ」ラベル + 各タイトルをピル型で表示

11. フッター
    └── © 2026 PORTAKEY ／ 利用規約 ／ プライバシー ／ お問い合わせ
    └── 気象情報：気象庁（出典表記）
    └── プライバシー表記：「おすすめ表示はこの端末内の閲覧履歴のみを使用」
    └── [履歴をリセット] ボタン
```

### 情報密度を高める4つの仕掛け

1. **統計バーで規模感を伝える**  
   ヒーロー直下に「20+コンテンツ・4カテゴリ・無料・随時追加」を横並びで表示。数字だけでサイトの充実度を伝える。

2. **カテゴリタブに件数を表示する**  
   「自己理解（6）」のように件数を入れることで、タブを見ただけで「中に複数ある」とわかる。

3. **開発中・未着手コンテンツも全部見せる**  
   `status: 'planned'` のコンテンツもグレースケール＋「近日公開」バッジで表示する。隠してはいけない。「たくさん準備している」感が再訪の期待感になる。

4. **追加予定コンテンツをピルで列挙する**  
   夢診断・カラータイプ診断・決断力診断・睡眠タイプ診断・強み発見テスト・ロト統計・防災チェックを常に表示する。「まだまだ増える」印象を与える。

### ステータスバッジの表示仕様

```typescript
// StatusBadge.tsx
const BADGE_CONFIG = {
  live:    { label: '公開中',   dot: '#1D9E75', bg: '#E1F5EE', text: '#085041' },
  dev:     { label: '開発中',   dot: '#BA7517', bg: '#FAEEDA', text: '#633806' },
  planned: { label: '近日公開', dot: '#aaa',    bg: '#F1EFE8', text: '#5F5E5A' },
}
```

---

## 姉妹サイト APERIS との連携

- ヘッダー/フッターに APERIS へのリンク常時表示（URL確定後に更新）
- 「データ分析・競技分析はAPERISへ →」誘導バナー
- PORTAKEY で自己理解 → APERIS でデータ分析 → AI BLACKで実戦、のステップアップ動線

---

## 開発時の注意

1. **Supabaseは使用しない** — JSON + localStorage で完結させる
2. **ニュースAPIは使用しない** — 商用利用可能な日本語ニュースAPIが存在しない
3. **免責表示は削除・省略しない** — `disclaimer_required: true` には必ず表示
4. **農園はコンテンツの題材として登場する** — 運営者表記・誘導バナーは不要
5. **天気API失敗時は静かに非表示** — サイト全体に影響させない
6. **モバイルファースト** — `grid-cols-1` から始めてメディアクエリで拡張
7. **PWAアイコンを必ず用意** — 192×192 / 512×512 の2サイズ
8. **サムネイルは `thumbnail_url` 直指定** — JSON編集のみで更新
9. **外部サービスを増やさない** — Phase 1はフロントのみで動くこと
10. **気象庁・Open-Meteoの出典表記** — 画面下部に必ず1行表示
