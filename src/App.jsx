import { useState, useMemo, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

// ══════════════════════════════════════════════════════
//  銘柄マスタ
// ══════════════════════════════════════════════════════
const STOCKS = [
  // ── 投信・インデックスファンド ──
  { symbol:"eMAXIS-SP500",  name:"eMAXIS Slim 米国株式(S&P500)", sector:"投信",  type:"fund",  annualReturn:18.5, dividend:0,   minAmount:100,  unitShares:null, 優待:null, risk:"medium" },
  { symbol:"eMAXIS-ALL",    name:"eMAXIS Slim 全世界株式",        sector:"投信",  type:"fund",  annualReturn:14.2, dividend:0,   minAmount:100,  unitShares:null, 優待:null, risk:"medium" },
  { symbol:"SBI-SP500",     name:"SBI・V・S&P500インデックス",    sector:"投信",  type:"fund",  annualReturn:18.3, dividend:0,   minAmount:100,  unitShares:null, 優待:null, risk:"medium" },
  { symbol:"SBI-NASDAQ",    name:"SBI・V・米国高配当株式",        sector:"投信",  type:"fund",  annualReturn:13.8, dividend:0,   minAmount:100,  unitShares:null, 優待:null, risk:"medium" },
  { symbol:"NIKKEI225",     name:"eMAXIS Slim 国内株式(日経225)", sector:"投信",  type:"fund",  annualReturn:9.4,  dividend:0,   minAmount:100,  unitShares:null, 優待:null, risk:"medium" },
  { symbol:"FANG-PLUS",     name:"iFreeNEXT FANG+インデックス",   sector:"投信",  type:"fund",  annualReturn:32.1, dividend:0,   minAmount:100,  unitShares:null, 優待:null, risk:"high" },
  // ── 国内個別株 ──
  { symbol:"7203.T", name:"トヨタ自動車",         sector:"自動車",    type:"jp",   annualReturn:12.4, dividend:2.8, minAmount:358000, unitShares:100, 優待:"自社製品割引", risk:"medium" },
  { symbol:"6758.T", name:"ソニーグループ",        sector:"電機",      type:"jp",   annualReturn:18.2, dividend:0.6, minAmount:142000, unitShares:100, 優待:null,          risk:"medium" },
  { symbol:"9984.T", name:"ソフトバンクG",         sector:"通信/投資", type:"jp",   annualReturn:8.1,  dividend:2.2, minAmount:89500,  unitShares:100, 優待:null,          risk:"medium" },
  { symbol:"8306.T", name:"三菱UFJフィナンシャル", sector:"金融",      type:"jp",   annualReturn:9.3,  dividend:3.2, minAmount:14850,  unitShares:100, 優待:null,          risk:"medium" },
  { symbol:"2914.T", name:"日本たばこ産業(JT)",    sector:"食品",      type:"jp",   annualReturn:5.8,  dividend:5.6, minAmount:42800,  unitShares:100, 優待:"自社製品",     risk:"low" },
  { symbol:"9432.T", name:"NTT",                   sector:"通信",      type:"jp",   annualReturn:7.6,  dividend:3.1, minAmount:1780,   unitShares:100, 優待:"dポイント",    risk:"low" },
  { symbol:"3382.T", name:"セブン&アイHD",         sector:"小売",      type:"jp",   annualReturn:6.1,  dividend:2.4, minAmount:21800,  unitShares:100, 優待:"商品券",       risk:"low" },
  { symbol:"4502.T", name:"武田薬品工業",           sector:"医薬品",    type:"jp",   annualReturn:4.2,  dividend:4.8, minAmount:42500,  unitShares:100, 優待:null,          risk:"low" },
  // ── 米国個別株・ETF ──
  { symbol:"AAPL",  name:"Apple",               sector:"テクノロジー", type:"us", annualReturn:22.1, dividend:0.5, minAmount:32000,  unitShares:1, 優待:null, risk:"medium" },
  { symbol:"MSFT",  name:"Microsoft",           sector:"テクノロジー", type:"us", annualReturn:19.8, dividend:0.7, minAmount:64000,  unitShares:1, 優待:null, risk:"medium" },
  { symbol:"NVDA",  name:"NVIDIA",              sector:"半導体",       type:"us", annualReturn:87.2, dividend:0.0, minAmount:20000,  unitShares:1, 優待:null, risk:"high" },
  { symbol:"TSLA",  name:"Tesla",               sector:"EV",           type:"us", annualReturn:31.5, dividend:0,   minAmount:37000,  unitShares:1, 優待:null, risk:"high" },
  { symbol:"AMZN",  name:"Amazon",              sector:"EC/クラウド",  type:"us", annualReturn:24.3, dividend:0,   minAmount:28000,  unitShares:1, 優待:null, risk:"medium" },
  { symbol:"VOO",   name:"Vanguard S&P500 ETF", sector:"ETF",          type:"us", annualReturn:13.2, dividend:1.4, minAmount:77000,  unitShares:1, 優待:null, risk:"medium" },
  // ── 仮想通貨 ──
  { symbol:"BTC",  name:"Bitcoin",  sector:"仮想通貨", type:"crypto", annualReturn:80.0,  dividend:0, minAmount:500, unitShares:null, 優待:null, risk:"very-high", cgId:"bitcoin" },
  { symbol:"ETH",  name:"Ethereum", sector:"仮想通貨", type:"crypto", annualReturn:60.0,  dividend:0, minAmount:500, unitShares:null, 優待:null, risk:"very-high", cgId:"ethereum" },
  { symbol:"SOL",  name:"Solana",   sector:"仮想通貨", type:"crypto", annualReturn:120.0, dividend:0, minAmount:500, unitShares:null, 優待:null, risk:"very-high", cgId:"solana" },
  { symbol:"XRP",  name:"XRP",      sector:"仮想通貨", type:"crypto", annualReturn:40.0,  dividend:0, minAmount:500, unitShares:null, 優待:null, risk:"very-high", cgId:"ripple" },
];

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

function calcCurrentValue(amount, purchaseDate, annualReturn, currentPrice, purchasePrice) {
  // currentPrice(現在株価)とpurchasePrice(購入時株価)がある場合は実際の株価差で計算
  if (currentPrice && purchasePrice && purchasePrice > 0) {
    return Math.round(amount * (currentPrice / purchasePrice));
  }
  // なければ年率近似
  const now = new Date();
  const bought = new Date(purchaseDate);
  const years = Math.max(0, (now - bought) / (1000*60*60*24*365.25));
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
function simulateLumpSum(stock, amount, years) {
  const r = stock.annualReturn/100;
  return Array.from({length:years+1},(_,y)=>({ year:`${y}年`, invested:amount, value:Math.round(amount*Math.pow(1+r,y)) }));
}

const fmt    = n => n>=10000 ? `${(n/10000).toFixed(1)}万円` : `${n.toLocaleString()}円`;
const fmtPct = n => (n>=0?"+":"")+n.toFixed(1)+"%";
const today  = () => new Date().toISOString().split("T")[0];

const TAG_STYLE = {
  "メモ":    {bg:C.soft,       text:C.mid,      border:"#CBD5E1"},
  "買いたい":{bg:C.blueLight,  text:C.blue,     border:C.blueMid},
  "様子見":  {bg:C.amberLight, text:C.amber,    border:"#FDE68A"},
  "見送り":  {bg:C.redLight,   text:C.red,      border:C.redMid},
  "気になる":{bg:"#F5F3FF",    text:"#7C3AED",  border:"#DDD6FE"},
};

const ChartTooltip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  const base = payload.find(p=>p.name==="元本");
  const stocks = payload.filter(p=>p.name!=="元本");
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

// ── localStorage helpers ────────────────────────────
function loadLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    if (!v) return fallback;
    const parsed = JSON.parse(v);
    if (key === "kabu_holdings") {
      return parsed.map(h => ({
        ...h,
        stock: STOCKS.find(s => s.symbol === h.stock.symbol) || h.stock,
      }));
    }
    if (key === "kabu_simStocks") {
      return parsed.map(sym => STOCKS.find(s => s.symbol === sym) || STOCKS[0]);
    }
    return parsed;
  } catch { return fallback; }
}
function saveLS(key, value) {
  try {
    if (key === "kabu_simStocks") {
      localStorage.setItem(key, JSON.stringify(value.map(s => s.symbol)));
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {}
}

const SAMPLE_HOLDINGS = [
  {id:1, stock:STOCKS[0], purchaseDate:"2023-04-01", amount:30000},
  {id:2, stock:STOCKS[6], purchaseDate:"2022-10-15", amount:358000},
  {id:3, stock:STOCKS[20],purchaseDate:"2023-01-01", amount:50000},
];

// ══════════════════════════════════════════════════════
export default function KabuMemo() {
  const [mainTab, setMainTab] = useState("portfolio");

  // ── ポートフォリオ（localStorage永続化）──
  const [holdings, setHoldingsRaw] = useState(() => loadLS("kabu_holdings", SAMPLE_HOLDINGS));
  const setHoldings = (v) => {
    setHoldingsRaw(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      saveLS("kabu_holdings", next);
      return next;
    });
  };

  const [showAdd, setShowAdd]     = useState(false);
  const [newStock, setNewStock]   = useState(STOCKS[0]);
  const [newDate, setNewDate]     = useState(today());
  const [newAmount, setNewAmount] = useState(100000);
  const [stockSearch, setStockSearch]   = useState("");
  const [showPicker, setShowPicker]     = useState(false);
  const [filterType, setFilterType]     = useState("all");
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [stockPrices, setStockPrices]   = useState({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError]     = useState(false);
  const [usdJpy, setUsdJpy]             = useState(null);
  // 銘柄リアルタイム検索
  const [searchResults, setSearchResults]   = useState([]);
  const [searchLoading, setSearchLoading]   = useState(false);
  const [searchError, setSearchError]       = useState(false);
  const [searchMode, setSearchMode]         = useState(false); // true=リアルタイム検索モード

  // ── シミュ（localStorage永続化）──
  const [simMode, setSimModeRaw]  = useState(() => loadLS("kabu_simMode", "monthly"));
  const setSimMode = v => { setSimModeRaw(v); saveLS("kabu_simMode", v); };
  const [simStocks, setSimStocksRaw] = useState(() => loadLS("kabu_simStocks", [STOCKS[0]]));
  const setSimStocks = (v) => {
    setSimStocksRaw(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      saveLS("kabu_simStocks", next);
      return next;
    });
  };
  const [monthly, setMonthlyRaw]  = useState(() => loadLS("kabu_monthly", 30000));
  const setMonthly = v => { setMonthlyRaw(v); saveLS("kabu_monthly", v); };
  const [lump, setLumpRaw]        = useState(() => loadLS("kabu_lump", 1000000));
  const setLump    = v => { setLumpRaw(v);    saveLS("kabu_lump", v); };
  const [months, setMonthsRaw]    = useState(() => loadLS("kabu_months", 120));
  const setMonths  = v => { setMonthsRaw(v);  saveLS("kabu_months", v); };
  const [years, setYearsRaw]      = useState(() => loadLS("kabu_years", 10));
  const setYears   = v => { setYearsRaw(v);   saveLS("kabu_years", v); };
  const [simSearch, setSimSearch] = useState("");
  const [showSimSearch, setShowSimSearch] = useState(false);

  // ── メモ（localStorage永続化）──
  const [memos, setMemosRaw] = useState(() => loadLS("kabu_memos", []));
  const setMemos = (v) => {
    setMemosRaw(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      saveLS("kabu_memos", next);
      return next;
    });
  };
  const [memoText, setMemoText] = useState("");
  const [memoTag, setMemoTag]   = useState("メモ");

  // ── CoinGecko 仮想通貨リアル価格 ──
  useEffect(() => {
    const ids = STOCKS.filter(s=>s.type==="crypto").map(s=>s.cgId).join(",");
    setCryptoLoading(true);
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=jpy&include_24hr_change=true`)
      .then(r=>r.json())
      .then(data=>{
        const prices = {};
        STOCKS.filter(s=>s.type==="crypto").forEach(s=>{
          if(data[s.cgId]) prices[s.symbol]={
            price: data[s.cgId].jpy,
            change24h: data[s.cgId].jpy_24h_change||0,
          };
        });
        setCryptoPrices(prices);
      })
      .catch(()=>{})
      .finally(()=>setCryptoLoading(false));
  },[]);

  // ── 為替レート + 株価リアルタイム（Vercel API Route経由）──
  useEffect(() => {
    const symbols = STOCKS.filter(s => s.type==="jp"||s.type==="us").map(s=>s.symbol).join(",");
    setPriceLoading(true);
    setPriceError(false);
    fetch("/api/forex")
      .then(r => r.json())
      .then(fx => {
        const rate = fx.usdJpy ?? 157.0;
        setUsdJpy(rate);
        return fetch(`/api/stock-prices?symbols=${symbols}&usdJpy=${rate}`);
      })
      .then(r => { if(!r.ok) throw new Error(); return r.json(); })
      .then(data => setStockPrices(data))
      .catch(() => setPriceError(true))
      .finally(() => setPriceLoading(false));
  },[]);

  // ── 銘柄リアルタイム検索（デバウンス付き）──
  useEffect(() => {
    if (!searchMode || stockSearch.length < 1) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearchLoading(true);
      setSearchError(false);
      fetch(`/api/stock-search?q=${encodeURIComponent(stockSearch)}`)
        .then(r => { if(!r.ok) throw new Error(); return r.json(); })
        .then(data => setSearchResults(data.results ?? []))
        .catch(() => setSearchError(true))
        .finally(() => setSearchLoading(false));
    }, 500); // 500msデバウンス
    return () => clearTimeout(timer);
  }, [stockSearch, searchMode]);

  // 最低金額チェック
  const minWarning = useMemo(()=>{
    if(!newAmount||newAmount<=0) return null;
    const min = newStock.minAmount||0;
    if(newAmount < min) return `最低${fmt(min)}必要です（${newStock.type==="jp"?`${newStock.unitShares}株単位`:newStock.type==="fund"?"100円から":"500円から"}）`;
    if(newStock.type==="jp"&&newStock.unitShares){
      const unitCost = newStock.minAmount;
      const units = Math.floor(newAmount/unitCost);
      if(units===0) return `最低${fmt(unitCost)}必要（${newStock.unitShares}株単位）`;
    }
    return null;
  },[newAmount, newStock]);

  // ポートフォリオ計算
  const portfolioStats = useMemo(()=>
    holdings.map(h=>{
      const sp = stockPrices[h.stock.symbol];    // リアルタイム株価
      const cp = cryptoPrices[h.stock.symbol];   // 仮想通貨リアル価格
      // 購入時の株価（記録時に保存してある場合）
      const purchasePrice = h.purchasePrice ?? null;
      const currentPrice  = sp?.price ?? null;

      const currentValue = calcCurrentValue(
        h.amount,
        h.purchaseDate,
        h.stock.annualReturn,
        currentPrice,
        purchasePrice
      );
      const gain    = currentValue - h.amount;
      const gainPct = (currentValue / h.amount - 1) * 100;
      const days    = Math.floor((new Date()-new Date(h.purchaseDate))/(1000*60*60*24));
      const isLive  = !!(sp || cp);
      return {...h, currentValue, gain, gainPct, days, isLive, currentPrice, cp};
    })
  ,[holdings, cryptoPrices, stockPrices]);

  const totalInvested = portfolioStats.reduce((s,h)=>s+h.amount,0);
  const totalValue    = portfolioStats.reduce((s,h)=>s+h.currentValue,0);
  const totalGain     = totalValue-totalInvested;
  const totalGainPct  = totalInvested>0?(totalValue/totalInvested-1)*100:0;

  const portfolioChart = useMemo(()=>{
    if(!holdings.length) return [];
    const earliest = holdings.reduce((min,h)=>h.purchaseDate<min?h.purchaseDate:min,holdings[0].purchaseDate);
    const startDate = new Date(earliest);
    const now = new Date();
    const totalMonths = Math.ceil((now-startDate)/(1000*60*60*24*30));
    const points=[];
    for(let m=0;m<=totalMonths;m++){
      const d=new Date(startDate); d.setMonth(d.getMonth()+m);
      if(d>now) break;
      const ds=d.toISOString().split("T")[0];
      let val=0,inv=0;
      holdings.forEach(h=>{
        if(h.purchaseDate<=ds){
          const y=(d-new Date(h.purchaseDate))/(1000*60*60*24*365.25);
          val+=Math.round(h.amount*Math.pow(1+h.stock.annualReturn/100,y));
          inv+=h.amount;
        }
      });
      if(m%3===0||m===totalMonths) points.push({label:`${d.getFullYear()}/${d.getMonth()+1}`,value:val,invested:inv});
    }
    return points;
  },[holdings]);

  const addHolding = ()=>{
    if(minWarning) return;
    // 購入時の株価を記録しておく（損益の正確な計算に使用）
    const sp = stockPrices[newStock.symbol];
    const purchasePrice = sp?.rawPrice ?? sp?.price ?? null;
    setHoldings(p=>[...p,{
      id: Date.now(),
      stock: newStock,
      purchaseDate: newDate,
      amount: newAmount,
      purchasePrice,  // 購入時株価（APIから取得できた場合のみ）
    }]);
    setShowAdd(false);
    setStockSearch("");
    setSearchResults([]);
    setSearchMode(false);
  };

  // シミュ
  const filteredSimStocks = STOCKS.filter(s=>
    !simSearch||s.name.includes(simSearch)||s.symbol.toLowerCase().includes(simSearch.toLowerCase())||s.sector.includes(simSearch)
  );
  const chartData = useMemo(()=>{
    if(!simStocks.length) return [];
    const base = simMode==="monthly"?simulateMonthly(simStocks[0],monthly,months):simulateLumpSum(simStocks[0],lump,years);
    return base.map((d,i)=>{
      const row={year:d.year,元本:d.invested};
      simStocks.forEach(s=>{
        const sim=simMode==="monthly"?simulateMonthly(s,monthly,months):simulateLumpSum(s,lump,years);
        if(sim[i]) row[s.name]=sim[i].value;
      });
      return row;
    });
  },[simStocks,simMode,monthly,lump,months,years]);

  const simStats = useMemo(()=>simStocks.map(s=>{
    const data=simMode==="monthly"?simulateMonthly(s,monthly,months):simulateLumpSum(s,lump,years);
    const last=data[data.length-1];
    return{...s,finalValue:last.value,invested:last.invested,gain:last.value-last.invested,gainPct:(last.value/last.invested-1)*100};
  }),[simStocks,simMode,monthly,lump,months,years]);

  const toggleSimStock = s=>{
    setSimStocks(p=>{
      const ex=p.find(x=>x.symbol===s.symbol);
      if(ex) return p.length>1?p.filter(x=>x.symbol!==s.symbol):p;
      return [...p,s].slice(0,4);
    });
    setShowSimSearch(false); setSimSearch("");
  };

  // フィルタ後の銘柄
  const pickerStocks = STOCKS.filter(s=>{
    const typeOk = filterType==="all"||s.type===filterType;
    const searchOk = !stockSearch||s.name.includes(stockSearch)||s.symbol.toLowerCase().includes(stockSearch.toLowerCase())||s.sector.includes(stockSearch);
    return typeOk&&searchOk;
  });

  const card = {background:C.card,borderRadius:14,border:`1px solid ${C.border}`,padding:16,marginBottom:14,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"};

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Helvetica Neue',Arial,sans-serif",maxWidth:480,margin:"0 auto"}}>

      {/* Header */}
      <div style={{background:C.card,borderBottom:`1px solid ${C.border}`,padding:"16px 18px 0",position:"sticky",top:0,zIndex:10,boxShadow:"0 1px 8px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{width:36,height:36,background:"linear-gradient(135deg,#2563EB,#06B6D4)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:"0 3px 10px #2563EB33"}}>📈</div>
          <div>
            <h1 style={{margin:0,fontSize:19,fontWeight:800,letterSpacing:"-0.02em"}}>株＋</h1>
            <p style={{margin:0,fontSize:11,color:C.light}}>投資シミュレーター</p>
          </div>
        </div>
        <div style={{display:"flex"}}>
          {[["portfolio","💼 保有株"],["sim","📊 シミュ"],["memo","📝 メモ"]].map(([key,label])=>(
            <button key={key} onClick={()=>setMainTab(key)} style={{flex:1,padding:"9px 0",background:"none",border:"none",borderBottom:mainTab===key?`2.5px solid ${C.blue}`:"2.5px solid transparent",color:mainTab===key?C.blue:C.light,fontSize:13,fontWeight:mainTab===key?700:400,cursor:"pointer"}}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"16px 16px 48px"}}>

        {/* ════ 保有株 ════ */}
        {mainTab==="portfolio"&&(<>

          {/* サマリー */}
          <div style={{background:"linear-gradient(135deg,#1D4ED8 0%,#0EA5E9 100%)",borderRadius:16,padding:"20px 20px 18px",marginBottom:14,boxShadow:"0 4px 20px #2563EB30"}}>
            <div style={{fontSize:12,color:"#BFDBFE",marginBottom:4,fontWeight:600}}>合計評価額</div>
            <div style={{fontSize:32,fontWeight:900,color:"#fff",letterSpacing:"-0.02em",marginBottom:8}}>{fmt(totalValue)}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{background:"rgba(255,255,255,0.18)",borderRadius:5,color:"#fff",fontSize:11,fontWeight:700,padding:"2px 8px"}}>運用収益額</span>
              <span style={{fontSize:18,fontWeight:800,color:totalGain>=0?"#86EFAC":"#FCA5A5"}}>{totalGain>=0?"+":""}{fmt(totalGain)} ({fmtPct(totalGainPct)})</span>
            </div>
            <div style={{display:"flex",gap:16,marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.2)"}}>
              {[["投資元本",fmt(totalInvested)],["保有銘柄",`${[...new Set(holdings.map(h=>h.stock.symbol))].length}銘柄`],["購入回数",`${holdings.length}回`]].map(([l,v])=>(
                <div key={l}><div style={{fontSize:10,color:"#BFDBFE"}}>{l}</div><div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{v}</div></div>
              ))}
              {usdJpy&&<div style={{marginLeft:"auto"}}><div style={{fontSize:10,color:"#BFDBFE"}}>USD/JPY</div><div style={{fontSize:14,fontWeight:700,color:"#FDE68A"}}>¥{usdJpy.toFixed(1)}</div></div>}
            </div>
          </div>

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
                  <Tooltip formatter={(v,n)=>[fmt(v),n==="value"?"評価額":"元本"]} contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12}}/>
                  <Area type="monotone" dataKey="invested" stroke={C.light} strokeDasharray="4 3" strokeWidth={1.5} fill="url(#ig)" name="元本"/>
                  <Area type="monotone" dataKey="value" stroke={C.blue} strokeWidth={2.5} fill="url(#ag)" name="評価額"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 銘柄リスト */}
          <div style={{...card}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:C.mid}}>保有銘柄の内訳</div>
              <button onClick={()=>setShowAdd(!showAdd)} style={{background:C.blueLight,border:`1px solid ${C.blueMid}`,borderRadius:8,color:C.blue,fontSize:12,fontWeight:700,padding:"5px 14px",cursor:"pointer"}}>＋ 追加</button>
            </div>
            {portfolioStats.length===0&&<div style={{textAlign:"center",color:C.light,padding:"24px 0",fontSize:13}}>＋ 追加ボタンから仮想購入を記録しましょう</div>}
            {portfolioStats.map((h,i)=>{
              const boughtStr=new Date(h.purchaseDate).toLocaleDateString("ja-JP",{year:"numeric",month:"short",day:"numeric"});
              const cp=cryptoPrices[h.stock.symbol];
              const sp=stockPrices[h.stock.symbol];
              return (
                <div key={h.id} style={{borderTop:i>0?`1px solid ${C.soft}`:"none",paddingTop:i>0?14:0,paddingBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:TYPE_COLOR[h.stock.type],flexShrink:0}}/>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:14,fontWeight:700}}>{h.stock.name}</span>
                          <span style={{background:TYPE_COLOR[h.stock.type]+"18",color:TYPE_COLOR[h.stock.type],fontSize:10,fontWeight:700,borderRadius:4,padding:"1px 6px"}}>{TYPE_LABEL[h.stock.type]}</span>
                        </div>
                        <div style={{fontSize:11,color:C.light}}>{h.stock.sector} · 年率{fmtPct(h.stock.annualReturn)}</div>
                        {h.cp&&<div style={{fontSize:11,color:C.amber,marginTop:1}}>現在価格: ¥{h.cp.price.toLocaleString()} ({h.cp.change24h>=0?"+":""}{h.cp.change24h.toFixed(1)}% 24h) <span style={{color:C.green,fontSize:10,fontWeight:700}}>● LIVE</span></div>}
                        {h.currentPrice&&<div style={{fontSize:11,color:C.blue,marginTop:1}}>現在株価: ¥{h.currentPrice.toLocaleString()} {h.currentPrice&&stockPrices[h.stock.symbol]?.change!==undefined&&`(${stockPrices[h.stock.symbol].change>=0?"+":""}${stockPrices[h.stock.symbol].change}%)`} <span style={{color:C.green,fontSize:10,fontWeight:700}}>● LIVE</span></div>}
                        {h.purchasePrice&&<div style={{fontSize:10,color:C.light,marginTop:1}}>購入時株価: ¥{h.purchasePrice.toLocaleString()} → 実際の株価差で計算</div>}
                        {priceError&&(h.stock.type==="jp"||h.stock.type==="us")&&!h.currentPrice&&<div style={{fontSize:10,color:C.light,marginTop:1}}>⚠️ 株価取得失敗 · 年率近似で計算中</div>}
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
                  <div style={{fontSize:11,color:C.light}}>📅 {boughtStr}購入 · {h.days}日経過{h.stock.優待&&<span style={{marginLeft:8,color:C.amber}}>🎁 {h.stock.優待}</span>}</div>
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
                      <span style={{background:TYPE_COLOR[newStock.type]+"18",color:TYPE_COLOR[newStock.type],fontSize:10,fontWeight:700,borderRadius:4,padding:"1px 6px"}}>{TYPE_LABEL[newStock.type]}</span>
                      <span style={{background:RISK_COLOR[newStock.risk]+"18",color:RISK_COLOR[newStock.risk],fontSize:10,fontWeight:700,borderRadius:4,padding:"1px 6px"}}>{RISK_LABEL[newStock.risk]}</span>
                    </div>
                    <div style={{fontSize:11,color:C.light}}>{newStock.sector} · 年率{fmtPct(newStock.annualReturn)} · 最低{fmt(newStock.minAmount)}</div>
                  </div>
                  <span style={{color:C.light,fontSize:12}}>▼</span>
                </div>
                {showPicker&&(
                  <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,marginTop:6,overflow:"hidden"}}>
                    {/* 検索モード切替 */}
                    <div style={{display:"flex",background:C.soft,margin:8,borderRadius:8,padding:3}}>
                      {[[false,"プリセット"],[true,"🔍 リアルタイム検索"]].map(([mode,label])=>(
                        <button key={String(mode)} onClick={()=>{setSearchMode(mode);setSearchResults([]);setStockSearch("");}}
                          style={{flex:1,padding:"6px 0",background:searchMode===mode?C.blue:"transparent",border:"none",borderRadius:6,color:searchMode===mode?"#fff":C.mid,fontSize:12,fontWeight:600,cursor:"pointer"}}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <div style={{padding:"0 8px 6px"}}>
                      <input value={stockSearch} onChange={e=>setStockSearch(e.target.value)}
                        placeholder={searchMode?"銘柄名・コードで検索（例: トヨタ, AAPL）":"銘柄名・コード・セクター"}
                        style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,padding:"8px 10px",fontSize:13,boxSizing:"border-box"}} autoFocus/>
                    </div>

                    {/* リアルタイム検索結果 */}
                    {searchMode&&(
                      <div style={{maxHeight:260,overflowY:"auto"}}>
                        {searchLoading&&<div style={{textAlign:"center",padding:"16px 0",color:C.light,fontSize:12}}>検索中...</div>}
                        {searchError&&<div style={{textAlign:"center",padding:"16px 0",color:C.red,fontSize:12}}>検索に失敗しました</div>}
                        {!searchLoading&&searchResults.length===0&&stockSearch.length>0&&!searchError&&(
                          <div style={{textAlign:"center",padding:"16px 0",color:C.light,fontSize:12}}>見つかりませんでした</div>
                        )}
                        {searchResults.map(s=>{
                          const sp = stockPrices[s.symbol];
                          return (
                            <div key={s.symbol} onClick={()=>{
                              // 検索結果からプリセットにない銘柄を動的追加
                              const existing = STOCKS.find(x=>x.symbol===s.symbol);
                              const stock = existing ?? {
                                symbol: s.symbol,
                                name: s.name,
                                sector: s.sector||s.quoteType||"",
                                type: s.type,
                                annualReturn: s.type==="crypto"?50:s.type==="fund"?14:s.type==="jp"?10:15,
                                dividend: 0,
                                minAmount: s.type==="jp"?100000:s.type==="fund"?100:1000,
                                unitShares: s.type==="jp"?100:1,
                                優待: null,
                                risk: s.type==="crypto"?"very-high":s.type==="us"?"medium":"medium",
                              };
                              setNewStock(stock);
                              setShowPicker(false);
                              setStockSearch("");
                              setSearchResults([]);
                            }}
                              style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderTop:`1px solid ${C.soft}`,cursor:"pointer",background:newStock.symbol===s.symbol?C.blueLight:C.card}}>
                              <div>
                                <div style={{fontSize:13,fontWeight:600,color:newStock.symbol===s.symbol?C.blue:C.text}}>{s.name}</div>
                                <div style={{fontSize:11,color:C.light}}>{s.symbol} · {s.exchange}</div>
                              </div>
                              <div style={{textAlign:"right"}}>
                                {sp?<div style={{fontSize:13,fontWeight:700,color:C.text}}>¥{sp.price.toLocaleString()}</div>
                                  :<div style={{fontSize:11,color:C.light}}>{s.quoteType}</div>}
                                {sp&&<div style={{fontSize:11,color:sp.change>=0?C.green:C.red}}>{sp.change>=0?"+":""}{sp.change}%</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* プリセット一覧 */}
                    {!searchMode&&(<>
                      <div style={{display:"flex",gap:4,padding:"0 8px 8px",overflowX:"auto"}}>
                        {[["all","すべて"],["fund","投信"],["jp","国内株"],["us","米国株"],["crypto","仮想通貨"]].map(([t,l])=>(
                          <button key={t} onClick={()=>setFilterType(t)} style={{background:filterType===t?C.blue:C.card,color:filterType===t?"#fff":C.mid,border:`1px solid ${filterType===t?C.blue:C.border}`,borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{l}</button>
                        ))}
                      </div>
                      <div style={{maxHeight:240,overflowY:"auto"}}>
                        {pickerStocks.map(s=>{
                          const sp = stockPrices[s.symbol];
                          const cp = cryptoPrices[s.symbol];
                          return (
                            <div key={s.symbol} onClick={()=>{setNewStock(s);setShowPicker(false);setStockSearch("");}}
                              style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 14px",borderTop:`1px solid ${C.soft}`,cursor:"pointer",background:newStock.symbol===s.symbol?C.blueLight:C.card}}>
                              <div>
                                <div style={{display:"flex",alignItems:"center",gap:5}}>
                                  <span style={{fontSize:13,fontWeight:600,color:newStock.symbol===s.symbol?C.blue:C.text}}>{s.name}</span>
                                  <span style={{background:TYPE_COLOR[s.type]+"18",color:TYPE_COLOR[s.type],fontSize:9,fontWeight:700,borderRadius:3,padding:"1px 4px"}}>{TYPE_LABEL[s.type]}</span>
                                </div>
                                <div style={{fontSize:11,color:C.light}}>{s.sector} · 最低{fmt(s.minAmount)}{s.優待?" 🎁":""}</div>
                              </div>
                              <div style={{textAlign:"right"}}>
                                {sp&&<div style={{fontSize:12,fontWeight:700,color:C.text}}>¥{sp.price.toLocaleString()}</div>}
                                {cp&&<div style={{fontSize:12,fontWeight:700,color:C.text}}>¥{cp.price.toLocaleString()}</div>}
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
                {/* 最低金額警告 */}
                {minWarning&&(
                  <div style={{background:C.redLight,border:`1px solid ${C.redMid}`,borderRadius:8,padding:"8px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:14}}>⚠️</span>
                    <span style={{fontSize:12,color:C.red,fontWeight:600}}>{minWarning}</span>
                  </div>
                )}
                {/* 最低金額ヒント */}
                <div style={{fontSize:11,color:C.light,marginBottom:8}}>
                  最低購入金額: <span style={{color:C.mid,fontWeight:600}}>{fmt(newStock.minAmount)}</span>
                  {newStock.type==="jp"&&newStock.unitShares&&<span> （{newStock.unitShares}株単位）</span>}
                  {newStock.type==="fund"&&<span>（100円から積立可）</span>}
                  {newStock.type==="crypto"&&<span>（少額からOK）</span>}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {(newStock.type==="fund"||newStock.type==="crypto"
                    ? [10000,30000,50000,100000,300000]
                    : [newStock.minAmount, newStock.minAmount*2, newStock.minAmount*5, newStock.minAmount*10].filter(v=>v<=2000000)
                  ).map(v=>(
                    <button key={v} onClick={()=>setNewAmount(v)} style={{background:newAmount===v?C.blue:C.card,color:newAmount===v?"#fff":C.mid,border:`1px solid ${newAmount===v?C.blue:C.border}`,borderRadius:7,padding:"5px 10px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{fmt(v)}</button>
                  ))}
                </div>
              </div>

              {/* プレビュー */}
              {!minWarning&&newDate&&newAmount>0&&(()=>{
                const preview=calcCurrentValue(newAmount,newDate,newStock.annualReturn);
                const previewGain=preview-newAmount;
                const previewPct=(preview/newAmount-1)*100;
                return (
                  <div style={{background:previewGain>=0?C.greenLight:C.redLight,border:`1px solid ${previewGain>=0?C.greenMid:C.redMid}`,borderRadius:10,padding:"10px 14px",marginBottom:14}}>
                    <div style={{fontSize:11,color:C.mid,marginBottom:4}}>📊 この条件での現在価値（試算）</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:15,fontWeight:800}}>{fmt(preview)}</span>
                      <span style={{fontSize:14,fontWeight:800,color:previewGain>=0?C.green:C.red}}>{previewGain>=0?"+":""}{fmt(previewGain)} ({fmtPct(previewPct)})</span>
                    </div>
                  </div>
                );
              })()}

              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setShowAdd(false);setStockSearch("");}} style={{flex:1,background:C.soft,border:`1px solid ${C.border}`,borderRadius:10,color:C.mid,fontSize:13,fontWeight:600,padding:"11px 0",cursor:"pointer"}}>キャンセル</button>
                <button onClick={addHolding} disabled={!!minWarning} style={{flex:2,background:minWarning?C.light:C.blue,border:"none",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700,padding:"11px 0",cursor:minWarning?"not-allowed":"pointer"}}>記録する</button>
              </div>
            </div>
          )}
        </>)}

        {/* ════ シミュ ════ */}
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
                          <div style={{fontSize:12,color:RISK_COLOR[s.risk],fontWeight:700}}>{fmtPct(s.annualReturn)}／年</div>
                          <div style={{fontSize:10,color:RISK_COLOR[s.risk]}}>{RISK_LABEL[s.risk]}</div>
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

          <div style={{...card,padding:"14px 6px 10px"}}>
            <p style={{fontSize:10,color:C.light,margin:"0 10px 10px",lineHeight:1.5}}>※過去実績ベースの試算。将来の利益を保証するものではありません</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.soft}/>
                <XAxis dataKey="year" tick={{fontSize:10,fill:C.light}}/>
                <YAxis tick={{fontSize:10,fill:C.light}} tickFormatter={v=>v>=10000?`${(v/10000).toFixed(0)}万`:v}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Legend wrapperStyle={{fontSize:11,paddingTop:6}}/>
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
                    <span style={{background:TYPE_COLOR[s.type]+"18",color:TYPE_COLOR[s.type],fontSize:10,fontWeight:700,borderRadius:4,padding:"1px 6px"}}>{TYPE_LABEL[s.type]}</span>
                  </div>
                  <div style={{fontSize:11,color:C.light}}>{s.sector} · 年率{fmtPct(s.annualReturn)} · 最低{fmt(s.minAmount)}</div>
                </div>
                <div style={{background:s.gain>=0?C.greenLight:C.redLight,border:`1px solid ${s.gain>=0?C.greenMid:C.redMid}`,borderRadius:8,padding:"5px 14px"}}>
                  <div style={{fontSize:18,fontWeight:800,color:s.gain>=0?C.green:C.red}}>{fmtPct(s.gainPct)}</div>
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

        {/* ════ メモ ════ */}
        {mainTab==="memo"&&(<>
          <div style={{...card}}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:10,color:C.mid}}>メモを残す</div>
            <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
              {Object.entries(TAG_STYLE).map(([t,tc])=>(
                <button key={t} onClick={()=>setMemoTag(t)} style={{background:memoTag===t?tc.bg:C.bg,border:`1px solid ${memoTag===t?tc.border:C.border}`,borderRadius:7,color:memoTag===t?tc.text:C.mid,fontSize:12,fontWeight:memoTag===t?700:400,padding:"5px 12px",cursor:"pointer"}}>{t}</button>
              ))}
            </div>
            <textarea value={memoText} onChange={e=>setMemoText(e.target.value)} placeholder="気づいたこと、判断の理由、確認したいことなど..."
              style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,padding:"10px 12px",fontSize:13,minHeight:100,resize:"none",boxSizing:"border-box",lineHeight:1.7}}/>
            <button onClick={()=>{if(!memoText.trim())return;setMemos(p=>[{id:Date.now(),text:memoText,tag:memoTag,date:new Date().toLocaleDateString("ja-JP")},...p]);setMemoText("");}}
              style={{width:"100%",marginTop:10,background:C.blue,border:"none",borderRadius:10,color:"#fff",fontSize:14,fontWeight:700,padding:"12px 0",cursor:"pointer"}}>保存する</button>
          </div>
          {memos.length===0&&<div style={{textAlign:"center",color:C.light,fontSize:13,padding:"36px 0"}}><div style={{fontSize:32,marginBottom:8}}>📝</div>メモはまだありません</div>}
          {memos.map(m=>{
            const tc=TAG_STYLE[m.tag]||TAG_STYLE["メモ"];
            return (
              <div key={m.id} style={{...card}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{background:tc.bg,border:`1px solid ${tc.border}`,borderRadius:5,color:tc.text,fontSize:11,fontWeight:700,padding:"2px 9px"}}>{m.tag}</span>
                  <span style={{fontSize:11,color:C.light}}>{m.date}</span>
                </div>
                <p style={{margin:0,fontSize:13,color:C.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{m.text}</p>
                <button onClick={()=>setMemos(p=>p.filter(x=>x.id!==m.id))} style={{marginTop:8,background:"none",border:"none",color:C.light,fontSize:11,cursor:"pointer",padding:0}}>削除</button>
              </div>
            );
          })}
        </>)}

      </div>
      <div style={{padding:"0 16px 36px",textAlign:"center"}}>
        <p style={{fontSize:10,color:C.light,lineHeight:1.7}}>⚠️ 過去実績ベースの参考シミュレーションです。将来の利益を保証するものではありません。投資は自己責任でお願いします。</p>
      </div>
    </div>
  );
}
