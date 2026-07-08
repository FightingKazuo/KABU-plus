// api/stock-prices.js
// Yahoo Finance非公式APIから株価取得（query1失敗時はquery2にフォールバック）

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchChart(host, symbol) {
  const url = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": UA,
      "Accept": "application/json",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!response.ok) throw new Error(`${response.status}`);
  return response.json();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { symbols } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const fx = parseFloat(req.query.usdJpy) || 157.0;
  const symbolList = symbols.split(",").filter(Boolean).slice(0, 25);
  const results = {};

  await Promise.allSettled(
    symbolList.map(async (symbol) => {
      let data = null;
      // query1 → query2 フォールバック
      for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]) {
        try {
          data = await fetchChart(host, symbol);
          if (data?.chart?.result?.[0]?.meta) break;
        } catch { data = null; }
      }
      if (!data) return;

      const meta = data?.chart?.result?.[0]?.meta;
      if (!meta) return;

      const price     = meta.regularMarketPrice ?? meta.previousClose;
      const prevClose = meta.chartPreviousClose ?? meta.previousClose;
      const change    = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
      const currency  = meta.currency ?? "JPY";

      let priceJPY = price;
      if (currency === "USD") priceJPY = Math.round(price * fx);

      if (priceJPY && !isNaN(priceJPY)) {
        results[symbol] = {
          price: priceJPY,
          priceRaw: price,
          currency,
          change: parseFloat(change.toFixed(2)),
          marketState: meta.marketState ?? "CLOSED",
        };
      }
    })
  );

  // キャッシュ60秒（更新頻度アップに対応）
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
  return res.status(200).json(results);
}
