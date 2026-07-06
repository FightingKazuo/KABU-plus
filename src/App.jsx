import { useState, useMemo, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ReferenceLine } from "recharts";

const STOCKS = [
  // ── 投信・インデックスファンド ──
  { symbol:"eMAXIS-SP500", name:"eMAXIS Slim 米国株式(S&P500)", sector:"投信", type:"fund", annualReturn:18.5, dividend:0, minAmount:100, unitShares:null, 優待:null, risk:"medium",
    desc:"米国の大企業500社に分散投資。初心者に最もおすすめ。", tags:["初心者向け","分散投資","積立NISA"] },
  { symbol:"eMAXIS-ALL", name:"eMAXIS Slim 全世界株式", sector:"投信", type:"fund", annualReturn:14.2, dividend:0, minAmount:100, unitShares:null, 優待:null, risk:"medium",
    desc:"世界中の株に一括投資。これ1本で世界分散が完成。", tags:["初心者向け","全世界","積立NISA"] },
  { symbol:"SBI-SP500", name:"SBI・V・S&P500インデックス", sector:"投信", type:"fund", annualReturn:18.3, dividend:0, minAmount:100, unitShares:null, 優待:null, risk:"medium",
    desc:"S&P500に超低コストで投資できるSBI版。", tags:["低コスト","積立NISA","人気"] },
  { symbol:"eMAXIS-NASDAQ", name:"eMAXIS Slim 米国株式(NASDAQ100)", sector:"投信", type:"fund", annualReturn:22.4, dividend:0, minAmount:100, unitShares:null, 優待:null, risk:"high",
    desc:"GAFAMなどIT大手100社に集中投資。高リターン狙い。", tags:["成長株","テクノロジー","ハイリスク"] },
  { symbol:"NIKKEI225", name:"eMAXIS Slim 国内株式(日経225)", sector:"投信", type:"fund", annualReturn:9.4, dividend:0, minAmount:100, unitShares:null, 優待:null, risk:"medium",
    desc:"日本を代表する225社への投資。円建てで安心感あり。", tags:["日本株","円建て","安定"] },
  { symbol:"FANG-PLUS", name:"iFreeNEXT FANG+インデックス", sector:"投信", type:"fund", annualReturn:32.1, dividend:0, minAmount:100, unitShares:null, 優待:null, risk:"high",
    desc:"GAFAM＋注目テック10社に集中。ハイリスク・ハイリターン。", tags:["集中投資","テクノロジー","ハイリスク"] },
  { symbol:"SBI-HAITOU", name:"SBI・V・米国高配当株式", sector:"投信", type:"fund", annualReturn:11.2, dividend:3.1, minAmount:100, unitShares:null, 優待:null, risk:"low",
    desc:"配当収入を重視した米国株ファンド。安定収入を求める方に。", tags:["高配当","安定収入","低リスク"] },
  { symbol:"eMAXIS-REIT", name:"eMAXIS Slim 国内リート", sector:"投信", type:"fund", annualReturn:7.3, dividend:3.8, minAmount:100, unitShares:null, 優待:null, risk:"medium",
    desc:"不動産への間接投資。高い分配金が魅力。", tags:["不動産","高配当","インフレ対策"] },

  // ── 国内個別株 ──
  { symbol:"7203.T", name:"トヨタ自動車", sector:"自動車", type:"jp", annualReturn:12.4, dividend:2.8, minAmount:358000, unitShares:100, 優待:"自社製品割引", risk:"medium",
    desc:"世界最大級の自動車メーカー。EV転換中。安定した日本の顔。", tags:["日本代表","配当あり","優待あり"] },
  { symbol:"6758.T", name:"ソニーグループ", sector:"電機", type:"jp", annualReturn:18.2, dividend:0.6, minAmount:142000, unitShares:100, 優待:null, risk:"medium",
    desc:"PS・カメラ・音楽・映画。多様な事業で成長続ける。", tags:["エンタメ","成長株","グローバル"] },
  { symbol:"9984.T", name:"ソフトバンクG", sector:"通信/投資", type:"jp", annualReturn:8.1, dividend:2.2, minAmount:89500, unitShares:100, 優待:null, risk:"high",
    desc:"AIベンチャーへの大規模投資。ハイリスクだが話題性抜群。", tags:["AI投資","ハイリスク","話題性"] },
  { symbol:"8306.T", name:"三菱UFJフィナンシャル", sector:"金融", type:"jp", annualReturn:9.3, dividend:3.2, minAmount:14850, unitShares:100, 優待:null, risk:"low",
    desc:"日本最大の銀行グループ。金利上昇局面で注目度アップ。", tags:["金融","高配当","低リスク"] },
  { symbol:"2914.T", name:"日本たばこ産業(JT)", sector:"食品", type:"jp", annualReturn:5.8, dividend:5.6, minAmount:42800, unitShares:100, 優待:"自社製品", risk:"low",
    desc:"配当利回り5%超の高配当銘柄。安定したキャッシュフロー。", tags:["超高配当","安定収入","優待あり"] },
  { symbol:"9432.T", name:"NTT", sector:"通信", type:"jp", annualReturn:7.6, dividend:3.1, minAmount:1780, unitShares:100, 優待:"dポイント", risk:"low",
    desc:"1株約18円から買える。少額から始めたい人に最適。", tags:["少額投資","安定","優待あり"] },
  { symbol:"3382.T", name:"セブン&アイHD", sector:"小売", type:"jp", annualReturn:6.1, dividend:2.4, minAmount:21800, unitShares:100, 優待:"商品券", risk:"low",
    desc:"セブンイレブン・イトーヨーカドーを展開。生活密着型。", tags:["生活必需品","優待あり","安定"] },
  { symbol:"4502.T", name:"武田薬品工業", sector:"医薬品", type:"jp", annualReturn:4.2, dividend:4.8, minAmount:42500, unitShares:100, 優待:null, risk:"low",
    desc:"日本最大の製薬会社。高配当で守りの投資に向く。", tags:["医薬品","高配当","ディフェンシブ"] },
  { symbol:"4063.T", name:"信越化学工業", sector:"化学", type:"jp", annualReturn:14.7, dividend:1.8, minAmount:582000, unitShares:100, 優待:null, risk:"medium",
    desc:"半導体素材で世界トップ。半導体ブームの恩恵を受ける。", tags:["半導体","成長株","グローバル"] },
  { symbol:"6861.T", name:"キーエンス", sector:"精密機器", type:"jp", annualReturn:16.2, dividend:0.3, minAmount:7310000, unitShares:100, 優待:null, risk:"medium",
    desc:"超高収益の産業用センサーメーカー。株価は高いが実力も高い。", tags:["高収益","成長株","FA自動化"] },
  { symbol:"7974.T", name:"任天堂", sector:"ゲーム", type:"jp", annualReturn:11.8, dividend:2.1, minAmount:840000, unitShares:100, 優待:null, risk:"medium",
    desc:"マリオ・ポケモン・スイッチ。世界的IPで安定成長。", tags:["ゲーム","エンタメ","グローバルIP"] },
  { symbol:"4755.T", name:"楽天グループ", sector:"IT/通信", type:"jp", annualReturn:3.2, dividend:0, minAmount:9700, unitShares:100, 優待:null, risk:"high",
    desc:"EC・金融・モバイルの総合サービス。再建中で高リスク高期待。", tags:["ハイリスク","再建中","モバイル"] },
  { symbol:"3769.T", name:"GMOペイメントG", sector:"IT/決済", type:"jp", annualReturn:13.4, dividend:1.2, minAmount:51200, unitShares:100, 優待:null, risk:"medium",
    desc:"キャッシュレス決済で成長。フィンテック関連の注目株。", tags:["フィンテック","成長株","キャッシュレス"] },
  { symbol:"2502.T", name:"アサヒグループHD", sector:"食品", type:"jp", annualReturn:7.8, dividend:2.1, minAmount:23400, unitShares:100, 優待:"自社製品", risk:"low",
    desc:"スーパードライなど国内外にブランドを持つ飲料大手。", tags:["食品","優待あり","安定"] },
  { symbol:"9020.T", name:"東日本旅客鉄道(JR東日本)", sector:"鉄道", type:"jp", annualReturn:5.4, dividend:2.0, minAmount:273000, unitShares:100, 優待:"乗車割引", risk:"low",
    desc:"鉄道・ホテル・商業施設。インバウンド回復で注目。", tags:["インフラ","優待あり","安定"] },

  // ── 米国個別株・ETF ──
  { symbol:"AAPL", name:"Apple", sector:"テクノロジー", type:"us", annualReturn:22.1, dividend:0.5, minAmount:32000, unitShares:1, 優待:null, risk:"medium",
    desc:"iPhone・Mac・サービスで世界最大の時価総額企業。", tags:["超有名","テクノロジー","安定成長"] },
  { symbol:"MSFT", name:"Microsoft", sector:"テクノロジー", type:"us", annualReturn:19.8, dividend:0.7, minAmount:64000, unitShares:1, 優待:null, risk:"medium",
    desc:"Windows・Azure・ChatGPT投資元。AI時代の本命。", tags:["AI","クラウド","安定成長"] },
  { symbol:"NVDA", name:"NVIDIA", sector:"半導体", type:"us", annualReturn:87.2, dividend:0.03, minAmount:20000, unitShares:1, 優待:null, risk:"high",
    desc:"AI用GPUで世界独占。ChatGPTブームの最大受益者。", tags:["AI","爆発的成長","ハイリスク"] },
  { symbol:"TSLA", name:"Tesla", sector:"EV/エネルギー", type:"us", annualReturn:31.5, dividend:0, minAmount:37000, unitShares:1, 優待:null, risk:"high",
    desc:"EV世界トップ。イーロン・マスク率いる革新企業。", tags:["EV","成長株","ハイリスク"] },
  { symbol:"AMZN", name:"Amazon", sector:"EC/クラウド", type:"us", annualReturn:24.3, dividend:0, minAmount:28000, unitShares:1, 優待:null, risk:"medium",
    desc:"EC・AWS・広告。多角化で安定成長を続ける。", tags:["クラウド","EC","成長株"] },
  { symbol:"GOOGL", name:"Alphabet(Google)", sector:"テクノロジー", type:"us", annualReturn:21.7, dividend:0, minAmount:26000, unitShares:1, 優待:null, risk:"medium",
    desc:"検索・YouTube・Android。生活に欠かせないプラットフォーム。", tags:["広告","AI","安定成長"] },
  { symbol:"META", name:"Meta Platforms", sector:"SNS", type:"us", annualReturn:28.4, dividend:0.4, minAmount:88000, unitShares:1, 優待:null, risk:"medium",
    desc:"Facebook・Instagram・WhatsApp。SNS広告の巨人。", tags:["SNS","AI投資","成長株"] },
  { symbol:"BRK-B", name:"Berkshire Hathaway B", sector:"投資会社", type:"us", annualReturn:12.8, dividend:0, minAmount:60000, unitShares:1, 優待:null, risk:"low",
    desc:"投資の神様バフェットが率いる投資会社。安定の王様。", tags:["安定","バフェット","長期投資"] },
  { symbol:"JPM", name:"JPMorgan Chase", sector:"金融", type:"us", annualReturn:14.2, dividend:2.4, minAmount:36000, unitShares:1, 優待:null, risk:"low",
    desc:"米国最大の銀行。金利上昇の恩恵を受ける安定株。", tags:["金融","高配当","安定"] },
  { symbol:"VOO", name:"Vanguard S&P500 ETF", sector:"ETF", type:"us", annualReturn:13.2, dividend:1.4, minAmount:77000, unitShares:1, 優待:null, risk:"medium",
    desc:"S&P500に連動するETF。eMAXIS SlimのETF版。", tags:["ETF","分散投資","初心者向け"] },
  { symbol:"QQQ", name:"Invesco QQQ ETF", sector:"ETF", type:"us", annualReturn:20.1, dividend:0.6, minAmount:68000, unitShares:1, 優待:null, risk:"high",
    desc:"NASDAQ100に連動。テクノロジー株に集中投資するETF。", tags:["ETF","テクノロジー","成長"] },
  { symbol:"VYM", name:"Vanguard 高配当ETF", sector:"ETF", type:"us", annualReturn:10.2, dividend:3.2, minAmount:17000, unitShares:1, 優待:null, risk:"low",
    desc:"米国の高配当株に分散投資。安定した配当収入が魅力。", tags:["ETF","高配当","安定収入"] },
  { symbol:"SPYD", name:"SPDR S&P500 高配当ETF", sector:"ETF", type:"us", annualReturn:9.8, dividend:4.5, minAmount:5800, unitShares:1, 優待:null, risk:"low",
    desc:"配当利回り4%超。少額から高配当投資ができるETF。", tags:["ETF","超高配当","少額OK"] },

  // ── 仮想通貨 ──
  { symbol:"BTC", name:"Bitcoin", sector:"仮想通貨", type:"crypto", annualReturn:80.0, dividend:0, minAmount:500, unitShares:null, 優待:null, risk:"very-high", cgId:"bitcoin",
    desc:"仮想通貨の王様。発行上限2100万枚で希少性がある。", tags:["仮想通貨","希少性","ハイリスク"] },
  { symbol:"ETH", name:"Ethereum", sector:"仮想通貨", type:"crypto", annualReturn:60.0, dividend:0, minAmount:500, unitShares:null, 優待:null, risk:"very-high", cgId:"ethereum",
    desc:"スマートコントラクトの基盤。DeFi・NFTの土台となる通貨。", tags:["仮想通貨","Web3","ハイリスク"] },
  { symbol:"SOL", name:"Solana", sector:"仮想通貨", type:"crypto", annualReturn:120.0, dividend:0, minAmount:500, unitShares:null, 優待:null, risk:"very-high", cgId:"solana",
    desc:"高速・低コストなブロックチェーン。ETHの競合として急成長。", tags:["仮想通貨","高速","超ハイリスク"] },
  { symbol:"XRP", name:"XRP(リップル)", sector:"仮想通貨", type:"crypto", annualReturn:40.0, dividend:0, minAmount:500, unitShares:null, 優待:null, risk:"very-high", cgId:"ripple",
    desc:"国際送金の効率化を目指す通貨。銀行との提携で注目。", tags:["仮想通貨","送金","法的リスク"] },
]

const TYPE_LABEL = { fund:"投信", jp:"国内株", us:"米国株", crypto:"仮想通貨" };
const TYPE_COLOR = { fund:"#7C3AED", jp:"#2563EB", us:"#059669", crypto:"#F59E0B" };
const RISK_LABEL = { low:"低リスク", medium:"中リスク", high:"高リスク", "very-high":"超ハイリスク" };
const RISK_COLOR = { low:"#059669", medium:"#2563EB", high:"#D97706", "very-high":"#DC2626" };
const COLORS = ["#2563EB","#059669","#D97706","#DC2626","#7C3AED","#DB2777"];

const C = {
  bg:"#F8FAFF", card:"#FFFFFF", border:"#E2E8F0", soft:"#F1F5F9",
  text:"#1E293B", mid:"#475569", light:"#94A3B8",
  blue:"#2563EB", blueLight:"#EFF6FF", blueMid:"#BFDBFE",
  green:"#059669", greenLight:"#ECFDF5", greenMid:"#A7F3D0",
  red:"#DC2626", redLight:"#FEF2F2", redMid:"#FECACA",
  amber:"#D97706", amberLight:"#FFFBEB",
};

// ── localStorage ────────────────────────────────────
function loadLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    if (!v) return fallback;
    const parsed = JSON.parse(v);
    if (key === "kabu_holdings") return parsed.map(h => {
      const stock = STOCKS.find(s => s.symbol === h.stock?.symbol) || h.stock;
      // purchasePriceの異常値チェック（ドル生値混入バグの修正）
      let purchasePrice = h.purchasePrice ?? null;
      if (purchasePrice !== null && h.amount > 0) {
        const impliedShares = h.amount / purchasePrice;
        if (impliedShares > 100000) purchasePrice = null; // 異常値はリセット
      }
      return { ...h, stock, purchasePrice };
    });
    if (key === "kabu_simStocks") return parsed.map(sym => STOCKS.find(s => s.symbol === sym) || STOCKS[0]);
    return parsed;
  } catch { return fallback; }
}
function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(key === "kabu_simStocks" ? value.map(s => s.symbol) : value));
  } catch {}
}

// ── 計算ユーティリティ ───────────────────────────────
function calcCurrentValue(amount, purchaseDate, annualReturn, currentPrice, purchasePrice) {
  if (currentPrice && purchasePrice && purchasePrice > 0) return Math.round(amount * (currentPrice / purchasePrice));
  const years = Math.max(0, (new Date() - new Date(purchaseDate)) / (1000*60*60*24*365.25));
  return Math.round(amount * Math.pow(1 + annualReturn/100, years));
}
function simulateMonthly(stock, monthly, months) {
  const r = stock.annualReturn/100/12;
  const out = [];
  for (let m=0; m<=months; m++) {
    const invested = monthly*m;
    const value = r===0 ? invested : monthly*((Math.pow(1+r,m)-1)/r)*(1+r);
    if (m%12===0||m===months) out.push({ year: m%12===0?`${m/12}年`:`${m}ヶ月`, invested, value:Math.round(value) });
  }
  return out;
}
function simulateLumpSum(stock, amount, yrs) {
  const r = stock.annualReturn/100;
  return Array.from({length:yrs+1},(_,y)=>({ year:`${y}年`, invested:amount, value:Math.round(amount*Math.pow(1+r,y)) }));
}

const fmt    = n => n>=10000 ? `${(n/10000).toFixed(1)}万円` : `${n.toLocaleString()}円`;
const fmtPct = n => (n>=0?"+":"")+n.toFixed(1)+"%";
const today  = () => new Date().toISOString().split("T")[0];

const ChartTooltip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  const base = payload.find(p=>p.name==="元本");
  const stocks = payload.filter(p=>p.name!=="元本"&&p.name!=="目標");
  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",boxShadow:"0 4px 16px rgba(0,0,0,0.10)"}}>
      <p style={{color:C.light,fontSize:11,margin:"0 0 4px",fontWeight:600}}>{label}</p>
      {base&&<p style={{color:C.mid,fontSize:12,margin:"2px 0"}}>元本: {fmt(base.value)}</p>}
      {stocks.map((p,i)=>{
        const gain=base?p.value-base.value:0;
        return (
          <div key={i} style={{borderTop:`1px solid ${C.soft}`,marginTop:4,paddingTop:4}}>
            <p style={{color:p.color,fontSize:13,margin:"2px 0",fontWeight:700}}>{p.name}: {fmt(p.value)}</p>
            {base&&<p style={{color:gain>=0?C.green:C.red,fontSize:11,margin:0}}>損益 {gain>=0?"+":""}{fmt(gain)} ({fmtPct((p.value/base.value-1)*100)})</p>}
          </div>
        );
      })}
    </div>
  );
};

// ── 銘柄一覧コンポーネント ─────────────────────────────
const THEME_TABS = [
  { key:"all",     label:"すべて" },
  { key:"beginner",label:"初心者向け" },
  { key:"dividend",label:"高配当" },
  { key:"growth",  label:"成長株" },
  { key:"fund",    label:"投信" },
  { key:"jp",      label:"国内株" },
  { key:"us",      label:"米国株" },
  { key:"crypto",  label:"仮想通貨" },
];

function matchTheme(s, theme) {
  if (theme === "all") return true;
  if (theme === "fund" || theme === "jp" || theme === "us" || theme === "crypto") return s.type === theme;
  if (theme === "beginner") return s.tags?.includes("初心者向け") || s.tags?.includes("少額OK") || s.risk === "low";
  if (theme === "dividend") return s.tags?.some(t => t.includes("配当")) || s.dividend >= 2;
  if (theme === "growth")   return s.tags?.includes("成長株") || s.tags?.includes("爆発的成長") || s.annualReturn >= 18;
  return true;
}

function StockList({ stocks, stockPrices, cryptoPrices, onSelect }) {
  const [theme, setTheme]   = useState("all");
  const [search, setSearch] = useState("");

  const filtered = stocks.filter(s => {
    const matchT = matchTheme(s, theme);
    const q = search.toLowerCase();
    const matchS = !q || s.name.toLowerCase().includes(q) || s.symbol.toLowerCase().includes(q) || s.sector.includes(q);
    return matchT && matchS;
  });

  return (
    <div>
      {/* 検索 */}
      <div style={{marginBottom:12}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  銘柄名・コード・セクターで検索"
          style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,padding:"10px 14px",fontSize:13,boxSizing:"border-box",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}/>
      </div>

      {/* テーマタブ */}
      <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
        {THEME_TABS.map(t=>(
          <button key={t.key} onClick={()=>setTheme(t.key)} style={{background:theme===t.key?C.blue:C.card,color:theme===t.key?"#fff":C.mid,border:`1px solid ${theme===t.key?C.blue:C.border}`,borderRadius:20,padding:"5px 14px",fontSize:12,fontWeight:theme===t.key?700:400,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,transition:"all .15s"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 件数 */}
      <div style={{fontSize:11,color:C.light,marginBottom:10}}>{filtered.length}銘柄</div>

      {/* リスト */}
      <div style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
        {filtered.length===0&&<div style={{textAlign:"center",padding:"32px 0",color:C.light,fontSize:13}}>見つかりませんでした</div>}
        {filtered.map((s,i)=>{
          const sp = stockPrices[s.symbol];
          const cp = cryptoPrices[s.symbol];
          const livePrice = sp?.price ?? cp?.price ?? null;
          const liveChange = sp?.change ?? cp?.change24h ?? null;
          return (
            <div key={s.symbol} style={{padding:"12px 16px",borderTop:i>0?`1px solid ${C.soft}`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                {/* 左：銘柄名・説明 */}
                <div style={{flex:1,marginRight:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                    <span style={{fontSize:14,fontWeight:700,color:C.text}}>{s.name}</span>
                    <span style={{background:TYPE_COLOR[s.type]+"18",color:TYPE_COLOR[s.type],fontSize:9,fontWeight:700,borderRadius:4,padding:"1px 6px"}}>{TYPE_LABEL[s.type]}</span>
                    <span style={{background:RISK_COLOR[s.risk]+"15",color:RISK_COLOR[s.risk],fontSize:9,fontWeight:700,borderRadius:4,padding:"1px 6px"}}>{RISK_LABEL[s.risk]}</span>
                  </div>
                  <div style={{fontSize:11,color:C.mid,marginBottom:5,lineHeight:1.5}}>{s.desc}</div>
                  {/* タグ */}
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {s.tags?.map(tag=>(
                      <span key={tag} style={{background:C.soft,color:C.mid,fontSize:10,borderRadius:4,padding:"2px 7px"}}>{tag}</span>
                    ))}
                  </div>
                </div>
                {/* 右：株価・ボタン */}
                <div style={{textAlign:"right",flexShrink:0}}>
                  {livePrice?(
                    <>
                      <div style={{fontSize:13,fontWeight:800,color:C.text}}>¥{livePrice.toLocaleString()}</div>
                      {liveChange!==null&&<div style={{fontSize:11,color:liveChange>=0?C.green:C.red,fontWeight:600}}>{liveChange>=0?"+":""}{liveChange.toFixed(1)}%</div>}
                      <div style={{fontSize:9,color:C.green,fontWeight:700,marginBottom:4}}>●LIVE</div>
                    </>
                  ):(
                    <div style={{fontSize:11,color:C.light,marginBottom:6}}>年率{fmtPct(s.annualReturn)}</div>
                  )}
                  <button onClick={()=>onSelect(s)} style={{background:C.blue,border:"none",borderRadius:7,color:"#fff",fontSize:11,fontWeight:700,padding:"5px 10px",cursor:"pointer",whiteSpace:"nowrap"}}>
                    ＋ 追加
                  </button>
                </div>
              </div>
              {/* 下段：配当・最低購入額 */}
              <div style={{display:"flex",gap:12,paddingTop:6,borderTop:`1px solid ${C.soft}`}}>
                <div style={{fontSize:10,color:C.light}}>最低購入額: <span style={{color:C.mid,fontWeight:600}}>{fmt(s.minAmount)}</span></div>
                {s.dividend>0&&<div style={{fontSize:10,color:C.light}}>配当利回り: <span style={{color:C.amber,fontWeight:600}}>{s.dividend}%</span></div>}
                {s.優待&&<div style={{fontSize:10,color:C.amber}}>🎁 優待あり</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SAMPLE_HOLDINGS = [
  {id:1,stock:STOCKS[0],purchaseDate:"2023-04-01",amount:30000,purchasePrice:null},
  {id:2,stock:STOCKS[6],purchaseDate:"2022-10-15",amount:358000,purchasePrice:null},
  {id:3,stock:STOCKS[20],purchaseDate:"2023-01-01",amount:50000,purchasePrice:null},
];

// ════════════════════════════════════════════════════════
export default function KabuPlus() {
  const [mainTab, setMainTab] = useState("portfolio");

  // ── ポートフォリオ ──
  const [holdings, setHoldingsRaw] = useState(() => loadLS("kabu_holdings", SAMPLE_HOLDINGS));
  const setHoldings = useCallback(v => setHoldingsRaw(prev => { const n=typeof v==="function"?v(prev):v; saveLS("kabu_holdings",n); return n; }),[]);

  const [showAdd, setShowAdd]         = useState(false);
  const [newStock, setNewStock]       = useState(STOCKS[0]);
  const [newDate, setNewDate]         = useState(today());
  const [newAmount, setNewAmount]     = useState(100000);
  const [newAnnualReturn, setNewAnnualReturn] = useState(null); // カスタム年率
  const [stockSearch, setStockSearch] = useState("");
  const [showPicker, setShowPicker]   = useState(false);
  const [filterType, setFilterType]   = useState("all");
  const [sortMode, setSortMode]       = useState("date"); // date|gain|symbol
  const [groupMode, setGroupMode]     = useState(false);  // 銘柄集計モード
  const [expandedGroup, setExpandedGroup] = useState(null);

  // ── API データ ──
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [stockPrices, setStockPrices]   = useState({});
  const [usdJpy, setUsdJpy]             = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError]     = useState(false);
  const [searchResults, setSearchResults]   = useState([]);
  const [searchLoading, setSearchLoading]   = useState(false);
  const [searchError, setSearchError]       = useState(false);
  const [searchMode, setSearchMode]         = useState(false);

  // ── 目標金額 ──
  const [goalAmount, setGoalAmountRaw] = useState(() => loadLS("kabu_goal", 0));
  const setGoalAmount = v => { setGoalAmountRaw(v); saveLS("kabu_goal", v); };
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [goalInput, setGoalInput]       = useState("");

  // ── シミュ ──
  const [simMode, setSimModeRaw]  = useState(() => loadLS("kabu_simMode","monthly"));
  const setSimMode = v => { setSimModeRaw(v); saveLS("kabu_simMode",v); };
  const [simStocks, setSimStocksRaw] = useState(() => loadLS("kabu_simStocks",[STOCKS[0]]));
  const setSimStocks = useCallback(v => setSimStocksRaw(prev => { const n=typeof v==="function"?v(prev):v; saveLS("kabu_simStocks",n); return n; }),[]);
  const [monthly,  setMonthlyRaw]  = useState(() => loadLS("kabu_monthly",30000));
  const setMonthly  = v => { setMonthlyRaw(v);  saveLS("kabu_monthly",v); };
  const [lump,     setLumpRaw]     = useState(() => loadLS("kabu_lump",1000000));
  const setLump     = v => { setLumpRaw(v);     saveLS("kabu_lump",v); };
  const [months,   setMonthsRaw]   = useState(() => loadLS("kabu_months",120));
  const setMonths   = v => { setMonthsRaw(v);   saveLS("kabu_months",v); };
  const [years,    setYearsRaw]    = useState(() => loadLS("kabu_years",10));
  const setYears    = v => { setYearsRaw(v);    saveLS("kabu_years",v); };
  const [simSearch, setSimSearch]  = useState("");
  const [showSimSearch, setShowSimSearch] = useState(false);

  // ── API取得 ──
  useEffect(() => {
    const ids = STOCKS.filter(s=>s.type==="crypto").map(s=>s.cgId).join(",");
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=jpy&include_24hr_change=true`)
      .then(r=>r.json()).then(data=>{
        const prices={};
        STOCKS.filter(s=>s.type==="crypto").forEach(s=>{
          if(data[s.cgId]) prices[s.symbol]={price:data[s.cgId].jpy,change24h:data[s.cgId].jpy_24h_change||0};
        });
        setCryptoPrices(prices);
      }).catch(()=>{});
  },[]);

  useEffect(() => {
    const symbols = STOCKS.filter(s=>s.type==="jp"||s.type==="us").map(s=>s.symbol).join(",");
    setPriceLoading(true); setPriceError(false);
    fetch("/api/forex").then(r=>r.json()).then(fx=>{
      const rate=fx.usdJpy??157.0; setUsdJpy(rate);
      return fetch(`/api/stock-prices?symbols=${symbols}&usdJpy=${rate}`);
    }).then(r=>{ if(!r.ok) throw new Error(); return r.json(); })
      .then(data=>setStockPrices(data))
      .catch(()=>setPriceError(true))
      .finally(()=>setPriceLoading(false));
  },[]);

  useEffect(() => {
    if(!searchMode||stockSearch.length<1){setSearchResults([]);return;}
    const timer=setTimeout(()=>{
      setSearchLoading(true); setSearchError(false);
      fetch(`/api/stock-search?q=${encodeURIComponent(stockSearch)}`)
        .then(r=>{ if(!r.ok) throw new Error(); return r.json(); })
        .then(data=>setSearchResults(data.results??[]))
        .catch(()=>setSearchError(true))
        .finally(()=>setSearchLoading(false));
    },500);
    return ()=>clearTimeout(timer);
  },[stockSearch,searchMode]);

  // ── 最低金額チェック ──
  const effectiveReturn = newAnnualReturn !== null ? newAnnualReturn : newStock.annualReturn;
  const minWarning = useMemo(()=>{
    if(!newAmount||newAmount<=0) return null;
    if(newAmount<newStock.minAmount) return `最低${fmt(newStock.minAmount)}必要です`;
    return null;
  },[newAmount,newStock]);

  // ── ポートフォリオ計算 ──
  const portfolioStats = useMemo(()=>
    holdings.map(h=>{
      const sp=stockPrices[h.stock?.symbol];
      const cp=cryptoPrices[h.stock?.symbol];
      const currentValue=calcCurrentValue(h.amount,h.purchaseDate,h.stock?.annualReturn??10,sp?.price??null,h.purchasePrice??null);
      const gain=currentValue-h.amount;
      const gainPct=(currentValue/h.amount-1)*100;
      const days=Math.floor((new Date()-new Date(h.purchaseDate))/(1000*60*60*24));
      const isLive=!!(sp||cp);
      return {...h,currentValue,gain,gainPct,days,isLive,currentPrice:sp?.price??null,cp,spChange:sp?.change};
    })
  ,[holdings,cryptoPrices,stockPrices]);

  // ── 銘柄ごと集計 ──
  const groupedStats = useMemo(()=>{
    const map={};
    portfolioStats.forEach(h=>{
      const sym=h.stock?.symbol;
      if(!map[sym]) map[sym]={symbol:sym,stock:h.stock,entries:[],totalAmount:0,totalValue:0};
      map[sym].entries.push(h);
      map[sym].totalAmount+=h.amount;
      map[sym].totalValue+=h.currentValue;
    });
    return Object.values(map).map(g=>({
      ...g,
      gain:g.totalValue-g.totalAmount,
      gainPct:(g.totalValue/g.totalAmount-1)*100,
      avgPurchasePrice: g.entries.filter(e=>e.purchasePrice).length>0
        ? g.entries.reduce((s,e)=>s+(e.purchasePrice||0)*e.amount,0)/g.entries.reduce((s,e)=>s+(e.purchasePrice?e.amount:0),0)
        : null,
    }));
  },[portfolioStats]);

  // ── ソート ──
  const sortedStats = useMemo(()=>{
    const arr=[...portfolioStats];
    if(sortMode==="gain") arr.sort((a,b)=>b.gainPct-a.gainPct);
    else if(sortMode==="date") arr.sort((a,b)=>new Date(b.purchaseDate)-new Date(a.purchaseDate));
    else if(sortMode==="symbol") arr.sort((a,b)=>a.stock?.name?.localeCompare(b.stock?.name,"ja"));
    return arr;
  },[portfolioStats,sortMode]);

  const totalInvested = portfolioStats.reduce((s,h)=>s+h.amount,0);
  const totalValue    = portfolioStats.reduce((s,h)=>s+h.currentValue,0);
  const totalGain     = totalValue-totalInvested;
  const totalGainPct  = totalInvested>0?(totalValue/totalInvested-1)*100:0;
  const goalProgress  = goalAmount>0 ? Math.min(100,(totalValue/goalAmount)*100) : 0;

  // ── 資産推移グラフ ──
  const portfolioChart = useMemo(()=>{
    if(!holdings.length) return [];
    const earliest=holdings.reduce((min,h)=>h.purchaseDate<min?h.purchaseDate:min,holdings[0].purchaseDate);
    const startDate=new Date(earliest);
    const now=new Date();
    const totalMonths=Math.ceil((now-startDate)/(1000*60*60*24*30));
    const points=[];
    for(let m=0;m<=totalMonths;m++){
      const d=new Date(startDate); d.setMonth(d.getMonth()+m);
      if(d>now) break;
      const ds=d.toISOString().split("T")[0];
      let val=0,inv=0;
      holdings.forEach(h=>{
        if(h.purchaseDate<=ds){
          const y=(d-new Date(h.purchaseDate))/(1000*60*60*24*365.25);
          val+=Math.round(h.amount*Math.pow(1+(h.stock?.annualReturn??10)/100,y));
          inv+=h.amount;
        }
      });
      if(m%3===0||m===totalMonths) points.push({label:`${d.getFullYear()}/${d.getMonth()+1}`,value:val,invested:inv,goal:goalAmount||undefined});
    }
    return points;
  },[holdings,goalAmount]);

  // ── addHolding ──
  const addHolding = () => {
    if(minWarning) return;
    const sp=stockPrices[newStock.symbol];
    const purchasePrice=sp?.price??null; // 常に円建てを使う（rawPrice/ドル生値は使わない）
    const stockToSave = newAnnualReturn !== null
      ? {...newStock, annualReturn: newAnnualReturn}
      : newStock;
    setHoldings(p=>[...p,{id:Date.now(),stock:stockToSave,purchaseDate:newDate,amount:newAmount,purchasePrice}]);
    setShowAdd(false); setStockSearch(""); setSearchResults([]); setSearchMode(false); setNewAnnualReturn(null);
  };

  // ── シミュ計算 ──
  const filteredSimStocks=STOCKS.filter(s=>!simSearch||s.name.includes(simSearch)||s.symbol.toLowerCase().includes(simSearch.toLowerCase())||s.sector.includes(simSearch));
  const chartData=useMemo(()=>{
    if(!simStocks.length) return [];
    const base=simMode==="monthly"?simulateMonthly(simStocks[0],monthly,months):simulateLumpSum(simStocks[0],lump,years);
    return base.map((d,i)=>{
      const row={year:d.year,元本:d.invested};
      if(goalAmount>0) row["目標"]=goalAmount;
      simStocks.forEach(s=>{
        const sim=simMode==="monthly"?simulateMonthly(s,monthly,months):simulateLumpSum(s,lump,years);
        if(sim[i]) row[s.name]=sim[i].value;
      });
      return row;
    });
  },[simStocks,simMode,monthly,lump,months,years,goalAmount]);

  const simStats=useMemo(()=>simStocks.map(s=>{
    const data=simMode==="monthly"?simulateMonthly(s,monthly,months):simulateLumpSum(s,lump,years);
    const last=data[data.length-1];
    return{...s,finalValue:last.value,invested:last.invested,gain:last.value-last.invested,gainPct:(last.value/last.invested-1)*100};
  }),[simStocks,simMode,monthly,lump,months,years]);

  const toggleSimStock=s=>{
    setSimStocks(p=>{const ex=p.find(x=>x.symbol===s.symbol);if(ex)return p.length>1?p.filter(x=>x.symbol!==s.symbol):p;return[...p,s].slice(0,4);});
    setShowSimSearch(false); setSimSearch("");
  };

  const pickerStocks=STOCKS.filter(s=>{
    const typeOk=filterType==="all"||s.type===filterType;
    const searchOk=!stockSearch||s.name.includes(stockSearch)||s.symbol.toLowerCase().includes(stockSearch.toLowerCase())||s.sector.includes(stockSearch);
    return typeOk&&searchOk;
  });

  const card={background:C.card,borderRadius:14,border:`1px solid ${C.border}`,padding:16,marginBottom:14,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"};

  // ── シミュからポートフォリオへ連携 ──
  const sendToPortfolio = (stock) => {
    setNewStock(stock); setNewAnnualReturn(null);
    setMainTab("portfolio"); setShowAdd(true);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Helvetica Neue',Arial,sans-serif",maxWidth:480,margin:"0 auto"}}>

      {/* ── Header ── */}
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:10,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
        {/* ロゴ行 */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px 10px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,background:"linear-gradient(135deg,#2563EB,#06B6D4)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,boxShadow:"0 2px 8px #2563EB40"}}>📈</div>
            <div>
              <h1 style={{margin:0,fontSize:18,fontWeight:800,letterSpacing:"-0.03em",color:C.text}}>株＋</h1>
              <p style={{margin:0,fontSize:10,color:C.light,letterSpacing:"0.02em"}}>投資シミュレーター</p>
            </div>
          </div>
          {/* ステータスバッジ群 */}
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {usdJpy&&(
              <div style={{background:C.blueLight,border:`1px solid ${C.blueMid}`,borderRadius:8,padding:"3px 8px",textAlign:"center"}}>
                <div style={{fontSize:8,color:C.light,fontWeight:600}}>USD/JPY</div>
                <div style={{fontSize:12,fontWeight:800,color:C.blue}}>¥{usdJpy.toFixed(1)}</div>
              </div>
            )}
            {priceLoading&&(
              <div style={{background:C.soft,borderRadius:8,padding:"3px 8px"}}>
                <div style={{fontSize:10,color:C.light}}>取得中...</div>
              </div>
            )}
            {!priceLoading&&!priceError&&stockPrices&&Object.keys(stockPrices).length>0&&(
              <div style={{background:C.greenLight,border:`1px solid ${C.greenMid}`,borderRadius:8,padding:"3px 8px"}}>
                <div style={{fontSize:10,color:C.green,fontWeight:700}}>● LIVE</div>
              </div>
            )}
          </div>
        </div>
        {/* タブ */}
        <div style={{display:"flex",borderTop:`1px solid ${C.soft}`}}>
          {[["portfolio","💼 保有株"],["sim","📊 シミュ"],["stocks","🔍 銘柄一覧"]].map(([key,label])=>(
            <button key={key} onClick={()=>setMainTab(key)} style={{flex:1,padding:"9px 0",background:"none",border:"none",borderBottom:mainTab===key?`2.5px solid ${C.blue}`:"2.5px solid transparent",color:mainTab===key?C.blue:C.light,fontSize:12,fontWeight:mainTab===key?700:400,cursor:"pointer",transition:"color .15s"}}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"16px 16px 48px"}}>

        {/* ════ 保有株タブ ════ */}
        {mainTab==="portfolio"&&(<>

          {/* サマリーカード */}
          <div style={{background:"linear-gradient(135deg,#1D4ED8 0%,#0EA5E9 100%)",borderRadius:16,padding:"20px 20px 18px",marginBottom:14,boxShadow:"0 4px 20px #2563EB30"}}>
            <div style={{fontSize:12,color:"#BFDBFE",marginBottom:4,fontWeight:600}}>合計評価額</div>
            <div style={{fontSize:32,fontWeight:900,color:"#fff",letterSpacing:"-0.02em",marginBottom:8}}>{fmt(totalValue)}</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{background:"rgba(255,255,255,0.18)",borderRadius:5,color:"#fff",fontSize:11,fontWeight:700,padding:"2px 8px"}}>運用収益額</span>
              <span style={{fontSize:18,fontWeight:800,color:totalGain>=0?"#86EFAC":"#FCA5A5"}}>{totalGain>=0?"+":""}{fmt(totalGain)} ({fmtPct(totalGainPct)})</span>
            </div>

            {/* 目標プログレスバー */}
            {goalAmount>0&&(
              <div style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,color:"#BFDBFE"}}>目標: {fmt(goalAmount)}</span>
                  <span style={{fontSize:11,color:"#FDE68A",fontWeight:700}}>{goalProgress.toFixed(1)}%</span>
                </div>
                <div style={{background:"rgba(255,255,255,0.2)",borderRadius:99,height:8,overflow:"hidden"}}>
                  <div style={{background:"linear-gradient(90deg,#86EFAC,#FDE68A)",height:"100%",width:`${goalProgress}%`,borderRadius:99,transition:"width 0.5s"}}/>
                </div>
              </div>
            )}

            <div style={{display:"flex",gap:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.2)",alignItems:"center"}}>
              {[["投資元本",fmt(totalInvested)],["保有銘柄",`${[...new Set(holdings.map(h=>h.stock?.symbol))].length}銘柄`],["購入回数",`${holdings.length}回`]].map(([l,v])=>(
                <div key={l}><div style={{fontSize:10,color:"#BFDBFE"}}>{l}</div><div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{v}</div></div>
              ))}
              <button onClick={()=>{setGoalInput(goalAmount||"");setShowGoalEdit(true);}} style={{marginLeft:"auto",background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:7,color:"#fff",fontSize:11,fontWeight:600,padding:"4px 10px",cursor:"pointer"}}>
                {goalAmount>0?"目標変更":"🎯 目標設定"}
              </button>
            </div>
          </div>

          {/* 目標入力モーダル */}
          {showGoalEdit&&(
            <div style={{...card,border:`1.5px solid ${C.blueMid}`}}>
              <div style={{fontSize:13,fontWeight:700,color:C.blue,marginBottom:10}}>🎯 目標金額を設定</div>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <input type="number" value={goalInput} onChange={e=>setGoalInput(e.target.value)} placeholder="例: 10000000"
                  style={{flex:1,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"9px 12px",fontSize:16,fontWeight:700}}/>
                <span style={{color:C.mid,fontSize:13,alignSelf:"center"}}>円</span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                {[3000000,5000000,10000000,30000000].map(v=>(
                  <button key={v} onClick={()=>setGoalInput(v)} style={{background:Number(goalInput)===v?C.blue:C.card,color:Number(goalInput)===v?"#fff":C.mid,border:`1px solid ${Number(goalInput)===v?C.blue:C.border}`,borderRadius:7,padding:"5px 10px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{fmt(v)}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setGoalAmount(0);setShowGoalEdit(false);}} style={{flex:1,background:C.redLight,border:`1px solid ${C.redMid}`,borderRadius:9,color:C.red,fontSize:12,fontWeight:600,padding:"9px 0",cursor:"pointer"}}>削除</button>
                <button onClick={()=>{setGoalAmount(Number(goalInput)||0);setShowGoalEdit(false);}} style={{flex:2,background:C.blue,border:"none",borderRadius:9,color:"#fff",fontSize:13,fontWeight:700,padding:"9px 0",cursor:"pointer"}}>設定する</button>
              </div>
            </div>
          )}

          {/* 推移グラフ */}
          {portfolioChart.length>1&&(
            <div style={{...card,padding:"14px 6px 10px"}}>
              <div style={{fontSize:12,fontWeight:700,color:C.mid,marginLeft:10,marginBottom:10}}>資産推移</div>
              <ResponsiveContainer width="100%" height={170}>
                <AreaChart data={portfolioChart}>
                  <defs>
                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.blue} stopOpacity={0.15}/><stop offset="95%" stopColor={C.blue} stopOpacity={0.02}/></linearGradient>
                    <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.light} stopOpacity={0.1}/><stop offset="95%" stopColor={C.light} stopOpacity={0.01}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.soft}/>
                  <XAxis dataKey="label" tick={{fontSize:10,fill:C.light}}/>
                  <YAxis tick={{fontSize:10,fill:C.light}} tickFormatter={v=>`${(v/10000).toFixed(0)}万`}/>
                  <Tooltip formatter={(v,n)=>[fmt(v),n==="value"?"評価額":n==="invested"?"元本":"目標"]} contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}}/>
                  <Area type="monotone" dataKey="invested" stroke={C.light} strokeDasharray="4 3" strokeWidth={1.5} fill="url(#ig)" name="元本"/>
                  <Area type="monotone" dataKey="value" stroke={C.blue} strokeWidth={2.5} fill="url(#ag)" name="評価額"/>
                  {goalAmount>0&&<Line type="monotone" dataKey="goal" stroke="#F59E0B" strokeDasharray="6 3" strokeWidth={1.5} dot={false} name="目標"/>}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* コントロールバー */}
          <div style={{display:"flex",gap:6,marginBottom:12,alignItems:"center"}}>
            <div style={{display:"flex",background:C.soft,borderRadius:8,padding:2,flex:1}}>
              {[["date","日付順"],["gain","損益順"],["symbol","銘柄順"]].map(([m,l])=>(
                <button key={m} onClick={()=>setSortMode(m)} style={{flex:1,padding:"5px 0",background:sortMode===m?C.blue:"transparent",border:"none",borderRadius:6,color:sortMode===m?"#fff":C.mid,fontSize:11,fontWeight:600,cursor:"pointer"}}>{l}</button>
              ))}
            </div>
            <button onClick={()=>setGroupMode(!groupMode)} style={{background:groupMode?C.blue:C.card,border:`1px solid ${groupMode?C.blue:C.border}`,borderRadius:8,color:groupMode?"#fff":C.mid,fontSize:11,fontWeight:600,padding:"6px 10px",cursor:"pointer",whiteSpace:"nowrap"}}>
              {groupMode?"集計中":"銘柄集計"}
            </button>
          </div>

          {/* 保有銘柄リスト */}
          <div style={{...card}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:C.mid}}>{groupMode?"銘柄ごと集計":"保有銘柄の内訳"}</div>
              <button onClick={()=>setShowAdd(!showAdd)} style={{background:C.blueLight,border:`1px solid ${C.blueMid}`,borderRadius:8,color:C.blue,fontSize:12,fontWeight:700,padding:"5px 14px",cursor:"pointer"}}>＋ 追加</button>
            </div>
            {holdings.length===0&&<div style={{textAlign:"center",color:C.light,padding:"24px 0",fontSize:13}}>＋ 追加ボタンから仮想購入を記録しましょう</div>}

            {/* 集計モード */}
            {groupMode&&groupedStats.map((g,i)=>{
              const isExp=expandedGroup===g.symbol;
              return (
                <div key={g.symbol} style={{borderTop:i>0?`1px solid ${C.soft}`:"none",paddingTop:i>0?12:0,paddingBottom:12}}>
                  <div onClick={()=>setExpandedGroup(isExp?null:g.symbol)} style={{cursor:"pointer"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:TYPE_COLOR[g.stock?.type]}}/>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:14,fontWeight:700}}>{g.stock?.name}</span>
                            <span style={{background:TYPE_COLOR[g.stock?.type]+"18",color:TYPE_COLOR[g.stock?.type],fontSize:9,fontWeight:700,borderRadius:3,padding:"1px 4px"}}>{TYPE_LABEL[g.stock?.type]}</span>
                          </div>
                          <div style={{fontSize:11,color:C.light}}>{g.entries.length}回購入 · 合計{fmt(g.totalAmount)}</div>
                          {g.avgPurchasePrice&&<div style={{fontSize:10,color:C.light}}>平均取得単価: ¥{Math.round(g.avgPurchasePrice).toLocaleString()}</div>}
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                        <div style={{background:g.gain>=0?C.greenLight:C.redLight,border:`1px solid ${g.gain>=0?C.greenMid:C.redMid}`,borderRadius:8,padding:"4px 12px"}}>
                          <div style={{fontSize:16,fontWeight:800,color:g.gain>=0?C.green:C.red}}>{fmtPct(g.gainPct)}</div>
                        </div>
                        <span style={{fontSize:10,color:C.light}}>{isExp?"▲ 閉じる":"▼ 明細"}</span>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                      {[["合計投資",fmt(g.totalAmount),C.mid],["合計評価",fmt(g.totalValue),C.text],["損益",(g.gain>=0?"+":"")+fmt(g.gain),g.gain>=0?C.green:C.red]].map(([l,v,c])=>(
                        <div key={l} style={{background:C.bg,borderRadius:8,padding:"7px 6px",textAlign:"center"}}>
                          <div style={{fontSize:10,color:C.light,marginBottom:2}}>{l}</div>
                          <div style={{fontSize:12,fontWeight:700,color:c}}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 明細展開 */}
                  {isExp&&g.entries.map((h,j)=>(
                    <div key={h.id} style={{background:C.bg,borderRadius:9,padding:"10px 12px",marginTop:8,border:`1px solid ${C.border}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{fontSize:12,color:C.mid}}>{new Date(h.purchaseDate).toLocaleDateString("ja-JP",{year:"numeric",month:"short",day:"numeric"})}</div>
                        <div style={{fontSize:13,fontWeight:700,color:h.gain>=0?C.green:C.red}}>{fmtPct(h.gainPct)}</div>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                        <span style={{fontSize:12,color:C.light}}>購入: {fmt(h.amount)}</span>
                        <span style={{fontSize:12,color:C.text,fontWeight:600}}>現在: {fmt(h.currentValue)}</span>
                        <button onClick={()=>setHoldings(p=>p.filter(x=>x.id!==h.id))} style={{background:"none",border:"none",color:C.light,fontSize:11,cursor:"pointer"}}>削除</button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* 通常モード */}
            {!groupMode&&sortedStats.map((h,i)=>{
              const boughtStr=new Date(h.purchaseDate).toLocaleDateString("ja-JP",{year:"numeric",month:"short",day:"numeric"});
              return (
                <div key={h.id} style={{borderTop:i>0?`1px solid ${C.soft}`:"none",paddingTop:i>0?14:0,paddingBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:TYPE_COLOR[h.stock?.type],flexShrink:0}}/>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:14,fontWeight:700}}>{h.stock?.name}</span>
                          <span style={{background:TYPE_COLOR[h.stock?.type]+"18",color:TYPE_COLOR[h.stock?.type],fontSize:9,fontWeight:700,borderRadius:3,padding:"1px 4px"}}>{TYPE_LABEL[h.stock?.type]}</span>
                        </div>
                        <div style={{fontSize:11,color:C.light}}>{h.stock?.sector} · 年率{fmtPct(h.stock?.annualReturn??0)}</div>
                        {h.cp&&<div style={{fontSize:11,color:C.amber,marginTop:1}}>¥{h.cp.price.toLocaleString()} ({h.cp.change24h>=0?"+":""}{h.cp.change24h.toFixed(1)}% 24h) <span style={{color:C.green,fontSize:10,fontWeight:700}}>●LIVE</span></div>}
                        {h.currentPrice&&<div style={{fontSize:11,color:C.blue,marginTop:1}}>¥{h.currentPrice.toLocaleString()} {h.spChange!==undefined&&`(${h.spChange>=0?"+":""}${h.spChange}%)`} <span style={{color:C.green,fontSize:10,fontWeight:700}}>●LIVE</span></div>}
                        {!h.isLive&&<div style={{fontSize:10,color:C.light,marginTop:1}}>年率近似で計算中</div>}
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                      <div style={{background:h.gain>=0?C.greenLight:C.redLight,border:`1px solid ${h.gain>=0?C.greenMid:C.redMid}`,borderRadius:8,padding:"4px 12px"}}>
                        <div style={{fontSize:16,fontWeight:800,color:h.gain>=0?C.green:C.red}}>{fmtPct(h.gainPct)}</div>
                      </div>
                      <button onClick={()=>setHoldings(p=>p.filter(x=>x.id!==h.id))} style={{background:"none",border:"none",color:C.light,fontSize:11,cursor:"pointer",padding:0}}>削除</button>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
                    {[["購入額",fmt(h.amount),C.mid],["現在価値",fmt(h.currentValue),C.text],["損益",(h.gain>=0?"+":"")+fmt(h.gain),h.gain>=0?C.green:C.red]].map(([l,v,c])=>(
                      <div key={l} style={{background:C.bg,borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
                        <div style={{fontSize:10,color:C.light,marginBottom:2}}>{l}</div>
                        <div style={{fontSize:12,fontWeight:700,color:c}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontSize:11,color:C.light}}>📅 {boughtStr} · {h.days}日{h.stock?.優待&&<span style={{marginLeft:6,color:C.amber}}>🎁 {h.stock.優待}</span>}</div>
                    <button onClick={()=>sendToPortfolio(h.stock)} style={{background:C.blueLight,border:`1px solid ${C.blueMid}`,borderRadius:6,color:C.blue,fontSize:10,fontWeight:700,padding:"3px 8px",cursor:"pointer"}}>📊 シミュ</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 追加フォーム */}
          {showAdd&&(
            <div style={{...card,border:`1.5px solid ${C.blueMid}`}}>
              <div style={{fontSize:13,fontWeight:700,color:C.blue,marginBottom:14}}>🛒 仮想購入を記録</div>

              {/* 銘柄選択 */}
              <div style={{marginBottom:12}}>
                <label style={{fontSize:12,fontWeight:600,color:C.mid,display:"block",marginBottom:6}}>銘柄</label>
                <div onClick={()=>setShowPicker(!showPicker)} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:13,fontWeight:700}}>{newStock.name}</span>
                      <span style={{background:TYPE_COLOR[newStock.type]+"18",color:TYPE_COLOR[newStock.type],fontSize:9,fontWeight:700,borderRadius:3,padding:"1px 4px"}}>{TYPE_LABEL[newStock.type]}</span>
                    </div>
                    <div style={{fontSize:11,color:C.light}}>年率{fmtPct(effectiveReturn)} · 最低{fmt(newStock.minAmount)}</div>
                  </div>
                  <span style={{color:C.light}}>▼</span>
                </div>

                {showPicker&&(
                  <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,marginTop:6,overflow:"hidden"}}>
                    <div style={{display:"flex",background:C.soft,margin:8,borderRadius:8,padding:3}}>
                      {[[false,"プリセット"],[true,"🔍 リアルタイム検索"]].map(([mode,label])=>(
                        <button key={String(mode)} onClick={()=>{setSearchMode(mode);setSearchResults([]);setStockSearch("");}}
                          style={{flex:1,padding:"6px 0",background:searchMode===mode?C.blue:"transparent",border:"none",borderRadius:6,color:searchMode===mode?"#fff":C.mid,fontSize:12,fontWeight:600,cursor:"pointer"}}>{label}</button>
                      ))}
                    </div>
                    <div style={{padding:"0 8px 6px"}}>
                      <input value={stockSearch} onChange={e=>setStockSearch(e.target.value)}
                        placeholder={searchMode?"銘柄名・コードで検索（例: トヨタ, AAPL）":"銘柄名・コード・セクター"}
                        style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,padding:"8px 10px",fontSize:13,boxSizing:"border-box"}} autoFocus/>
                    </div>
                    {searchMode&&(
                      <div style={{maxHeight:260,overflowY:"auto"}}>
                        {searchLoading&&<div style={{textAlign:"center",padding:"16px 0",color:C.light,fontSize:12}}>検索中...</div>}
                        {searchError&&<div style={{textAlign:"center",padding:"16px 0",color:C.red,fontSize:12}}>検索失敗 · プリセットをご利用ください</div>}
                        {!searchLoading&&searchResults.length===0&&stockSearch.length>0&&!searchError&&<div style={{textAlign:"center",padding:"16px 0",color:C.light,fontSize:12}}>見つかりませんでした</div>}
                        {searchResults.map(s=>{
                          const sp=stockPrices[s.symbol];
                          return (
                            <div key={s.symbol} onClick={()=>{
                              const existing=STOCKS.find(x=>x.symbol===s.symbol);
                              const stock=existing??{symbol:s.symbol,name:s.name,sector:s.sector||s.quoteType||"",type:s.type,annualReturn:s.type==="crypto"?50:s.type==="fund"?14:s.type==="jp"?10:15,dividend:0,minAmount:s.type==="jp"?100000:s.type==="fund"?100:1000,unitShares:s.type==="jp"?100:1,優待:null,risk:s.type==="crypto"?"very-high":"medium"};
                              setNewStock(stock); setNewAnnualReturn(null); setShowPicker(false); setStockSearch(""); setSearchResults([]);
                            }} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderTop:`1px solid ${C.soft}`,cursor:"pointer",background:newStock.symbol===s.symbol?C.blueLight:C.card}}>
                              <div>
                                <div style={{fontSize:13,fontWeight:600,color:newStock.symbol===s.symbol?C.blue:C.text}}>{s.name}</div>
                                <div style={{fontSize:11,color:C.light}}>{s.symbol} · {s.exchange}</div>
                              </div>
                              <div style={{textAlign:"right"}}>
                                {sp?<><div style={{fontSize:13,fontWeight:700}}>¥{sp.price.toLocaleString()}</div><div style={{fontSize:11,color:sp.change>=0?C.green:C.red}}>{sp.change>=0?"+":""}{sp.change}%</div></>:<div style={{fontSize:11,color:C.light}}>{s.quoteType}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {!searchMode&&(<>
                      <div style={{display:"flex",gap:4,padding:"0 8px 8px",overflowX:"auto"}}>
                        {[["all","すべて"],["fund","投信"],["jp","国内株"],["us","米国株"],["crypto","仮想通貨"]].map(([t,l])=>(
                          <button key={t} onClick={()=>setFilterType(t)} style={{background:filterType===t?C.blue:C.card,color:filterType===t?"#fff":C.mid,border:`1px solid ${filterType===t?C.blue:C.border}`,borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{l}</button>
                        ))}
                      </div>
                      <div style={{maxHeight:240,overflowY:"auto"}}>
                        {pickerStocks.map(s=>{
                          const sp=stockPrices[s.symbol]; const cp=cryptoPrices[s.symbol];
                          return (
                            <div key={s.symbol} onClick={()=>{setNewStock(s);setNewAnnualReturn(null);setShowPicker(false);setStockSearch("");}}
                              style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 14px",borderTop:`1px solid ${C.soft}`,cursor:"pointer",background:newStock.symbol===s.symbol?C.blueLight:C.card}}>
                              <div>
                                <div style={{display:"flex",alignItems:"center",gap:5}}>
                                  <span style={{fontSize:13,fontWeight:600,color:newStock.symbol===s.symbol?C.blue:C.text}}>{s.name}</span>
                                  <span style={{background:TYPE_COLOR[s.type]+"18",color:TYPE_COLOR[s.type],fontSize:9,fontWeight:700,borderRadius:3,padding:"1px 4px"}}>{TYPE_LABEL[s.type]}</span>
                                </div>
                                <div style={{fontSize:11,color:C.light}}>{s.sector} · 最低{fmt(s.minAmount)}{s.優待?" 🎁":""}</div>
                              </div>
                              <div style={{textAlign:"right"}}>
                                {sp&&<div style={{fontSize:12,fontWeight:700}}>{sp.price.toLocaleString()}円</div>}
                                {cp&&<div style={{fontSize:12,fontWeight:700}}>{cp.price.toLocaleString()}円</div>}
                                {!sp&&!cp&&<div style={{fontSize:12,color:RISK_COLOR[s.risk],fontWeight:700}}>{fmtPct(s.annualReturn)}／年</div>}
                                <div style={{fontSize:10,color:RISK_COLOR[s.risk]}}>{RISK_LABEL[s.risk]}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>)}
                  </div>
                )}
              </div>

              {/* カスタム年率（プリセット外銘柄用）*/}
              <div style={{marginBottom:12}}>
                <label style={{fontSize:12,fontWeight:600,color:C.mid,display:"block",marginBottom:6}}>
                  期待年率（任意で上書き可）
                  <span style={{fontSize:10,color:C.light,fontWeight:400,marginLeft:6}}>デフォルト: {fmtPct(newStock.annualReturn)}</span>
                </label>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <input type="number" step="0.1" value={newAnnualReturn??""} onChange={e=>setNewAnnualReturn(e.target.value===""?null:Number(e.target.value))}
                    placeholder={String(newStock.annualReturn)}
                    style={{width:90,background:C.bg,border:`1px solid ${newAnnualReturn!==null?C.blue:C.border}`,borderRadius:8,color:C.text,padding:"7px 10px",fontSize:15,fontWeight:700}}/>
                  <span style={{color:C.mid,fontSize:13}}>% / 年</span>
                  {newAnnualReturn!==null&&<button onClick={()=>setNewAnnualReturn(null)} style={{background:"none",border:"none",color:C.light,fontSize:11,cursor:"pointer"}}>リセット</button>}
                </div>
              </div>

              {/* 購入日 */}
              <div style={{marginBottom:12}}>
                <label style={{fontSize:12,fontWeight:600,color:C.mid,display:"block",marginBottom:6}}>購入日（想定）</label>
                <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} max={today()}
                  style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"9px 12px",fontSize:14,boxSizing:"border-box"}}/>
              </div>

              {/* 購入金額 */}
              <div style={{marginBottom:14}}>
                <label style={{fontSize:12,fontWeight:600,color:C.mid,display:"block",marginBottom:6}}>購入金額</label>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <input type="number" value={newAmount} onChange={e=>setNewAmount(Number(e.target.value))}
                    style={{flex:1,background:C.bg,border:`1.5px solid ${minWarning?C.red:C.border}`,borderRadius:8,color:C.text,padding:"9px 12px",fontSize:18,fontWeight:800}}/>
                  <span style={{color:C.mid,fontSize:13}}>円</span>
                </div>
                {minWarning&&(
                  <div style={{background:C.redLight,border:`1px solid ${C.redMid}`,borderRadius:8,padding:"8px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                    <span>⚠️</span><span style={{fontSize:12,color:C.red,fontWeight:600}}>{minWarning}</span>
                  </div>
                )}
                <div style={{fontSize:11,color:C.light,marginBottom:8}}>最低: <span style={{color:C.mid,fontWeight:600}}>{fmt(newStock.minAmount)}</span>{newStock.type==="jp"&&newStock.unitShares&&` (${newStock.unitShares}株単位)`}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {(newStock.type==="fund"||newStock.type==="crypto"
                    ?[10000,30000,50000,100000,300000]
                    :[newStock.minAmount,newStock.minAmount*2,newStock.minAmount*5].filter(v=>v<=2000000)
                  ).map(v=>(
                    <button key={v} onClick={()=>setNewAmount(v)} style={{background:newAmount===v?C.blue:C.card,color:newAmount===v?"#fff":C.mid,border:`1px solid ${newAmount===v?C.blue:C.border}`,borderRadius:7,padding:"5px 10px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{fmt(v)}</button>
                  ))}
                </div>
              </div>

              {/* プレビュー */}
              {!minWarning&&newDate&&newAmount>0&&(()=>{
                const preview=calcCurrentValue(newAmount,newDate,effectiveReturn,stockPrices[newStock.symbol]?.price??null,null);
                const previewGain=preview-newAmount;
                const previewPct=(preview/newAmount-1)*100;
                return (
                  <div style={{background:previewGain>=0?C.greenLight:C.redLight,border:`1px solid ${previewGain>=0?C.greenMid:C.redMid}`,borderRadius:10,padding:"10px 14px",marginBottom:14}}>
                    <div style={{fontSize:11,color:C.mid,marginBottom:4}}>📊 現在価値の試算（年率{fmtPct(effectiveReturn)}）</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:15,fontWeight:800}}>{fmt(preview)}</span>
                      <span style={{fontSize:14,fontWeight:800,color:previewGain>=0?C.green:C.red}}>{previewGain>=0?"+":""}{fmt(previewGain)} ({fmtPct(previewPct)})</span>
                    </div>
                  </div>
                );
              })()}

              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setShowAdd(false);setStockSearch("");setNewAnnualReturn(null);}} style={{flex:1,background:C.soft,border:`1px solid ${C.border}`,borderRadius:10,color:C.mid,fontSize:13,fontWeight:600,padding:"11px 0",cursor:"pointer"}}>キャンセル</button>
                <button onClick={addHolding} disabled={!!minWarning} style={{flex:2,background:minWarning?C.light:C.blue,border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,padding:"11px 0",cursor:minWarning?"not-allowed":"pointer"}}>記録する</button>
              </div>
            </div>
          )}
        </>)}

        {/* ════ シミュタブ ════ */}
        {mainTab==="sim"&&(<>
          <div style={{display:"flex",background:C.soft,borderRadius:10,padding:3,marginBottom:14}}>
            {[["monthly","積立投資"],["lump","一括投資"]].map(([m,l])=>(
              <button key={m} onClick={()=>setSimMode(m)} style={{flex:1,padding:"8px 0",background:simMode===m?C.blue:"transparent",border:"none",borderRadius:8,color:simMode===m?"#fff":C.mid,fontSize:13,fontWeight:600,cursor:"pointer"}}>{l}</button>
            ))}
          </div>

          <div style={{...card}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:12,fontWeight:600,color:C.mid}}>比較銘柄（最大4つ）</span>
              <button onClick={()=>setShowSimSearch(!showSimSearch)} style={{background:C.blueLight,border:`1px solid ${C.blueMid}`,borderRadius:7,color:C.blue,fontSize:12,fontWeight:700,padding:"4px 12px",cursor:"pointer"}}>＋ 追加</button>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {simStocks.map((s,i)=>(
                <div key={s.symbol} style={{display:"flex",alignItems:"center",gap:5,background:C.bg,border:`1.5px solid ${COLORS[i]}33`,borderRadius:9,padding:"5px 10px"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:COLORS[i]}}/>
                  <span style={{fontSize:12,fontWeight:700}}>{s.name}</span>
                  <span style={{background:TYPE_COLOR[s.type]+"18",color:TYPE_COLOR[s.type],fontSize:9,fontWeight:700,borderRadius:3,padding:"1px 4px"}}>{TYPE_LABEL[s.type]}</span>
                  {simStocks.length>1&&<button onClick={()=>toggleSimStock(s)} style={{background:"none",border:"none",color:C.light,cursor:"pointer",fontSize:14,padding:0}}>✕</button>}
                </div>
              ))}
            </div>
            {showSimSearch&&(
              <div style={{marginTop:12,background:C.bg,borderRadius:10,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                <div style={{padding:10}}>
                  <input value={simSearch} onChange={e=>setSimSearch(e.target.value)} placeholder="銘柄名・コード・セクター"
                    style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"8px 12px",fontSize:13,boxSizing:"border-box"}} autoFocus/>
                </div>
                <div style={{maxHeight:260,overflowY:"auto"}}>
                  {filteredSimStocks.map(s=>{
                    const isSel=simStocks.find(x=>x.symbol===s.symbol);
                    const sp=stockPrices[s.symbol]; const cp=cryptoPrices[s.symbol];
                    return (
                      <div key={s.symbol} onClick={()=>toggleSimStock(s)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderTop:`1px solid ${C.soft}`,cursor:"pointer",background:isSel?C.blueLight:C.card}}>
                        <div>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <span style={{fontSize:13,fontWeight:600,color:isSel?C.blue:C.text}}>{s.name}</span>
                            <span style={{background:TYPE_COLOR[s.type]+"18",color:TYPE_COLOR[s.type],fontSize:9,fontWeight:700,borderRadius:3,padding:"1px 4px"}}>{TYPE_LABEL[s.type]}</span>
                          </div>
                          <div style={{fontSize:11,color:C.light}}>{s.sector} · 最低{fmt(s.minAmount)}{s.優待?" 🎁":""}</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          {sp&&<div style={{fontSize:12,fontWeight:700}}>{sp.price.toLocaleString()}円</div>}
                          {cp&&<div style={{fontSize:12,fontWeight:700}}>{cp.price.toLocaleString()}円</div>}
                          <div style={{fontSize:11,color:RISK_COLOR[s.risk]}}>{fmtPct(s.annualReturn)}／年</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div style={{...card}}>
            {simMode==="monthly"?(<>
              <label style={{fontSize:12,fontWeight:600,color:C.mid,display:"block",marginBottom:6}}>毎月の積立額</label>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <input type="number" value={monthly} onChange={e=>setMonthly(Number(e.target.value))} style={{flex:1,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"9px 12px",fontSize:18,fontWeight:800}}/>
                <span style={{color:C.mid,fontSize:13}}>円</span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
                {[10000,30000,50000,100000].map(v=><button key={v} onClick={()=>setMonthly(v)} style={{background:monthly===v?C.blue:C.card,color:monthly===v?"#fff":C.mid,border:`1px solid ${monthly===v?C.blue:C.border}`,borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{fmt(v)}</button>)}
              </div>
              <label style={{fontSize:12,fontWeight:600,color:C.mid,display:"block",marginBottom:6}}>積立期間</label>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input type="range" min={12} max={360} step={12} value={months} onChange={e=>setMonths(Number(e.target.value))} style={{flex:1,accentColor:C.blue}}/>
                <span style={{color:C.blue,fontWeight:800,minWidth:44,textAlign:"right",fontSize:16}}>{months/12}年</span>
              </div>
            </>):(<>
              <label style={{fontSize:12,fontWeight:600,color:C.mid,display:"block",marginBottom:6}}>一括投資額</label>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <input type="number" value={lump} onChange={e=>setLump(Number(e.target.value))} style={{flex:1,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"9px 12px",fontSize:18,fontWeight:800}}/>
                <span style={{color:C.mid,fontSize:13}}>円</span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
                {[100000,300000,500000,1000000].map(v=><button key={v} onClick={()=>setLump(v)} style={{background:lump===v?C.blue:C.card,color:lump===v?"#fff":C.mid,border:`1px solid ${lump===v?C.blue:C.border}`,borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{fmt(v)}</button>)}
              </div>
              <label style={{fontSize:12,fontWeight:600,color:C.mid,display:"block",marginBottom:6}}>運用期間</label>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input type="range" min={1} max={30} value={years} onChange={e=>setYears(Number(e.target.value))} style={{flex:1,accentColor:C.blue}}/>
                <span style={{color:C.blue,fontWeight:800,minWidth:36,textAlign:"right",fontSize:16}}>{years}年</span>
              </div>
            </>)}
          </div>

          {/* 目標ライン設定 */}
          {!showGoalEdit&&(
            <div style={{...card,padding:"12px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:12,fontWeight:600,color:C.mid}}>🎯 目標金額ライン</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  {goalAmount>0&&<span style={{fontSize:12,color:C.amber,fontWeight:700}}>{fmt(goalAmount)}</span>}
                  <button onClick={()=>{setGoalInput(goalAmount||"");setShowGoalEdit(true);}} style={{background:C.amberLight,border:"1px solid #FDE68A",borderRadius:7,color:C.amber,fontSize:11,fontWeight:700,padding:"4px 10px",cursor:"pointer"}}>{goalAmount>0?"変更":"設定"}</button>
                </div>
              </div>
            </div>
          )}

          <div style={{...card,padding:"14px 6px 10px"}}>
            <p style={{fontSize:10,color:C.light,margin:"0 10px 10px",lineHeight:1.5}}>※過去実績ベースの試算。将来の利益を保証するものではありません</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.soft}/>
                <XAxis dataKey="year" tick={{fontSize:10,fill:C.light}}/>
                <YAxis tick={{fontSize:10,fill:C.light}} tickFormatter={v=>v>=10000?`${(v/10000).toFixed(0)}万`:v}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Legend wrapperStyle={{fontSize:11,paddingTop:6}}/>
                {goalAmount>0&&<ReferenceLine y={goalAmount} stroke="#F59E0B" strokeDasharray="6 3" label={{value:"目標",fill:"#D97706",fontSize:10}}/>}
                <Line type="monotone" dataKey="元本" stroke={C.border} strokeDasharray="4 3" strokeWidth={1.5} dot={false}/>
                {simStocks.map((s,i)=><Line key={s.symbol} type="monotone" dataKey={s.name} stroke={COLORS[i]} strokeWidth={2.5} dot={false}/>)}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {simStats.map((s,i)=>(
            <div key={s.symbol} style={{background:C.card,borderRadius:14,border:`1px solid ${C.border}`,borderLeft:`4px solid ${COLORS[i]}`,padding:"14px 16px",marginBottom:10,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                    <span style={{fontSize:14,fontWeight:700}}>{s.name}</span>
                    <span style={{background:TYPE_COLOR[s.type]+"18",color:TYPE_COLOR[s.type],fontSize:9,fontWeight:700,borderRadius:3,padding:"1px 4px"}}>{TYPE_LABEL[s.type]}</span>
                  </div>
                  <div style={{fontSize:11,color:C.light}}>{s.sector} · 年率{fmtPct(s.annualReturn)} · 最低{fmt(s.minAmount)}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{background:s.gain>=0?C.greenLight:C.redLight,border:`1px solid ${s.gain>=0?C.greenMid:C.redMid}`,borderRadius:8,padding:"5px 14px",marginBottom:6}}>
                    <div style={{fontSize:18,fontWeight:800,color:s.gain>=0?C.green:C.red}}>{fmtPct(s.gainPct)}</div>
                  </div>
                  <button onClick={()=>sendToPortfolio(s)} style={{background:C.blueLight,border:`1px solid ${C.blueMid}`,borderRadius:7,color:C.blue,fontSize:10,fontWeight:700,padding:"3px 10px",cursor:"pointer"}}>💼 保有に追加</button>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[["投資元本",fmt(s.invested),C.mid],["評価額",fmt(s.finalValue),C.text],["損益",(s.gain>=0?"+":"")+fmt(s.gain),s.gain>=0?C.green:C.red]].map(([l,v,c])=>(
                  <div key={l} style={{background:C.bg,borderRadius:8,padding:"8px 6px",textAlign:"center"}}>
                    <div style={{fontSize:10,color:C.light,marginBottom:2}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:700,color:c}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>)}

        {/* ════ 銘柄一覧タブ ════ */}
        {mainTab==="stocks"&&(<StockList stocks={STOCKS} stockPrices={stockPrices} cryptoPrices={cryptoPrices} onSelect={s=>{setNewStock(s);setMainTab("portfolio");setShowAdd(true);}}/>)}

      </div>
      <div style={{padding:"0 16px 36px",textAlign:"center"}}>
        <p style={{fontSize:10,color:C.light,lineHeight:1.7}}>⚠️ 過去実績ベースの参考シミュレーションです。将来の利益を保証するものではありません。投資は自己責任でお願いします。</p>
      </div>
    </div>
  );
}
