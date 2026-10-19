import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/site";
import { metaConfigured } from "@/lib/ads/meta";

export const metadata: Metadata = { title: "広告データの接続 — Stellia Academy", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) redirect("/signin?next=/admin/setup");

  const metaOn = metaConfigured();
  const ingestOn = !!process.env.ADS_INGEST_SECRET;

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 text-[15px]">
      <Link href="/admin" className="text-xs text-ink-mute hover:text-ink">← ダッシュボードへ</Link>
      <h1 className="mt-4 text-2xl font-bold">広告データの接続</h1>
      <p className="mt-2 text-sm text-ink-soft">一度つなげば、毎日自動で数字が入ります。以後、Metaの管理画面を開く必要はありません。</p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Meta（Instagram・Facebook広告）
          <span className={`text-xs px-2 py-0.5 rounded ${metaOn ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{metaOn ? "接続済み" : "未接続"}</span>
        </h2>
        <p className="mt-2 text-sm text-ink-soft">必要なのは「広告アカウントID」と「読み取り専用のトークン」の2つです。10分ほどで終わります。</p>
        <ol className="mt-5 space-y-5 text-sm">
          <Step n={1} title="広告アカウントIDを控える">
            広告マネージャ（adsmanager.facebook.com）を開き、URLの <code>act=</code> のあとの数字をコピー。または左上のアカウント名の下に表示される「アカウントID」。
          </Step>
          <Step n={2} title="アプリを1つ作る（トークンを発行するための箱）">
            developers.facebook.com → 右上「マイアプリ」→「アプリを作成」→ ユースケースは「その他」→ タイプは「ビジネス」→ アプリ名は何でもよい（例: stellia-academy）→ 作成。
            作成後、ダッシュボードの「製品を追加」で <b>Marketing API</b> を選んで「設定」。これ以上の設定は不要です。
          </Step>
          <Step n={3} title="システムユーザーを作ってトークンを発行">
            business.facebook.com → 左下「設定」→「ビジネス設定」→ 左メニュー「ユーザー」→「システムユーザー」→「追加」→ 名前を付けて役割は「管理者」。
            <br />作成したシステムユーザーを選び「アセットを追加」→「広告アカウント」→ 自社の広告アカウントにチェック → 権限は「パフォーマンスを表示」でOK → 保存。
            <br />続けて「トークンを生成」→ 手順2のアプリを選ぶ → 有効期限は「<b>無期限</b>」→ 権限は <code>ads_read</code> と <code>read_insights</code> にチェック → 生成 → 表示されたトークンをコピー（この画面を閉じると二度と見られません）。
          </Step>
          <Step n={4} title="Vercelに登録">
            Vercel のプロジェクト →「Settings」→「Environment Variables」に次の2つを追加して「Redeploy」。
            <pre className="mt-2 rounded bg-bg-soft p-3 text-xs overflow-x-auto">{`META_AD_ACCOUNT_ID = （手順1の数字）
META_ACCESS_TOKEN  = （手順3のトークン）`}</pre>
            あわせて <code>CRON_SECRET</code> に任意の長い文字列を入れておくと、毎日朝6時（日本時間）に自動で取り込みます。
          </Step>
          <Step n={5} title="取り込みを確認">
            ダッシュボードに戻り「Metaから今すぐ取り込む」を押す。媒体別の表に Meta の広告費・表示・クリックが出れば完了です。
          </Step>
        </ol>
        <div className="mt-6 rounded-lg border border-line bg-bg-soft p-4 text-sm">
          <p className="font-medium">広告のURLに付けるパラメーター（1回だけ設定）</p>
          <p className="mt-1 text-ink-soft">広告マネージャで広告を作るとき、「URLパラメーター」欄に次を貼ると、どの広告・どのキャンペーンから買われたかが自社DBでつながります。</p>
          <pre className="mt-2 rounded bg-card p-3 text-xs overflow-x-auto">{`utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`}</pre>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          Google広告（検索・YouTube）
          <span className={`text-xs px-2 py-0.5 rounded ${ingestOn ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{ingestOn ? "受け口あり" : "ADS_INGEST_SECRET 未設定"}</span>
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Google は正式なAPIを使うと審査が必要なので、代わりに「Google広告スクリプト」を使います。Google広告の画面に短いスクリプトを貼るだけで、毎日こちらへ数字を送ってくれます。審査も開発者登録も不要です。
        </p>
        <ol className="mt-5 space-y-5 text-sm">
          <Step n={1} title="合言葉を決める">
            Vercel の Environment Variables に <code>ADS_INGEST_SECRET</code> を追加（長いランダムな文字列）→ Redeploy。
          </Step>
          <Step n={2} title="スクリプトを貼る">
            Google広告 → 上部「ツール」→「一括操作」→「スクリプト」→「＋」→ リポジトリの <code>academy/scripts/google-ads-script.js</code> の中身を貼り付け。先頭2行の <code>SITE_URL</code> と <code>INGEST_SECRET</code> を自分の値に書き換えて保存。
          </Step>
          <Step n={3} title="承認して毎日実行に">
            「承認」→「プレビュー」で動くことを確認 →「頻度」を「毎日」にして保存。過去7日分を毎日上書きするので、数字の確定遅れも自動で追いつきます。
          </Step>
          <Step n={4} title="広告のURLに付けるパラメーター">
            Google広告のキャンペーン設定「トラッキングテンプレート」に次を設定。
            <pre className="mt-2 rounded bg-bg-soft p-3 text-xs overflow-x-auto">{`{lpurl}?utm_source=google&utm_medium=paid&utm_campaign={campaignid}&utm_content={creative}`}</pre>
          </Step>
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">無料投稿のリンク（YouTube・Instagram）</h2>
        <p className="mt-2 text-sm text-ink-soft">広告でなくても、リンクに印を付けておけば同じ表で比べられます。</p>
        <pre className="mt-2 rounded bg-bg-soft p-3 text-xs overflow-x-auto">{`YouTube概要欄:    https://<サイト>/?utm_source=youtube&utm_content=<動画名>
Instagramプロフ:  https://<サイト>/?utm_source=instagram_organic
LINE配信:         https://<サイト>/?utm_source=line&utm_campaign=<配信名>`}</pre>
      </section>
    </main>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="h-7 w-7 shrink-0 rounded-full bg-accent text-white grid place-items-center text-xs font-semibold">{n}</span>
      <div>
        <p className="font-medium">{title}</p>
        <div className="mt-1 text-ink-soft leading-7">{children}</div>
      </div>
    </li>
  );
}
