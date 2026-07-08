// api/stock-history.js
// 過去1ヶ月の日次終値を取得（アプリを開いていなかった日の補完用）

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { symbols, usdJpy } = req.query;
  if (!symbols) return res.status(400).json({ error: "symbols required" });

  const fx = parseFloat(usdJpy) || 157.0;
  const symbolList = symbols.split(",").filter(Boolean).slice(0, 20);
  const results = {};

  await Promise.allSettled(
    symbolList.map(async (symbol) => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1mo`;
        const response = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" },
        });
        if (!response.ok) return;
        const data = await response.json();
        const result = data?.chart?.result?.[0];
        if (!result) return;

        const timestamps = result.timestamp ?? [];
        const closes = result.indicators?.quote?.[0]?.close ?? [];
        const currency = result.meta?.currency ?? "JPY";
        const rate = currency === "USD" ? fx : 1;

        const history = [];
        for (let i = 0; i < timestamps.length; i++) {
          if (closes[i] == null) continue;
          const date = new Date(timestamps[i] * 1000).toISOString().split("T")[0];
          history.push({ date, price: Math.round(closes[i] * rate * 100) / 100 });
        }
        if (history.length > 0) results[symbol] = history;
      } catch {}
    })
  );

  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");
  return res.status(200).json(results);
}
