import { useState, useEffect, useRef, createContext, useContext } from "react";

// ── THEMES ────────────────────────────────────────────────────────────────────
const LIGHT = {
  name:"light", bg:"#F5F1EA", card:"#FFFFFF", card2:"#FAF8F4", cardBorder:"#EDE8DF",
  border:"#E8E2D8", strong:"#D4CAB8", accent:"#A87C38", accentTxt:"#FFFFFF", accentBg:"#FDF4E7",
  text:"#1A1208", muted:"#7A6848", faint:"#B8A890",
  green:"#2A7A50", greenBg:"#EAF5EE", greenBd:"#A8D4B8", greenTxt:"#1A4A30",
  red:"#C04040", redBg:"#FDF0F0", redBd:"#E0AAAA", redTxt:"#7A2020",
  blue:"#4060B0", blueBg:"#F0F2FC", blueBd:"#B0B8E8", blueTxt:"#283078",
  navBg:"#FFFFFF", navBd:"#EDE8DF", inputBg:"#F8F5EF", inputBd:"#DDD5C5",
  shadow:"rgba(0,0,0,0.06)",
};
const DARK = {
  name:"dark", bg:"#0D0D0D", card:"#1A1A1A", card2:"#141414", cardBorder:"#2A2A2A",
  border:"#2A2A2A", strong:"#3A3A3A", accent:"#C8A96E", accentTxt:"#1A1208", accentBg:"#2A1F0A",
  text:"#FFFFFF", muted:"#888888", faint:"#444444",
  green:"#4CAF7D", greenBg:"#0D1F14", greenBd:"#2A5A3A", greenTxt:"#A8D4B8",
  red:"#E05550", redBg:"#1F0D0D", redBd:"#5A2020", redTxt:"#F0AAAA",
  blue:"#6080D4", blueBg:"#0E0D1A", blueBd:"#2A2860", blueTxt:"#C8C8E8",
  navBg:"#0D0D0D", navBd:"#1A1A1A", inputBg:"#111111", inputBd:"#333333",
  shadow:"rgba(0,0,0,0.3)",
};
const ThemeCtx = createContext(LIGHT);
const useT = () => useContext(ThemeCtx);

// ── SUBJECTS ──────────────────────────────────────────────────────────────────
const SUBJECTS = [
  { id:"reading",   name:"Books",       label:"Books & Reading", color:"#C8A96E" },
  { id:"science",   name:"Science",     label:"Science",         color:"#5A9EC8" },
  { id:"history",   name:"History",     label:"History",         color:"#C87A5A" },
  { id:"languages", name:"Languages",   label:"Languages",       color:"#5AC8C8" },
  { id:"business",  name:"Business",    label:"Business",        color:"#8A5AC8" },
  { id:"arts",      name:"Arts",        label:"Arts & Culture",  color:"#C85A8A" },
  { id:"health",    name:"Health",      label:"Health",          color:"#C85A5A" },
];
const getSub = id => SUBJECTS.find(s => s.id === id) || SUBJECTS[0];
const getGreeting = () => { const h=new Date().getHours(); return h<12?"Morning":h<17?"Afternoon":"Evening"; };

// ── SM-2 SPACED REPETITION ────────────────────────────────────────────────────
// Based on Dunlosky et al. (2013) high-utility intervals
const SR_INTERVALS = [1, 2, 7, 14, 30, 60]; // days per mastery level 0-5
const getNextReview = (mastery) => {
  const days = SR_INTERVALS[Math.min(mastery, SR_INTERVALS.length-1)];
  return Date.now() + days * 24 * 60 * 60 * 1000;
};
const isDue = (card) => !card.nextReview || Date.now() >= card.nextReview;
const daysUntil = (ts) => Math.max(0, Math.ceil((ts - Date.now()) / 86400000));

// ── SUBJECT ICONS ─────────────────────────────────────────────────────────────
const SubjectIcon = ({ id, color, size=40 }) => {
  const p = { fill:"none", stroke:color, strokeWidth:"1.8", strokeLinecap:"round", strokeLinejoin:"round" };
  const icons = {
    reading:(<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><path d="M20 32V12" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><path d="M5 10c4-2 8-2 11 0l4 2.5 4-2.5c3-2 7-2 11 0v22c-4-2-8-2-11 0l-4 2.5-4-2.5c-3-2-7-2-11 0V10z" {...p}/><line x1="9" y1="16" x2="16" y2="16" stroke={color} strokeWidth="1.4" strokeLinecap="round"/><line x1="9" y1="20" x2="16" y2="20" stroke={color} strokeWidth="1.4" strokeLinecap="round"/><line x1="24" y1="16" x2="31" y2="16" stroke={color} strokeWidth="1.4" strokeLinecap="round"/><line x1="24" y1="20" x2="31" y2="20" stroke={color} strokeWidth="1.4" strokeLinecap="round"/></svg>),
    science:(<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><path d="M15 6h10M16 6v10L7 29a3 3 0 002.5 4.5h21A3 3 0 0033 29L24 16V6" {...p}/><circle cx="14" cy="26" r="2" fill={color} opacity="0.7"/><circle cx="22" cy="30" r="1.5" fill={color} opacity="0.5"/><circle cx="26" cy="24" r="1" fill={color} opacity="0.4"/><line x1="12" y1="22" x2="18" y2="22" stroke={color} strokeWidth="1.4" strokeLinecap="round"/></svg>),
    history:(<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><path d="M10 6h20M10 34h20" stroke={color} strokeWidth="2" strokeLinecap="round"/><path d="M12 6c0 7 8 10 8 14s-8 7-8 14M28 6c0 7-8 10-8 14s8 7 8 14" {...p}/><path d="M15 31h10" stroke={color} strokeWidth="1.4" strokeLinecap="round"/><circle cx="20" cy="20" r="2" fill={color} opacity="0.6"/></svg>),
    maths:(<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><rect x="6" y="8" width="28" height="24" rx="4" {...p}/><circle cx="20" cy="20" r="6" {...p}/><line x1="20" y1="14" x2="20" y2="8" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><line x1="16" y1="17" x2="24" y2="23" stroke={color} strokeWidth="1.4" strokeLinecap="round"/><circle cx="20" cy="20" r="2" fill={color}/></svg>),
    languages:(<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><path d="M5 8h18a2 2 0 012 2v9a2 2 0 01-2 2h-5l-4 4v-4H5a2 2 0 01-2-2V10a2 2 0 012-2z" {...p}/><path d="M23 18h10a2 2 0 012 2v7a2 2 0 01-2 2h-3l-3 3v-3h-4a2 2 0 01-2-2v-7a2 2 0 012-2z" {...p}/><line x1="8" y1="14" x2="18" y2="14" stroke={color} strokeWidth="1.4" strokeLinecap="round"/><line x1="8" y1="17" x2="14" y2="17" stroke={color} strokeWidth="1.4" strokeLinecap="round"/></svg>),
    business:(<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><line x1="6" y1="34" x2="34" y2="34" stroke={color} strokeWidth="2" strokeLinecap="round"/><rect x="8" y="24" width="7" height="10" rx="1.5" stroke={color} strokeWidth="1.7" fill={color+"22"}/><rect x="17" y="16" width="7" height="18" rx="1.5" stroke={color} strokeWidth="1.7" fill={color+"22"}/><rect x="26" y="9" width="7" height="25" rx="1.5" stroke={color} strokeWidth="1.7" fill={color+"22"}/><path d="M22 8l4-4 4 4M26 4v8" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>),
    arts:(<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><path d="M28 6l6 6-16 16s-4 2-8 2c0-4 2-8 2-8L28 6z" {...p}/><path d="M24 10l6 6" stroke={color} strokeWidth="1.4" strokeLinecap="round"/><path d="M8 30c1-2 3-3 4-2s0 3-1 4c-2 1-4 0-3-2z" stroke={color} strokeWidth="1.4" fill={color+"33"}/><circle cx="10" cy="36" r="2" fill={color} opacity="0.5"/></svg>),
    health:(<svg width={size} height={size} viewBox="0 0 40 40" fill="none"><path d="M20 33s-14-9-14-18a9 9 0 0114-7.4A9 9 0 0134 15c0 9-14 18-14 18z" {...p}/><polyline points="8,20 12,16 16,24 20,13 24,20 28,20 32,20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  };
  return icons[id]||icons.reading;
};

// ── NAV ICONS ─────────────────────────────────────────────────────────────────
const NavHome=({active})=>{const T=useT();return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active?T.accent:T.faint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>);};
const NavBattle=({active})=>{const T=useT();return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active?T.accent:T.faint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>);};
const NavWords=({active})=>{const T=useT();return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active?T.accent:T.faint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>);};
const NavProfile=({active})=>{const T=useT();return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active?T.accent:T.faint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);};

// ── RING + STATUS ─────────────────────────────────────────────────────────────
const Ring=({pct,color,size=64})=>{const r=size/2-5,c=2*Math.PI*r;return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color+"28"} strokeWidth="4"/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4" strokeDasharray={c} strokeDashoffset={c*(1-pct/100)} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/><text x={size/2} y={size/2+5} textAnchor="middle" fontSize="13" fontWeight="800" fill={color}>{pct}%</text></svg>);};

const StatusBadge=({pct,total})=>{const T=useT();if(total===0)return<span style={{fontSize:10,color:T.faint,letterSpacing:1.5,textTransform:"uppercase"}}>EMPTY</span>;if(pct===100)return<span style={{fontSize:10,color:T.green,background:T.greenBg,border:`1px solid ${T.greenBd}`,borderRadius:50,padding:"4px 10px",letterSpacing:1.5,textTransform:"uppercase",display:"inline-flex",alignItems:"center",gap:4}}>🔒 SEALED</span>;if(pct>=50)return<span style={{fontSize:10,color:T.accent,background:T.accentBg,border:`1px solid ${T.accent}55`,borderRadius:50,padding:"4px 10px",letterSpacing:1.5,textTransform:"uppercase"}}>BATTLE READY</span>;return<span style={{fontSize:10,color:T.muted,background:T.card2,border:`1px solid ${T.border}`,borderRadius:50,padding:"4px 10px",letterSpacing:1.5,textTransform:"uppercase"}}>LEARNING</span>;};

// ── SHARED UI ─────────────────────────────────────────────────────────────────
const Input=({value,onChange,placeholder,onEnter,autoFocus})=>{const T=useT();return(<input value={value} onChange={onChange} placeholder={placeholder} autoFocus={autoFocus} onKeyDown={e=>e.key==="Enter"&&onEnter&&onEnter()} style={{width:"100%",background:T.inputBg,border:`1px solid ${T.inputBd}`,borderRadius:10,padding:"11px 13px",color:T.text,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>);};

const Btn=({label,onClick,disabled,loading,variant="primary",block,style={}})=>{const T=useT();const v={primary:{bg:disabled?T.strong:T.accent,color:disabled?T.faint:T.accentTxt,border:"none"},ghost:{bg:"transparent",color:T.accent,border:`1.5px solid ${T.accent}`},danger:{bg:T.redBg,color:T.red,border:`1px solid ${T.redBd}`}}[variant];return(<button onClick={onClick} disabled={disabled} style={{background:v.bg,color:v.color,border:v.border,borderRadius:50,padding:"11px 20px",fontSize:13,fontWeight:800,cursor:disabled?"default":"pointer",letterSpacing:1.2,textTransform:"uppercase",fontFamily:"inherit",width:block?"100%":"auto",...style}}>{loading?"···":label}</button>);};

// ── AI HELPERS ────────────────────────────────────────────────────────────────
async function callAI(system, content) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:2000, system, messages:[{role:"user",content}] })
  });
  return (await r.json()).content?.[0]?.text || "";
}
async function callJSON(system, content) {
  try { return JSON.parse(await callAI(system, content)); } catch { return null; }
}

// ── SCAN & ANALYSE MODAL ──────────────────────────────────────────────────────
// Implements: Feynman Technique analysis + Active Recall flashcard generation
const ScanModal = ({ vaults, setVaults, subjects, onClose, forSubject }) => {
  const T = useT();
  const [step, setStep] = useState("upload"); // upload | analysing | result | saving
  const [imgData, setImgData] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [selVault, setSelVault] = useState(null);
  const [saved, setSaved] = useState(false);
  const allVaults = Object.values(vaults);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setImgPreview(dataUrl);
      setImgData(dataUrl.split(",")[1]); // base64 only
    };
    reader.readAsDataURL(file);
  };

  const analyse = async () => {
    if (!imgData) return;
    setStep("analysing");
    const system = `You are Vaultd's AI study coach using evidence-based learning science.
Apply the Feynman Technique (can concepts be explained simply?), Active Recall principles, and the Ebbinghaus forgetting curve.
Analyse the student's handwritten notes/summary in the image.
Return ONLY valid JSON:
{
  "topic": "<main topic of the notes>",
  "clarity_score": <1-10>,
  "completeness_score": <1-10>,
  "overall_grade": "<A+|A|B+|B|C+|C|D>",
  "feynman_check": "<Can this be explained to a 12-year-old? What's missing?>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "coach_note": "<one motivating sentence under 20 words>",
  "flashcards": [
    {"front": "<active recall question>", "back": "<concise answer>"},
    {"front": "<active recall question>", "back": "<concise answer>"},
    {"front": "<active recall question>", "back": "<concise answer>"},
    {"front": "<active recall question>", "back": "<concise answer>"},
    {"front": "<active recall question>", "back": "<concise answer>"}
  ]
}
Flashcards must use active recall (question-answer format) not passive restatement.`;

    const res = await callJSON(system, [
      { type:"image", source:{ type:"base64", media_type:"image/jpeg", data:imgData } },
      { type:"text", text:"Analyse these study notes and return the JSON." }
    ]);
    setResult(res || { error:true });
    setStep("result");
  };

  const saveCards = () => {
    if (!result?.flashcards) return;
    const targetVaultId = forSubject
      ? (() => {
          // Create a new vault named after the AI-detected topic
          const id = "v" + Date.now();
          const topicName = result.topic || "My Notes";
          setVaults(prev => ({
            ...prev,
            [id]: { id, subject:forSubject, name:topicName, flashcards:[], words:[], created:Date.now() }
          }));
          return id;
        })()
      : selVault;
    if (!targetVaultId) return;
    setVaults(prev => {
      const v = prev[targetVaultId] || { id:targetVaultId, subject:forSubject, name:result.topic||"My Notes", flashcards:[], words:[], created:Date.now() };
      const newCards = result.flashcards.map(fc => ({
        id: Date.now() + Math.random(),
        front: fc.front, back: fc.back, mastered: 0,
        nextReview: Date.now(),
        source: "scan",
      }));
      return { ...prev, [targetVaultId]:{ ...v, flashcards:[...(v.flashcards||[]), ...newCards] }};
    });
    setSaved(true);
  };

  const iS = { width:"100%", background:T.inputBg, border:`1px solid ${T.inputBd}`, borderRadius:10, padding:"10px 13px", color:T.text, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" };

  return (
    <div style={{ position:"fixed", inset:0, background:T.bg, zIndex:200, overflowY:"auto" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"18px 20px 14px", borderBottom:`1px solid ${T.border}`, background:T.card, position:"sticky", top:0 }}>
        <button onClick={onClose} style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:50, width:34, height:34, cursor:"pointer", color:T.muted, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        <div>
          <div style={{ fontWeight:800, fontSize:17, color:T.text }}>Scan & Analyse</div>
          <div style={{ fontSize:11, color:T.muted }}>Active Recall · Feynman Technique · Spaced Repetition</div>
        </div>
      </div>

      <div style={{ padding:"20px" }}>
        {/* Science badge */}
        <div style={{ background:T.accentBg, border:`1px solid ${T.accent}44`, borderRadius:12, padding:"10px 14px", marginBottom:20, display:"flex", gap:10, alignItems:"flex-start" }}>
          <span style={{ fontSize:18 }}>🔬</span>
          <div style={{ fontSize:12, color:T.muted, lineHeight:1.6 }}>
            <strong style={{ color:T.accent }}>Research-backed:</strong> Dunlosky et al. (2013) found active recall and spaced repetition are the only "high utility" study techniques. Vaultd applies both automatically.
          </div>
        </div>

        {/* Upload step */}
        {step==="upload" && (
          <div>
            {!imgPreview ? (
              <div>
                {/* Camera — label triggers input directly (works on all mobile browsers) */}
                <input id="vaultd-camera" type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display:"none" }}/>
                <label htmlFor="vaultd-camera" style={{ display:"flex", alignItems:"center", gap:18, width:"100%", background:T.card, border:`1.5px solid ${T.cardBorder}`, borderRadius:18, padding:"28px 20px", cursor:"pointer", marginBottom:12, boxShadow:`0 2px 10px ${T.shadow}`, textAlign:"left", boxSizing:"border-box" }}>
                  <div style={{ width:56, height:56, borderRadius:14, background:T.accent, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:800, fontSize:15, color:T.text, marginBottom:3 }}>Open Camera</div>
                    <div style={{ fontSize:12, color:T.muted, lineHeight:1.5 }}>Take a photo of your handwritten notes right now</div>
                  </div>
                  <div style={{ color:T.faint, fontSize:20 }}>›</div>
                </label>

                {/* Gallery — no capture attribute = photo library */}
                <input id="vaultd-gallery" type="file" accept="image/*" onChange={handleFile} style={{ display:"none" }}/>
                <label htmlFor="vaultd-gallery" style={{ display:"flex", alignItems:"center", gap:18, width:"100%", background:T.card, border:`1.5px solid ${T.cardBorder}`, borderRadius:18, padding:"28px 20px", cursor:"pointer", boxShadow:`0 2px 10px ${T.shadow}`, textAlign:"left", boxSizing:"border-box" }}>
                  <div style={{ width:56, height:56, borderRadius:14, background:T.card2, border:`1.5px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:800, fontSize:15, color:T.text, marginBottom:3 }}>Upload from Gallery</div>
                    <div style={{ fontSize:12, color:T.muted, lineHeight:1.5 }}>Choose an existing photo of your notes or summary</div>
                  </div>
                  <div style={{ color:T.faint, fontSize:20 }}>›</div>
                </label>
              </div>
            ) : (
              <div>
                <img src={imgPreview} alt="Notes" style={{ width:"100%", borderRadius:16, border:`1px solid ${T.border}`, marginBottom:16, maxHeight:320, objectFit:"contain" }}/>
                <div style={{ display:"flex", gap:8, marginBottom:16 }}>
                  <button onClick={()=>{setImgPreview(null);setImgData(null);}} sty
