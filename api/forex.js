// api/forex.js
// USD/JPY為替レートをYahoo Financeから取得

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const url = "https://query1.finance.yahoo.com/v8/finance/chart/USDJPY%3DX?interval=1d&range=1d";
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const data = await response.json();
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice ?? 157.0;

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json({ usdJpy: parseFloat(price.toFixed(2)) });
  } catch {
    return res.status(200).json({ usdJpy: 157.0 });
  }
}
