import { useState, useEffect, useRef } from “react”;

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// /api/generate is a relative URL — works locally and on Vercel automatically
const API_URL            = “/api/generate”;
const STRIPE_PAYMENT_URL = “https://buy.stripe.com/…”; // Your Stripe payment link
const FREE_LIMIT         = 2;
// ─────────────────────────────────────────────────────────────────────────────

const EXAMPLES = [“skincare for teens”, “home gym gear”, “AI productivity tools”, “vegan snacks”, “language learning”];

function getUsage() { try { return parseInt(localStorage.getItem(“tktok_count”) || “0”, 10); } catch { return 0; } }
function incUsage() { try { localStorage.setItem(“tktok_count”, String(getUsage() + 1)); } catch {} }
function isPaid()   { try { return localStorage.getItem(“tktok_paid”) === “true”; } catch { return false; } }

function CopyBtn({ text }) {
const [done, setDone] = useState(false);
return (
<button
onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1600); }}
style={{
background: done ? “rgba(0,230,150,0.12)” : “rgba(255,255,255,0.05)”,
border: `1px solid ${done ? "rgba(0,230,150,0.3)" : "rgba(255,255,255,0.09)"}`,
color: done ? “#00e696” : “#555”, borderRadius: “6px”, padding: “3px 10px”,
fontSize: “10px”, cursor: “pointer”, fontFamily: “‘Fira Code’, monospace”,
letterSpacing: “0.07em”, transition: “all 0.2s”, flexShrink: 0,
}}
>{done ? “✓ COPIED” : “COPY”}</button>
);
}

function Card({ idea, index, visible }) {
return (
<div style={{
background: “rgba(255,255,255,0.022)”, border: “1px solid rgba(255,255,255,0.07)”,
borderRadius: “14px”, padding: “22px 22px 18px”, marginBottom: “10px”,
opacity: visible ? 1 : 0, transform: visible ? “translateY(0)” : “translateY(16px)”,
transition: `opacity 0.45s ease ${index * 0.055}s, transform 0.45s ease ${index * 0.055}s`,
}}>
<div style={{ display: “flex”, gap: “12px”, alignItems: “flex-start”, marginBottom: “14px” }}>
<span style={{ fontFamily: “‘Fira Code’, monospace”, fontSize: “11px”, color: “#ff2d55”, marginTop: “2px”, flexShrink: 0 }}>
{String(index + 1).padStart(2, “0”)}
</span>
<p style={{ color: “#f0f0f0”, fontSize: “14px”, fontWeight: 600, lineHeight: 1.45, margin: 0 }}>{idea.title}</p>
</div>
<div style={{ background: “rgba(255,45,85,0.07)”, border: “1px solid rgba(255,45,85,0.14)”, borderRadius: “9px”, padding: “12px 14px”, marginBottom: “8px” }}>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “flex-start”, gap: “10px” }}>
<div style={{ flex: 1 }}>
<span style={{ fontSize: “9px”, color: “#ff6b8a”, fontFamily: “‘Fira Code’, monospace”, letterSpacing: “0.12em” }}>🎣 HOOK</span>
<p style={{ color: “#ddd”, fontSize: “13px”, margin: “5px 0 0”, lineHeight: 1.5, fontStyle: “italic” }}>”{idea.hook}”</p>
</div>
<CopyBtn text={idea.hook} />
</div>
</div>
<div style={{ background: “rgba(255,255,255,0.025)”, border: “1px solid rgba(255,255,255,0.07)”, borderRadius: “9px”, padding: “12px 14px” }}>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “flex-start”, gap: “10px” }}>
<div style={{ flex: 1 }}>
<span style={{ fontSize: “9px”, color: “#888”, fontFamily: “‘Fira Code’, monospace”, letterSpacing: “0.12em” }}>✍️ CAPTION</span>
<p style={{ color: “#aaa”, fontSize: “13px”, margin: “5px 0 0”, lineHeight: 1.6 }}>{idea.caption}</p>
</div>
<CopyBtn text={idea.caption} />
</div>
</div>
</div>
);
}

function PaywallBanner({ onUpgrade }) {
return (
<div style={{ maxWidth: “640px”, margin: “0 auto 40px”, padding: “0 20px”, animation: “fadeUp 0.5s ease both” }}>
<div style={{
background: “linear-gradient(135deg, rgba(255,45,85,0.11) 0%, rgba(255,100,30,0.07) 100%)”,
border: “1px solid rgba(255,45,85,0.24)”, borderRadius: “16px”, padding: “32px 28px”, textAlign: “center”,
}}>
<div style={{ fontSize: “36px”, marginBottom: “14px” }}>🔒</div>
<h2 style={{ color: “#fff”, fontSize: “20px”, fontWeight: 800, marginBottom: “8px” }}>You’ve used both free generations</h2>
<p style={{ color: “#555”, fontSize: “12px”, fontFamily: “‘Fira Code’, monospace”, marginBottom: “24px”, lineHeight: 1.7 }}>
Upgrade to Pro for unlimited TikTok ideas,<br />hooks, and captions — generated instantly.
</p>
<div style={{ display: “flex”, justifyContent: “center”, gap: “10px”, flexWrap: “wrap”, marginBottom: “22px” }}>
{[“Unlimited generations”, “GPT-4o mini”, “Copy-ready output”].map(f => (
<span key={f} style={{
background: “rgba(255,255,255,0.04)”, border: “1px solid rgba(255,255,255,0.08)”,
borderRadius: “100px”, padding: “5px 13px”, fontSize: “11px”, color: “#666”,
fontFamily: “‘Fira Code’, monospace”,
}}>✓ {f}</span>
))}
</div>
<button onClick={onUpgrade} style={{
background: “linear-gradient(135deg,#ff2d55,#ff6b35)”, border: “none”,
borderRadius: “10px”, padding: “13px 38px”, color: “#fff”, fontSize: “14px”,
fontWeight: 700, cursor: “pointer”, fontFamily: “‘Syne’, sans-serif”,
boxShadow: “0 8px 28px rgba(255,45,85,0.3)”, transition: “transform 0.15s, box-shadow 0.15s”,
}}
onMouseEnter={e => { e.currentTarget.style.transform = “translateY(-2px)”; e.currentTarget.style.boxShadow = “0 14px 36px rgba(255,45,85,0.4)”; }}
onMouseLeave={e => { e.currentTarget.style.transform = “”; e.currentTarget.style.boxShadow = “0 8px 28px rgba(255,45,85,0.3)”; }}
>Upgrade to Pro →</button>
<p style={{ color: “#383838”, fontSize: “11px”, marginTop: “12px”, fontFamily: “‘Fira Code’, monospace” }}>
Secured by Stripe · Cancel anytime
</p>
</div>
</div>
);
}

export default function App() {
const [input, setInput]     = useState(””);
const [loading, setLoading] = useState(false);
const [ideas, setIdeas]     = useState([]);
const [visible, setVisible] = useState(false);
const [error, setError]     = useState(””);
const [usage, setUsage]     = useState(getUsage());
const [paid, setPaid]       = useState(isPaid());
const [niche, setNiche]     = useState(””);
const inputRef = useRef();

const canGenerate = paid || usage < FREE_LIMIT;
const remaining   = Math.max(0, FREE_LIMIT - usage);
const showPaywall = !paid && usage >= FREE_LIMIT;

useEffect(() => {
const p = new URLSearchParams(window.location.search);
if (p.get(“paid”) === “true”) {
localStorage.setItem(“tktok_paid”, “true”);
setPaid(true);
}
}, []);

const generate = async () => {
if (!input.trim() || loading || !canGenerate) return;
setLoading(true); setIdeas([]); setVisible(false); setError(””); setNiche(input.trim());

```
try {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ niche: input.trim() }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
  if (!Array.isArray(data.ideas)) throw new Error("Unexpected response from server.");

  incUsage();
  setUsage(getUsage());
  setIdeas(data.ideas);
  setLoading(false);
  setTimeout(() => setVisible(true), 60);
} catch (e) {
  setError(e.message || "Something went wrong. Please try again.");
  setLoading(false);
}
```

};

return (
<>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Fira+Code:wght@300;400;500&display=swap" rel="stylesheet" />
<style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:#080810} ::selection{background:rgba(255,45,85,0.28)} ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px} @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}} @keyframes spin{to{transform:rotate(360deg)}} @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}`}</style>

```
  <div style={{
    minHeight: "100vh", background: "#080810",
    backgroundImage: `radial-gradient(ellipse 55% 35% at 15% 0%,rgba(255,45,85,0.11) 0%,transparent 55%),
      radial-gradient(ellipse 40% 30% at 85% 95%,rgba(255,110,30,0.07) 0%,transparent 55%)`,
    fontFamily: "'Syne', sans-serif", paddingBottom: "80px",
  }}>

    <div style={{ textAlign: "center", padding: "56px 20px 32px", animation: "fadeUp 0.5s ease" }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "7px",
        background: "rgba(255,45,85,0.09)", border: "1px solid rgba(255,45,85,0.2)",
        borderRadius: "100px", padding: "5px 15px", marginBottom: "24px",
      }}>
        <span style={{ fontSize: "13px" }}>🎵</span>
        <span style={{ color: "#ff6b8a", fontSize: "10px", fontFamily: "'Fira Code', monospace", letterSpacing: "0.14em" }}>AI TIKTOK CONTENT GENERATOR</span>
      </div>
      <h1 style={{ fontSize: "clamp(30px,6.5vw,62px)", fontWeight: 800, color: "#fff", lineHeight: 1.06, letterSpacing: "-0.02em", marginBottom: "12px" }}>
        Go viral on<br />
        <span style={{ background: "linear-gradient(120deg,#ff2d55,#ff7043)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TikTok.</span>
      </h1>
      <p style={{ color: "#555", fontSize: "14px", fontFamily: "'Fira Code', monospace", fontWeight: 300, lineHeight: 1.65 }}>
        Enter your niche → get 10 video ideas, hooks & captions.
      </p>
    </div>

    {!paid && (
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "100px", padding: "6px 16px",
          fontFamily: "'Fira Code', monospace", fontSize: "11px",
        }}>
          <span style={{ color: "#3a3a3a" }}>FREE USES</span>
          {Array.from({ length: FREE_LIMIT }).map((_, i) => (
            <div key={i} style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: i < usage ? "rgba(255,45,85,0.25)" : "#ff2d55",
              opacity: i < usage ? 0.4 : 1,
            }} />
          ))}
          <span style={{ color: remaining > 0 ? "#ff6b8a" : "#555" }}>
            {remaining > 0 ? `${remaining} left` : "limit reached"}
          </span>
        </div>
      </div>
    )}
    {paid && (
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: "rgba(0,230,150,0.07)", border: "1px solid rgba(0,230,150,0.18)",
          borderRadius: "100px", padding: "5px 14px",
          fontFamily: "'Fira Code', monospace", fontSize: "10px", color: "#00e696",
        }}>✦ PRO · Unlimited</div>
      </div>
    )}

    <div style={{ maxWidth: "620px", margin: "0 auto", padding: "0 20px 36px" }}>
      <div style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px", padding: "5px 5px 5px 18px",
        display: "flex", alignItems: "center", gap: "10px",
        transition: "border-color 0.2s, box-shadow 0.2s",
        opacity: showPaywall ? 0.4 : 1, pointerEvents: showPaywall ? "none" : "auto",
      }}
        onFocusCapture={e => { e.currentTarget.style.borderColor = "rgba(255,45,85,0.35)"; e.currentTarget.style.boxShadow = "0 0 50px rgba(255,45,85,0.1)"; }}
        onBlurCapture={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          placeholder="e.g. skincare for teens, AI tools, home gym..."
          disabled={loading || showPaywall}
          style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: "15px", fontFamily: "'Syne', sans-serif" }}
        />
        <button onClick={generate} disabled={loading || !input.trim() || showPaywall} style={{
          background: loading ? "rgba(255,45,85,0.18)" : "linear-gradient(135deg,#ff2d55,#ff6b35)",
          border: "none", borderRadius: "9px", padding: "11px 20px",
          color: loading ? "#ff6b8a" : "#fff", fontSize: "12px", fontWeight: 700,
          cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          fontFamily: "'Fira Code', monospace", letterSpacing: "0.07em",
          transition: "all 0.2s", whiteSpace: "nowrap",
          opacity: !input.trim() && !loading ? 0.4 : 1,
          display: "flex", alignItems: "center", gap: "7px",
        }}>
          {loading && <span style={{ display: "inline-block", animation: "spin 0.9s linear infinite" }}>◌</span>}
          {loading ? "GENERATING..." : "GENERATE →"}
        </button>
      </div>

      {!ideas.length && !loading && !showPaywall && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginTop: "12px" }}>
          <span style={{ color: "#3a3a3a", fontSize: "10px", fontFamily: "'Fira Code', monospace", alignSelf: "center" }}>TRY:</span>
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => { setInput(ex); setTimeout(() => inputRef.current?.focus(), 50); }} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "100px", padding: "4px 11px", color: "#555", fontSize: "11px",
              cursor: "pointer", fontFamily: "'Fira Code', monospace", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,45,85,0.3)"; e.currentTarget.style.color = "#ff6b8a"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#555"; }}
            >{ex}</button>
          ))}
        </div>
      )}
    </div>

    {showPaywall && <PaywallBanner onUpgrade={() => window.open(STRIPE_PAYMENT_URL, "_blank")} />}

    {loading && (
      <div style={{ textAlign: "center", padding: "36px 20px" }}>
        <div style={{ fontSize: "34px", animation: "float 1.4s ease-in-out infinite", marginBottom: "14px" }}>🎬</div>
        <p style={{ color: "#555", fontFamily: "'Fira Code', monospace", fontSize: "12px", animation: "pulse 1.5s ease infinite" }}>
          Generating viral ideas...
        </p>
      </div>
    )}

    {error && (
      <div style={{ maxWidth: "680px", margin: "0 auto 20px", padding: "0 20px" }}>
        <div style={{ background: "rgba(255,45,85,0.07)", border: "1px solid rgba(255,45,85,0.2)", borderRadius: "12px", padding: "14px 18px", color: "#ff6b8a", fontSize: "12px", fontFamily: "'Fira Code', monospace", lineHeight: 1.6 }}>
          ⚠️ {error}
        </div>
      </div>
    )}

    {ideas.length > 0 && !showPaywall && (
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", opacity: visible ? 1 : 0, transition: "opacity 0.3s" }}>
          <div>
            <span style={{ color: "#ff2d55", fontSize: "10px", fontFamily: "'Fira Code', monospace", letterSpacing: "0.12em" }}>10 IDEAS FOR</span>
            <h2 style={{ color: "#fff", fontSize: "17px", fontWeight: 700, marginTop: "3px" }}>"{niche}"</h2>
          </div>
          <button onClick={generate} disabled={!canGenerate} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px", padding: "7px 13px", color: "#555", fontSize: "10px",
            cursor: canGenerate ? "pointer" : "not-allowed", fontFamily: "'Fira Code', monospace",
            letterSpacing: "0.08em", transition: "all 0.15s", opacity: canGenerate ? 1 : 0.4,
          }}
            onMouseEnter={e => { if (canGenerate) { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; } }}
            onMouseLeave={e => { e.currentTarget.style.color = "#555"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
          >↻ REGENERATE</button>
        </div>
        {ideas.map((idea, i) => <Card key={i} idea={idea} index={i} visible={visible} />)}
      </div>
    )}
  </div>
</>
```

);
}
