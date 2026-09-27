import type { Metadata } from "next";
import SigninForm from "./SigninForm";

export const metadata: Metadata = { title: "ログイン — Stellia Academy" };

export default async function SigninPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="mx-auto max-w-md px-5 py-20">
      <h1 className="text-2xl font-bold">ログイン</h1>
      <p className="mt-3 text-sm text-ink-soft">
        メールアドレスを入力すると認証コードが届きます。パスワードは不要です。
        購入済みの方は、決済時と同じメールアドレスでログインしてください。
      </p>
      <div className="mt-8">
        <SigninForm initialEmail={params.email ?? ""} next={params.next ?? "/learn"} />
      </div>
      {params.error === "auth_failed" && (
        <p className="mt-6 text-sm text-danger">認証に失敗しました。もう一度コードを送信してください。</p>
      )}
    </main>
  );
}
