import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase設定が無い場合（v0段階）はメモリにだけ保持して501を返さず常に成功扱いにする選択肢もあるが、
// 仕様としてSupabase未設定時は警告を出して501で返す（後で気付ける）
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();

    // 簡易バリデーション
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "正しいメールアドレスを入力してください" },
        { status: 400 }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      // Supabase未設定でも開発時はクラッシュしないように
      console.warn(
        "[waitlist] Supabase env not set. Skipping persistence. Email:",
        email
      );
      return NextResponse.json({ ok: true, persisted: false });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { error } = await supabase
      .from("waitlist")
      .insert({ email })
      .select()
      .single();

    if (error) {
      // ユニーク制約違反は静かに成功扱い（既にウェイトリスト登録済み）
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, alreadyJoined: true });
      }
      console.error("[waitlist] insert error:", error);
      return NextResponse.json(
        { error: "登録に失敗しました。少し時間をおいて再度お試しください。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, persisted: true });
  } catch (err) {
    console.error("[waitlist] unexpected:", err);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました" },
      { status: 500 }
    );
  }
}
