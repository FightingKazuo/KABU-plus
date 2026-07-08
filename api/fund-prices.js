// api/fund-prices.js
// 投資信託の基準価額をYahoo!ファイナンス(日本)から取得
// codes: 投信コード(カンマ区切り) / names: 銘柄名(コード解決失敗時の検索用・|区切り)

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

function extractPrice(html) {
  let price = null;
  let change = null;

  // パターン1: __PRELOADED_STATE__
  const stateMatch = html.match(/__PRELOADED_STATE__\s*=\s*({.+?})<\/script>/s);
  if (stateMatch) {
    try {
      const state = JSON.parse(stateMatch[1]);
      const detail = state?.mainFundPriceBoard ?? state?.fund ?? {};
      const board = detail?.fundPriceBoard ?? detail;
      if (board?.price) {
        price = parseFloat(String(board.price).replace(/,/g, ""));
        change = board.priceChangeRate ? parseFloat(String(board.priceChangeRate).replace(/[+%]/g, "")) : null;
      }
    } catch {}
  }

  // パターン2: "基準価額 12,345円"
  if (!price) {
    const m = html.match(/基準価[額格][^0-9]*([0-9,]+)\s*円/);
    if (m) price = parseFloat(m[1].replace(/,/g, ""));
  }

  // パターン3: メタ情報から
  if (!price) {
    const m = html.match(/content="[^"]*?([0-9]{1,3}(?:,[0-9]{3})+)\s*円/);
    if (m) price = parseFloat(m[1].replace(/,/g, ""));
  }

  return price && !isNaN(price) && price > 1000 ? { price, change: change ?? 0 } : null;
}

// 銘柄名からYahoo!ファイナンス検索で投信コードを解決
async function resolveFundCode(name) {
  try {
    const url = `https://finance.yahoo.co.jp/search/?query=${encodeURIComponent(name)}`;
    const response = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "ja-JP" } });
    if (!response.ok) return null;
    const html = await response.text();
    const m = html.match(/\/quote\/([0-9A-Z]{8})(?:[^0-9A-Z]|")/);
    return m ? m[1] : null;
  } catch { return null; }
}

async function fetchFundPrice(code) {
  try {
    const url = `https://finance.yahoo.co.jp/quote/${encodeURIComponent(code)}`;
    const response = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "text/html", "Accept-Language": "ja-JP,ja;q=0.9" },
    });
    if (!response.ok) return null;
    const html = await response.text();
    return extractPrice(html);
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { codes, names } = req.query;
  if (!codes) return res.status(400).json({ error: "codes required" });

  const codeList = codes.split(",").filter(Boolean).slice(0, 15);
  const nameList = names ? decodeURIComponent(names).split("|") : [];
  const results = {};
  const resolvedCodes = {};

  await Promise.allSettled(
    codeList.map(async (code, i) => {
      let priceData = await fetchFundPrice(code);
      let usedCode = code;

      // 失敗したら銘柄名から検索して再解決
      if (!priceData && nameList[i]) {
        const resolved = await resolveFundCode(nameList[i]);
        if (resolved && resolved !== code) {
          priceData = await fetchFundPrice(resolved);
          if (priceData) usedCode = resolved;
        }
      }

      if (priceData) {
        results[code] = { ...priceData, source: "yahoo-jp" };
        if (usedCode !== code) resolvedCodes[code] = usedCode;
      }
    })
  );

  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=300");
  return res.status(200).json({ ...results, __resolved: resolvedCodes });
}
