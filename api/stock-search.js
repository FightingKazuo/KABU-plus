// api/stock-search.js
// 銘柄名・コードでYahoo Financeを検索して候補リストを返す

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");

  const { q } = req.query;
  if (!q || q.length < 1) {
    return res.status(400).json({ error: "query required" });
  }

  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&lang=ja-JP&region=JP&quotesCount=8&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        "Accept": "application/json",
        "Accept-Language": "ja-JP,ja;q=0.9",
      },
    });

    if (!response.ok) throw new Error(`Yahoo API error: ${response.status}`);

    const data = await response.json();
    const quotes = data?.quotes ?? [];

    // 必要な情報だけ絞って返す
    const results = quotes
      .filter(q => q.symbol && q.quoteType !== "FUTURE" && q.quoteType !== "CURRENCY")
      .slice(0, 8)
      .map(q => ({
        symbol:    q.symbol,
        name:      q.longname || q.shortname || q.symbol,
        sector:    q.sector || q.quoteType || "",
        exchange:  q.exchange || "",
        quoteType: q.quoteType || "",
        // タイプ判定
        type: q.quoteType === "MUTUALFUND" || q.quoteType === "ETF"
          ? (q.symbol.endsWith(".T") ? "fund" : "us")
          : q.symbol.endsWith(".T")
            ? "jp"
            : q.quoteType === "CRYPTOCURRENCY"
              ? "crypto"
              : "us",
      }));

    return res.status(200).json({ results });
  } catch (err) {
    return res.status(500).json({ error: "search failed", detail: err.message });
  }
}
