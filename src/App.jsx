import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Area, AreaChart, ComposedChart, ReferenceLine
} from "recharts";

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const monthlyData = [
  { month:"Jan", receitas:4200, despesas:3100 },
  { month:"Fev", receitas:3800, despesas:2900 },
  { month:"Mar", receitas:5100, despesas:3400 },
  { month:"Abr", receitas:4600, despesas:3800 },
  { month:"Mai", receitas:5900, despesas:4100 },
  { month:"Jun", receitas:6200, despesas:3600 },
];

const categoryData = [
  { name:"Alimentação", value:1240, color:"#f97316" },
  { name:"Transporte", value:680,  color:"#3b82f6" },
  { name:"Moradia",    value:1800, color:"#8b5cf6" },
  { name:"Lazer",      value:420,  color:"#ec4899" },
  { name:"Saúde",      value:350,  color:"#10b981" },
  { name:"Outros",     value:510,  color:"#6b7280" },
];

const initialTransactions = [
  { id:1, desc:"Salário",          type:"receita",  cat:"Renda",        value:5200, date:"2024-06-01" },
  { id:2, desc:"Aluguel",          type:"despesa",  cat:"Moradia",      value:1800, date:"2024-06-02" },
  { id:3, desc:"Supermercado",     type:"despesa",  cat:"Alimentação",  value:420,  date:"2024-06-03" },
  { id:4, desc:"Freelance Design", type:"receita",  cat:"Renda Extra",  value:1000, date:"2024-06-05" },
  { id:5, desc:"Uber",             type:"despesa",  cat:"Transporte",   value:85,   date:"2024-06-06" },
  { id:6, desc:"Netflix",          type:"despesa",  cat:"Lazer",        value:45,   date:"2024-06-07" },
  { id:7, desc:"Academia",         type:"despesa",  cat:"Saúde",        value:99,   date:"2024-06-08" },
  { id:8, desc:"Dividendos",       type:"receita",  cat:"Investimentos", value:380, date:"2024-06-10" },
];

const initialGoals = [
  { id:1, name:"Reserva de Emergência", target:20000, current:12400, color:"#10b981", icon:"🛡️" },
  { id:2, name:"Viagem para Europa",    target:15000, current:4800,  color:"#3b82f6", icon:"✈️" },
  { id:3, name:"Novo Notebook",         target:5000,  current:3200,  color:"#8b5cf6", icon:"💻" },
];

const adminUsers = [
  { id:1, name:"Ana Costa",    email:"ana@email.com",  plan:"Pro",    status:"ativo",   joined:"2024-01-15" },
  { id:2, name:"Bruno Lima",   email:"bruno@email.com",plan:"Free",   status:"ativo",   joined:"2024-02-20" },
  { id:3, name:"Carlos Melo",  email:"carlos@email.com",plan:"Pro",   status:"inativo", joined:"2024-03-10" },
  { id:4, name:"Diana Rocha",  email:"diana@email.com", plan:"Pro",   status:"ativo",   joined:"2024-04-05" },
];

const cats = ["Alimentação","Transporte","Moradia","Lazer","Saúde","Renda","Renda Extra","Investimentos","Outros"];

// Fluxo de caixa diário — Junho
const cashFlowData = [
  { dia:"01", entradas:5200, saidas:0,    saldo:5200 },
  { dia:"02", entradas:0,    saidas:1800, saldo:3400 },
  { dia:"03", entradas:0,    saidas:420,  saldo:2980 },
  { dia:"05", entradas:1000, saidas:0,    saldo:3980 },
  { dia:"06", entradas:0,    saidas:85,   saldo:3895 },
  { dia:"07", entradas:0,    saidas:45,   saldo:3850 },
  { dia:"08", entradas:0,    saidas:99,   saldo:3751 },
  { dia:"09", entradas:0,    saidas:210,  saldo:3541 },
  { dia:"10", entradas:380,  saidas:0,    saldo:3921 },
  { dia:"12", entradas:0,    saidas:320,  saldo:3601 },
  { dia:"14", entradas:0,    saidas:180,  saldo:3421 },
  { dia:"16", entradas:800,  saidas:0,    saldo:4221 },
  { dia:"18", entradas:0,    saidas:95,   saldo:4126 },
  { dia:"20", entradas:0,    saidas:430,  saldo:3696 },
  { dia:"22", entradas:500,  saidas:0,    saldo:4196 },
  { dia:"24", entradas:0,    saidas:160,  saldo:4036 },
  { dia:"26", entradas:0,    saidas:75,   saldo:3961 },
  { dia:"28", entradas:0,    saidas:290,  saldo:3671 },
  { dia:"30", entradas:0,    saidas:110,  saldo:3561 },
];

// Comparativo anual (12 meses)
const annualData = [
  { month:"Jan", receitas:4200, despesas:3100, liquido:1100 },
  { month:"Fev", receitas:3800, despesas:2900, liquido:900  },
  { month:"Mar", receitas:5100, despesas:3400, liquido:1700 },
  { month:"Abr", receitas:4600, despesas:3800, liquido:800  },
  { month:"Mai", receitas:5900, despesas:4100, liquido:1800 },
  { month:"Jun", receitas:6580, despesas:3464, liquido:3116 },
  { month:"Jul", receitas:5400, despesas:3900, liquido:1500 },
  { month:"Ago", receitas:6100, despesas:4200, liquido:1900 },
  { month:"Set", receitas:5800, despesas:3700, liquido:2100 },
  { month:"Out", receitas:6300, despesas:4500, liquido:1800 },
  { month:"Nov", receitas:7200, despesas:5100, liquido:2100 },
  { month:"Dez", receitas:8500, despesas:6200, liquido:2300 },
];

// ─── UTILS ───────────────────────────────────────────────────────────────────
const fmt = (v) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v);
const fmtDate = (d) => new Date(d+"T00:00:00").toLocaleDateString("pt-BR");
const pct = (c,t) => Math.min(100, Math.round((c/t)*100));

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Badge({ plan }) {
  const cls = plan==="Pro"
    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
    : "bg-slate-700 text-slate-400 border border-slate-600";
  return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${cls}`}>{plan}</span>;
}

function StatusDot({ status }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${status==="ativo"?"bg-emerald-400":"bg-slate-500"}`}/>
      <span className={status==="ativo"?"text-emerald-400":"text-slate-500"}>{status}</span>
    </span>
  );
}

function Card({ children, className="" }) {
  return (
    <div className={`bg-slate-800/70 border border-slate-700/60 rounded-2xl backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

// Tiny sparkline using SVG path
function Sparkline({ data, color, height=40 }) {
  if (!data || data.length < 2) return null;
  const w = 120, h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 6) - 3,
  ]);
  const pathD = pts.map((p,i) => `${i===0?"M":"L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const areaD = `${pathD} L${w},${h} L0,${h} Z`;
  const gradId = `sg${color.replace("#","")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25}/>
          <stop offset="100%" stopColor={color} stopOpacity={0}/>
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`}/>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={color}/>
    </svg>
  );
}

// Mordomize-style KPI Card with sparkline
function KpiCard({ label, value, pctChange, sparkData, sparkColor="#10b981", extra, extraColor="green" }) {
  const isPos = pctChange >= 0;
  const pctBg = isPos ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400";
  const arrow = isPos ? "↑" : "↓";
  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 flex flex-col gap-1 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{background:`radial-gradient(ellipse at top left, ${sparkColor}10 0%, transparent 70%)`}}/>
      <p className="text-slate-400 text-xs font-medium z-10">{label}</p>
      <p className="text-white text-2xl font-bold tracking-tight z-10" style={{fontFamily:"DM Mono, monospace"}}>
        {value}
      </p>
      <div className="flex items-center gap-2 z-10 flex-wrap">
        <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${pctBg}`}>
          {arrow}{Math.abs(pctChange).toFixed(1)}%
        </span>
        {extra && (
          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
            extraColor==="red" ? "bg-rose-500/15 text-rose-400"
            : extraColor==="green" ? "bg-emerald-500/15 text-emerald-400"
            : "bg-amber-500/15 text-amber-400"
          }`}>{extra}</span>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color="text-white", icon }) {
  return (
    <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl backdrop-blur-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded-lg">{sub}</span>
      </div>
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}

// SVG icon map matching the reference sidebar
function NavIcon({ name, size=16 }) {
  const icons = {
    "grid":       <path d="M3 3h7v7H3zm0 11h7v7H3zm11-11h7v7h-7zm0 11h7v7h-7z" strokeWidth="1.5" fill="none" stroke="currentColor" strokeLinejoin="round"/>,
    "arrow-up":   <path d="M12 19V5m-7 7 7-7 7 7" strokeWidth="2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>,
    "arrow-down": <path d="M12 5v14m7-7-7 7-7-7" strokeWidth="2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>,
    "arrows":     <path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" strokeWidth="2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>,
    "document":   <><rect x="5" y="2" width="14" height="20" rx="2" strokeWidth="1.5" fill="none" stroke="currentColor"/><path d="M9 7h6M9 11h6M9 15h4" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round"/></>,
    "tag":        <path d="M12 2H7a1 1 0 0 0-.7.3l-4 4a1 1 0 0 0 0 1.4l10 10a1 1 0 0 0 1.4 0l6-6a1 1 0 0 0 0-1.4l-10-10A1 1 0 0 0 12 2zm-3 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" strokeWidth="1.5" fill="none" stroke="currentColor" strokeLinejoin="round"/>,
    "chart-bar":  <path d="M3 3v18h18M7 16v-5m4 5V8m4 8V11" strokeWidth="2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>,
    "target":     <><circle cx="12" cy="12" r="9" strokeWidth="1.5" fill="none" stroke="currentColor"/><circle cx="12" cy="12" r="5" strokeWidth="1.5" fill="none" stroke="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
    "cart":       <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" strokeWidth="1.5" fill="none" stroke="currentColor"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0" strokeWidth="1.5" fill="none" stroke="currentColor" strokeLinecap="round"/></>,
    "credit-card": <><rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="1.5" fill="none" stroke="currentColor"/><line x1="2" y1="10" x2="22" y2="10" strokeWidth="1.5" stroke="currentColor"/></>,
    "car":        <><path d="M5 17H3a1 1 0 0 1-1-1v-5l2-6h16l2 6v5a1 1 0 0 1-1 1h-2" strokeWidth="1.5" fill="none" stroke="currentColor" strokeLinejoin="round"/><circle cx="7.5" cy="17" r="2.5" strokeWidth="1.5" fill="none" stroke="currentColor"/><circle cx="16.5" cy="17" r="2.5" strokeWidth="1.5" fill="none" stroke="currentColor"/></>,
    "user":       <><circle cx="12" cy="8" r="4" strokeWidth="1.5" fill="none" stroke="currentColor"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeWidth="1.5" fill="none" stroke="currentColor" strokeLinecap="round"/></>,
    "star":       <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="1.5" fill="none" stroke="currentColor" strokeLinejoin="round"/>,
    "settings":   <><circle cx="12" cy="12" r="3" strokeWidth="1.5" fill="none" stroke="currentColor"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" strokeWidth="1.5" fill="none" stroke="currentColor"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="flex-shrink-0">
      {icons[name] || <circle cx="12" cy="12" r="5" fill="currentColor"/>}
    </svg>
  );
}

function NavItem({ icon, label, active, onClick, mode }) {
  const activeStyle = active
    ? mode === "empresarial"
      ? { bg: "bg-blue-500 text-white shadow-lg shadow-blue-500/25", icon: "text-white" }
      : { bg: "bg-orange-500 text-white shadow-lg shadow-orange-500/25", icon: "text-white" }
    : { bg: "text-slate-400 hover:bg-slate-700/50 hover:text-white", icon: "" };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${activeStyle.bg}`}
    >
      <NavIcon name={icon} size={16}/>
      <span className="truncate">{label}</span>
    </button>
  );
}

// ─── PAGES ───────────────────────────────────────────────────────────────────

function Dashboard({ transactions, accountMode }) {
  const receitas = transactions.filter(t=>t.type==="receita").reduce((s,t)=>s+t.value,0);
  const despesas = transactions.filter(t=>t.type==="despesa").reduce((s,t)=>s+t.value,0);
  const saldo = receitas - despesas;
  const saude = Math.round((saldo/receitas)*100);

  // ── Month selectors ──────────────────────────────────────────────────────
  const [cfMonth, setCfMonth]     = useState(5);  // index 0-11, default Junho
  const [cmpMonths, setCmpMonths] = useState([0,1,2,3,4,5]); // multi-select for annual comparison

  const toggleCmpMonth = (i) => {
    setCmpMonths(prev =>
      prev.includes(i)
        ? prev.length > 1 ? prev.filter(m => m !== i) : prev
        : [...prev, i].sort((a,b)=>a-b)
    );
  };

  // ── Per-month cash flow data (simulated deterministically per month) ──────
  const generateCashFlow = (monthIdx) => {
    const seed = (monthIdx + 1) * 137;
    const base = 3000 + seed % 2500;
    const days = [1,2,3,5,6,7,8,9,10,12,14,16,18,20,22,24,26,28,30];
    let running = 0;
    return days.map((dia, i) => {
      const isIncome = i === 0 || i === 9 || i === 15 || i === 11;
      const entrada = isIncome ? base + ((seed * (i+1)) % 800) : 0;
      const saida   = !isIncome ? 80 + ((seed * (i+3)) % 450) : 0;
      running = running + entrada - saida;
      return { dia: String(dia).padStart(2,"0"), entradas: entrada, saidas: saida, saldo: Math.max(0, running) };
    });
  };

  const cfData = generateCashFlow(cfMonth);
  const cfMonthName = MONTHS[cfMonth];

  // ── Filtered annual data ─────────────────────────────────────────────────
  const filteredAnnual = annualData.filter((_,i) => cmpMonths.includes(i));
  const selectedMonthData = annualData[cfMonth];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl">
        <p className="text-slate-300 text-xs mb-2 font-semibold">{label}</p>
        {payload.map((p,i)=>(
          <p key={i} style={{color:p.color}} className="text-sm font-mono">
            {p.name}: {fmt(p.value)}
          </p>
        ))}
      </div>
    );
  };

  // ── Shared month pill selector ───────────────────────────────────────────
  const MonthPills = ({ selected, onSelect, multi=false, accentColor="orange" }) => {
    const colors = {
      orange: { active:"bg-orange-500 text-white shadow-orange-500/30", dot:"bg-orange-400" },
      violet: { active:"bg-violet-600 text-white shadow-violet-500/30", dot:"bg-violet-400" },
    };
    const c = colors[accentColor];
    return (
      <div className="flex flex-wrap gap-1.5 mt-3">
        {MONTHS.map((m, i) => {
          const isActive = multi ? selected.includes(i) : selected === i;
          return (
            <button key={i} onClick={() => onSelect(i)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? `${c.active} shadow-sm`
                  : "bg-slate-700/60 text-slate-400 hover:bg-slate-600/80 hover:text-slate-200"
              }`}>
              {m}
              {multi && isActive && <span className="ml-1 opacity-70">✓</span>}
            </button>
          );
        })}
      </div>
    );
  };

  const now = new Date();
  const mesAtual = MONTHS[now.getMonth()];
  const anoAtual = now.getFullYear();
  const primeiroDia = `01/${String(now.getMonth()+1).padStart(2,"0")}/${anoAtual}`;
  const ultimoDia   = `${new Date(anoAtual, now.getMonth()+1, 0).getDate()}/${String(now.getMonth()+1).padStart(2,"0")}/${anoAtual}`;
  const isPessoal   = accountMode === "pessoal";

  return (
    <div className="space-y-6">

      {/* ── BANNER RESUMO FINANCEIRO ── */}
      <div className={`flex items-center gap-4 rounded-2xl px-5 py-4 border ${
        isPessoal
          ? "bg-orange-500/10 border-orange-500/20"
          : "bg-blue-500/10 border-blue-600/25"
      }`}>
        {/* Icon */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
          isPessoal
            ? "bg-orange-500 shadow-lg shadow-orange-500/40"
            : "bg-blue-600 shadow-lg shadow-blue-600/40"
        }`}>
          {isPessoal ? "ℹ️" : "🏢"}
        </div>
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">
            Resumo Financeiro {isPessoal ? "Pessoal" : "Empresarial"}: {mesAtual}/{anoAtual}
          </p>
          <p className={`text-xs mt-0.5 ${isPessoal ? "text-orange-300/70" : "text-blue-300/70"}`}>
            Período: {primeiroDia} a {ultimoDia}
          </p>
        </div>
        {/* Saldo badge */}
        <span className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg ${
          saldo >= 0
            ? isPessoal
              ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
              : "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
            : "bg-rose-500 text-white shadow-sm shadow-rose-500/30"
        }`}>
          {saldo >= 0 ? "Saldo Positivo" : "Saldo Negativo"}
        </span>
      </div>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
            isPessoal
              ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
              : "bg-blue-500/20 text-blue-400 border-blue-500/30"
          }`}>
            {isPessoal ? "👤 Pessoal" : "🏢 Empresarial"}
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-1">Visão geral das suas finanças — {cfMonthName} 2024</p>
      </div>

      {/* ── KPI Cards estilo Mordomize ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Receitas no período"
          value={fmt(receitas)}
          pctChange={0.0}
          sparkData={annualData.map(d=>d.receitas)}
          sparkColor="#10b981"
        />
        <KpiCard
          label="Despesas no período"
          value={fmt(despesas)}
          pctChange={-12.4}
          sparkData={annualData.map(d=>d.despesas)}
          sparkColor="#f43f5e"
          extra={"⏳ Pendente: R$ 0,00"}
          extraColor="red"
        />
        <KpiCard
          label="Saldo do período"
          value={fmt(saldo)}
          pctChange={parseFloat(((saldo/receitas)*100).toFixed(1))}
          sparkData={annualData.map(d=>d.liquido)}
          sparkColor={saldo>=0?"#10b981":"#f43f5e"}
        />
        <KpiCard
          label="Despesas/Receitas"
          value={`${((despesas/receitas)*100).toFixed(1)}%`}
          pctChange={saude - 50}
          sparkData={annualData.map(d=>Math.round((d.despesas/d.receitas)*100))}
          sparkColor="#f59e0b"
          extra={saude > 70 ? "💚 Saúde Financeira: Excelente" : saude > 50 ? "💛 Saúde Financeira: Boa" : "🔴 Saúde Financeira: Atenção"}
          extraColor={saude > 70 ? "green" : saude > 50 ? "yellow" : "red"}
        />
      </div>

      {/* Empresarial extras */}
      {accountMode === "empresarial" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Faturamento Bruto" value={fmt(receitas * 3.2)} pctChange={8.3}
            sparkData={annualData.map(d=>d.receitas*3.2)} sparkColor="#3b82f6"/>
          <KpiCard label="Resultado (DRE)" value={fmt(saldo * 2.8)} pctChange={5.1}
            sparkData={annualData.map(d=>d.liquido*2.8)} sparkColor="#8b5cf6"/>
          <KpiCard label="Funcionários Ativos" value="12" pctChange={0}
            sparkData={[10,10,11,11,11,12,12,12,12,12,12,12]} sparkColor="#64748b"/>
          <KpiCard label="CNPJ / Status" value="Regularizado" pctChange={0}
            sparkData={[1,1,1,1,1,1,1,1,1,1,1,1]} sparkColor="#10b981"
            extra="✅ Ativo" extraColor="green"/>
        </div>
      )}

      {/* Categorias (pie) */}
      <Card className="p-5">
        <h3 className="text-white font-semibold mb-4">Distribuição por Categoria</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-48 flex-shrink-0">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                  dataKey="value" paddingAngle={3}>
                  {categoryData.map((c,i)=><Cell key={i} fill={c.color}/>)}
                </Pie>
                <Tooltip formatter={(v)=>fmt(v)} contentStyle={{background:"#0f172a",border:"1px solid #334155",borderRadius:12}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 w-full grid grid-cols-2 gap-2">
            {categoryData.map((c,i)=>(
              <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-700/30">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:c.color}}/>
                  <span className="text-slate-300">{c.name}</span>
                </span>
                <span className="text-slate-300 font-mono font-semibold">{fmt(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── FLUXO DE CAIXA PESSOAL ─────────────────────────────────────── */}
      {accountMode === "pessoal" && (
        <Card className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-white font-semibold">💧 Fluxo de Caixa Pessoal</h3>
              <p className="text-slate-400 text-xs mt-0.5">Entradas, saídas e saldo acumulado</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"/>Entradas</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"/>Saídas</span>
              <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-amber-400 inline-block"/>Saldo</span>
            </div>
          </div>

          {/* Month selector */}
          <div className="mt-3 pb-3 border-b border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1.5">📆 Selecionar mês:</p>
            <MonthPills selected={cfMonth} onSelect={setCfMonth} accentColor="orange"/>
          </div>

          {/* Selected month label */}
          <div className="flex items-center gap-2 mt-3 mb-1">
            <span className="text-sm font-semibold text-orange-400">{cfMonthName} 2024</span>
            {selectedMonthData && (
              <span className="text-xs text-slate-500">
                · Receita projetada: <span className="text-emerald-400 font-mono">{fmt(selectedMonthData.receitas)}</span>
                · Despesa: <span className="text-rose-400 font-mono">{fmt(selectedMonthData.despesas)}</span>
              </span>
            )}
          </div>

          {/* KPIs rápidos */}
          <div className="grid grid-cols-3 gap-3 my-4">
            {[
              { label:"Total Entradas", value: fmt(cfData.reduce((s,d)=>s+d.entradas,0)), color:"text-emerald-400", bg:"bg-emerald-500/10 border-emerald-500/20" },
              { label:"Total Saídas",   value: fmt(cfData.reduce((s,d)=>s+d.saidas,0)),  color:"text-rose-400",    bg:"bg-rose-500/10 border-rose-500/20" },
              { label:"Saldo Final",    value: fmt(cfData[cfData.length-1].saldo),         color:"text-amber-400",   bg:"bg-amber-500/10 border-amber-500/20" },
            ].map((k,i)=>(
              <div key={i} className={`rounded-xl p-3 border ${k.bg} text-center`}>
                <p className="text-slate-400 text-xs mb-1">{k.label}</p>
                <p className={`font-bold font-mono text-sm ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={cfData} barGap={2} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
              <XAxis dataKey="dia" tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}
                tickFormatter={d=>`${d}/${String(cfMonth+1).padStart(2,"0")}`}/>
              <YAxis tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}
                tickFormatter={v=>v===0?"":v>=1000?`R$${v/1000}k`:`R$${v}`}/>
              <Tooltip
                contentStyle={{background:"#0f172a",border:"1px solid #334155",borderRadius:12,fontSize:12}}
                formatter={(v,name)=>[fmt(v), name==="entradas"?"Entradas":name==="saidas"?"Saídas":"Saldo"]}
                labelFormatter={l=>`Dia ${l}/${String(cfMonth+1).padStart(2,"0")}`}
              />
              <Bar dataKey="entradas" name="entradas" fill="#10b981" radius={[4,4,0,0]} maxBarSize={18}/>
              <Bar dataKey="saidas"   name="saidas"   fill="#f43f5e" radius={[4,4,0,0]} maxBarSize={18}/>
              <Line type="monotone" dataKey="saldo" name="saldo" stroke="#f59e0b" strokeWidth={2.5}
                dot={{fill:"#f59e0b",r:3,strokeWidth:0}} activeDot={{r:5,fill:"#f59e0b"}}/>
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* ── COMPARATIVO MENSAL ANUAL ────────────────────────────────────── */}
      {accountMode === "pessoal" && (
        <Card className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-white font-semibold">📅 Comparativo Mensal — Anual 2024</h3>
              <p className="text-slate-400 text-xs mt-0.5">Receitas, despesas e resultado líquido</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"/>Receitas</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"/>Despesas</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-violet-500 inline-block"/>Líquido</span>
            </div>
          </div>

          {/* Multi-month selector */}
          <div className="mt-3 pb-3 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-slate-500">📆 Selecionar meses para comparar (múltiplos):</p>
              <div className="flex gap-2">
                <button onClick={()=>setCmpMonths([0,1,2,3,4,5,6,7,8,9,10,11])}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors px-2 py-0.5 rounded-lg hover:bg-violet-500/10">
                  Todos
                </button>
                <button onClick={()=>setCmpMonths([cfMonth])}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-0.5 rounded-lg hover:bg-slate-700">
                  Limpar
                </button>
              </div>
            </div>
            <MonthPills selected={cmpMonths} onSelect={toggleCmpMonth} multi={true} accentColor="violet"/>
          </div>

          {/* Totalizadores dos meses selecionados */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-4">
            {[
              { label:`Receitas (${cmpMonths.length} meses)`, value: fmt(filteredAnnual.reduce((s,d)=>s+d.receitas,0)),  color:"text-emerald-400", bg:"bg-emerald-500/10 border-emerald-500/20" },
              { label:`Despesas (${cmpMonths.length} meses)`, value: fmt(filteredAnnual.reduce((s,d)=>s+d.despesas,0)),  color:"text-rose-400",    bg:"bg-rose-500/10 border-rose-500/20" },
              { label:"Resultado Período",                     value: fmt(filteredAnnual.reduce((s,d)=>s+d.liquido,0)),   color:"text-violet-400",  bg:"bg-violet-500/10 border-violet-500/20" },
              { label:"Melhor Mês",
                value: filteredAnnual.length ? filteredAnnual.reduce((best,d)=>d.liquido>best.liquido?d:best,filteredAnnual[0]).month : "—",
                color:"text-amber-400", bg:"bg-amber-500/10 border-amber-500/20" },
            ].map((k,i)=>(
              <div key={i} className={`rounded-xl p-3 border ${k.bg} text-center`}>
                <p className="text-slate-400 text-xs mb-1">{k.label}</p>
                <p className={`font-bold font-mono text-sm ${k.color}`}>{k.value}</p>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={filteredAnnual} barGap={3} barCategoryGap="25%">
              <defs>
                <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="gDesp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#e11d48" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="gLiq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
              <XAxis dataKey="month" tick={{fill:"#64748b",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false}
                tickFormatter={v=>v===0?"":v>=1000?`${v/1000}k`:v}/>
              <Tooltip
                contentStyle={{background:"#0f172a",border:"1px solid #334155",borderRadius:12,fontSize:12}}
                formatter={(v,name)=>[fmt(v), name==="receitas"?"Receitas":name==="despesas"?"Despesas":"Líquido"]}
                cursor={{fill:"rgba(255,255,255,0.04)"}}
              />
              <Bar dataKey="receitas"  name="receitas"  fill="url(#gRec)"  radius={[4,4,0,0]} maxBarSize={22}/>
              <Bar dataKey="despesas"  name="despesas"  fill="url(#gDesp)" radius={[4,4,0,0]} maxBarSize={22}/>
              <Bar dataKey="liquido"   name="liquido"   fill="url(#gLiq)"  radius={[4,4,0,0]} maxBarSize={22}/>
            </BarChart>
          </ResponsiveContainer>

          {/* Mini tabela resumo — só dos meses selecionados */}
          <div className="mt-4 flex flex-wrap gap-1">
            {filteredAnnual.map((d,i)=>{
              const pctBar = Math.round((d.liquido / d.receitas) * 100);
              const monthIdx = annualData.findIndex(a=>a.month===d.month);
              const isActive = cmpMonths.includes(monthIdx);
              return (
                <button key={i} onClick={()=>toggleCmpMonth(monthIdx)}
                  className={`text-center p-2 rounded-xl transition-all min-w-[52px] border ${
                    isActive
                      ? "bg-violet-500/15 border-violet-500/40"
                      : "bg-slate-700/30 border-transparent hover:bg-slate-700/50"
                  }`}>
                  <p className="text-xs font-semibold text-white">{d.month}</p>
                  <p className="text-xs font-bold text-violet-400 font-mono">{pctBar}%</p>
                  <div className="h-1 bg-slate-700 rounded-full mt-1 overflow-hidden w-full">
                    <div className="h-full bg-violet-500 rounded-full transition-all" style={{width:`${pctBar}%`}}/>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-600 mt-2 text-center">% = resultado líquido ÷ receita · Clique nos cards para remover meses</p>
        </Card>
      )}

      {/* Recent transactions */}
      <Card className="p-5">
        <h3 className="text-white font-semibold mb-4">Últimas Transações</h3>
        <div className="space-y-2">
          {transactions.slice(0,5).map(t=>(
            <div key={t.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-700/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                  t.type==="receita"?"bg-emerald-500/20 text-emerald-400":"bg-rose-500/20 text-rose-400"
                }`}>
                  {t.type==="receita"?"⬆":"⬇"}
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{t.desc}</p>
                  <p className="text-xs text-slate-500">{t.cat} · {fmtDate(t.date)}</p>
                </div>
              </div>
              <span className={`font-mono font-semibold ${t.type==="receita"?"text-emerald-400":"text-rose-400"}`}>
                {t.type==="receita"?"+":"-"}{fmt(t.value)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Transactions({ transactions, setTransactions }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ desc:"", type:"despesa", cat:"Alimentação", value:"", date:"" });
  const [whatsapp, setWhatsapp] = useState(false);
  const [wpMsg, setWpMsg] = useState("");
  const [filter, setFilter] = useState("todos");

  const addTx = () => {
    if (!form.desc || !form.value || !form.date) return;
    setTransactions(prev=>[{id:Date.now(),...form,value:parseFloat(form.value)},...prev]);
    setModal(false);
    setForm({ desc:"", type:"despesa", cat:"Alimentação", value:"", date:"" });
  };

  const parseWp = () => {
    const lower = wpMsg.toLowerCase();
    const val = parseFloat(wpMsg.match(/\d+([.,]\d+)?/)?.[0]?.replace(",",".")||"0");
    const type = lower.includes("recebi")||lower.includes("ganhei")?"receita":"despesa";
    let cat = "Outros";
    if (lower.includes("comida")||lower.includes("restaurante")||lower.includes("ifood")) cat="Alimentação";
    else if (lower.includes("uber")||lower.includes("gasolina")) cat="Transporte";
    else if (lower.includes("salário")||lower.includes("salario")) cat="Renda";
    const desc = wpMsg.split(/\d/)[0].trim() || "WhatsApp Transaction";
    setTransactions(prev=>[{id:Date.now(),desc,type,cat,value:val,date:new Date().toISOString().split("T")[0]},...prev]);
    setWhatsapp(false);
    setWpMsg("");
  };

  const filtered = filter==="todos" ? transactions : transactions.filter(t=>t.type===filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transações</h1>
          <p className="text-slate-400 text-sm mt-1">{transactions.length} registros encontrados</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setWhatsapp(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors">
            <span>📱</span> WhatsApp
          </button>
          <button onClick={()=>setModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors">
            <span>+</span> Nova
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["todos","receita","despesa"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-all ${
              filter===f?"bg-emerald-500 text-white":"bg-slate-700/50 text-slate-400 hover:bg-slate-700"
            }`}>{f==="todos"?"Todos":f==="receita"?"Receitas":"Despesas"}</button>
        ))}
      </div>

      <Card>
        <div className="divide-y divide-slate-700/50">
          {filtered.map(t=>(
            <div key={t.id} className="flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  t.type==="receita"?"bg-emerald-500/20":"bg-rose-500/20"
                }`}>
                  <span className="text-sm">{t.type==="receita"?"💚":"🔴"}</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{t.desc}</p>
                  <p className="text-slate-500 text-xs">{t.cat} · {fmtDate(t.date)}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-mono font-bold ${t.type==="receita"?"text-emerald-400":"text-rose-400"}`}>
                  {t.type==="receita"?"+":"-"}{fmt(t.value)}
                </span>
                <button onClick={()=>setTransactions(p=>p.filter(x=>x.id!==t.id))}
                  className="block text-xs text-slate-600 hover:text-rose-400 transition-colors mt-0.5 ml-auto">
                  remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-white font-bold text-lg">Nova Transação</h2>
            <div className="grid grid-cols-2 gap-3">
              {["receita","despesa"].map(t=>(
                <button key={t} onClick={()=>setForm(p=>({...p,type:t}))}
                  className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                    form.type===t
                      ? t==="receita"?"bg-emerald-500 text-white":"bg-rose-500 text-white"
                      : "bg-slate-700 text-slate-400"
                  }`}>{t==="receita"?"+ Receita":"- Despesa"}</button>
              ))}
            </div>
            {[
              {label:"Descrição",key:"desc",type:"text",placeholder:"Ex: Salário..."},
              {label:"Valor (R$)",key:"value",type:"number",placeholder:"0,00"},
              {label:"Data",key:"date",type:"date"},
            ].map(f=>(
              <div key={f.key}>
                <label className="text-slate-400 text-xs mb-1 block">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder||""}
                  value={form[f.key]}
                  onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"/>
              </div>
            ))}
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Categoria</label>
              <select value={form.cat} onChange={e=>setForm(p=>({...p,cat:e.target.value}))}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500">
                {cats.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={()=>setModal(false)} className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-600 transition-colors">Cancelar</button>
              <button onClick={addTx} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-400 transition-colors">Adicionar</button>
            </div>
          </Card>
        </div>
      )}

      {/* WhatsApp Modal */}
      {whatsapp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-xl">📱</div>
              <div>
                <h2 className="text-white font-bold">Registrar via WhatsApp</h2>
                <p className="text-slate-400 text-xs">Descreva sua transação em linguagem natural</p>
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
              <p className="text-slate-500 text-xs mb-2">Exemplos:</p>
              {["Gastei 85 reais no Uber hoje","Recebi meu salário de 5200","Comprei comida no ifood por 42 reais"].map(e=>(
                <button key={e} onClick={()=>setWpMsg(e)}
                  className="block text-xs text-emerald-400 hover:text-emerald-300 mb-1 transition-colors text-left">→ {e}</button>
              ))}
            </div>
            <textarea
              value={wpMsg}
              onChange={e=>setWpMsg(e.target.value)}
              placeholder="Ex: Paguei 350 reais de academia..."
              rows={3}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-green-500"
            />
            <div className="flex gap-3">
              <button onClick={()=>setWhatsapp(false)} className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-600 transition-colors">Cancelar</button>
              <button onClick={parseWp} disabled={!wpMsg.trim()} className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">Processar ✨</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Goals() {
  const [goals, setGoals] = useState(initialGoals);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name:"", target:"", current:"", icon:"🎯" });

  const icons = ["🎯","✈️","🏠","💻","🚗","💰","🎓","❤️","🛡️","🎸"];

  const addGoal = () => {
    if (!form.name||!form.target) return;
    const colors = ["#10b981","#3b82f6","#8b5cf6","#ec4899","#f97316"];
    setGoals(p=>[...p,{id:Date.now(),...form,target:+form.target,current:+form.current||0,
      color:colors[Math.floor(Math.random()*colors.length)]}]);
    setModal(false);
    setForm({name:"",target:"",current:"",icon:"🎯"});
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Metas Financeiras</h1>
          <p className="text-slate-400 text-sm mt-1">Acompanhe seu progresso</p>
        </div>
        <button onClick={()=>setModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors">
          + Nova Meta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {goals.map(g=>{
          const p = pct(g.current,g.target);
          return (
            <Card key={g.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{g.icon}</span>
                  <div>
                    <h3 className="text-white font-semibold">{g.name}</h3>
                    <p className="text-slate-400 text-sm">{fmt(g.current)} de {fmt(g.target)}</p>
                  </div>
                </div>
                <span className="text-2xl font-bold font-mono" style={{color:g.color}}>{p}%</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{width:`${p}%`, background:g.color}}/>
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>Faltam {fmt(g.target-g.current)}</span>
                <span>{p===100?"✅ Concluída!":"Em progresso..."}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-white font-bold text-lg">Nova Meta</h2>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Ícone</label>
              <div className="flex flex-wrap gap-2">
                {icons.map(i=>(
                  <button key={i} onClick={()=>setForm(p=>({...p,icon:i}))}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                      form.icon===i?"bg-emerald-500/30 border border-emerald-500":"bg-slate-700 hover:bg-slate-600"
                    }`}>{i}</button>
                ))}
              </div>
            </div>
            {[
              {label:"Nome da Meta",key:"name",placeholder:"Ex: Reserva de emergência"},
              {label:"Valor Alvo (R$)",key:"target",placeholder:"20000"},
              {label:"Valor Atual (R$)",key:"current",placeholder:"0"},
            ].map(f=>(
              <div key={f.key}>
                <label className="text-slate-400 text-xs mb-1 block">{f.label}</label>
                <input type="text" placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"/>
              </div>
            ))}
            <div className="flex gap-3 pt-1">
              <button onClick={()=>setModal(false)} className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-600 transition-colors">Cancelar</button>
              <button onClick={addGoal} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-400 transition-colors">Criar Meta</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Reports({ transactions }) {
  const [period, setPeriod] = useState("mes");
  const [catFilter, setCatFilter] = useState("Todos");

  const allCats = ["Todos", ...new Set(transactions.map(t=>t.cat))];
  const filtered = transactions.filter(t=> catFilter==="Todos" || t.cat===catFilter);
  const total = filtered.reduce((s,t)=> t.type==="receita"?s+t.value:s-t.value, 0);

  const catTotals = cats.reduce((acc,c)=>{
    const sum = transactions.filter(t=>t.cat===c&&t.type==="despesa").reduce((s,t)=>s+t.value,0);
    if (sum>0) acc.push({name:c,total:sum});
    return acc;
  },[]).sort((a,b)=>b.total-a.total);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Relatórios</h1>
          <p className="text-slate-400 text-sm mt-1">Análise detalhada das suas finanças</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors border border-slate-600">
          📥 Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["Todos",...new Set(transactions.map(t=>t.cat))].slice(0,6).map(c=>(
          <button key={c} onClick={()=>setCatFilter(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              catFilter===c?"bg-emerald-500 text-white":"bg-slate-700/50 text-slate-400 hover:bg-slate-700"
            }`}>{c}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Gastos por Categoria</h3>
          <div className="space-y-3">
            {catTotals.map((c,i)=>{
              const max = catTotals[0].total;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{c.name}</span>
                    <span className="text-slate-400 font-mono">{fmt(c.total)}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full"
                      style={{width:`${(c.total/max)*100}%`}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Distribuição Mensal</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
              <XAxis dataKey="month" tick={{fill:"#94a3b8",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#94a3b8",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${v/1000}k`}/>
              <Tooltip contentStyle={{background:"#0f172a",border:"1px solid #334155",borderRadius:12,fontSize:12}}/>
              <Bar dataKey="receitas" name="Receitas" fill="#10b981" radius={[4,4,0,0]}/>
              <Bar dataKey="despesas" name="Despesas" fill="#f43f5e" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Extrato Filtrado</h3>
          <span className={`font-mono font-bold ${total>=0?"text-emerald-400":"text-rose-400"}`}>
            Saldo: {fmt(total)}
          </span>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {filtered.map(t=>(
            <div key={t.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-700/30">
              <span className="text-slate-300 text-sm">{t.desc}</span>
              <div className="text-right">
                <span className={`text-sm font-mono font-semibold ${t.type==="receita"?"text-emerald-400":"text-rose-400"}`}>
                  {t.type==="receita"?"+":"-"}{fmt(t.value)}
                </span>
                <p className="text-xs text-slate-500">{fmtDate(t.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Planos() {
  const [billing, setBilling] = useState("mensal");
  const plans = [
    {
      name:"Free", price:0, color:"slate",
      features:["Até 50 transações/mês","1 conta","Relatórios básicos","Dashboard simples"],
      blocked:["Metas ilimitadas","Integração WhatsApp","Exportar PDF/CSV","Suporte prioritário"],
    },
    {
      name:"Pro", price:billing==="mensal"?29:23, color:"emerald", popular:true,
      features:["Transações ilimitadas","5 contas","Relatórios avançados","Metas ilimitadas","Integração WhatsApp","Exportar PDF/CSV","Suporte prioritário"],
      blocked:[],
    },
    {
      name:"Business", price:billing==="mensal"?79:59, color:"violet",
      features:["Tudo do Pro","Contas ilimitadas","Multi-usuários","API própria","Painel administrativo","SLA garantido"],
      blocked:[],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Planos & Preços</h1>
        <p className="text-slate-400 text-sm mt-1">Comece grátis, escale quando precisar</p>
        <div className="flex items-center justify-center gap-2 mt-4">
          {["mensal","anual"].map(b=>(
            <button key={b} onClick={()=>setBilling(b)}
              className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                billing===b?"bg-emerald-500 text-white":"bg-slate-700 text-slate-400"
              }`}>
              {b} {b==="anual"&&<span className="text-xs ml-1 text-emerald-300">-20%</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {plans.map(p=>(
          <Card key={p.name} className={`p-6 relative ${p.popular?"border-emerald-500/50":""}`}>
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                MAIS POPULAR
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-white font-bold text-lg">{p.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-white font-mono">
                  {p.price===0?"Grátis":`R$${p.price}`}
                </span>
                {p.price>0&&<span className="text-slate-400 text-sm">/mês</span>}
              </div>
            </div>
            <div className="space-y-2 mb-6">
              {p.features.map((f,i)=>(
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-slate-300">{f}</span>
                </div>
              ))}
              {p.blocked.map((f,i)=>(
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-slate-600">✗</span>
                  <span className="text-slate-600 line-through">{f}</span>
                </div>
              ))}
            </div>
            <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              p.popular
                ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                : p.name==="Business"
                  ? "bg-violet-600 hover:bg-violet-500 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-300"
            }`}>
              {p.price===0?"Começar Grátis":"Assinar Agora"}
            </button>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-white font-bold mb-4">🔒 Segurança & Conformidade</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {icon:"🔐",label:"JWT + OAuth2",desc:"Autenticação segura"},
            {icon:"🔒",label:"SSL/TLS",desc:"Criptografia ponta a ponta"},
            {icon:"🛡️",label:"Bcrypt",desc:"Hash de senhas"},
            {icon:"📋",label:"LGPD",desc:"Conformidade garantida"},
          ].map((s,i)=>(
            <div key={i} className="bg-slate-700/30 rounded-xl p-4 text-center">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-white text-sm font-semibold mt-2">{s.label}</p>
              <p className="text-slate-400 text-xs mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


// ════════════════════════════════════════════════════════
// RECEITAS PAGE
// ════════════════════════════════════════════════════════
function ReceitasPage({ transactions }) {
  const receitas = transactions.filter(t => t.type === "receita");
  const total = receitas.reduce((s,t) => s + t.value, 0);
  const bycat = receitas.reduce((acc,t) => { acc[t.cat] = (acc[t.cat]||0)+t.value; return acc; },{});
  const cats = Object.entries(bycat).sort((a,b)=>b[1]-a[1]);
  const sparkData = annualData.map(d=>d.receitas);

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-white">Receitas</h1>
        <p className="text-slate-400 text-sm mt-1">Todas as entradas no período</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Total Receitas" value={fmt(total)} pctChange={8.2} sparkData={sparkData} sparkColor="#10b981"/>
        <KpiCard label="Maior entrada" value={fmt(Math.max(...receitas.map(t=>t.value)))} pctChange={0} sparkData={sparkData.map(v=>v*0.9)} sparkColor="#34d399"/>
        <KpiCard label="Média mensal" value={fmt(total/6)} pctChange={3.1} sparkData={sparkData.map(v=>v/6)} sparkColor="#6ee7b7"/>
      </div>
      <Card className="p-5">
        <h3 className="text-white font-semibold mb-4">Por Categoria</h3>
        <div className="space-y-3">
          {cats.map(([cat,val],i)=>(
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300 font-medium">{cat}</span>
                <span className="text-emerald-400 font-mono font-semibold">{fmt(val)}</span>
              </div>
              <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{width:`${(val/total)*100}%`}}/>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="p-4 border-b border-slate-700/50">
          <h3 className="text-white font-semibold">Histórico de Receitas</h3>
        </div>
        {receitas.map(t=>(
          <div key={t.id} className="flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors border-b border-slate-700/30 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 font-bold">↑</div>
              <div><p className="text-white text-sm font-medium">{t.desc}</p>
                <p className="text-slate-500 text-xs">{t.cat} · {fmtDate(t.date)}</p></div>
            </div>
            <span className="text-emerald-400 font-mono font-bold">+{fmt(t.value)}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// DESPESAS PAGE
// ════════════════════════════════════════════════════════
function DespesasPage({ transactions }) {
  const despesas = transactions.filter(t => t.type === "despesa");
  const total = despesas.reduce((s,t) => s + t.value, 0);
  const bycat = despesas.reduce((acc,t) => { acc[t.cat] = (acc[t.cat]||0)+t.value; return acc; },{});
  const cats = Object.entries(bycat).sort((a,b)=>b[1]-a[1]);
  const sparkData = annualData.map(d=>d.despesas);
  const colors = ["#f43f5e","#f97316","#fbbf24","#a78bfa","#60a5fa","#34d399"];

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-white">Despesas</h1>
        <p className="text-slate-400 text-sm mt-1">Controle de saídas e gastos</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Total Despesas" value={fmt(total)} pctChange={-5.3} sparkData={sparkData} sparkColor="#f43f5e"/>
        <KpiCard label="Maior gasto" value={fmt(Math.max(...despesas.map(t=>t.value)))} pctChange={-2.1} sparkData={sparkData.map(v=>v*0.8)} sparkColor="#fb7185"/>
        <KpiCard label="Média mensal" value={fmt(total/6)} pctChange={-1.8} sparkData={sparkData.map(v=>v/6)} sparkColor="#fda4af"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Distribuição por Categoria</h3>
          <div className="space-y-3">
            {cats.map(([cat,val],i)=>(
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{background:colors[i%colors.length]}}/>
                    <span className="text-slate-300">{cat}</span>
                  </span>
                  <span className="text-rose-400 font-mono font-semibold">{fmt(val)}</span>
                </div>
                <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{width:`${(val/total)*100}%`,background:colors[i%colors.length]}}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Maiores Gastos</h3>
          <div className="space-y-2">
            {despesas.sort((a,b)=>b.value-a.value).slice(0,5).map((t,i)=>(
              <div key={t.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-700/30">
                <span className="w-6 h-6 rounded-full bg-slate-700 text-slate-400 text-xs flex items-center justify-center font-bold">
                  {i+1}
                </span>
                <div className="flex-1"><p className="text-white text-sm">{t.desc}</p>
                  <p className="text-slate-500 text-xs">{t.cat}</p></div>
                <span className="text-rose-400 font-mono font-semibold text-sm">-{fmt(t.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// DÍVIDAS PAGE
// ════════════════════════════════════════════════════════
const initialDividas = [
  {id:1, name:"Cartão Nubank",    total:4500,  pago:1800, parcelas:12, pagas:4,  venc:"2024-07-10", juros:2.99, color:"#8b5cf6"},
  {id:2, name:"Financiamento Auto",total:28000,pago:12000,parcelas:48, pagas:20, venc:"2024-07-05", juros:1.49, color:"#3b82f6"},
  {id:3, name:"Empréstimo Pessoal",total:8000, pago:6400, parcelas:24, pagas:19, venc:"2024-07-20", juros:3.50, color:"#f97316"},
  {id:4, name:"Cartão Inter",     total:1200,  pago:0,    parcelas:3,  pagas:0,  venc:"2024-07-15", juros:2.75, color:"#ec4899"},
];

function DividasPage() {
  const [dividas] = useState(initialDividas);
  const totalDivida = dividas.reduce((s,d)=>s+(d.total-d.pago),0);
  const totalPago   = dividas.reduce((s,d)=>s+d.pago,0);

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-white">Dívidas</h1>
        <p className="text-slate-400 text-sm mt-1">Controle de dívidas e financiamentos</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Total em Dívidas" value={fmt(totalDivida)} pctChange={-8.5}
          sparkData={[38000,36000,34000,32000,30000,28000]} sparkColor="#f43f5e"/>
        <KpiCard label="Total Já Pago" value={fmt(totalPago)} pctChange={12.0}
          sparkData={[8000,10000,12000,14000,16000,18000]} sparkColor="#10b981"/>
        <KpiCard label="Dívidas Ativas" value={`${dividas.length}`} pctChange={0}
          sparkData={[5,5,5,4,4,4]} sparkColor="#f59e0b"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {dividas.map(d=>{
          const restante = d.total - d.pago;
          const progresso = Math.round((d.pago/d.total)*100);
          return (
            <Card key={d.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{d.name}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Parcela {d.pagas}/{d.parcelas} · Vence {fmtDate(d.venc)}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-lg bg-slate-700 text-slate-300 font-mono">
                  {d.juros}% a.m.
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Pago: <span className="text-emerald-400 font-semibold font-mono">{fmt(d.pago)}</span></span>
                <span className="text-slate-400">Restante: <span className="text-rose-400 font-semibold font-mono">{fmt(restante)}</span></span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{width:`${progresso}%`, background:d.color}}/>
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-slate-500">{progresso}% quitado</span>
                <span className="text-xs text-slate-500">Total: {fmt(d.total)}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// CATEGORIAS PAGE
// ════════════════════════════════════════════════════════
const catIcons = {"Alimentação":"🍔","Transporte":"🚌","Moradia":"🏠","Lazer":"🎮","Saúde":"💊","Renda":"💼","Renda Extra":"💡","Investimentos":"📈","Outros":"📦"};
const catColors = {"Alimentação":"#f97316","Transporte":"#3b82f6","Moradia":"#8b5cf6","Lazer":"#ec4899","Saúde":"#10b981","Renda":"#f59e0b","Renda Extra":"#34d399","Investimentos":"#60a5fa","Outros":"#6b7280"};

function CategoriasPage() {
  const [list, setList] = useState(cats.map((c,i)=>({id:i,name:c,icon:catIcons[c]||"📁",color:catColors[c]||"#6b7280",orcamento:500+i*150})));
  const [modal, setModal] = useState(false);
  const [newCat, setNewCat] = useState({name:"",icon:"📁",color:"#6b7280",orcamento:""});

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Categorias</h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie suas categorias de gastos</p></div>
        <button onClick={()=>setModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors">
          + Nova Categoria
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {list.map(c=>(
          <Card key={c.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                  style={{background:c.color+"22", border:`1px solid ${c.color}44`}}>
                  {c.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{c.name}</p>
                  <p className="text-slate-500 text-xs">Orçamento: <span className="font-mono" style={{color:c.color}}>{fmt(c.orcamento)}/mês</span></p>
                </div>
              </div>
              <button onClick={()=>setList(l=>l.filter(x=>x.id!==c.id))}
                className="text-slate-600 hover:text-rose-400 text-xs transition-colors px-2 py-1 rounded-lg hover:bg-rose-500/10">
                ✕
              </button>
            </div>
          </Card>
        ))}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm p-6 space-y-4">
            <h2 className="text-white font-bold text-lg">Nova Categoria</h2>
            {[{label:"Nome",key:"name",placeholder:"Ex: Pets"},{label:"Ícone (emoji)",key:"icon",placeholder:"🐾"},{label:"Orçamento mensal",key:"orcamento",placeholder:"300"}].map(f=>(
              <div key={f.key}><label className="text-slate-400 text-xs mb-1 block">{f.label}</label>
                <input type="text" placeholder={f.placeholder} value={newCat[f.key]}
                  onChange={e=>setNewCat(p=>({...p,[f.key]:e.target.value}))}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"/>
              </div>
            ))}
            <div className="flex gap-3">
              <button onClick={()=>setModal(false)} className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-xl text-sm">Cancelar</button>
              <button onClick={()=>{
                if(!newCat.name) return;
                setList(l=>[...l,{id:Date.now(),...newCat,orcamento:+newCat.orcamento||0}]);
                setModal(false); setNewCat({name:"",icon:"📁",color:"#6b7280",orcamento:""});
              }} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold">Criar</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// MERCADO PAGE
// ════════════════════════════════════════════════════════
const mercadoStoreIcons = {
  "Atacadão":"🏪","Carrefour":"🛒","Extra":"🏬","Walmart":"🏢",
  "Assaí":"🏭","Pão de Açúcar":"🛍️","Dia":"🏪","Mercadinho":"🏠",
};

const initialMercadoGastos = [
  {id:1, mercado:"Atacadão",      valor:347.80, data:"2024-06-01", desc:"Compra mensal"},
  {id:2, mercado:"Carrefour",     valor:128.40, data:"2024-06-05", desc:"Frutas e laticínios"},
  {id:3, mercado:"Pão de Açúcar", valor:89.90,  data:"2024-06-09", desc:"Compra rápida"},
  {id:4, mercado:"Atacadão",      valor:412.00, data:"2024-06-15", desc:"Compra quinzenal"},
  {id:5, mercado:"Assaí",         valor:560.00, data:"2024-06-18", desc:"Estoque mês"},
  {id:6, mercado:"Carrefour",     valor:74.50,  data:"2024-06-22", desc:"Limpeza e higiene"},
  {id:7, mercado:"Mercadinho",    valor:38.90,  data:"2024-06-25", desc:"Compras do dia"},
  {id:8, mercado:"Extra",         valor:215.30, data:"2024-06-28", desc:"Compra semanal"},
];

function MercadoPage() {
  const [gastos, setGastos] = useState(initialMercadoGastos);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({mercado:"", valor:"", data:"", desc:""});

  const total = gastos.reduce((s,g) => s + g.valor, 0);
  const totalMes = gastos.filter(g => g.data.startsWith("2024-06")).reduce((s,g) => s + g.valor, 0);

  // Agrupado por mercado
  const porMercado = gastos.reduce((acc, g) => {
    acc[g.mercado] = (acc[g.mercado]||0) + g.valor;
    return acc;
  }, {});
  const rankMercados = Object.entries(porMercado).sort((a,b)=>b[1]-a[1]);
  const maxVal = rankMercados[0]?.[1] || 1;

  const addGasto = () => {
    if (!form.mercado || !form.valor || !form.data) return;
    setGastos(prev => [{id: Date.now(), ...form, valor: parseFloat(form.valor)},...prev]);
    setForm({mercado:"", valor:"", data:"", desc:""});
    setModal(false);
  };

  const storeColors = ["#10b981","#3b82f6","#f97316","#8b5cf6","#ec4899","#f59e0b","#34d399","#60a5fa"];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mercado</h1>
          <p className="text-slate-400 text-sm mt-1">Controle de gastos em supermercados</p>
        </div>
        <button onClick={()=>setModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors">
          + Registrar Gasto
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {label:"Total Gasto no Mês", value:fmt(totalMes), color:"text-rose-400", bg:"bg-rose-500/10 border-rose-500/20", icon:"🛒"},
          {label:"Total de Compras",   value:`${gastos.length}`, color:"text-blue-400", bg:"bg-blue-500/10 border-blue-500/20", icon:"🧾"},
          {label:"Ticket Médio",       value:fmt(total/gastos.length), color:"text-amber-400", bg:"bg-amber-500/10 border-amber-500/20", icon:"📊"},
        ].map((k,i)=>(
          <div key={i} className={`rounded-2xl p-5 border ${k.bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{k.icon}</span>
              <p className="text-slate-400 text-xs">{k.label}</p>
            </div>
            <p className={`text-2xl font-bold font-mono ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Ranking por mercado */}
      <Card className="p-5">
        <h3 className="text-white font-semibold mb-4">🏆 Ranking por Mercado</h3>
        <div className="space-y-3">
          {rankMercados.map(([nome, val], i) => (
            <div key={nome}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{background: storeColors[i % storeColors.length]}}>
                    {i+1}
                  </span>
                  <span className="text-base">{mercadoStoreIcons[nome] || "🏪"}</span>
                  <span className="text-white font-medium text-sm">{nome}</span>
                  <span className="text-slate-500 text-xs">
                    · {gastos.filter(g=>g.mercado===nome).length} visitas
                  </span>
                </div>
                <span className="font-mono font-bold text-sm text-rose-400">
                  {fmt(val)}
                </span>
              </div>
              <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{width:`${(val/maxVal)*100}%`, background: storeColors[i % storeColors.length]}}/>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Histórico de gastos */}
      <Card>
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="text-white font-semibold">Histórico de Gastos</h3>
          <span className="text-slate-400 text-xs">{gastos.length} registros</span>
        </div>
        <div className="divide-y divide-slate-700/30">
          {gastos.map(g => (
            <div key={g.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-700/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center text-lg flex-shrink-0">
                  {mercadoStoreIcons[g.mercado] || "🏪"}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{g.mercado}</p>
                  <p className="text-slate-500 text-xs">{g.desc || "—"} · {fmtDate(g.data)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-rose-400 font-mono font-bold">-{fmt(g.valor)}</span>
                <button onClick={()=>setGastos(prev=>prev.filter(x=>x.id!==g.id))}
                  className="text-slate-600 hover:text-rose-400 text-xs transition-colors w-5 h-5 rounded flex items-center justify-center hover:bg-rose-500/10">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal novo gasto */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-white font-bold text-lg">Registrar Gasto no Mercado</h2>
            {[
              {label:"Nome do Mercado", key:"mercado", placeholder:"Ex: Carrefour, Atacadão..."},
              {label:"Valor (R$)",      key:"valor",   placeholder:"0,00"},
              {label:"Data",           key:"data",    placeholder:"", type:"date"},
              {label:"Descrição",      key:"desc",    placeholder:"Ex: Compra quinzenal"},
            ].map(f => (
              <div key={f.key}>
                <label className="text-slate-400 text-xs mb-1 block">{f.label}</label>
                <input
                  type={f.type || "text"}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            ))}
            {/* Quick mercado buttons */}
            <div>
              <p className="text-slate-500 text-xs mb-2">Acesso rápido:</p>
              <div className="flex flex-wrap gap-1.5">
                {["Atacadão","Carrefour","Assaí","Extra","Pão de Açúcar","Mercadinho"].map(m=>(
                  <button key={m} onClick={()=>setForm(p=>({...p,mercado:m}))}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                      form.mercado===m
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    }`}>
                    {mercadoStoreIcons[m]||"🏪"} {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={()=>setModal(false)}
                className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-600 transition-colors">
                Cancelar
              </button>
              <button onClick={addGasto}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-semibold transition-colors">
                Registrar
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════
// VEÍCULOS PAGE
// ════════════════════════════════════════════════════════
const veiculoData = [
  {id:1,name:"Honda Civic 2021",placa:"ABC-1234",km:42000,combustivel:75,ipva:1820,seguro:2400,prox_revisao:"2024-08-15",gastos:[320,280,410,190,350,300]},
  {id:2,name:"Moto Yamaha YBR",placa:"XYZ-5678",km:18500,combustivel:40,ipva:380,seguro:890,prox_revisao:"2024-09-01",gastos:[90,120,80,110,95,105]},
];

function VeiculosPage() {
  const [veiculos] = useState(veiculoData);
  const [sel, setSel] = useState(0);
  const v = veiculos[sel];
  const totalGastos = v.gastos.reduce((s,x)=>s+x,0);

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-white">Veículos</h1>
        <p className="text-slate-400 text-sm mt-1">Controle de custos dos seus veículos</p></div>

      {/* Vehicle selector */}
      <div className="flex gap-3">
        {veiculos.map((vei,i)=>(
          <button key={vei.id} onClick={()=>setSel(i)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium ${
              sel===i
                ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                : "bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700/50"
            }`}>
            <span className="text-lg">🚗</span>
            <div className="text-left">
              <p className="font-semibold text-xs">{vei.name.split(" ").slice(0,2).join(" ")}</p>
              <p className="text-xs opacity-70">{vei.placa}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Km Rodados" value={`${v.km.toLocaleString("pt-BR")} km`} pctChange={2.1}
          sparkData={v.gastos} sparkColor="#3b82f6"/>
        <KpiCard label="Combustível" value={`${v.combustivel}%`} pctChange={v.combustivel-60}
          sparkData={[80,65,50,70,60,v.combustivel]} sparkColor={v.combustivel>50?"#10b981":"#f43f5e"}/>
        <KpiCard label="IPVA Anual" value={fmt(v.ipva)} pctChange={0}
          sparkData={v.gastos.map(x=>x*2)} sparkColor="#f59e0b"/>
        <KpiCard label="Seguro Anual" value={fmt(v.seguro)} pctChange={-3.2}
          sparkData={v.gastos.map(x=>x*3)} sparkColor="#8b5cf6"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-white font-semibold mb-4">Gastos Mensais (últimos 6 meses)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MONTHS.slice(0,6).map((m,i)=>({month:m, valor:v.gastos[i]}))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
              <XAxis dataKey="month" tick={{fill:"#64748b",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#64748b",fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`R$${v}`}/>
              <Tooltip contentStyle={{background:"#0f172a",border:"1px solid #334155",borderRadius:12,fontSize:12}}
                formatter={v=>[fmt(v),"Gastos"]}/>
              <Bar dataKey="valor" fill="#3b82f6" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5 space-y-4">
          <h3 className="text-white font-semibold">Informações do Veículo</h3>
          {[
            {label:"Placa",value:v.placa},
            {label:"Próxima Revisão",value:fmtDate(v.prox_revisao)},
            {label:"Total Gastos (6m)",value:fmt(totalGastos)},
            {label:"Média Mensal",value:fmt(totalGastos/6)},
          ].map((info,i)=>(
            <div key={i} className="flex justify-between py-2 border-b border-slate-700/50 last:border-0">
              <span className="text-slate-400 text-sm">{info.label}</span>
              <span className="text-white text-sm font-semibold">{info.value}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// PERFIL PAGE
// ════════════════════════════════════════════════════════
function PerfilPage() {
  const [form, setForm] = useState({
    name:"João Dalago", email:"joao@email.com", phone:"(11) 99999-8888",
    cpf:"000.000.000-00", nascimento:"1990-05-15", renda:"8500",
  });
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-white">Perfil</h1>
        <p className="text-slate-400 text-sm mt-1">Suas informações pessoais e configurações</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Avatar card */}
        <Card className="p-6 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-orange-500/30">
            {form.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
          </div>
          <div>
            <p className="text-white font-bold text-lg">{form.name}</p>
            <p className="text-slate-400 text-sm">{form.email}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30">
            ⭐ Plano Pro
          </span>
          <div className="w-full pt-3 border-t border-slate-700 space-y-1">
            {[{label:"Membro desde",value:"Jan 2024"},{label:"Transações",value:"142"},{label:"Metas ativas",value:"3"}].map((s,i)=>(
              <div key={i} className="flex justify-between text-xs">
                <span className="text-slate-500">{s.label}</span>
                <span className="text-slate-300 font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Form */}
        <Card className="p-6 lg:col-span-2 space-y-4">
          <h3 className="text-white font-semibold">Dados Pessoais</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              {label:"Nome completo",key:"name"},
              {label:"E-mail",key:"email"},
              {label:"Telefone",key:"phone"},
              {label:"CPF",key:"cpf"},
              {label:"Data de nascimento",key:"nascimento"},
              {label:"Renda mensal (R$)",key:"renda"},
            ].map(f=>(
              <div key={f.key}>
                <label className="text-slate-400 text-xs mb-1 block">{f.label}</label>
                <input type="text" value={form[f.key]}
                  onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"/>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2">
            <p className={`text-sm transition-all duration-300 ${saved?"text-emerald-400 opacity-100":"opacity-0"}`}>
              ✅ Dados salvos com sucesso!
            </p>
            <button onClick={save}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-semibold transition-colors ml-auto">
              Salvar Alterações
            </button>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-white font-semibold mb-4">Segurança & Preferências</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {[
            {icon:"🔒",title:"Alterar Senha",desc:"Última alteração há 30 dias",btn:"Alterar"},
            {icon:"📱",title:"Autenticação 2FA",desc:"Proteção extra para sua conta",btn:"Ativar"},
            {icon:"🔔",title:"Notificações",desc:"WhatsApp e e-mail ativos",btn:"Configurar"},
          ].map((s,i)=>(
            <div key={i} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold">{s.title}</p>
                  <p className="text-slate-500 text-xs">{s.desc}</p>
                </div>
              </div>
              <button className="text-xs text-orange-400 hover:text-orange-300 font-semibold px-3 py-1.5 rounded-lg hover:bg-orange-500/10 transition-all">
                {s.btn}
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


// ════════════════════════════════════════════════════════
// CARTÕES PAGE
// ════════════════════════════════════════════════════════
const initialCartoes = [
  {
    id:1, nome:"Nubank Ultravioleta", banco:"Nubank", bandeira:"Mastercard",
    limite:15000, usado:4830.50, vencimento:10, fechamento:3,
    cor1:"#7c3aed", cor2:"#4c1d95", emoji:"💜",
    fatura_atual:4830.50, fatura_anterior:3210.00, status:"aberta",
    gastos:[
      {id:1, desc:"iFood",        cat:"Alimentação", valor:89.90,  data:"2024-06-01"},
      {id:2, desc:"Netflix",      cat:"Lazer",       valor:45.90,  data:"2024-06-02"},
      {id:3, desc:"Uber",         cat:"Transporte",  valor:32.50,  data:"2024-06-04"},
      {id:4, desc:"Amazon",       cat:"Compras",     valor:219.00, data:"2024-06-06"},
      {id:5, desc:"Supermercado", cat:"Alimentação", valor:387.40, data:"2024-06-10"},
      {id:6, desc:"Spotify",      cat:"Lazer",       valor:21.90,  data:"2024-06-11"},
      {id:7, desc:"Posto Shell",  cat:"Transporte",  valor:180.00, data:"2024-06-15"},
      {id:8, desc:"Farmácia",     cat:"Saúde",       valor:67.80,  data:"2024-06-18"},
    ]
  },
  {
    id:2, nome:"Inter Gold", banco:"Inter", bandeira:"Visa",
    limite:8000, usado:1245.00, vencimento:15, fechamento:8,
    cor1:"#f97316", cor2:"#c2410c", emoji:"🟠",
    fatura_atual:1245.00, fatura_anterior:980.00, status:"aberta",
    gastos:[
      {id:1, desc:"Restaurante",  cat:"Alimentação", valor:145.00, data:"2024-06-03"},
      {id:2, desc:"Mercado",      cat:"Alimentação", valor:312.50, data:"2024-06-08"},
      {id:3, desc:"Aplicativo",   cat:"Serviços",    valor:29.90,  data:"2024-06-12"},
      {id:4, desc:"Academia",     cat:"Saúde",       valor:99.00,  data:"2024-06-01"},
      {id:5, desc:"Cinema",       cat:"Lazer",       valor:78.00,  data:"2024-06-20"},
    ]
  },
  {
    id:3, nome:"C6 Carbon", banco:"C6 Bank", bandeira:"Mastercard",
    limite:5000, usado:290.00, vencimento:20, fechamento:13,
    cor1:"#1f2937", cor2:"#111827", emoji:"🖤",
    fatura_atual:290.00, fatura_anterior:540.00, status:"fechada",
    gastos:[
      {id:1, desc:"Combustível",  cat:"Transporte",  valor:200.00, data:"2024-06-05"},
      {id:2, desc:"Estacionamento",cat:"Transporte", valor:45.00,  data:"2024-06-09"},
      {id:3, desc:"Lanche",       cat:"Alimentação", valor:45.00,  data:"2024-06-14"},
    ]
  },
];

const bandeiraBadge = { Mastercard:"🔴🟡", Visa:"🔵", Elo:"💛", Amex:"🟦" };

function CartaoVisual({ cartao, selected, onClick }) {
  const usoPct = Math.round((cartao.usado / cartao.limite) * 100);
  const diasVenc = cartao.vencimento - new Date().getDate();
  const urgente = diasVenc <= 5 && diasVenc >= 0;

  return (
    <div onClick={onClick} className={`cursor-pointer rounded-2xl p-1.5 transition-all duration-200 ${
      selected ? "ring-2 ring-white/30 scale-105" : "hover:scale-102 opacity-80 hover:opacity-100"
    }`}>
      {/* Card face */}
      <div className="rounded-xl p-5 relative overflow-hidden h-44 flex flex-col justify-between"
        style={{background:`linear-gradient(135deg, ${cartao.cor1}, ${cartao.cor2})`}}>
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
          style={{background:"rgba(255,255,255,0.3)"}}/>
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10"
          style={{background:"rgba(255,255,255,0.4)"}}/>
        {/* Top row */}
        <div className="flex items-start justify-between z-10">
          <div>
            <p className="text-white/60 text-xs font-medium">{cartao.banco}</p>
            <p className="text-white font-bold text-sm mt-0.5">{cartao.nome}</p>
          </div>
          <span className="text-2xl">{cartao.emoji}</span>
        </div>
        {/* Middle — chip */}
        <div className="flex items-center gap-1 z-10">
          <div className="w-8 h-6 rounded-md bg-yellow-400/80 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5 p-0.5">
              {[1,2,3,4].map(i=><div key={i} className="w-1.5 h-1.5 bg-yellow-600/60 rounded-sm"/>)}
            </div>
          </div>
          <span className="text-white/40 text-xs ml-2 font-mono tracking-widest">•••• •••• ••••</span>
        </div>
        {/* Bottom row */}
        <div className="flex items-end justify-between z-10">
          <div>
            <p className="text-white/50 text-xs">Limite disponível</p>
            <p className="text-white font-bold font-mono text-sm">
              {fmt(cartao.limite - cartao.usado)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-xs">Vence dia</p>
            <p className={`font-bold text-sm ${urgente ? "text-red-300" : "text-white"}`}>
              {urgente && "⚠️ "}{cartao.vencimento}
            </p>
          </div>
        </div>
      </div>
      {/* Usage bar */}
      <div className="px-1 mt-2">
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all"
            style={{
              width:`${usoPct}%`,
              background: usoPct > 80 ? "#f43f5e" : usoPct > 60 ? "#f59e0b" : "#10b981"
            }}/>
        </div>
        <div className="flex justify-between mt-1 text-xs text-slate-500">
          <span>{fmt(cartao.usado)} usado</span>
          <span>{usoPct}% do limite</span>
        </div>
      </div>
    </div>
  );
}

function CartoesPage() {
  const [cartoes, setCartoes] = useState(initialCartoes);
  const [selId, setSelId] = useState(1);
  const [tab, setTab] = useState("fatura"); // fatura | gastos | info
  const [modal, setModal] = useState(false);
  const [novoGasto, setNovoGasto] = useState({desc:"", cat:"Alimentação", valor:"", data:""});

  const cartao = cartoes.find(c=>c.id===selId);
  const usoPct = Math.round((cartao.uso / cartao.limite) * 100);
  const diasVenc = cartao.vencimento - new Date().getDate();
  const totalFatura = cartao.gastos.reduce((s,g)=>s+g.valor, 0);

  // Group gastos by category
  const porCat = cartao.gastos.reduce((acc,g)=>{
    acc[g.cat] = (acc[g.cat]||0) + g.valor;
    return acc;
  },{});
  const catList = Object.entries(porCat).sort((a,b)=>b[1]-a[1]);
  const catColors = {"Alimentação":"#f97316","Lazer":"#8b5cf6","Transporte":"#3b82f6","Compras":"#ec4899","Saúde":"#10b981","Serviços":"#64748b"};

  const addGasto = () => {
    if(!novoGasto.desc||!novoGasto.valor||!novoGasto.data) return;
    setCartoes(prev=>prev.map(c=> c.id!==selId ? c : {
      ...c,
      usado: c.usado + parseFloat(novoGasto.valor),
      fatura_atual: c.fatura_atual + parseFloat(novoGasto.valor),
      gastos: [{id:Date.now(),...novoGasto,valor:parseFloat(novoGasto.valor)},...c.gastos]
    }));
    setNovoGasto({desc:"",cat:"Alimentação",valor:"",data:""});
    setModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cartões</h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie seus cartões e faturas</p>
        </div>
        <button onClick={()=>setModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors">
          + Lançar Gasto
        </button>
      </div>

      {/* Cards visual row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {cartoes.map(c=>(
          <CartaoVisual key={c.id} cartao={c} selected={selId===c.id} onClick={()=>setSelId(c.id)}/>
        ))}
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label:"Fatura Atual",
            value: fmt(cartao.fatura_atual),
            sub: `Vence dia ${cartao.vencimento}`,
            color: diasVenc <= 5 ? "text-rose-400" : "text-white",
            bg: diasVenc <= 5 ? "bg-rose-500/10 border-rose-500/20" : "bg-slate-800/70 border-slate-700/60",
            icon: diasVenc <= 5 ? "⚠️" : "🧾"
          },
          {
            label:"Fatura Anterior",
            value: fmt(cartao.fatura_anterior),
            sub: cartao.fatura_atual > cartao.fatura_anterior ? "↑ Aumentou" : "↓ Reduziu",
            color: cartao.fatura_atual > cartao.fatura_anterior ? "text-rose-400" : "text-emerald-400",
            bg:"bg-slate-800/70 border-slate-700/60",
            icon:"📋"
          },
          {
            label:"Limite Total",
            value: fmt(cartao.limite),
            sub: `${fmt(cartao.limite - cartao.usado)} disponível`,
            color:"text-blue-400",
            bg:"bg-blue-500/10 border-blue-500/20",
            icon:"💳"
          },
          {
            label:"Fechamento",
            value: `Dia ${cartao.fechamento}`,
            sub: `${cartao.fechamento - new Date().getDate() > 0
              ? `em ${cartao.fechamento - new Date().getDate()} dias`
              : "Este mês fechou"}`,
            color:"text-amber-400",
            bg:"bg-amber-500/10 border-amber-500/20",
            icon:"📅"
          },
        ].map((k,i)=>(
          <div key={i} className={`rounded-2xl p-4 border ${k.bg}`}>
            <div className="flex items-center gap-1.5 mb-2">
              <span>{k.icon}</span>
              <p className="text-slate-400 text-xs">{k.label}</p>
            </div>
            <p className={`text-xl font-bold font-mono ${k.color}`}>{k.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Status alert */}
      {diasVenc >= 0 && diasVenc <= 7 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25">
          <span className="text-2xl">🔔</span>
          <div>
            <p className="text-rose-400 font-semibold text-sm">
              {diasVenc === 0 ? "Fatura vence HOJE!" : `Fatura vence em ${diasVenc} dia${diasVenc>1?"s":""}!`}
            </p>
            <p className="text-slate-400 text-xs">
              {cartao.nome} · Valor: <span className="text-rose-400 font-mono font-bold">{fmt(cartao.fatura_atual)}</span>
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl w-fit">
        {[
          {id:"fatura", label:"📊 Fatura"},
          {id:"gastos", label:"🧾 Lançamentos"},
          {id:"info",   label:"ℹ️ Detalhes"},
        ].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab===t.id
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: FATURA ── */}
      {tab==="fatura" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="text-white font-semibold mb-4">Gastos por Categoria</h3>
            <div className="space-y-3">
              {catList.map(([cat,val],i)=>(
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full" style={{background:catColors[cat]||"#64748b"}}/>
                      <span className="text-slate-300">{cat}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">{Math.round((val/totalFatura)*100)}%</span>
                      <span className="text-white font-mono font-semibold text-sm">{fmt(val)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{width:`${(val/totalFatura)*100}%`, background:catColors[cat]||"#64748b"}}/>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between">
              <span className="text-slate-400 text-sm">Total da fatura</span>
              <span className="text-white font-bold font-mono">{fmt(totalFatura)}</span>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-white font-semibold mb-4">Comparativo de Faturas</h3>
            <div className="space-y-4">
              {[
                {label:"Fatura atual",   val:cartao.fatura_atual,    color:"#f43f5e", ref:true},
                {label:"Fatura anterior",val:cartao.fatura_anterior, color:"#64748b", ref:false},
              ].map((f,i)=>{
                const max = Math.max(cartao.fatura_atual, cartao.fatura_anterior);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className={f.ref?"text-white font-medium":"text-slate-400"}>{f.label}</span>
                      <span className="font-mono font-bold" style={{color:f.color}}>{fmt(f.val)}</span>
                    </div>
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full flex items-center transition-all"
                        style={{width:`${(f.val/max)*100}%`, background:f.color}}>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className={`flex items-center gap-2 mt-3 p-3 rounded-xl text-sm font-medium ${
                cartao.fatura_atual > cartao.fatura_anterior
                  ? "bg-rose-500/10 text-rose-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}>
                <span>{cartao.fatura_atual > cartao.fatura_anterior ? "↑" : "↓"}</span>
                <span>
                  {cartao.fatura_atual > cartao.fatura_anterior ? "Fatura aumentou " : "Fatura reduziu "}
                  {fmt(Math.abs(cartao.fatura_atual - cartao.fatura_anterior))} vs. mês anterior
                </span>
              </div>
            </div>

            {/* Vencimento timeline */}
            <div className="mt-5 pt-4 border-t border-slate-700/50">
              <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Calendário da Fatura</h4>
              <div className="flex items-center gap-0">
                {[
                  {label:"Abertura", day:"01", done:true},
                  {label:"Fechamento", day:`0${cartao.fechamento}`, done:new Date().getDate()>cartao.fechamento},
                  {label:"Vencimento", day:`${cartao.vencimento}`, done:false, alert:diasVenc<=5},
                ].map((step,i,arr)=>(
                  <div key={i} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                        step.alert ? "border-rose-500 bg-rose-500/20 text-rose-400"
                        : step.done ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                        : "border-slate-600 bg-slate-700 text-slate-400"
                      }`}>{step.day}</div>
                      <span className="text-xs text-slate-500 mt-1 text-center leading-tight w-16">{step.label}</span>
                    </div>
                    {i<arr.length-1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 ${step.done?"bg-emerald-500/50":"bg-slate-700"}`}/>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB: LANÇAMENTOS ── */}
      {tab==="gastos" && (
        <Card>
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="text-white font-semibold">Lançamentos — {cartao.nome}</h3>
            <span className="text-slate-500 text-xs">{cartao.gastos.length} transações</span>
          </div>
          <div className="divide-y divide-slate-700/30">
            {cartao.gastos.map(g=>(
              <div key={g.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-700/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{background:(catColors[g.cat]||"#64748b")+"22", color:catColors[g.cat]||"#94a3b8"}}>
                    {g.cat[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{g.desc}</p>
                    <p className="text-slate-500 text-xs">{g.cat} · {fmtDate(g.data)}</p>
                  </div>
                </div>
                <span className="text-rose-400 font-mono font-semibold text-sm">-{fmt(g.valor)}</span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-700/50 flex justify-between items-center">
            <span className="text-slate-400 text-sm">Total</span>
            <span className="text-white font-bold font-mono text-lg">{fmt(totalFatura)}</span>
          </div>
        </Card>
      )}

      {/* ── TAB: DETALHES ── */}
      {tab==="info" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5 space-y-3">
            <h3 className="text-white font-semibold">Informações do Cartão</h3>
            {[
              {label:"Banco emissor",      value:cartao.banco},
              {label:"Bandeira",           value:`${bandeiraBadge[cartao.bandeira]||""} ${cartao.bandeira}`},
              {label:"Limite total",       value:fmt(cartao.limite)},
              {label:"Limite usado",       value:fmt(cartao.usado)},
              {label:"Limite disponível",  value:fmt(cartao.limite - cartao.usado)},
              {label:"Dia de fechamento",  value:`Dia ${cartao.fechamento} de cada mês`},
              {label:"Dia de vencimento",  value:`Dia ${cartao.vencimento} de cada mês`},
              {label:"Status da fatura",   value:cartao.status==="aberta"?"🟢 Aberta":"🔴 Fechada"},
            ].map((row,i)=>(
              <div key={i} className="flex justify-between py-2 border-b border-slate-700/40 last:border-0">
                <span className="text-slate-400 text-sm">{row.label}</span>
                <span className="text-white text-sm font-semibold">{row.value}</span>
              </div>
            ))}
          </Card>
          <Card className="p-5">
            <h3 className="text-white font-semibold mb-4">Uso do Limite</h3>
            <div className="flex items-center justify-center my-4">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="12"/>
                  <circle cx="60" cy="60" r="50" fill="none"
                    stroke={cartao.usado/cartao.limite>0.8?"#f43f5e":cartao.usado/cartao.limite>0.6?"#f59e0b":"#10b981"}
                    strokeWidth="12"
                    strokeDasharray={`${Math.round((cartao.usado/cartao.limite)*314)} 314`}
                    strokeLinecap="round"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white font-mono">
                    {Math.round((cartao.usado/cartao.limite)*100)}%
                  </span>
                  <span className="text-slate-500 text-xs">usado</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-2">
              {[
                {label:"Crédito usado",      val:cartao.usado,                color:"#f43f5e"},
                {label:"Crédito disponível", val:cartao.limite-cartao.usado,  color:"#10b981"},
              ].map((r,i)=>(
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{background:r.color}}/>
                    <span className="text-slate-400">{r.label}</span>
                  </span>
                  <span className="font-mono font-bold" style={{color:r.color}}>{fmt(r.val)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Modal lançar gasto */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{background:`linear-gradient(135deg,${cartao.cor1},${cartao.cor2})`}}>
                {cartao.emoji}
              </div>
              <div>
                <h2 className="text-white font-bold">Lançar Gasto</h2>
                <p className="text-slate-400 text-xs">{cartao.nome}</p>
              </div>
            </div>
            {[
              {label:"Descrição",     key:"desc",  placeholder:"Ex: iFood, Amazon...",type:"text"},
              {label:"Valor (R$)",    key:"valor", placeholder:"0,00",               type:"number"},
              {label:"Data",          key:"data",  placeholder:"",                    type:"date"},
            ].map(f=>(
              <div key={f.key}>
                <label className="text-slate-400 text-xs mb-1 block">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={novoGasto[f.key]}
                  onChange={e=>setNovoGasto(p=>({...p,[f.key]:e.target.value}))}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"/>
              </div>
            ))}
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Categoria</label>
              <select value={novoGasto.cat} onChange={e=>setNovoGasto(p=>({...p,cat:e.target.value}))}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500">
                {["Alimentação","Transporte","Lazer","Compras","Saúde","Serviços","Outros"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={()=>setModal(false)}
                className="flex-1 py-2.5 bg-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-600 transition-colors">
                Cancelar
              </button>
              <button onClick={addGasto}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-semibold transition-colors">
                Lançar
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Admin() {
  const stats = [
    {label:"Usuários Ativos",value:"1.284",delta:"+12%",icon:"👥"},
    {label:"Planos Pro",value:"387",delta:"+8%",icon:"⭐"},
    {label:"MRR",value:"R$11.223",delta:"+15%",icon:"💵"},
    {label:"Churn Rate",value:"2.3%",delta:"-0.4%",icon:"📉"},
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
        <p className="text-slate-400 text-sm mt-1">Visão geral da plataforma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s,i)=>(
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{s.icon}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                s.delta.startsWith("+")||s.delta.startsWith("-0")
                  ?"bg-emerald-500/20 text-emerald-400"
                  :"bg-rose-500/20 text-rose-400"
              }`}>{s.delta}</span>
            </div>
            <p className="text-slate-400 text-xs">{s.label}</p>
            <p className="text-white font-bold font-mono text-xl">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-white font-semibold">Gestão de Usuários</h3>
        </div>
        <div className="divide-y divide-slate-700/50">
          {adminUsers.map(u=>(
            <div key={u.id} className="flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                  {u.name[0]}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{u.name}</p>
                  <p className="text-slate-500 text-xs">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusDot status={u.status}/>
                <Badge plan={u.plan}/>
                <span className="text-slate-500 text-xs hidden lg:block">{fmtDate(u.joined)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-white font-semibold mb-4">Deploy & Infraestrutura</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            {icon:"▲",name:"Vercel",desc:"Frontend React deploy automático via GitHub Actions. Zero config, edge network.",color:"text-white"},
            {icon:"🚄",name:"Railway",desc:"Backend Node.js + PostgreSQL. Auto-deploy, variáveis de ambiente integradas.",color:"text-purple-400"},
            {icon:"🔑",name:".env vars",desc:"DATABASE_URL, JWT_SECRET, WHATSAPP_TOKEN, STRIPE_KEY, REDIS_URL",color:"text-amber-400"},
          ].map((d,i)=>(
            <div key={i} className="bg-slate-700/30 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg ${d.color}`}>{d.icon}</span>
                <span className="text-white font-semibold text-sm">{d.name}</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── ACCOUNT TYPE TOGGLE ─────────────────────────────────────────────────────
function AccountToggle({ mode, setMode }) {
  return (
    <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 gap-1">
      <button
        onClick={() => setMode("pessoal")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
          mode === "pessoal"
            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <span>👤</span> Pessoal
      </button>
      <button
        onClick={() => setMode("empresarial")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
          mode === "empresarial"
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        <span>🏢</span> Empresarial
      </button>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function useAuth() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("fb_session") || "null"); } catch { return null; }
  });

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem("fb_users") || "{}");
    const u = users[email.toLowerCase()];
    if (!u || u.password !== password) return "Email ou senha incorretos.";
    const session = { email: u.email, name: u.name, plan: u.plan };
    localStorage.setItem("fb_session", JSON.stringify(session));
    setUser(session);
    return null;
  };

  const register = (name, email, password) => {
    if (!name.trim() || !email.trim() || !password) return "Preencha todos os campos.";
    if (password.length < 6) return "Senha deve ter pelo menos 6 caracteres.";
    const users = JSON.parse(localStorage.getItem("fb_users") || "{}");
    if (users[email.toLowerCase()]) return "Este email já está cadastrado.";
    users[email.toLowerCase()] = { name, email: email.toLowerCase(), password, plan: "Free",
      createdAt: new Date().toISOString() };
    localStorage.setItem("fb_users", JSON.stringify(users));
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("fb_session");
    setUser(null);
  };

  return { user, login, register, logout };
}

function getUserData(email, key, fallback) {
  try {
    const all = JSON.parse(localStorage.getItem("fb_data_" + key) || "{}");
    return all[email] !== undefined ? all[email] : fallback;
  } catch { return fallback; }
}

function setUserData(email, key, value) {
  try {
    const all = JSON.parse(localStorage.getItem("fb_data_" + key) || "{}");
    all[email] = value;
    localStorage.setItem("fb_data_" + key, JSON.stringify(all));
  } catch {}
}

// ─── LOGIN / REGISTER SCREEN ──────────────────────────────────────────────────
function AuthScreen({ onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const err = mode === "login"
      ? onLogin(form.email, form.password)
      : onRegister(form.name, form.email, form.password);
    if (err) { setError(err); setLoading(false); }
  };

  const f = (key, val) => setForm(p => ({...p, [key]: val}));

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4"
      style={{fontFamily:"'DM Sans', system-ui, sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-orange-500/8 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"/>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl translate-y-1/3"/>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-bold text-slate-900 text-2xl shadow-2xl shadow-orange-500/30 mb-4">
            FB
          </div>
          <h1 className="text-white font-bold text-2xl">Finance Buddy</h1>
          <p className="text-slate-400 text-sm mt-1">Controle financeiro pessoal e empresarial</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm shadow-2xl">
          {/* Mode toggle */}
          <div className="flex gap-1 bg-slate-700/50 p-1 rounded-xl mb-6">
            {[["login","Entrar"],["register","Criar conta"]].map(([m,l])=>(
              <button key={m} onClick={()=>{setMode(m);setError("");}}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode===m ? "bg-orange-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}>{l}</button>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Nome completo</label>
                <input type="text" placeholder="Seu nome" required value={form.name}
                  onChange={e=>f("name",e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-500"/>
              </div>
            )}
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Email</label>
              <input type="email" placeholder="seu@email.com" required value={form.email}
                onChange={e=>f("email",e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-500"/>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Senha</label>
              <input type="password" placeholder={mode==="register"?"Mínimo 6 caracteres":"••••••••"} required value={form.password}
                onChange={e=>f("password",e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors placeholder-slate-500"/>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
                <span className="text-rose-400 text-xs">⚠️ {error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/25">
              {loading ? "Aguarde..." : mode==="login" ? "Entrar na minha conta" : "Criar minha conta grátis"}
            </button>
          </form>

          {mode === "login" && (
            <p className="text-center text-slate-500 text-xs mt-4">
              Não tem conta?{" "}
              <button onClick={()=>setMode("register")} className="text-orange-400 hover:text-orange-300 font-semibold">
                Cadastre-se grátis
              </button>
            </p>
          )}
        </div>

        {/* Demo hint */}
        <p className="text-center text-slate-600 text-xs mt-4">
          Seus dados ficam salvos localmente, por conta separada 🔒
        </p>
      </div>
    </div>
  );
}

// ─── FLOATING ACTION BUTTON (+ Receita) ──────────────────────────────────────
function FABReceita({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ desc:"", value:"", cat:"Renda", date: new Date().toISOString().split("T")[0] });

  const submit = () => {
    if (!form.desc || !form.value || !form.date) return;
    onAdd({ id: Date.now(), ...form, type:"receita", value: parseFloat(form.value) });
    setForm({ desc:"", value:"", cat:"Renda", date: new Date().toISOString().split("T")[0] });
    setOpen(false);
  };

  return (
    <>
      {/* FAB Button */}
      <button onClick={()=>setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-2xl shadow-emerald-500/40 flex items-center justify-center text-2xl font-bold transition-all hover:scale-110 active:scale-95">
        +
      </button>

      {/* Quick modal */}
      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">↑</span>
                <h3 className="text-white font-bold">Adicionar Receita</h3>
              </div>
              <button onClick={()=>setOpen(false)} className="text-slate-500 hover:text-slate-300 text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700">×</button>
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-1 block">Descrição</label>
              <input autoFocus type="text" placeholder="Ex: Salário, Freelance..." value={form.desc}
                onChange={e=>setForm(p=>({...p,desc:e.target.value}))}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Valor (R$)</label>
                <input type="number" placeholder="0,00" value={form.value}
                  onChange={e=>setForm(p=>({...p,value:e.target.value}))}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"/>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Data</label>
                <input type="date" value={form.date}
                  onChange={e=>setForm(p=>({...p,date:e.target.value}))}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"/>
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-1 block">Categoria</label>
              <select value={form.cat} onChange={e=>setForm(p=>({...p,cat:e.target.value}))}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500">
                {["Renda","Renda Extra","Investimentos","Freelance","Vendas","Outros"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Quick amounts */}
            <div>
              <p className="text-slate-500 text-xs mb-2">Valores rápidos:</p>
              <div className="flex flex-wrap gap-1.5">
                {[500,1000,1500,2000,3000,5000].map(v=>(
                  <button key={v} onClick={()=>setForm(p=>({...p,value:String(v)}))}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                      form.value===String(v)
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                    }`}>
                    R${v.toLocaleString("pt-BR")}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={submit}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20">
              ✓ Adicionar Receita
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const { user, login, register, logout } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountMode, setAccountMode] = useState("pessoal");

  // Per-user persistent transactions
  const [transactions, setTransactionsRaw] = useState(() =>
    user ? getUserData(user.email, "transactions", initialTransactions) : initialTransactions
  );

  useEffect(() => {
    if (user) {
      const saved = getUserData(user.email, "transactions", null);
      setTransactionsRaw(saved !== null ? saved : initialTransactions);
    }
  }, [user?.email]);

  const setTransactions = (val) => {
    const next = typeof val === "function" ? val(transactions) : val;
    setTransactionsRaw(next);
    if (user) setUserData(user.email, "transactions", next);
  };

  const addReceita = (tx) => setTransactions(prev => [tx, ...prev]);

  if (!user) {
    return <AuthScreen onLogin={login} onRegister={register}/>;
  }

  const navGroups = [
    {
      items: [
        {id:"dashboard",   label:"Dashboard",   icon:"grid"},
      ]
    },
    {
      label: "Finanças",
      items: [
        {id:"receitas",    label:"Receitas",    icon:"arrow-up"},
        {id:"despesas",    label:"Despesas",    icon:"arrow-down"},
        {id:"transactions",label:"Transações",  icon:"arrows"},
        {id:"cartoes",     label:"Cartões",     icon:"credit-card"},
        {id:"dividas",     label:"Dívidas",     icon:"document"},
        {id:"categories",  label:"Categorias",  icon:"tag"},
        {id:"reports",     label:"Relatórios",  icon:"chart-bar"},
        {id:"goals",       label:"Metas",       icon:"target"},
      ]
    },
    {
      label: "Mais",
      items: [
        {id:"mercado",     label:"Mercado",     icon:"cart"},
        {id:"veiculos",    label:"Veículos",    icon:"car"},
        {id:"perfil",      label:"Perfil",      icon:"user"},
        {id:"plans",       label:"Planos",      icon:"star"},
        {id:"admin",       label:"Admin",       icon:"settings"},
      ]
    }
  ];
  const nav = navGroups.flatMap(g => g.items);

  const pages = {
    dashboard:    <Dashboard transactions={transactions} accountMode={accountMode}/>,
    receitas:     <ReceitasPage transactions={transactions}/>,
    despesas:     <DespesasPage transactions={transactions}/>,
    transactions: <Transactions transactions={transactions} setTransactions={setTransactions}/>,
    cartoes:      <CartoesPage/>,
    dividas:      <DividasPage/>,
    categories:   <CategoriasPage/>,
    reports:      <Reports transactions={transactions}/>,
    goals:        <Goals/>,
    mercado:      <MercadoPage/>,
    veiculos:     <VeiculosPage/>,
    perfil:       <PerfilPage/>,
    plans:        <Planos/>,
    admin:        <Admin/>,
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex" style={{fontFamily:"'DM Sans', system-ui, sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
        body { margin: 0; }
      `}</style>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 sm:w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 shadow-2xl lg:shadow-none ${
        sidebarOpen?"translate-x-0":"-translate-x-full lg:translate-x-0"
      }`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-slate-900 text-sm transition-all duration-300 ${
              accountMode === "pessoal"
                ? "bg-gradient-to-br from-orange-400 to-orange-600"
                : "bg-gradient-to-br from-blue-400 to-blue-600"
            }`}>
              FB
            </div>
            <div>
              <h1 className="text-white font-bold text-sm">Finance Buddy</h1>
              <p className={`text-xs font-medium transition-colors ${
                accountMode === "pessoal" ? "text-orange-400" : "text-blue-400"
              }`}>
                {accountMode === "pessoal" ? "Conta Pessoal" : "Conta Empresarial"}
              </p>
            </div>
          </div>
          <AccountToggle mode={accountMode} setMode={setAccountMode} />
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-4">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider px-3 mb-1.5">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(n => (
                  <NavItem key={n.id} {...n} active={page===n.id} mode={accountMode}
                    onClick={()=>{setPage(n.id);setSidebarOpen(false)}}/>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
              {user.name ? user.name[0].toUpperCase() : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.name}</p>
              <p className="text-slate-500 text-xs">{user.plan === "Pro" ? "Plano Pro ⭐" : "Plano Free"}</p>
            </div>
            <button onClick={logout} title="Sair"
              className="text-slate-600 hover:text-rose-400 transition-colors text-sm p-1 rounded-lg hover:bg-rose-500/10">
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen&&<div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}

      {/* FAB — Adicionar Receita */}
      <FABReceita onAdd={addReceita}/>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header mobile */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-20">
          <button onClick={()=>setSidebarOpen(true)} className="text-slate-400 hover:text-white p-1">
            ☰
          </button>
          <AccountToggle mode={accountMode} setMode={setAccountMode} />
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xs font-bold text-white">
            {user.name ? user.name[0].toUpperCase() : "?"}
          </div>
        </header>

        {/* Background decoration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"/>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl translate-y-1/3"/>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-5 lg:p-8 overflow-y-auto relative pb-24">
          <div className="max-w-5xl mx-auto">
            {pages[page]}
          </div>
        </main>
      </div>
    </div>
  );
}
