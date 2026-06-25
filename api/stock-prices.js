// api/stock-prices.js
// Vercel Serverless Function
// Yahoo Finance非公式APIから株価を取得してフロントに返す
// CORSをサーバー側で解決するためにこのRouteを経由する

export default async function handler(req, res) {
  // CORS設定
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { symbols } = req.query;
  if (!symbols) {
    return res.status(400).json({ error: "symbols required" });
  }

  const symbolList = symbols.split(",").filter(Boolean);
  const results = {};

  // Yahoo Finance非公式APIから一括取得
  // 例: https://query1.finance.yahoo.com/v8/finance/chart/7203.T
  await Promise.allSettled(
    symbolList.map(async (symbol) => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) return;

        const price    = meta.regularMarketPrice ?? meta.previousClose;
        const prevClose = meta.chartPreviousClose ?? meta.previousClose;
        const change   = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
        const currency = meta.currency ?? "JPY";

        // 米国株はUSD→JPY換算（為替レートも取得できれば理想だが今はハードコード）
        // 為替レートは別途 /api/forex で取得できる構成にしてある
        let priceJPY = price;
        if (currency === "USD") {
          const fx = req.query.usdJpy ? parseFloat(req.query.usdJpy) : 157.0;
          priceJPY = Math.round(price * fx);
        }

        results[symbol] = {
          price: priceJPY,
          rawPrice: price,
          currency,
          change: parseFloat(change.toFixed(2)),
          marketState: meta.marketState ?? "CLOSED",
        };
      } catch {
        // 個別銘柄のエラーは無視してスキップ
      }
    })
  );

  // キャッシュ5分
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
  return res.status(200).json(results);
}
