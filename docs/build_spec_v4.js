// Sotto. 仕様書 v0.4 — Phase 2: Spaces Economy
// Generates Sotto_Spec_v0.4.docx in the same folder.

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, TabStopType, TabStopPosition, PageBreak,
} = require("docx");

// ───────────────────────────── styles
const FONT_BODY = "Noto Serif JP";
const FONT_FALLBACK = "Yu Mincho";
const FONT_DISPLAY = "Cormorant Garamond";

const COLOR_INK = "1A1A1A";
const COLOR_GOLD = "B8945C";
const COLOR_MUTE = "6E6859";
const COLOR_LINE = "D8D2C6";
const COLOR_BG_GOLD = "FAF5EB";
const COLOR_BG_INK = "F4F1EC";

// ───────────────────────────── helpers
function p(text, opts = {}) {
  return new Paragraph({
    spacing: opts.spacing ?? { before: 60, after: 60 },
    alignment: opts.alignment,
    children: [new TextRun({
      text,
      font: opts.font ?? FONT_BODY,
      size: opts.size ?? 22,
      bold: opts.bold ?? false,
      italics: opts.italics ?? false,
      color: opts.color ?? COLOR_INK,
    })],
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [
      new TextRun({ text, font: FONT_BODY, size: 32, bold: true, color: COLOR_INK }),
    ],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
    children: [
      new TextRun({ text, font: FONT_BODY, size: 26, bold: true, color: COLOR_INK }),
    ],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({ text, font: FONT_BODY, size: 22, bold: true, color: COLOR_GOLD }),
    ],
  });
}

function blank() { return p(""); }

function quote(text) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    indent: { left: 480, right: 480 },
    border: {
      left: { style: BorderStyle.SINGLE, size: 12, color: COLOR_GOLD, space: 12 },
    },
    children: [new TextRun({
      text, font: FONT_BODY, size: 22, italics: true, color: COLOR_MUTE,
    })],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    spacing: { before: 30, after: 30 },
    numbering: { reference: "sotto-bullets", level },
    children: [new TextRun({ text, font: FONT_BODY, size: 22, color: COLOR_INK })],
  });
}

function number(text, level = 0) {
  return new Paragraph({
    spacing: { before: 30, after: 30 },
    numbering: { reference: "sotto-numbers", level },
    children: [new TextRun({ text, font: FONT_BODY, size: 22, color: COLOR_INK })],
  });
}

const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE };
const cellBorders = {
  top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder,
};

function tcell(content, opts = {}) {
  const paragraphs = Array.isArray(content) ? content : [content];
  return new TableCell({
    borders: cellBorders,
    width: { size: opts.width, type: WidthType.DXA },
    shading: opts.shade
      ? { fill: opts.shade, type: ShadingType.CLEAR }
      : undefined,
    margins: { top: 90, bottom: 90, left: 130, right: 130 },
    children: paragraphs.map((line) => {
      if (line instanceof Paragraph) return line;
      return new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [new TextRun({
          text: line, font: FONT_BODY, size: opts.size ?? 20,
          bold: opts.bold ?? false, color: opts.color ?? COLOR_INK,
        })],
      });
    }),
  });
}

function table(columnWidths, rows) {
  const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths,
    rows,
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 240, after: 240 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({
      text: "—— ※ ——", font: FONT_DISPLAY, size: 22, italics: true,
      color: COLOR_GOLD,
    })],
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ───────────────────────────── content
const children = [];

// COVER
children.push(new Paragraph({
  spacing: { before: 1800, after: 200 },
  alignment: AlignmentType.CENTER,
  children: [new TextRun({
    text: "Sotto.", font: FONT_DISPLAY, size: 96, color: COLOR_INK,
  })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 80, after: 600 },
  children: [new TextRun({
    text: "— Spaces Economy —", font: FONT_DISPLAY, size: 28,
    italics: true, color: COLOR_GOLD,
  })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 0, after: 80 },
  children: [new TextRun({
    text: "仕様書 v0.4", font: FONT_BODY, size: 26, color: COLOR_INK,
  })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 40, after: 600 },
  children: [new TextRun({
    text: "Phase 2 ロードマップ", font: FONT_BODY, size: 22, color: COLOR_MUTE,
  })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 1600, after: 40 },
  children: [new TextRun({
    text: "The Sotto Lounge Project", font: FONT_DISPLAY, size: 24,
    italics: true, color: COLOR_GOLD,
  })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 40, after: 40 },
  children: [new TextRun({
    text: "2026.06.07", font: FONT_BODY, size: 20, color: COLOR_MUTE,
  })],
}));
children.push(pageBreak());

// ───────────────────────────── 0. このドキュメント
children.push(h1("0. このドキュメント"));
children.push(p("Sotto. 仕様書 v0.4 は、v0.3 で確立した「AI音楽の置き場」というプロダクトコンセプトを、次の段階 ——「音楽の経済圏」へと進化させる Phase 2 のロードマップである。"));
children.push(p("v0.3 までで Sotto. は、AI クリエイターが「1曲を静かに置く」場所として最小成立した。本 v0.4 では、そこに置かれた音楽が現実の店舗で流れ、クリエイターに継続的な報酬をもたらす循環を設計する。"));
children.push(blank());

children.push(h3("対象読者"));
children.push(bullet("代表（藤原靖子 / The Sotto Lounge Project）"));
children.push(bullet("外部協力者（開発・デザイン・キュレーション）"));
children.push(bullet("将来の投資家・パートナー企業"));
children.push(bullet("将来の Sotto Spaces 加盟店舗オーナー（要約版を別途用意）"));
children.push(blank());

children.push(h3("バージョン履歴"));
children.push(table([2000, 2500, 4800], [
  new TableRow({ children: [
    tcell("Version", { shade: COLOR_BG_GOLD, bold: true, width: 2000 }),
    tcell("日付", { shade: COLOR_BG_GOLD, bold: true, width: 2500 }),
    tcell("主な変更", { shade: COLOR_BG_GOLD, bold: true, width: 4800 }),
  ]}),
  new TableRow({ children: [
    tcell("v0.1", { width: 2000 }),
    tcell("2026.05", { width: 2500 }),
    tcell("初版（プロダクト基本構想）", { width: 4800 }),
  ]}),
  new TableRow({ children: [
    tcell("v0.2", { width: 2000 }),
    tcell("2026.05", { width: 2500 }),
    tcell("Web/PWA 前提への改訂、技術スタック確定", { width: 4800 }),
  ]}),
  new TableRow({ children: [
    tcell("v0.3", { width: 2000 }),
    tcell("2026.06", { width: 2500 }),
    tcell("オープン登録 + 軽い審査、Pro 課金、Sotto Spaces 構想の明文化、Early Bird ¥350", { width: 4800 }),
  ]}),
  new TableRow({ children: [
    tcell("v0.4", { shade: COLOR_BG_GOLD, bold: true, width: 2000 }),
    tcell("2026.06.07", { shade: COLOR_BG_GOLD, bold: true, width: 2500 }),
    tcell("Phase 2: Spaces Economy（チャンネル / マッチング / 経済圏化）", { shade: COLOR_BG_GOLD, bold: true, width: 4800 }),
  ]}),
]));
children.push(pageBreak());

// ───────────────────────────── 1. ナラティブの進化
children.push(h1("1. ナラティブの進化"));
children.push(p("Sotto. が辿る三段階の物語を確認する。"));
children.push(blank());

children.push(table([3000, 6300], [
  new TableRow({ children: [
    tcell("v0.1 – v0.2", { shade: COLOR_BG_INK, bold: true, width: 3000 }),
    tcell([
      p("AIで作った1曲を「作品」として置く場所", { size: 22, bold: true }),
      p("クリエイター個人の「置き場」が目的。SoundCloud に近い構造。", { size: 20, color: COLOR_MUTE }),
    ], { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("v0.3", { shade: COLOR_BG_INK, bold: true, width: 3000 }),
    tcell([
      p("音楽が空間に届く。", { size: 22, bold: true }),
      p("「店舗で流す音楽」というユースケースを定義。Sotto Spaces 構想を発表。", { size: 20, color: COLOR_MUTE }),
    ], { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("v0.4", { shade: COLOR_BG_GOLD, bold: true, width: 3000 }),
    tcell([
      p("あなたの音楽が、世界の店舗で奏でられる。", { size: 22, bold: true, color: COLOR_GOLD }),
      p("Sotto. は「置き場」から「音楽の経済圏」へ。クリエイターが継続的な報酬を得る構造を持つ。", { size: 20, color: COLOR_MUTE }),
    ], { width: 6300 }),
  ]}),
]));

children.push(blank());
children.push(quote("AI クリエイターの新しいキャリアパスを設計する。今までは Suno でバズって Spotify 配信が限界だった。これからは Sotto Spaces 経由で月10万円の安定収入が現実になる。"));
children.push(pageBreak());

// ───────────────────────────── 2. Phase 2 全体像
children.push(h1("2. Phase 2 全体像"));
children.push(p("Phase 2 では3つの新機能を段階的に投入する。各機能は独立して価値を提供しつつ、組み合わさることで「経済圏」を成立させる。"));
children.push(blank());

children.push(h2("2.1 三本柱"));
children.push(table([700, 2400, 3500, 2700], [
  new TableRow({ children: [
    tcell("#", { shade: COLOR_BG_GOLD, bold: true, width: 700 }),
    tcell("機能", { shade: COLOR_BG_GOLD, bold: true, width: 2400 }),
    tcell("目的", { shade: COLOR_BG_GOLD, bold: true, width: 3500 }),
    tcell("対象", { shade: COLOR_BG_GOLD, bold: true, width: 2700 }),
  ]}),
  new TableRow({ children: [
    tcell("①", { width: 700 }),
    tcell([p("Space Channels", { size: 22, bold: true }), p("店舗向けチャンネル", { size: 20, color: COLOR_MUTE })], { width: 2400 }),
    tcell("店舗オーナーが曲ではなく「空間」を選べる入り口を作る", { width: 3500 }),
    tcell("店舗オーナー", { width: 2700 }),
  ]}),
  new TableRow({ children: [
    tcell("②", { width: 700 }),
    tcell([p("Creator Space Matching", { size: 22, bold: true }), p("用途タグ", { size: 20, color: COLOR_MUTE })], { width: 2400 }),
    tcell("クリエイターが投稿時に用途を宣言し、マッチング精度を高める", { width: 3500 }),
    tcell("クリエイター", { width: 2700 }),
  ]}),
  new TableRow({ children: [
    tcell("③", { width: 700 }),
    tcell([p("Usage Proof & Board", { size: 22, bold: true }), p("実績可視化 + 募集掲示板", { size: 20, color: COLOR_MUTE })], { width: 2400 }),
    tcell("利用実績を可視化し、店舗とクリエイターをマッチング、報酬分配する", { width: 3500 }),
    tcell("両者", { width: 2700 }),
  ]}),
]));

children.push(blank());
children.push(h2("2.2 経済圏としての構造"));
children.push(p("3つの機能が組み合わさることで、Sotto. は「音楽の発注プラットフォーム」になる。"));
children.push(blank());
children.push(quote("店舗オーナーが空間を選ぶ → クリエイターが用途を宣言した曲が見つかる → 採用される → 利用実績が可視化される → 新規店舗が安心して採用する → クリエイターに継続報酬が入る → もっと作りたくなる → 良い曲が集まる → 良い店舗が集まる"));
children.push(blank());
children.push(p("これは典型的な両面市場（two-sided marketplace）のネットワーク効果であり、Sotto. は AI 音楽分野でこの構造を最初に作る。"));
children.push(pageBreak());

// ───────────────────────────── 3. ① Space Channels
children.push(h1("3. ① Space Channels（店舗向けチャンネル）"));
children.push(quote("店舗オーナーは「ジャンル」を知らない。彼らが知っているのは「自分の店の空気感」だ。"));

children.push(h2("3.1 目的"));
children.push(p("店舗オーナーが曲ではなく「空間」を選べる入り口を作る。"));
children.push(p("ジャンル知識ゼロでも「自分の店」をイメージさえできれば適切な音楽にたどり着ける仕組み。これは Spotify や Apple Music for Business にはない、Sotto. 独自の構造である。"));

children.push(h2("3.2 カテゴリー（業種別）"));
children.push(p("初期リリース時に用意する6カテゴリー："));
children.push(blank());
children.push(table([3000, 6300], [
  new TableRow({ children: [
    tcell("Beauty Salon", { shade: COLOR_BG_INK, bold: true, width: 3000 }),
    tcell("美容室・ヘアサロン・ネイルサロン", { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("Hotel Lounge", { shade: COLOR_BG_INK, bold: true, width: 3000 }),
    tcell("ホテルラウンジ・ロビー・ビジネスホテル", { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("Cafe", { shade: COLOR_BG_INK, bold: true, width: 3000 }),
    tcell("カフェ・喫茶店・ベーカリー", { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("Pilates Studio", { shade: COLOR_BG_INK, bold: true, width: 3000 }),
    tcell("ピラティス・ヨガ・パーソナルジム", { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("Spa", { shade: COLOR_BG_INK, bold: true, width: 3000 }),
    tcell("スパ・エステサロン・温浴施設", { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("Showroom", { shade: COLOR_BG_INK, bold: true, width: 3000 }),
    tcell("ショールーム・ギャラリー・アパレル店舗", { width: 6300 }),
  ]}),
]));

children.push(h2("3.3 プレイリスト（チャンネル内の細分化）"));
children.push(p("各カテゴリーには 3〜5 のキュレーション済みプレイリストを用意する。"));
children.push(blank());

children.push(h3("Beauty Salon"));
children.push(bullet("Morning Salon — 朝の静かなお迎え"));
children.push(bullet("Quiet Luxury — 落ち着いた高級感"));
children.push(bullet("Korean Minimal — 韓国系ミニマル"));
children.push(bullet("Natural Glow — 自然光を感じる温度"));
children.push(blank());

children.push(h3("Hotel Lounge"));
children.push(bullet("Ocean Lobby — 海辺のホテル"));
children.push(bullet("Evening Reception — 夕方のチェックイン"));
children.push(bullet("Silent Business — 商談・ビジネスホテル"));
children.push(blank());

children.push(h3("Cafe"));
children.push(bullet("Slow Morning — ゆっくりした朝"));
children.push(bullet("Lo-fi Afternoon — 午後の集中時間"));
children.push(bullet("Closing Hours — 閉店前の余韻"));
children.push(blank());

children.push(p("これらは「ブランド語彙」として一貫性を保つ。Sotto. のキュレーター（初期は代表）が選定する。", { color: COLOR_MUTE, italics: true }));

children.push(h2("3.4 UI 仕様"));
children.push(h3("トップページ"));
children.push(p("ヘッダー直下に大きく2つの選択肢を表示："));
children.push(blank());

children.push(table([4650, 4650], [
  new TableRow({ children: [
    tcell([
      p("[ Listen ]", { size: 26, bold: true, color: COLOR_GOLD }),
      p("Sotto. の楽曲をブラウズしたい人へ", { size: 20, color: COLOR_MUTE }),
    ], { shade: COLOR_BG_GOLD, width: 4650 }),
    tcell([
      p("[ For Spaces ]", { size: 26, bold: true, color: COLOR_GOLD }),
      p("店舗で流す音楽を探している人へ", { size: 20, color: COLOR_MUTE }),
    ], { shade: COLOR_BG_GOLD, width: 4650 }),
  ]}),
]));

children.push(blank());
children.push(h3("/spaces ページ（業種別ブラウズ）"));
children.push(p("For Spaces を押すと、6カテゴリーがダーク・ギャラリー風にグリッド表示される。"));
children.push(bullet("各カテゴリーをタップ → そのカテゴリーのプレイリスト一覧"));
children.push(bullet("プレイリストをタップ → 楽曲が連続再生される（プレイヤーUI）"));
children.push(bullet("店舗オーナーは再生ボタンを押すだけで利用可能"));
children.push(bullet("商用利用（実店舗で流す）は Sotto Spaces Premium 契約が必要（後述）"));

children.push(h2("3.5 データモデル"));
children.push(p("新規テーブル：channels, playlists, playlist_works"));
children.push(blank());
children.push(table([2400, 6900], [
  new TableRow({ children: [
    tcell("channels", { shade: COLOR_BG_INK, bold: true, width: 2400 }),
    tcell("業種カテゴリー（slug, name_ja, name_en, description, sort_order）", { width: 6900 }),
  ]}),
  new TableRow({ children: [
    tcell("playlists", { shade: COLOR_BG_INK, bold: true, width: 2400 }),
    tcell("プレイリスト（channel_id, slug, title, description, curator_id, cover_url, is_published）", { width: 6900 }),
  ]}),
  new TableRow({ children: [
    tcell("playlist_works", { shade: COLOR_BG_INK, bold: true, width: 2400 }),
    tcell("プレイリストと曲の中間テーブル（playlist_id, work_id, position）", { width: 6900 }),
  ]}),
]));
children.push(pageBreak());

// ───────────────────────────── 4. ② Creator Space Matching
children.push(h1("4. ② Creator Space Matching"));
children.push(quote("クリエイターが「この曲は美容室向け」と宣言した瞬間に、初めてマッチングが始まる。"));

children.push(h2("4.1 目的"));
children.push(p("投稿時にクリエイターが用途を宣言することで、店舗とのマッチング精度を高める。これは AI で適当に分類するのではなく、作り手の意図そのものを構造化することで、Sotto. のキュレーション品質を保つ。"));

children.push(h2("4.2 投稿フォーム追加項目"));
children.push(h3("Space Tags（用途タグ）— 複数選択"));
children.push(p("「この音楽はどんな空間向けですか？」"));
children.push(blank());
children.push(table([3100, 3100, 3100], [
  new TableRow({ children: [
    tcell("Beauty Salon", { width: 3100 }),
    tcell("Hotel Lounge", { width: 3100 }),
    tcell("Cafe", { width: 3100 }),
  ]}),
  new TableRow({ children: [
    tcell("Spa", { width: 3100 }),
    tcell("Pilates / Yoga", { width: 3100 }),
    tcell("Restaurant", { width: 3100 }),
  ]}),
  new TableRow({ children: [
    tcell("Office", { width: 3100 }),
    tcell("Showroom", { width: 3100 }),
    tcell("Other", { width: 3100 }),
  ]}),
]));

children.push(blank());
children.push(h3("Vibe Tags（雰囲気タグ）— 複数選択"));
children.push(p("「どんな雰囲気の曲ですか？」"));
children.push(blank());
children.push(table([3100, 3100, 3100], [
  new TableRow({ children: [
    tcell("Quiet", { width: 3100 }),
    tcell("Luxury", { width: 3100 }),
    tcell("Minimal", { width: 3100 }),
  ]}),
  new TableRow({ children: [
    tcell("Warm", { width: 3100 }),
    tcell("Modern", { width: 3100 }),
    tcell("Nature", { width: 3100 }),
  ]}),
]));

children.push(blank());
children.push(p("複数選択可能。最大3つ程度を推奨（多すぎると焦点が散る）。", { color: COLOR_MUTE, italics: true }));

children.push(h2("4.3 タグの語彙統制"));
children.push(p("自由入力にせず、上記のキュレーション済みの語彙のみ使用可能とする。理由："));
children.push(bullet("Sotto. のブランド一貫性を保つ"));
children.push(bullet("検索・フィルタリングが正確になる"));
children.push(bullet("店舗側が直感的に理解できる"));
children.push(bullet("将来のチャンネル拡張時に語彙を統制された状態で増やせる"));
children.push(blank());
children.push(p("ただし、自由記述の concept（コンセプト文）は引き続き任意で書ける。タグは構造化データ、concept は表現の場、という分業。", { color: COLOR_MUTE, italics: true }));

children.push(h2("4.4 楽曲詳細ページに表示"));
children.push(p("作品詳細ページに用途タグと雰囲気タグを金色のチップで表示。タップするとそのタグで絞り込まれた一覧へ。"));

children.push(h2("4.5 データモデル"));
children.push(p("works テーブル拡張："));
children.push(blank());
children.push(table([3000, 6300], [
  new TableRow({ children: [
    tcell("space_tags", { shade: COLOR_BG_INK, bold: true, width: 3000 }),
    tcell("text[] — 用途タグ（最大9種類から選択、最大3つ推奨）", { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("vibe_tags", { shade: COLOR_BG_INK, bold: true, width: 3000 }),
    tcell("text[] — 雰囲気タグ（6種類から選択、最大3つ推奨）", { width: 6300 }),
  ]}),
]));
children.push(pageBreak());

// ───────────────────────────── 5. ③ Usage Proof & Matching Board
children.push(h1("5. ③ Usage Proof & Matching Board"));
children.push(quote("「12 Spaces Using This Track」— その一行が、クリエイターの自信になる。"));

children.push(h2("5.1 目的"));
children.push(p("音楽が実際に店舗で使われていることを可視化し、両面市場のネットワーク効果を起動する。さらに、店舗とクリエイターが直接マッチングできる募集掲示板を提供する。"));

children.push(h2("5.2 Usage Proof（利用実績）"));
children.push(h3("楽曲ページの表示例"));
children.push(blank());
children.push(table([9300], [
  new TableRow({ children: [
    tcell([
      p("12 Spaces Using This Track", { size: 26, bold: true, color: COLOR_GOLD, alignment: AlignmentType.CENTER }),
      blank(),
      p("利用業種：Beauty Salon · Hotel Lounge · Cafe", { size: 20, color: COLOR_MUTE, alignment: AlignmentType.CENTER }),
    ], { shade: COLOR_BG_GOLD, width: 9300 }),
  ]}),
]));

children.push(blank());
children.push(h3("3つの効果"));
children.push(table([2400, 6900], [
  new TableRow({ children: [
    tcell("店舗オーナー", { shade: COLOR_BG_INK, bold: true, width: 2400 }),
    tcell("採用実績がある＝安心して使える（社会的証明）", { width: 6900 }),
  ]}),
  new TableRow({ children: [
    tcell("クリエイター", { shade: COLOR_BG_INK, bold: true, width: 2400 }),
    tcell("自分の曲が使われている＝喜び＝もっと作りたくなる", { width: 6900 }),
  ]}),
  new TableRow({ children: [
    tcell("新規流入", { shade: COLOR_BG_INK, bold: true, width: 2400 }),
    tcell("「使われてる曲ランキング」が口コミになる", { width: 6900 }),
  ]}),
]));

children.push(h3("採用の証明方法"));
children.push(p("Phase 2.2 では、店舗オーナーの自己申告制でスタート。Phase 2.5 で Sotto Spaces Player（埋込み・iPad アプリ）を提供し、自動計測へ移行する。"));
children.push(bullet("Phase 2.2：店舗オーナーが管理画面から「採用しました」と申告"));
children.push(bullet("Phase 2.5：Player 経由の再生時間を自動集計"));

children.push(h2("5.3 Matching Board（店舗募集掲示板）"));
children.push(h3("店舗オーナー投稿例"));
children.push(quote("韓国系美容室です。落ち着いた Lo-fi を探しています。月10時間程度の利用。クリエイターからの提案歓迎です。"));
children.push(quote("ホテルロビー向けの環境音楽を探しています。明け方〜夜まで通して流せる、季節感のある楽曲があれば。"));

children.push(h3("掲示板のステータス管理"));
children.push(table([2400, 6900], [
  new TableRow({ children: [
    tcell("募集中", { shade: COLOR_BG_INK, bold: true, width: 2400 }),
    tcell("店舗が新規募集を投稿した状態。クリエイター提案受付中。", { width: 6900 }),
  ]}),
  new TableRow({ children: [
    tcell("提案受付中", { shade: COLOR_BG_INK, bold: true, width: 2400 }),
    tcell("店舗が複数提案を比較検討中。", { width: 6900 }),
  ]}),
  new TableRow({ children: [
    tcell("採用済", { shade: COLOR_BG_INK, bold: true, width: 2400 }),
    tcell("採用したクリエイターと契約済み。", { width: 6900 }),
  ]}),
  new TableRow({ children: [
    tcell("クローズ", { shade: COLOR_BG_INK, bold: true, width: 2400 }),
    tcell("採用なしで終了、または期限切れ（デフォルト30日）。", { width: 6900 }),
  ]}),
]));

children.push(h2("5.4 Suggest This Track（クリエイター応募）"));
children.push(p("クリエイター側は、募集ボードを見て自分の楽曲をエントリーできる。"));
children.push(blank());
children.push(table([9300], [
  new TableRow({ children: [
    tcell([
      p("[ Suggest This Track ]", { size: 26, bold: true, color: COLOR_GOLD, alignment: AlignmentType.CENTER }),
    ], { shade: COLOR_BG_GOLD, width: 9300 }),
  ]}),
]));

children.push(blank());
children.push(h3("提案フロー"));
children.push(number("クリエイターが募集投稿を見つける"));
children.push(number("自分の楽曲一覧から「これを提案」ボタン"));
children.push(number("店舗側ダッシュボードに提案が届く"));
children.push(number("店舗側は「ありがとう」「興味あり」「採用」の3段階で意思表示"));
children.push(number("採用されると契約・報酬分配へ"));

children.push(h2("5.5 経済圏化：報酬分配"));
children.push(p("Phase 2.5 で Stripe Connect によるロイヤリティ自動分配を実装する。"));
children.push(blank());
children.push(table([3000, 6300], [
  new TableRow({ children: [
    tcell("店舗側課金", { shade: COLOR_BG_INK, bold: true, width: 3000 }),
    tcell("Sotto Spaces Premium：月額 ¥2,000（曲数無制限・商用利用可）", { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("クリエイター分配", { shade: COLOR_BG_INK, bold: true, width: 3000 }),
    tcell("採用1店舗あたり ¥500/月のロイヤリティ。100店舗で採用されれば ¥50,000/月。", { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("Sotto. 取り分", { shade: COLOR_BG_INK, bold: true, width: 3000 }),
    tcell("差額 ¥1,500/月（システム運営・キュレーション・キュレーター人件費）", { width: 6300 }),
  ]}),
]));

children.push(blank());
children.push(p("価格は v0.4 時点の仮設定。実装時に市場テストして最適化する。", { color: COLOR_MUTE, italics: true }));

children.push(h2("5.6 データモデル"));
children.push(table([2700, 6600], [
  new TableRow({ children: [
    tcell("spaces", { shade: COLOR_BG_INK, bold: true, width: 2700 }),
    tcell("店舗アカウント（owner_id, name, business_type, location, premium_until, …）", { width: 6600 }),
  ]}),
  new TableRow({ children: [
    tcell("requests", { shade: COLOR_BG_INK, bold: true, width: 2700 }),
    tcell("店舗からの募集投稿（space_id, title, description, expires_at, status）", { width: 6600 }),
  ]}),
  new TableRow({ children: [
    tcell("suggestions", { shade: COLOR_BG_INK, bold: true, width: 2700 }),
    tcell("クリエイター提案（request_id, work_id, creator_id, message, status）", { width: 6600 }),
  ]}),
  new TableRow({ children: [
    tcell("adoptions", { shade: COLOR_BG_INK, bold: true, width: 2700 }),
    tcell("採用記録（space_id, work_id, adopted_at, monthly_amount, last_paid_at）", { width: 6600 }),
  ]}),
]));
children.push(pageBreak());

// ───────────────────────────── 6. 実装ロードマップ
children.push(h1("6. 実装ロードマップ（Phase 2.0 – 2.5）"));
children.push(p("段階的に投入することで、各フェーズで市場反応を見ながら次に進める。"));
children.push(blank());

children.push(table([1700, 2700, 4900], [
  new TableRow({ children: [
    tcell("Phase", { shade: COLOR_BG_GOLD, bold: true, width: 1700 }),
    tcell("内容", { shade: COLOR_BG_GOLD, bold: true, width: 2700 }),
    tcell("成果物", { shade: COLOR_BG_GOLD, bold: true, width: 4900 }),
  ]}),
  new TableRow({ children: [
    tcell("2.0", { shade: COLOR_BG_INK, bold: true, width: 1700 }),
    tcell("Space マッチング基盤", { width: 2700 }),
    tcell([
      bullet("works テーブルに space_tags / vibe_tags 追加"),
      bullet("投稿フォームにタグ選択UI追加"),
      bullet("作品詳細ページにタグ表示"),
    ], { width: 4900 }),
  ]}),
  new TableRow({ children: [
    tcell("2.1", { shade: COLOR_BG_INK, bold: true, width: 1700 }),
    tcell("For Spaces ページ", { width: 2700 }),
    tcell([
      bullet("channels / playlists テーブル新設"),
      bullet("/spaces 業種別ブラウズ"),
      bullet("プレイリストプレイヤー"),
      bullet("トップに [Listen] [For Spaces] 切替"),
    ], { width: 4900 }),
  ]}),
  new TableRow({ children: [
    tcell("2.2", { shade: COLOR_BG_INK, bold: true, width: 1700 }),
    tcell("Usage Proof 表示", { width: 2700 }),
    tcell([
      bullet("works に usage_count 追加（self-report）"),
      bullet("作品ページに「N Spaces Using」表示"),
      bullet("人気曲ランキング"),
    ], { width: 4900 }),
  ]}),
  new TableRow({ children: [
    tcell("2.3", { shade: COLOR_BG_INK, bold: true, width: 1700 }),
    tcell("Matching Board", { width: 2700 }),
    tcell([
      bullet("spaces / requests テーブル新設"),
      bullet("店舗アカウント登録フロー"),
      bullet("/spaces/board 店舗投稿一覧"),
      bullet("店舗オーナー管理画面"),
    ], { width: 4900 }),
  ]}),
  new TableRow({ children: [
    tcell("2.4", { shade: COLOR_BG_INK, bold: true, width: 1700 }),
    tcell("Suggest This Track", { width: 2700 }),
    tcell([
      bullet("suggestions テーブル新設"),
      bullet("クリエイター提案UI"),
      bullet("店舗側「ありがとう/興味あり/採用」フロー"),
    ], { width: 4900 }),
  ]}),
  new TableRow({ children: [
    tcell("2.5", { shade: COLOR_BG_GOLD, bold: true, width: 1700 }),
    tcell("経済圏化", { width: 2700 }),
    tcell([
      bullet("Stripe Connect 連携"),
      bullet("ロイヤリティ自動分配"),
      bullet("クリエイター収益ダッシュボード"),
      bullet("Sotto Spaces Player（埋込み・iPad アプリ）"),
    ], { width: 4900 }),
  ]}),
]));
children.push(pageBreak());

// ───────────────────────────── 7. KPI
children.push(h1("7. KPI（各フェーズの成功指標）"));
children.push(p("Phase 2 の各段階で見るべき指標を整理する。"));
children.push(blank());

children.push(h3("Phase 2.0–2.1：基盤"));
children.push(bullet("作品投稿時のタグ付け率：70% 以上"));
children.push(bullet("/spaces ページ訪問者の業種別 CTR：平均 30% 以上"));
children.push(bullet("プレイリスト再生完了率：50% 以上"));
children.push(blank());

children.push(h3("Phase 2.2–2.3：マーケット形成"));
children.push(bullet("店舗アカウント登録数：100 件（v0.4 公開後3ヶ月）"));
children.push(bullet("Matching Board 投稿数：月20 件以上"));
children.push(bullet("クリエイター提案率：1募集あたり平均3提案"));
children.push(blank());

children.push(h3("Phase 2.4–2.5：経済圏成立"));
children.push(bullet("採用率：提案100件あたり10件採用（10%）"));
children.push(bullet("Sotto Spaces Premium 契約数：月500契約"));
children.push(bullet("クリエイター月間平均ロイヤリティ：¥10,000 以上"));
children.push(bullet("Sotto. 全体 ARR（年間経常収益）：¥1,500万円"));
children.push(pageBreak());

// ───────────────────────────── 8. リスクと対策
children.push(h1("8. リスクと対策"));
children.push(table([3000, 6300], [
  new TableRow({ children: [
    tcell("リスク", { shade: COLOR_BG_GOLD, bold: true, width: 3000 }),
    tcell("対策", { shade: COLOR_BG_GOLD, bold: true, width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("店舗側の流入不足", { width: 3000 }),
    tcell("既存のヘアサロンオーナーコミュニティ / Instagram 経由のリーチ。代表（藤原）の人脈活用。最初の100店舗は無料Premium提供。", { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("クリエイターの離脱", { width: 3000 }),
    tcell("Phase 2.5 までは確実な報酬がないため、Sotto Pro（¥500）に加えてクリエイター向け広報（採用事例の共有）を継続。", { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("AI 著作権の不確実性", { width: 3000 }),
    tcell("利用規約で「商用利用ライセンスはクリエイターが Sotto. に許諾」と明記。Suno / Udio 等のソース AI ツール側の規約も追跡。", { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("採用申告の不正", { width: 3000 }),
    tcell("Phase 2.5 で Player 計測に移行。Phase 2.2–2.4 は信頼ベース運用 + 異常値検知。", { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("競合（Spotify for Business 等）の参入", { width: 3000 }),
    tcell("「空間で選ぶ」「個人クリエイター直接採用」「ロイヤリティ分配」の3点で差別化。ダーク・ギャラリーの世界観で代替不能なブランドを確立。", { width: 6300 }),
  ]}),
]));
children.push(pageBreak());

// ───────────────────────────── 9. 次のアクション
children.push(h1("9. 次のアクション"));
children.push(p("v0.4 公開後、3ヶ月以内に着手する優先項目："));
children.push(blank());

children.push(number("Phase 1 安定運用（投稿UX改善・最初の50クリエイター獲得）"));
children.push(number("Phase 2.0 タグ機能追加（works テーブル拡張 + 投稿フォーム）"));
children.push(number("Phase 2.1 /spaces ページのモック作成 + キュレーション語彙の確定"));
children.push(number("最初の10店舗への営業（無料Premium枠提供）"));
children.push(number("Phase 2.3 Matching Board の MVP 実装"));
children.push(number("Stripe Connect の事前申請（Phase 2.5 に向けて）"));
children.push(blank());

children.push(divider());
children.push(blank());
children.push(p("Sotto. の本質は、AI 音楽を「単なるコンテンツ」ではなく、「空間に届く作品」として扱うことにある。Phase 2 はそのコンセプトに、経済的な裏付けを与える段階である。"));
children.push(blank());
children.push(quote("音楽が空間に届く。 — そして、作り手のもとへ報酬が戻ってくる。"));
children.push(blank());
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 600, after: 80 },
  children: [new TextRun({
    text: "— The Sotto Lounge Project —", font: FONT_DISPLAY, size: 22,
    italics: true, color: COLOR_GOLD,
  })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 40 },
  children: [new TextRun({
    text: "2026.06.07", font: FONT_BODY, size: 20, color: COLOR_MUTE,
  })],
}));

// ───────────────────────────── build doc
const doc = new Document({
  creator: "The Sotto Lounge Project",
  title: "Sotto. 仕様書 v0.4 — Phase 2: Spaces Economy",
  description: "Phase 2 ロードマップ：Space Channels / Creator Space Matching / Usage Proof & Matching Board",
  styles: {
    default: {
      document: { run: { font: FONT_BODY, size: 22, color: COLOR_INK } },
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: FONT_BODY, color: COLOR_INK },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: FONT_BODY, color: COLOR_INK },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: FONT_BODY, color: COLOR_GOLD },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "sotto-bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "・",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 320 } } },
        }],
      },
      {
        reference: "sotto-numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(__dirname, "Sotto_Spec_v0.4.docx");
  fs.writeFileSync(out, buf);
  console.log("✓ wrote", out, "(" + buf.length + " bytes)");
});
