import { useState, useEffect } from 'react';

const API = 'https://bmi-backend-production-3651.up.railway.app/api';

// ── Colors ──
const catInfo = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', bg: '#E6F1FB', color: '#185FA5' };
  if (bmi < 25)   return { label: 'Normal weight', bg: '#EAF3DE', color: '#3B6D11' };
  if (bmi < 30)   return { label: 'Overweight', bg: '#FAEEDA', color: '#854F0B' };
  return           { label: 'Obese', bg: '#FCEBEB', color: '#A32D2D' };
};

// ── SMS / iMessage Tips Data ──
const tipsConvo = [
  { from: 'them', text: '👋 Hey! How are you doing today?', delay: 0 },
  { from: 'me',   text: "I'm trying to stay healthy 💪", delay: 600 },
  { from: 'them', text: '🥗 Great! Tip #1: Eat plenty of fruits, veggies & lean proteins every day.', delay: 1200 },
  { from: 'them', text: '🚫 Avoid processed foods, added sugars & trans fats!', delay: 1800 },
  { from: 'me',   text: 'What about exercise? 🏃', delay: 2400 },
  { from: 'them', text: '🏋️ Aim for 30 mins of moderate exercise at least 5 days a week.', delay: 3000 },
  { from: 'them', text: '💡 Mix cardio with strength training for best results!', delay: 3600 },
  { from: 'me',   text: 'Sleep tips? I sleep late 😅', delay: 4200 },
  { from: 'them', text: '😴 Adults need 7–9 hours of quality sleep each night.', delay: 4800 },
  { from: 'them', text: '🌙 Keep a consistent sleep schedule — even on weekends!', delay: 5400 },
  { from: 'me',   text: 'Water intake?', delay: 6000 },
  { from: 'them', text: '💧 Drink at least 2–3 litres of water daily, more if you exercise.', delay: 6600 },
  { from: 'them', text: '✅ Replace sugary drinks with water or herbal teas. You got this!', delay: 7200 },
];

// ── HOME ──
function HomePage({ history, onGoToBMI, user }) {
  const last = history[0];
  return (
    <div style={{ padding: '24px 20px' }}>
      <span style={{ display: 'inline-block', background: '#EEEDFE', color: '#534AB7', fontSize: 12, fontWeight: 500, padding: '4px 14px', borderRadius: 20, marginBottom: 16 }}>
        Your Health Companion
      </span>
      <h1 style={{ fontSize: 26, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.3, marginBottom: 8 }}>
        {user ? `Hey, ${user.name}! 👋` : 'Track your BMI, stay healthy'}
      </h1>
      <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 24 }}>
        Monitor your Body Mass Index and get personalized health tips.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Checks done', val: history.length },
          { label: 'Last BMI', val: last ? last.bmi : '—' },
          { label: 'Your status', val: last ? last.category : '—', color: last ? catInfo(last.bmi).color : '#888' },
          { label: 'Goal', val: 'Normal', color: '#3B6D11' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#f5f5f5', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: s.label === 'Your status' ? 14 : 22, fontWeight: 600, color: s.color || '#1a1a1a' }}>{s.val}</div>
          </div>
        ))}
      </div>
      <button onClick={onGoToBMI} style={btnPrimary}>Check BMI now →</button>
    </div>
  );
}

// ── LOGIN ──
function LoginPage({ user, setUser, history, setHistory }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setError(''); setSuccess('');
    if (!email || !pass) { setError('Please fill in all fields.'); return; }
    if (!email.includes('@')) { setError('Enter a valid email.'); return; }
    if (mode === 'signup' && !name) { setError('Please enter your name.'); return; }
    setLoading(true);
    try {
      const endpoint = mode === 'signup' ? '/register' : '/login';
      const body = mode === 'signup' ? { name, email, password: pass } : { email, password: pass };
      const res = await fetch(API + endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); setLoading(false); return; }
      setUser(data.user);
      setSuccess(mode === 'signup' ? 'Account created! 🎉' : 'Welcome back! 👋');
      // Load history from MongoDB
      const hRes = await fetch(`${API}/bmi/${data.user.email}`);
      const hData = await hRes.json();
      setHistory(hData);
    } catch {
      setError('Cannot connect to server. Is backend running?');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setUser(null); setEmail(''); setPass(''); setName('');
    setSuccess(''); setError(''); setHistory([]);
  };

  if (user) return (
    <div style={{ padding: '24px 20px', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EEEDFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 600, color: '#534AB7', margin: '0 auto 12px' }}>
        {user.name[0].toUpperCase()}
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{user.name}</div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>{user.email}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div style={{ background: '#f5f5f5', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Member since</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Today</div>
        </div>
        <div style={{ background: '#f5f5f5', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>BMI checks</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{history.length}</div>
        </div>
      </div>
      <button onClick={handleLogout} style={{ ...btnPrimary, background: '#FCEBEB', color: '#A32D2D' }}>Logout</button>
    </div>
  );

  return (
    <div style={{ padding: '24px 20px' }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Sign in to save your BMI history to MongoDB.</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['login', 'signup'].map(m => (
          <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
            style={{ flex: 1, padding: 9, border: `1.5px solid ${mode === m ? '#534AB7' : '#ddd'}`, borderRadius: 8, fontSize: 13, cursor: 'pointer', background: mode === m ? '#EEEDFE' : '#f5f5f5', color: mode === m ? '#534AB7' : '#666', fontWeight: mode === m ? 600 : 400 }}>
            {m === 'login' ? 'Login' : 'Sign up'}
          </button>
        ))}
      </div>
      {success && <div style={{ background: '#EAF3DE', color: '#3B6D11', padding: '12px 14px', borderRadius: 8, fontSize: 14, marginBottom: 14 }}>{success}</div>}
      {error && <div style={{ background: '#FCEBEB', color: '#A32D2D', padding: '12px 14px', borderRadius: 8, fontSize: 14, marginBottom: 14 }}>{error}</div>}
      {mode === 'signup' && (
        <><label style={labelStyle}>Full name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} /></>
      )}
      <label style={labelStyle}>Email</label>
      <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@email.com" style={inputStyle} />
      <label style={labelStyle}>Password</label>
      <input value={pass} onChange={e => setPass(e.target.value)} type="password" placeholder="Enter password" style={{ ...inputStyle, marginBottom: 20 }} />
      <button onClick={handleAuth} disabled={loading} style={btnPrimary}>
        {loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Sign up')}
      </button>
    </div>
  );
}

// ── BMI CALCULATOR ──
function BMIPage({ onAdd }) {
  const [unit, setUnit] = useState('metric');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState(null);

  const calc = () => {
    let w = parseFloat(weight), h = parseFloat(height);
    if (!w || !h || w <= 0 || h <= 0) return;
    let bmi = unit === 'metric' ? w / Math.pow(h / 100, 2) : (703 * w) / Math.pow(h * 12, 2);
    bmi = parseFloat(bmi.toFixed(1));
    const info = catInfo(bmi);
    const pct = Math.min((bmi / 40) * 100, 100);
    setResult({ bmi, info, pct });
    onAdd({ bmi, category: info.label, weight: w, height: h, unit });
  };

  return (
    <div style={{ padding: '24px 20px' }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Calculate your BMI</h2>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[['metric', 'kg / cm'], ['imperial', 'lbs / ft']].map(([u, label]) => (
          <button key={u} onClick={() => { setUnit(u); setResult(null); }}
            style={{ padding: '6px 16px', borderRadius: 20, fontSize: 12, border: `1.5px solid ${unit === u ? '#534AB7' : '#ddd'}`, cursor: 'pointer', background: unit === u ? '#EEEDFE' : '#f5f5f5', color: unit === u ? '#534AB7' : '#666', fontWeight: unit === u ? 600 : 400 }}>
            {label}
          </button>
        ))}
      </div>
      <label style={labelStyle}>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
      <input value={weight} onChange={e => setWeight(e.target.value)} type="number" placeholder={unit === 'metric' ? 'e.g. 70' : 'e.g. 154'} style={inputStyle} />
      <label style={labelStyle}>Height ({unit === 'metric' ? 'cm' : 'ft'})</label>
      <input value={height} onChange={e => setHeight(e.target.value)} type="number" placeholder={unit === 'metric' ? 'e.g. 170' : 'e.g. 5.7'} style={{ ...inputStyle, marginBottom: 20 }} />
      <button onClick={calc} style={btnPrimary}>Calculate BMI</button>

      {result && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <div style={{ width: 130, height: 130, borderRadius: '50%', background: `conic-gradient(${result.info.color} ${result.pct * 3.6}deg, #eee 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: result.info.color }}>{result.bmi}</div>
              <div style={{ fontSize: 11, color: '#888' }}>BMI</div>
            </div>
          </div>
          <div style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 20, background: result.info.bg, color: result.info.color, fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
            {result.info.label}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>BMI scale</div>
            <div style={{ width: '100%', height: 10, borderRadius: 5, background: 'linear-gradient(to right, #3498db, #2ecc71, #f39c12, #e74c3c)', position: 'relative', marginBottom: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#333', position: 'absolute', top: -2, left: `calc(${result.pct}% - 7px)` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888' }}>
              <span>0</span><span>18.5</span><span>25</span><span>30</span><span>40+</span>
            </div>
          </div>
          <div style={{ marginTop: 20, textAlign: 'left', background: '#f9f9f9', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: result.info.color, marginBottom: 8 }}>💡 Tips for you</div>
            {result.bmi < 18.5 && <>
              <p style={{ fontSize: 13, marginBottom: 6 }}>🥗 <b>Diet:</b> Eat calorie-rich foods like nuts, dairy, eggs</p>
              <p style={{ fontSize: 13, marginBottom: 6 }}>🏋️ <b>Exercise:</b> Strength training to build muscle</p>
              <p style={{ fontSize: 13 }}>😴 <b>Lifestyle:</b> Get 8hrs sleep, avoid skipping meals</p>
            </>}
            {result.bmi >= 18.5 && result.bmi < 25 && <>
              <p style={{ fontSize: 13, marginBottom: 6 }}>🥗 <b>Diet:</b> Maintain balanced diet with fruits & veggies</p>
              <p style={{ fontSize: 13, marginBottom: 6 }}>🏃 <b>Exercise:</b> 30 mins walk or cardio daily</p>
              <p style={{ fontSize: 13 }}>💧 <b>Hydration:</b> Drink 2–3 litres of water daily</p>
            </>}
            {result.bmi >= 25 && result.bmi < 30 && <>
              <p style={{ fontSize: 13, marginBottom: 6 }}>🥗 <b>Diet:</b> Reduce sugar, fried & processed food</p>
              <p style={{ fontSize: 13, marginBottom: 6 }}>🏃 <b>Exercise:</b> 45 mins cardio + light weights daily</p>
              <p style={{ fontSize: 13 }}>💊 <b>Health:</b> Monitor blood pressure regularly</p>
            </>}
            {result.bmi >= 30 && <>
              <p style={{ fontSize: 13, marginBottom: 6 }}>🥗 <b>Diet:</b> Low carb, high protein diet</p>
              <p style={{ fontSize: 13, marginBottom: 6 }}>🏃 <b>Exercise:</b> Start with walking, increase slowly</p>
              <p style={{ fontSize: 13 }}>💊 <b>Health:</b> Consult doctor for proper health plan</p>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── iMESSAGE TIPS ──
function TipsPage() {
  const [visible, setVisible] = useState([]);
  const [started, setStarted] = useState(false);
  const [typing, setTyping] = useState(false);

  const startChat = () => {
    setStarted(true);
    setVisible([]);
    tipsConvo.forEach((msg, i) => {
      setTimeout(() => {
        if (msg.from === 'them') setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setVisible(prev => [...prev, msg]);
        }, 600);
      }, msg.delay);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* iMessage header */}
      <div style={{ background: '#f5f5f5', borderBottom: '0.5px solid #ddd', padding: '12px 16px', textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#34C759', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, margin: '0 auto 4px' }}>🏥</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>Health Coach</div>
        <div style={{ fontSize: 11, color: '#34C759' }}>● Online</div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', background: 'white', minHeight: 340, maxHeight: 400 }}>
        {!started && (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
            <div style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>Chat with your Health Coach for tips!</div>
            <button onClick={startChat} style={{ ...btnPrimary, width: 'auto', padding: '10px 24px', display: 'inline-block' }}>Start Chat</button>
          </div>
        )}
        {visible.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
            <div style={{
              maxWidth: '75%', padding: '10px 14px', borderRadius: msg.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.from === 'me' ? '#007AFF' : '#E9E9EB',
              color: msg.from === 'me' ? 'white' : '#1a1a1a',
              fontSize: 14, lineHeight: 1.5,
              animation: 'fadeUp 0.3s ease'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
            <div style={{ background: '#E9E9EB', borderRadius: '18px 18px 18px 4px', padding: '10px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#888', animation: `bounce 1s ease ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input bar (decorative) */}
      <div style={{ background: '#f5f5f5', borderTop: '0.5px solid #ddd', padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1, background: 'white', borderRadius: 20, padding: '8px 14px', fontSize: 14, color: '#aaa', border: '0.5px solid #ddd' }}>iMessage</div>
        {started && <button onClick={startChat} style={{ background: '#007AFF', border: 'none', borderRadius: '50%', width: 32, height: 32, color: 'white', fontSize: 16, cursor: 'pointer' }}>↺</button>}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0.6); } 40% { transform: scale(1); } }
      `}</style>
    </div>
  );
}

// ── HISTORY ──
function HistoryPage({ history, user, setHistory }) {
  const clearAll = async () => {
    if (!user) return;
    await fetch(`${API}/bmi/${user.email}`, { method: 'DELETE' });
    setHistory([]);
  };

  if (!history.length) return (
    <div style={{ padding: '24px 20px' }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>BMI History</h2>
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 14 }}>No records yet.<br />Calculate your BMI to start tracking!</div>
      </div>
    </div>
  );

  const avg = (history.reduce((s, e) => s + e.bmi, 0) / history.length).toFixed(1);

  return (
    <div style={{ padding: '24px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>BMI History</h2>
        {user && <button onClick={clearAll} style={{ fontSize: 12, color: '#A32D2D', background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Latest', val: history[0].bmi, color: catInfo(history[0].bmi).color },
          { label: 'Average', val: avg },
          { label: 'Total', val: history.length },
        ].map((s, i) => (
          <div key={i} style={{ background: '#f5f5f5', borderRadius: 10, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color || '#1a1a1a' }}>{s.val}</div>
          </div>
        ))}
      </div>
      {history.map((h, i) => {
        const info = catInfo(h.bmi);
        const dateStr = h.date ? new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : h.dateStr;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, border: '0.5px solid #eee', borderRadius: 10, marginBottom: 10, background: 'white' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: info.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: info.color }}>{h.bmi}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{h.category || info.label}</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>{dateStr}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── SHARED STYLES ──
const btnPrimary = { width: '100%', padding: 13, background: '#534AB7', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 0 };
const labelStyle = { fontSize: 13, color: '#666', marginBottom: 6, display: 'block', marginTop: 0 };
const inputStyle = { width: '100%', padding: '11px 14px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 15, marginBottom: 16, outline: 'none', display: 'block' };

// ── MAIN APP ──
const tabs = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'login', icon: '👤', label: 'Login' },
  { id: 'bmi', icon: '⚖️', label: 'BMI' },
  { id: 'tips', icon: '💬', label: 'Tips' },
  { id: 'history', icon: '📊', label: 'History' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);

  const addRecord = async (record) => {
    const newRecord = { ...record, dateStr: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) };
    if (user) {
      try {
        const res = await fetch(`${API}/bmi`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...record, userEmail: user.email })
        });
        const saved = await res.json();
        setHistory(prev => [saved.record || newRecord, ...prev]);
      } catch {
        setHistory(prev => [newRecord, ...prev]);
      }
    } else {
      setHistory(prev => [newRecord, ...prev]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: 390, background: 'white', borderRadius: 24, overflow: 'hidden', boxShadow: '0 10px 50px rgba(0,0,0,0.15)' }}>
        {/* Nav */}
        <div style={{ display: 'flex', borderBottom: '0.5px solid #eee', background: '#fafafa' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: '12px 4px', fontSize: 10, fontWeight: 600, color: activeTab === t.id ? '#534AB7' : '#888', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === t.id ? '#534AB7' : 'transparent'}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
        {/* Pages */}
        <div style={{ minHeight: 500, overflowY: 'auto', maxHeight: '80vh' }}>
          {activeTab === 'home' && <HomePage history={history} user={user} onGoToBMI={() => setActiveTab('bmi')} />}
          {activeTab === 'login' && <LoginPage user={user} setUser={setUser} history={history} setHistory={setHistory} />}
          {activeTab === 'bmi' && <BMIPage onAdd={addRecord} />}
          {activeTab === 'tips' && <TipsPage />}
          {activeTab === 'history' && <HistoryPage history={history} user={user} setHistory={setHistory} />}
        </div>
      </div>
    </div>
  );
}
