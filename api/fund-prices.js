// api/fund-prices.js
// 投信の基準価額をマルチソースで取得
// ソース1: 三菱UFJアセット公式API（eMAXIS系・確実）
// ソース2: Yahoo!ファイナンスJP スクレイピング（複数UA試行）
// ソース3: minkabu スクレイピング（フォールバック）

// 複数のUser-Agentをローテーションして403回避を試みる
const UAS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
];
const pickUA = () => UAS[Math.floor(Math.random() * UAS.length)];

// ── ソース1: MUFG公式API（eMAXIS系）──
async function fetchMufg(fundCd) {
  try {
    const url = `https://developer.am.mufg.jp/fund_information_latest/fund_cd/${fundCd}`;
    const r = await fetch(url, {
      headers: { "User-Agent": pickUA(), "Accept": "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) return null;
    const data = await r.json();
    const item = data?.datasets?.[0] ?? (Array.isArray(data) ? data[0] : data);
    const price = parseFloat(item?.nav ?? item?.base_price ?? item?.price ?? 0);
    const change = parseFloat(item?.percentage_change ?? item?.change_rate ?? item?.change ?? 0);
    return price > 1000 ? { price, change: change || 0, source: "mufg" } : null;
  } catch { return null; }
}

// ── ソース2: Yahoo JP（複数回試行・タイムアウト対策）──
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
  if (!price) {
    // og:description等のメタタグ
    const m = html.match(/<meta[^>]+(?:name|property)="[^"]*description[^"]*"[^>]+content="[^"]*?([0-9]{1,3}(?:,[0-9]{3})+)\s*円/i);
    if (m) price = parseFloat(m[1].replace(/,/g, ""));
  }
  return price && price > 1000 ? { price, change: change ?? 0, source: "yahoo-jp" } : null;
}

async function fetchYahoo(code, retry = true) {
  try {
    const r = await fetch(`https://finance.yahoo.co.jp/quote/${encodeURIComponent(code)}`, {
      headers: {
        "User-Agent": pickUA(),
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ja-JP,ja;q=0.9",
        "Referer": "https://finance.yahoo.co.jp/",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (r.status === 403 && retry) {
      // 403は少し待って別UAで再試行
      await new Promise(res => setTimeout(res, 300));
      return fetchYahoo(code, false);
    }
    if (!r.ok) return null;
    return extractYahooPrice(await r.text());
  } catch { return null; }
}

async function resolveYahooCode(name) {
  try {
    const r = await fetch(`https://finance.yahoo.co.jp/search/?query=${encodeURIComponent(name)}`, {
      headers: { "User-Agent": pickUA(), "Accept-Language": "ja-JP", "Referer": "https://finance.yahoo.co.jp/" },
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) return null;
    const html = await r.text();
    const m = html.match(/\/quote\/([0-9A-Z]{8})(?:[^0-9A-Z]|")/);
    return m ? m[1] : null;
  } catch { return null; }
}

// ── ソース3: minkabu ──
async function fetchMinkabu(name) {
  try {
    const sr = await fetch(`https://itf.minkabu.jp/search?fund_name=${encodeURIComponent(name)}`, {
      headers: { "User-Agent": pickUA(), "Accept-Language": "ja-JP" },
      signal: AbortSignal.timeout(6000),
    });
    if (!sr.ok) return null;
    const searchHtml = await sr.text();
    const m = searchHtml.match(/\/fund\/(JP[0-9A-Z]{10})/);
    if (!m) return null;
    const fr = await fetch(`https://itf.minkabu.jp/fund/${m[1]}`, {
      headers: { "User-Agent": pickUA(), "Accept-Language": "ja-JP" },
      signal: AbortSignal.timeout(6000),
    });
    if (!fr.ok) return null;
    const html = await fr.text();
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
  const debug = {}; // どのソースで成功/失敗したか（デバッグ用）

  await Promise.allSettled(
    codeList.map(async (code, i) => {
      let priceData = null;
      const attempts = [];

      // ① MUFG公式API
      if (mufgList[i] && mufgList[i] !== "-") {
        priceData = await fetchMufg(mufgList[i]);
        attempts.push(`mufg:${priceData ? "OK" : "NG"}`);
      }

      // ② Yahoo JP（指定コード）
      if (!priceData) {
        priceData = await fetchYahoo(code);
        attempts.push(`yahoo-direct:${priceData ? "OK" : "NG"}`);
      }

      // ③ Yahoo JP（名前検索で再解決）
      if (!priceData && nameList[i]) {
        const resolved = await resolveYahooCode(nameList[i]);
        attempts.push(`yahoo-resolve:${resolved ?? "NG"}`);
        if (resolved && resolved !== code) {
          priceData = await fetchYahoo(resolved);
          attempts.push(`yahoo-resolved-fetch:${priceData ? "OK" : "NG"}`);
        }
      }

      // ④ minkabu
      if (!priceData && nameList[i]) {
        priceData = await fetchMinkabu(nameList[i]);
        attempts.push(`minkabu:${priceData ? "OK" : "NG"}`);
      }

      if (priceData) results[code] = priceData;
      debug[code] = attempts.join(",");
    })
  );

  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=300");
  return res.status(200).json({ ...results, __debug: debug });
}
