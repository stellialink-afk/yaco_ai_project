import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * サーバー専用の管理クライアント（service role）。
 * RLS を通さないので、計測系テーブル（leads / events / purchases）や
 * 受講判定後の動画URL取得など、サーバー側の処理だけで使う。
 * 絶対にクライアントコンポーネントから import しないこと。
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL が未設定です");
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
