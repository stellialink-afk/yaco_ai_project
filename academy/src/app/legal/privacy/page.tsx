import type { Metadata } from "next";
export const metadata: Metadata = { title: "プライバシーポリシー — Stellia Academy" };

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14 prose-md text-[15px]">
      <h1 className="text-2xl font-bold">プライバシーポリシー</h1>
      <p className="text-xs text-ink-mute">最終更新: 公開前に確定</p>
      <h2>取得する情報</h2>
      <ul>
        <li>メールアドレス、氏名・会社名（任意入力）</li>
        <li>決済情報（カード情報は Stripe が保持し、当社は保持しません）</li>
        <li>閲覧・受講の記録、流入元（URL パラメータ、リファラ）、Cookie による識別子</li>
      </ul>
      <h2>利用目的</h2>
      <ul>
        <li>講座の提供、受講状況の管理、サポート</li>
        <li>広告・発信の効果測定と改善</li>
        <li>講座やイベントに関するご案内（メール・LINE）</li>
      </ul>
      <h2>第三者提供・委託</h2>
      <p>決済（Stripe）、認証・データ保管（Supabase）、配信（Vercel）、動画配信事業者に、目的の範囲で業務を委託します。法令に基づく場合を除き、本人の同意なく第三者に提供しません。</p>
      <h2>Cookie と計測</h2>
      <p>サイトの改善と広告効果の測定のため Cookie を使用します。ブラウザ設定で無効化できますが、一部機能が使えなくなる場合があります。</p>
      <h2>お問い合わせ</h2>
      <p>info@stellialink.com</p>
    </main>
  );
}
