// api/fund-prices.js
// 投信の基準価額をマルチソースで取得
// ソース1: 三菱UFJアセット公式API（eMAXIS系・確実）
// ソース2: Yahoo!ファイナンスJP スクレイピング
// ソース3: minkabu スクレイピング（フォールバック）

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ── ソース1: MUFG公式API（eMAXIS系）──
async function fetchMufg(fundCd) {
  try {
    const url = `https://developer.am.mufg.jp/fund_information_latest/fund_cd/${fundCd}`;
    const r = await fetch(url, { headers: { "User-Agent": UA, "Accept": "application/json" } });
    if (!r.ok) return null;
    const data = await r.json();
    const item = data?.datasets?.[0] ?? data?.[0] ?? data;
    const price = parseFloat(item?.nav ?? item?.base_price ?? 0);
    const change = parseFloat(item?.percentage_change ?? item?.change_rate ?? 0);
    return price > 1000 ? { price, change: change || 0, source: "mufg" } : null;
  } catch { return null; }
}

// ── ソース2: Yahoo JP ──
function extractYahooPrice(html) {
  let price = null, change = null;
  const stateMatch = html.match(/__PRELOADED_STATE__\s*=\s*({.+?})<\/script>/s);
  if (stateMatch) {
    try {
      const state = JSON.parse(stateMatch[1]);
      const board = state?.mainFundPriceBoard?.fundPriceBoard ?? state?.mainFundPriceBoard ?? {};
      if (board?.price) {
        price = parseFloat(String(board.price).replace(/,/g, ""));
        change = board.priceChangeRate ? parseFloat(String(board.priceChangeRate).replace(/[+%]/g, "")) : null;
      }
    } catch {}
  }
  if (!price) {
    const m = html.match(/基準価[額格][^0-9]*([0-9,]+)\s*円/);
    if (m) price = parseFloat(m[1].replace(/,/g, ""));
  }
  return price && price > 1000 ? { price, change: change ?? 0, source: "yahoo-jp" } : null;
}

async function fetchYahoo(code) {
  try {
    const r = await fetch(`https://finance.yahoo.co.jp/quote/${encodeURIComponent(code)}`, {
      headers: { "User-Agent": UA, "Accept": "text/html", "Accept-Language": "ja-JP" },
    });
    if (!r.ok) return null;
    return extractYahooPrice(await r.text());
  } catch { return null; }
}

async function resolveYahooCode(name) {
  try {
    const r = await fetch(`https://finance.yahoo.co.jp/search/?query=${encodeURIComponent(name)}`, {
      headers: { "User-Agent": UA, "Accept-Language": "ja-JP" },
    });
    if (!r.ok) return null;
    const html = await r.text();
    const m = html.match(/\/quote\/([0-9A-Z]{8})(?:[^0-9A-Z]|")/);
    return m ? m[1] : null;
  } catch { return null; }
}

// ── ソース3: minkabu（名前検索→基準価額）──
async function fetchMinkabu(name) {
  try {
    const sr = await fetch(`https://itf.minkabu.jp/search?fund_name=${encodeURIComponent(name)}`, {
      headers: { "User-Agent": UA, "Accept-Language": "ja-JP" },
    });
    if (!sr.ok) return null;
    const searchHtml = await sr.text();
    // /fund/JPXXXXXXXXXX 形式のISINリンクを抽出
    const m = searchHtml.match(/\/fund\/(JP[0-9A-Z]{10})/);
    if (!m) return null;
    const fr = await fetch(`https://itf.minkabu.jp/fund/${m[1]}`, {
      headers: { "User-Agent": UA, "Accept-Language": "ja-JP" },
    });
    if (!fr.ok) return null;
    const html = await fr.text();
    // 基準価額パターン
    const pm = html.match(/基準価[額格][^0-9]*([0-9,]+)/);
    if (pm) {
      const price = parseFloat(pm[1].replace(/,/g, ""));
      if (price > 1000) return { price, change: 0, source: "minkabu" };
    }
    return null;
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { codes, names, mufg } = req.query;
  if (!codes) return res.status(400).json({ error: "codes required" });

  const codeList = codes.split(",").filter(Boolean).slice(0, 10);
  const nameList = names ? decodeURIComponent(names).split("|") : [];
  const mufgList = mufg ? mufg.split(",") : [];
  const results = {};

  await Promise.allSettled(
    codeList.map(async (code, i) => {
      let priceData = null;

      // ① MUFG公式API（eMAXIS系はfund_cdがあれば最優先）
      if (mufgList[i] && mufgList[i] !== "-") {
        priceData = await fetchMufg(mufgList[i]);
      }

      // ② Yahoo JP（指定コード）
      if (!priceData) priceData = await fetchYahoo(code);

      // ③ Yahoo JP（名前検索でコード再解決）
      if (!priceData && nameList[i]) {
        const resolved = await resolveYahooCode(nameList[i]);
        if (resolved && resolved !== code) priceData = await fetchYahoo(resolved);
      }

      // ④ minkabu（名前検索）
      if (!priceData && nameList[i]) {
        priceData = await fetchMinkabu(nameList[i]);
      }

      if (priceData) results[code] = priceData;
    })
  );

  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=300");
  return res.status(200).json(results);
}
