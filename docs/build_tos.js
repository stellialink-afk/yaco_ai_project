// Sotto. 利用規約（ToS）日本語ドラフト
// Generates Sotto_Terms_of_Service_v1.0_draft.docx
//
// ⚠️ これはドラフトです。公開前に IT・エンタメ専門の弁護士チェックを推奨します。

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak,
} = require("docx");

const FONT = "Noto Serif JP";
const COLOR_INK = "1A1A1A";
const COLOR_GOLD = "B8945C";
const COLOR_MUTE = "6E6859";
const COLOR_LINE = "D8D2C6";

function p(text, opts = {}) {
  return new Paragraph({
    spacing: opts.spacing ?? { before: 80, after: 80 },
    alignment: opts.alignment,
    indent: opts.indent,
    children: [new TextRun({
      text, font: FONT, size: opts.size ?? 22,
      bold: opts.bold ?? false, italics: opts.italics ?? false,
      color: opts.color ?? COLOR_INK,
    })],
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({ text, font: FONT, size: 30, bold: true, color: COLOR_INK })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, font: FONT, size: 24, bold: true, color: COLOR_GOLD })],
  });
}

function num(text, level = 0) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    numbering: { reference: "tos-numbers", level },
    children: [new TextRun({ text, font: FONT, size: 22 })],
  });
}

function bullet(text) {
  return new Paragraph({
    spacing: { before: 30, after: 30 },
    numbering: { reference: "tos-bullets", level: 0 },
    children: [new TextRun({ text, font: FONT, size: 22 })],
  });
}

function blank() { return p(""); }

function notice(text) {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    indent: { left: 480, right: 480 },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: COLOR_GOLD, space: 12 } },
    children: [new TextRun({ text, font: FONT, size: 22, italics: true, color: COLOR_MUTE })],
  });
}

const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE };
const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

function tcell(text, opts = {}) {
  return new TableCell({
    borders: cellBorders,
    width: { size: opts.width, type: WidthType.DXA },
    shading: opts.shade ? { fill: opts.shade, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 130, right: 130 },
    children: [new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text, font: FONT, size: 20, bold: opts.bold ?? false })],
    })],
  });
}

function table(columnWidths, rows) {
  return new Table({
    width: { size: columnWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths,
    rows,
  });
}

const children = [];

// ───────────── COVER
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 1600, after: 200 },
  children: [new TextRun({ text: "Sotto.", font: "Cormorant Garamond", size: 80, color: COLOR_INK })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 40, after: 600 },
  children: [new TextRun({ text: "— Terms of Service —", font: "Cormorant Garamond", size: 28, italics: true, color: COLOR_GOLD })],
}));
children.push(p("利用規約", { alignment: AlignmentType.CENTER, size: 36, bold: true }));
children.push(p("v1.0 ドラフト", { alignment: AlignmentType.CENTER, size: 22, color: COLOR_MUTE }));
children.push(p("作成日：2026年6月10日", { alignment: AlignmentType.CENTER, size: 20, color: COLOR_MUTE }));
children.push(blank());
children.push(blank());
children.push(notice("【重要】本書はドラフトです。公開前に IT・エンタメ専門の弁護士によるレビューを必ず受けてください。Sotto. の事業内容・課金体系の確定後に最終版へ更新します。"));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ───────────── 前文
children.push(h1("前文"));
children.push(p("「Sotto.」（以下「本サービス」といいます）は、The Sotto Lounge Project（以下「当社」または「Sotto.」といいます）が運営する、AI技術によって生成された音楽作品を発表・共有するためのオンラインプラットフォームです。"));
children.push(p("本利用規約（以下「本規約」といいます）は、本サービスをご利用になる全ての方（以下「利用者」または「ユーザー」といいます）と当社との間の権利義務関係を定めることを目的とし、利用者と当社との間の本サービスの利用に関わる一切の関係に適用されます。"));
children.push(p("利用者は、本サービスを利用することにより、本規約のすべての条項に同意したものとみなされます。"));

// ───────────── 第1条
children.push(h1("第1条（定義）"));
children.push(p("本規約において使用する用語の意義は、以下のとおりとします。"));
children.push(num("「本サービス」とは、当社が運営する「Sotto.」という名称のオンラインプラットフォーム（ウェブサイト、関連アプリケーション、付随サービスを含む）を指します。"));
children.push(num("「投稿コンテンツ」とは、利用者が本サービスに投稿した音源、ジャケット画像、テキスト、メタデータ、その他一切の情報を指します。"));
children.push(num("「AI ツール」とは、Suno、Udio、Stable Audio、AIVA、Mubert、その他の人工知能を用いた音楽生成サービスを指します。"));
children.push(num("「クリエイター」とは、本サービスにアカウントを登録し、投稿コンテンツを公開する利用者を指します。"));
children.push(num("「Sotto Spaces」とは、当社が提供する、店舗等の商用空間向け音楽配信機能を指します。"));
children.push(num("「店舗オーナー」とは、Sotto Spaces を商用利用する利用者を指します。"));

// ───────────── 第2条
children.push(h1("第2条（規約への同意）"));
children.push(num("利用者は、本規約の内容に同意した上で本サービスを利用するものとします。"));
children.push(num("利用者が本サービスを実際に利用した場合には、本規約の全ての内容に同意したものとみなされます。"));
children.push(num("未成年者の利用については、親権者または法定代理人の同意を得た上で本サービスを利用するものとします。"));
children.push(num("13歳未満の利用は禁止します。"));

// ───────────── 第3条
children.push(h1("第3条（アカウント）"));
children.push(num("本サービスのうち投稿等の機能を利用するためには、利用者は当社の定める方法によりアカウント登録を行う必要があります。"));
children.push(num("利用者は、登録情報を常に正確かつ最新のものに保つよう努めるものとします。"));
children.push(num("利用者は、自己の責任においてアカウント情報を管理し、第三者に利用させてはなりません。"));
children.push(num("アカウントの不正利用により生じた損害について、当社は一切の責任を負わないものとします。"));

// ───────────── 第4条
children.push(h1("第4条（投稿コンテンツに関する利用者の保証）"));
children.push(p("利用者は、投稿コンテンツに関し、以下の事項を保証するものとします。"));
children.push(num("投稿コンテンツが、利用者自身が AI ツールを使用して生成したものであること、または利用者が完全な権利を有する素材を用いて制作したものであること。"));
children.push(num("使用した AI ツールについて、当該ツールの利用規約に基づく商用利用を含む適切なライセンスを保有していること。"));
children.push(num("投稿コンテンツが、第三者の著作権、著作者人格権、商標権、肖像権、パブリシティ権、プライバシー権、名誉権その他一切の権利を侵害しないこと。"));
children.push(num("投稿コンテンツに、第三者から権利クレームの対象となり得るサンプル、ループ、フレーズ等が含まれていないこと。"));
children.push(num("投稿時に表示される確認チェックボックスに対する同意は、上記保証の意思表示であること。"));
children.push(blank());
children.push(notice("当社は、投稿コンテンツの権利関係について、利用者の保証を信頼して運営しています。万一保証が虚偽であった場合、利用者は当社および第三者に生じた損害を補償するものとします。"));

// ───────────── 第5条
children.push(h1("第5条（投稿コンテンツに関する当社への利用許諾）"));
children.push(p("利用者は、投稿コンテンツについて、以下の利用を当社に対し非独占的かつ無償で許諾するものとします。"));
children.push(num("本サービス上での表示、配信、ストリーミング再生"));
children.push(num("検索結果、おすすめ表示、プレイリスト等への組み込み"));
children.push(num("本サービスのプロモーション目的での当社公式 SNS、メディア、広告等での利用"));
children.push(num("OGP（Open Graph Protocol）画像、サムネイル画像、プレビュー音源等の自動生成・表示"));
children.push(num("利用者が同意した範囲における Sotto Spaces を介した店舗オーナーへの配信"));
children.push(blank());
children.push(p("ただし、投稿コンテンツの著作権その他一切の権利は、引き続き利用者に帰属します。"));

// ───────────── 第6条
children.push(h1("第6条（禁止事項）"));
children.push(p("利用者は、本サービスの利用に際して、以下の行為を行ってはなりません。"));
children.push(num("法令、本規約、公序良俗に違反する行為"));
children.push(num("犯罪行為または犯罪行為を予告、誘発、助長する行為"));
children.push(num("第三者の知的財産権、肖像権、プライバシー権、名誉権その他一切の権利を侵害する行為"));
children.push(num("第三者を誹謗中傷し、または名誉を毀損する行為"));
children.push(num("性的、暴力的、差別的、その他公序良俗に反するコンテンツを投稿する行為"));
children.push(num("本サービスの運営を妨害する行為（不正アクセス、過剰なリクエスト送信、自動化ツール使用等を含む）"));
children.push(num("他人のアカウントを不正に使用する行為、または複数アカウントを不正な目的で運用する行為"));
children.push(num("商用利用ライセンスを保有しない AI ツールで生成した楽曲を、商用利用可能であるかのように偽って投稿する行為"));
children.push(num("Sotto Spaces 機能を、契約範囲を超えて利用する行為"));
children.push(num("その他、当社が不適切と判断する行為"));

// ───────────── 第7条
children.push(h1("第7条（投稿コンテンツの非公開化・削除）"));
children.push(num("当社は、投稿コンテンツが本規約に違反する、または違反するおそれがあると判断した場合、利用者への事前通知なく当該コンテンツを非公開化または削除することができます。"));
children.push(num("第三者から権利侵害の申立てがあった場合、当社は当該コンテンツを24時間以内に非公開化し、利用者に通知のうえ反論の機会を与えます。"));
children.push(num("当社による非公開化または削除によって利用者に生じた損害について、当社は一切の責任を負わないものとします。"));
children.push(num("利用者は、いつでも自身の投稿コンテンツを削除することができます。ただし、Sotto Spaces で採用済みの楽曲については、店舗オーナーとの契約期間中は削除が制限される場合があります。"));

// ───────────── 第8条
children.push(h1("第8条（商用利用：Sotto Spaces）"));
children.push(num("Sotto Spaces は、当社が別途定める「Sotto Spaces 利用契約」に基づき、店舗オーナーに対し、本サービスに投稿された楽曲のうち利用者が許諾したものを商用空間で再生する権利を提供する機能です。"));
children.push(num("クリエイターは、投稿時に「Sotto Spaces 候補」として登録することにより、自身の楽曲が店舗で利用されることを許諾します。"));
children.push(num("店舗オーナーによる利用に関し、当社はクリエイターに対し、別途定めるロイヤリティ規程に基づく報酬を支払います。"));
children.push(num("店舗オーナーによる契約範囲外の利用、または契約終了後の利用については、店舗オーナー側の責任となります。"));
children.push(num("当社は、Sotto Spaces 経由の利用について、店舗オーナーに対し一定範囲の保証を提供する場合があります。詳細は「Sotto Spaces 利用契約」に定めます。"));

// ───────────── 第9条
children.push(h1("第9条（知的財産権）"));
children.push(num("本サービスに関する一切の知的財産権は、当社または当社にライセンスを許諾している権利者に帰属します。"));
children.push(num("投稿コンテンツの著作権は、第5条に定める利用許諾を除き、利用者に帰属します。"));
children.push(num("利用者は、本サービスの利用により、当社の知的財産権について何らかの権利を取得するものではありません。"));

// ───────────── 第10条
children.push(h1("第10条（免責事項）"));
children.push(num("当社は、本サービスについて、その完全性、正確性、確実性、有用性、特定目的への適合性、第三者の権利を侵害しないことを保証するものではありません。"));
children.push(num("当社は、本サービスの中断、停止、変更、終了によって利用者に生じた損害について、一切の責任を負わないものとします。"));
children.push(num("当社は、AI ツールの規約変更、関連する法令や判例の変動により、本サービスの提供内容や条件が変更される可能性があることを、利用者は予め了承するものとします。"));
children.push(num("利用者間または利用者と第三者との間に生じたトラブルについて、当社は一切の責任を負わず、当事者間で解決するものとします。"));
children.push(num("本サービスは、利用者の権利関係を保証するものではなく、紛争が生じた場合は利用者の責任において解決するものとします。"));

// ───────────── 第11条
children.push(h1("第11条（損害賠償の範囲）"));
children.push(num("当社の故意または重過失による場合を除き、当社が利用者に対して負う損害賠償責任は、当該損害発生時から遡って過去12ヶ月間に利用者が本サービスに対して支払った対価の総額を上限とします。"));
children.push(num("当社は、間接損害、逸失利益、特別損害について、いかなる場合も責任を負わないものとします。"));
children.push(num("利用者が本規約に違反したことにより当社が損害を被った場合、利用者は当社の被った損害（弁護士費用を含む）を賠償するものとします。"));

// ───────────── 第12条
children.push(h1("第12条（サービスの変更・停止）"));
children.push(num("当社は、利用者への事前通知なく、本サービスの内容を変更、追加、削除することができます。"));
children.push(num("当社は、技術的な保守、システムの障害、その他やむを得ない事由により、本サービスの全部または一部の提供を停止することができます。"));
children.push(num("当社は、6ヶ月の事前通知をもって、本サービスの全部または一部を終了することができます。"));

// ───────────── 第13条
children.push(h1("第13条（規約の変更）"));
children.push(num("当社は、必要と判断した場合、本規約を変更することができます。"));
children.push(num("変更後の規約は、本サービス上での掲示、利用者への通知、その他適切な方法により利用者に告知します。"));
children.push(num("利用者が告知後も本サービスを継続利用した場合、変更後の規約に同意したものとみなされます。"));

// ───────────── 第14条
children.push(h1("第14条（準拠法・管轄裁判所）"));
children.push(num("本規約の解釈および適用は、日本法に準拠します。"));
children.push(num("本サービスに関連して当社と利用者との間に生じた紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。"));

// ───────────── 第15条
children.push(h1("第15条（お問い合わせ）"));
children.push(p("本規約に関するご質問、ご相談、削除申請等のお問い合わせは、本サービス内のお問い合わせフォーム、またはメール（stellialink@gmail.com）までご連絡ください。"));

// ───────────── 附則
children.push(h1("附則"));
children.push(p("本規約は、2026年X月X日から施行します。"));
children.push(blank());
children.push(p("【改定履歴】", { bold: true }));
children.push(table([2500, 2500, 4300], [
  new TableRow({ children: [
    new TableCell({
      width: { size: 2500, type: WidthType.DXA },
      shading: { fill: "F4F1EC", type: ShadingType.CLEAR },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
      },
      margins: { top: 80, bottom: 80, left: 130, right: 130 },
      children: [p("バージョン", { bold: true, size: 20 })],
    }),
    new TableCell({
      width: { size: 2500, type: WidthType.DXA },
      shading: { fill: "F4F1EC", type: ShadingType.CLEAR },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
      },
      margins: { top: 80, bottom: 80, left: 130, right: 130 },
      children: [p("日付", { bold: true, size: 20 })],
    }),
    new TableCell({
      width: { size: 4300, type: WidthType.DXA },
      shading: { fill: "F4F1EC", type: ShadingType.CLEAR },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
      },
      margins: { top: 80, bottom: 80, left: 130, right: 130 },
      children: [p("内容", { bold: true, size: 20 })],
    }),
  ]}),
  new TableRow({ children: [
    new TableCell({
      width: { size: 2500, type: WidthType.DXA },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
      },
      margins: { top: 80, bottom: 80, left: 130, right: 130 },
      children: [p("v1.0 ドラフト", { size: 20 })],
    }),
    new TableCell({
      width: { size: 2500, type: WidthType.DXA },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
      },
      margins: { top: 80, bottom: 80, left: 130, right: 130 },
      children: [p("2026.06.10", { size: 20 })],
    }),
    new TableCell({
      width: { size: 4300, type: WidthType.DXA },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
        right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE },
      },
      margins: { top: 80, bottom: 80, left: 130, right: 130 },
      children: [p("初版ドラフト（弁護士チェック前）", { size: 20 })],
    }),
  ]}),
]));

children.push(blank());
children.push(blank());
children.push(p("以上", { alignment: AlignmentType.CENTER, italics: true, color: COLOR_MUTE }));
children.push(p("The Sotto Lounge Project", { alignment: AlignmentType.CENTER, italics: true, color: COLOR_GOLD }));

// ───────────── build
const doc = new Document({
  creator: "The Sotto Lounge Project",
  title: "Sotto. 利用規約 v1.0 ドラフト",
  styles: {
    default: { document: { run: { font: FONT, size: 22, color: COLOR_INK } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: FONT, color: COLOR_INK },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: FONT, color: COLOR_GOLD },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "tos-numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "tos-bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "・", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 320 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(__dirname, "Sotto_Terms_of_Service_v1.0_draft.docx");
  fs.writeFileSync(out, buf);
  console.log("✓ wrote", out, "(" + buf.length + " bytes)");
});
