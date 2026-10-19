/**
 * 管理画面の目標値と、指標のやさしい解説。
 * 目標は自由に書き換えてOK。
 */
export const kpiTargets = {
  roas: 3.0,   // 広告費1円あたりの売上。3倍以上が目安
  cpa: 5000,   // 1件の購入にかかった広告費（円）。この金額以下が目標
  cvr: 1.0,    // サイト訪問者のうち購入した割合（%）
  ctr: 1.0,    // 広告を見た人のうちクリックした割合（%）
};

export const glossary: { key: string; name: string; formula: string; plain: string }[] = [
  { key: "roas", name: "ROAS", formula: "売上 ÷ 広告費", plain: "広告に1円使って、いくら売上が返ってきたか。3倍なら「1万円の広告で3万円売れた」。" },
  { key: "cpa", name: "CPA", formula: "広告費 ÷ 購入数", plain: "1人に買ってもらうのに、広告費がいくらかかったか。講座の値段より十分小さければ黒字。" },
  { key: "cv", name: "CV（購入数）", formula: "購入の件数", plain: "この期間に講座を買った人の数。" },
  { key: "cvr", name: "CVR", formula: "購入数 ÷ サイト訪問者 × 100", plain: "サイトに来た100人のうち何人が買ったか。LPの説得力と価格の妥当性がここに出る。" },
  { key: "ctr", name: "CTR", formula: "クリック ÷ 表示回数 × 100", plain: "広告を見た100人のうち何人がクリックしたか。動画や画像の「引き」の強さ。" },
  { key: "cpm", name: "CPM", formula: "広告費 ÷ 表示回数 × 1000", plain: "広告を1,000回見せるのにかかる費用。高いときは、競争が激しいか、ターゲットが狭すぎる。" },
  { key: "cpc", name: "CPC", formula: "広告費 ÷ クリック", plain: "1クリックいくらか。CTRが上がるとCPCは下がる。" },
  { key: "ltv", name: "LTV", formula: "1人あたりの累計売上", plain: "1人のお客さんが、最初の講座も含めて合計いくら払ってくれるか。許せるCPAの上限を決める基準。" },
];
