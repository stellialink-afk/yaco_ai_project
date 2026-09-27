import Link from "next/link";
import type { Metadata } from "next";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "お申し込みありがとうございます — Stellia Academy" };
export const dynamic = "force-dynamic";

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  let email = "";
  if (session_id) {
    try {
      const s = await getStripe().checkout.sessions.retrieve(session_id);
      email = s.customer_details?.email ?? s.customer_email ?? "";
    } catch {
      /* 表示だけなので失敗しても続ける */
    }
  }
  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <p className="text-xs tracking-[0.2em] text-gold font-medium">THANK YOU</p>
      <h1 className="mt-4 text-2xl font-bold">お申し込みありがとうございます</h1>
      <p className="mt-6 text-ink-soft text-sm leading-7">
        決済が完了しました。受講ページには、決済時に入力したメールアドレス
        {email && <>（<span className="font-medium text-ink">{email}</span>）</>}
        でログインするとすぐ入れます。パスワードはなく、メールに届く認証コードを入力するだけです。
      </p>
      <Link
        href={`/signin?next=/learn${email ? `&email=${encodeURIComponent(email)}` : ""}`}
        className="mt-10 inline-flex rounded-md bg-accent text-white px-8 py-3.5 font-medium hover:opacity-90"
      >
        受講ページへログイン
      </Link>
      <p className="mt-8 text-xs text-ink-mute">領収書は Stripe からのメールで発行できます。届かない場合は迷惑メールフォルダをご確認ください。</p>
    </main>
  );
}
