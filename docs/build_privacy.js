// Sotto. プライバシーポリシー 日本語ドラフト
// ⚠️ 公開前に弁護士・個人情報保護方針の専門家チェックを推奨。

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
const COLOR_BG = "F4F1EC";

function p(text, opts = {}) {
  return new Paragraph({
    spacing: opts.spacing ?? { before: 80, after: 80 },
    alignment: opts.alignment,
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

function num(text) {
  return new Paragraph({
    spacing: { before: 40, after: 40 },
    numbering: { reference: "pp-numbers", level: 0 },
    children: [new TextRun({ text, font: FONT, size: 22 })],
  });
}

function bullet(text) {
  return new Paragraph({
    spacing: { before: 30, after: 30 },
    numbering: { reference: "pp-bullets", level: 0 },
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

// ───────── COVER
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 1600, after: 200 },
  children: [new TextRun({ text: "Sotto.", font: "Cormorant Garamond", size: 80, color: COLOR_INK })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 40, after: 600 },
  children: [new TextRun({ text: "— Privacy Policy —", font: "Cormorant Garamond", size: 28, italics: true, color: COLOR_GOLD })],
}));
children.push(p("プライバシーポリシー", { alignment: AlignmentType.CENTER, size: 36, bold: true }));
children.push(p("v1.0 ドラフト", { alignment: AlignmentType.CENTER, size: 22, color: COLOR_MUTE }));
children.push(p("作成日：2026年6月10日", { alignment: AlignmentType.CENTER, size: 20, color: COLOR_MUTE }));
children.push(blank());
children.push(notice("【重要】本書はドラフトです。個人情報保護法および GDPR 等の各国法令対応について、公開前に専門家のレビューを必ず受けてください。"));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ───────── 前文
children.push(h1("前文"));
children.push(p("The Sotto Lounge Project（以下「当社」）は、「Sotto.」（以下「本サービス」）の利用者の個人情報の取り扱いについて、個人情報の保護に関する法律（個人情報保護法）その他関連法令を遵守し、適切に管理することを目的として、本プライバシーポリシー（以下「本ポリシー」）を定めます。"));

// ───────── 第1条 取得する情報
children.push(h1("第1条（取得する情報）"));
children.push(p("当社は、本サービスの提供にあたり、以下の情報を取得することがあります。"));
children.push(blank());

children.push(h2("1-1. 利用者から直接ご提供いただく情報"));
children.push(bullet("メールアドレス（アカウント作成・サインイン時）"));
children.push(bullet("アーティスト名（display_name、任意で公開される）"));
children.push(bullet("自己紹介文（bio、任意で公開される）"));
children.push(bullet("投稿コンテンツ（音源、ジャケット画像、メタデータ、タグ、コンセプト文等）"));
children.push(bullet("お問い合わせ時の連絡先情報"));
children.push(bullet("有料サービス利用時の決済情報（決済代行業者経由）"));

children.push(h2("1-2. 利用に伴い自動的に取得する情報"));
children.push(bullet("IP アドレス、ブラウザの種類とバージョン、OS、デバイス情報"));
children.push(bullet("Cookie および類似技術によって取得される情報"));
children.push(bullet("アクセスログ、利用履歴、再生履歴、検索履歴"));
children.push(bullet("リファラ情報（参照元 URL）"));

children.push(h2("1-3. Sotto Spaces 関連の情報（店舗オーナーの場合）"));
children.push(bullet("店舗名、業種、所在地情報"));
children.push(bullet("採用楽曲・利用履歴"));
children.push(bullet("契約内容、課金情報"));

// ───────── 第2条 利用目的
children.push(h1("第2条（利用目的）"));
children.push(p("当社は、取得した情報を以下の目的で利用します。"));
children.push(num("本サービスの提供、運営、維持、改善"));
children.push(num("利用者の認証、アカウント管理"));
children.push(num("投稿コンテンツの表示、配信、検索、推薦"));
children.push(num("有料サービスの提供、課金、決済処理"));
children.push(num("ロイヤリティの支払い処理（クリエイター向け）"));
children.push(num("利用者からのお問い合わせ、サポート対応"));
children.push(num("本サービスに関するお知らせ、重要なご連絡"));
children.push(num("マーケティング、プロモーション、新機能のご案内（オプトアウト可能）"));
children.push(num("利用状況の分析、サービス改善のための統計データ作成"));
children.push(num("不正利用の防止、システムの安全性確保"));
children.push(num("法令、利用規約、その他関連規定の遵守状況の確認"));

// ───────── 第3条 第三者提供
children.push(h1("第3条（第三者提供）"));
children.push(p("当社は、以下の場合を除き、取得した個人情報を第三者に提供しません。"));
children.push(num("利用者の同意がある場合"));
children.push(num("法令に基づく場合"));
children.push(num("人の生命、身体または財産の保護のために必要があり、利用者の同意を得ることが困難である場合"));
children.push(num("公衆衛生または児童の健全な育成のために特に必要があり、利用者の同意を得ることが困難である場合"));
children.push(num("国の機関、地方公共団体、またはこれらから委託を受けた者が法令の定める事務を遂行することに対し協力する場合"));
children.push(num("業務委託先に必要な範囲で開示する場合（第4条参照）"));

// ───────── 第4条 業務委託先
children.push(h1("第4条（業務委託先）"));
children.push(p("当社は、本サービスの提供に必要な業務を以下の業者に委託しています。委託先には、適切な情報管理体制を要求し、契約により情報の取扱いを制限しています。"));
children.push(blank());
children.push(table([2200, 2200, 4900], [
  new TableRow({ children: [
    tcell("委託先", { shade: COLOR_BG, bold: true, width: 2200 }),
    tcell("用途", { shade: COLOR_BG, bold: true, width: 2200 }),
    tcell("管轄", { shade: COLOR_BG, bold: true, width: 4900 }),
  ]}),
  new TableRow({ children: [
    tcell("Supabase Inc.", { width: 2200 }),
    tcell("データベース・認証・ストレージ", { width: 2200 }),
    tcell("米国（GDPR、SOC2 準拠）", { width: 4900 }),
  ]}),
  new TableRow({ children: [
    tcell("Vercel Inc.", { width: 2200 }),
    tcell("Webホスティング・配信", { width: 2200 }),
    tcell("米国（GDPR 準拠）", { width: 4900 }),
  ]}),
  new TableRow({ children: [
    tcell("Resend, Inc.", { width: 2200 }),
    tcell("メール配信（認証コード・通知）", { width: 2200 }),
    tcell("米国", { width: 4900 }),
  ]}),
  new TableRow({ children: [
    tcell("Stripe, Inc.", { width: 2200 }),
    tcell("決済処理・ロイヤリティ送金（Phase 1.5 以降）", { width: 2200 }),
    tcell("米国（PCI DSS 準拠）", { width: 4900 }),
  ]}),
  new TableRow({ children: [
    tcell("Cloudflare, Inc.", { width: 2200 }),
    tcell("ドメイン管理・DNS", { width: 2200 }),
    tcell("米国", { width: 4900 }),
  ]}),
]));
children.push(blank());
children.push(notice("一部の業務委託先は日本国外（主に米国）に所在します。利用者の個人情報は、これらの業務委託先のサーバーに保存される場合があり、利用者は本サービスの利用により、これらの越境移転に同意したものとみなされます。"));

// ───────── 第5条 安全管理
children.push(h1("第5条（安全管理措置）"));
children.push(p("当社は、取得した個人情報の漏洩、滅失または毀損の防止その他の安全管理のために、以下の措置を講じます。"));
children.push(bullet("通信の暗号化（HTTPS / TLS 1.2 以上）"));
children.push(bullet("データベースおよびストレージのアクセス制御（Row Level Security）"));
children.push(bullet("業務委託先における適切な情報管理体制の確認"));
children.push(bullet("従業者・委託先への教育、監督"));
children.push(bullet("インシデント発生時の対応体制の整備"));

// ───────── 第6条 Cookie
children.push(h1("第6条（Cookie その他類似技術）"));
children.push(num("本サービスは、利用者の利便性向上、サービス改善、サインイン状態の維持等のため、Cookie および類似技術を使用します。"));
children.push(num("利用者は、ブラウザの設定により Cookie の受け取りを拒否することができますが、その場合、本サービスの一部機能が利用できなくなることがあります。"));
children.push(num("本サービスは現時点で、Google Analytics、広告配信プラットフォーム等の第三者トラッキング技術を導入していません。導入の際は本ポリシーを改定します。"));

// ───────── 第7条 保有期間
children.push(h1("第7条（保有期間）"));
children.push(p("当社は、取得した個人情報を、利用目的の達成に必要な期間に限り保有します。"));
children.push(blank());
children.push(table([3000, 6300], [
  new TableRow({ children: [
    tcell("情報の種類", { shade: COLOR_BG, bold: true, width: 3000 }),
    tcell("保有期間", { shade: COLOR_BG, bold: true, width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("アカウント情報", { width: 3000 }),
    tcell("アカウント削除後、原則として速やかに削除（法令で保管義務がある場合を除く）", { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("投稿コンテンツ", { width: 3000 }),
    tcell("利用者の削除操作または当社による削除まで", { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("アクセスログ", { width: 3000 }),
    tcell("取得から原則として12ヶ月", { width: 6300 }),
  ]}),
  new TableRow({ children: [
    tcell("決済関連情報", { width: 3000 }),
    tcell("取引から法令の定める期間（電子帳簿保存法等：7年）", { width: 6300 }),
  ]}),
]));

// ───────── 第8条 開示・訂正・削除
children.push(h1("第8条（開示・訂正・削除・利用停止の請求）"));
children.push(num("利用者は、当社に対し、自己の個人情報の開示、訂正、追加、削除、利用停止、消去または第三者への提供の停止を請求することができます。"));
children.push(num("請求は、本サービス上のお問い合わせフォーム、またはメール（stellialink@gmail.com）にて受け付けます。"));
children.push(num("ご本人確認のため、追加の情報をお願いする場合があります。"));
children.push(num("法令の定めにより、当社が請求に応じることができない場合があります。その場合、理由とともに通知します。"));

// ───────── 第9条 子供
children.push(h1("第9条（13歳未満の方の個人情報）"));
children.push(num("本サービスは、13歳未満の方の利用を想定していません。"));
children.push(num("当社が、13歳未満の方の個人情報を意図せず取得したことが判明した場合、速やかに削除します。"));
children.push(num("13歳以上18歳未満の利用者は、親権者または法定代理人の同意を得た上でご利用ください。"));

// ───────── 第10条 越境
children.push(h1("第10条（国外への情報移転）"));
children.push(p("本サービスは、業務委託先（Supabase、Vercel 等）のサーバーが米国その他の国に所在することがあり、その場合、利用者の個人情報は当該国に移転されます。当該移転にあたり、当社は受託者と適切なデータ保護契約を締結し、個人情報の安全性を確保します。"));

// ───────── 第11条 改定
children.push(h1("第11条（本ポリシーの改定）"));
children.push(num("当社は、必要に応じて本ポリシーを改定することがあります。"));
children.push(num("改定後の本ポリシーは、本サービス上での掲示その他適切な方法により利用者に告知します。"));
children.push(num("重要な改定の場合、利用者に対し別途通知します。"));

// ───────── 第12条 お問い合わせ
children.push(h1("第12条（お問い合わせ窓口）"));
children.push(p("本ポリシーに関するお問い合わせは、以下までご連絡ください。"));
children.push(blank());
children.push(p("The Sotto Lounge Project", { bold: true }));
children.push(p("メール：stellialink@gmail.com"));
children.push(p("ウェブ：sottolounge.app（公開準備中）", { color: COLOR_MUTE }));

// ───────── 附則
children.push(h1("附則"));
children.push(p("本ポリシーは、2026年X月X日から施行します。"));
children.push(blank());
children.push(p("【改定履歴】", { bold: true }));
children.push(table([2500, 2500, 4300], [
  new TableRow({ children: [
    tcell("バージョン", { shade: COLOR_BG, bold: true, width: 2500 }),
    tcell("日付", { shade: COLOR_BG, bold: true, width: 2500 }),
    tcell("内容", { shade: COLOR_BG, bold: true, width: 4300 }),
  ]}),
  new TableRow({ children: [
    tcell("v1.0 ドラフト", { width: 2500 }),
    tcell("2026.06.10", { width: 2500 }),
    tcell("初版ドラフト（弁護士チェック前）", { width: 4300 }),
  ]}),
]));

children.push(blank());
children.push(blank());
children.push(p("以上", { alignment: AlignmentType.CENTER, italics: true, color: COLOR_MUTE }));
children.push(p("The Sotto Lounge Project", { alignment: AlignmentType.CENTER, italics: true, color: COLOR_GOLD }));

// ───────── build
const doc = new Document({
  creator: "The Sotto Lounge Project",
  title: "Sotto. プライバシーポリシー v1.0 ドラフト",
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
      { reference: "pp-numbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "pp-bullets",
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
  const out = path.join(__dirname, "Sotto_Privacy_Policy_v1.0_draft.docx");
  fs.writeFileSync(out, buf);
  console.log("✓ wrote", out, "(" + buf.length + " bytes)");
});
