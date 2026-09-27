import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ATTRIB_COOKIE, VISITOR_COOKIE, parseAttribution } from "@/lib/attribution";

type CookiesToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
}[];

const ONE_YEAR = 60 * 60 * 24 * 365;
const NINETY_DAYS = 60 * 60 * 24 * 90;

/**
 * 毎リクエストで実行:
 *  1. Supabase セッションの更新
 *  2. 匿名 visitor_id Cookie の発行（初回のみ）
 *  3. 流入元（UTM / gclid / fbclid / ttclid）の初回タッチを Cookie に保存
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  // 2. visitor_id
  if (!request.cookies.get(VISITOR_COOKIE)) {
    response.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), {
      maxAge: ONE_YEAR,
      sameSite: "lax",
      path: "/",
    });
  }

  // 3. 初回タッチの流入元（すでに保存済みなら上書きしない = ファーストタッチ）
  if (!request.cookies.get(ATTRIB_COOKIE)) {
    const attrib = parseAttribution(request.nextUrl.searchParams, {
      landingPath: request.nextUrl.pathname,
      referrer: request.headers.get("referer"),
    });
    if (attrib) {
      response.cookies.set(ATTRIB_COOKIE, JSON.stringify(attrib), {
        maxAge: NINETY_DAYS,
        sameSite: "lax",
        path: "/",
      });
    }
  }

  return response;
}
