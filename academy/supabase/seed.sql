-- ===========================================================
-- 初期データ: 最初の講座と8レッスン（下書き。タイトル・順番は自由に変更可）
-- 0001_init.sql の後に SQL Editor で Run
-- ===========================================================

insert into public.courses (
  slug, title, subtitle, description,
  price_personal, price_business, list_price_personal, list_price_business,
  presale_seats_personal, presale_seats_business, is_published
) values (
  'ai-video-ads',
  'AIで自社の動画広告を内製する講座',
  '外注3万円の広告動画を、自社で1時間で。',
  '中小企業・店舗のオーナーが、AIを使って「売れる動画広告」を自分たちで作り、少額の広告で回し、数字を見て改善できるようになる8レッスンの動画講座です。',
  19800, 98000, 49800, 198000,
  10, 10, true
)
on conflict (slug) do nothing;

with c as (select id from public.courses where slug = 'ai-video-ads')
insert into public.lessons (course_id, slug, title, summary, duration_min, sort_order, is_free_preview)
select c.id, l.slug, l.title, l.summary, l.duration_min, l.sort_order, l.is_free_preview
from c, (values
  ('01-why-inhouse',  'なぜ今、動画広告を内製するのか', '外注と内製の費用構造、AIで変わった勝ち筋、この講座で作れるようになるもの。', 8, 1, true),
  ('02-design',       '売れる動画の設計図', '誰に・何を・どう感じさせるか。ブランドと世界観を15秒に落とす考え方。', 10, 2, false),
  ('03-script',       '台本をAIで書く', '15秒・30秒・60秒の型と、AIに書かせるときのプロンプトの作り方。', 10, 3, false),
  ('04-assets',       '撮らずに素材を作る', 'AI画像・AI動画・手元の写真の活かし方。権利と注意点。', 12, 4, false),
  ('05-voice',        '声とナレーション', 'AI音声で自分の声を量産する。クローンの作り方と使いどころ。', 8, 5, false),
  ('06-edit',         '1時間で仕上げる編集', 'CapCut・Canvaでの組み立て。テロップ・BGM・書き出しの実務。', 12, 6, false),
  ('07-ads',          '少額で回すMeta広告', '広告アカウントの設定、ターゲット、1日1,000円からの予算の決め方。', 12, 7, false),
  ('08-measure',      '数字の見方と次の1本', '効果測定の基本、止める判断、改善して次の動画を決める手順。', 10, 8, false)
) as l(slug, title, summary, duration_min, sort_order, is_free_preview)
on conflict (course_id, slug) do nothing;
