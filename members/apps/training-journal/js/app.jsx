// Northern Rockies Karate-do — Training Journal (PWA)
// Source JSX. Compiled once to app.js (committed); the browser runs app.js, not this.
// To rebuild after editing (classic runtime so it uses the global UMD React):
//   npx babel app.jsx --presets "@babel/preset-react" -o app.js   (then confirm it emits
//   React.createElement, not jsx-runtime imports — pass {runtime:'classic'} if needed)
//
// Two journaling styles (Guided / Cards) behind a chooser, in NRKD brand, plus real
// persistence: finished entries are saved with timestamps and shown in a History list,
// with a real count + streak. Renders full-screen (no device frame).

const { useState, useEffect } = React;
const v = (n) => `var(--nrkd-${n})`;
const FD = v('font-display'), FB = v('font-body'), FJ = v('font-jp-display'), FM = v('font-mono');

// Resolve crest assets through the (legacy) standalone bundler's window.__resources when
// present, otherwise the project-relative path used by this PWA build.
const asset = (id, path) => (window.__resources && window.__resources[id]) || path;

// ── persistence ─────────────────────────────────────────────────
const STORE = 'nrkd-journal-v1';
const emptyDraft = () => ({ mode: 'guided', gStep: 0, gAnswers: {}, gMood: '', gDiscs: {}, cAns: {}, startedAt: null });
function loadState() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) {}
  return {
    entries: Array.isArray(saved.entries) ? saved.entries : [],
    draft: { ...emptyDraft(), ...(saved.draft || {}) },
  };
}

// ── date / stats helpers ────────────────────────────────────────
function fmtStamp(ms) {
  const d = new Date(ms);
  const wd = d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
  const mo = d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
  let h = d.getHours();
  const ap = h < 12 ? 'AM' : 'PM';
  h = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${wd} · ${mo} ${d.getDate()} · ${h}:${mm} ${ap}`;
}
function fmtShort(ms) {
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
const dayKey = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
function computeStats(entries) {
  const days = new Set(entries.map((e) => dayKey(e.savedAt)));
  const at = (off) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - off); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  let start;
  if (days.has(at(0))) start = 0; else if (days.has(at(1))) start = 1; else return { count: entries.length, streak: 0 };
  let streak = 0;
  for (let off = start; days.has(at(off)); off++) streak++;
  return { count: entries.length, streak };
}
function entryPreview(e) {
  const vals = e.mode === 'cards' ? Object.values(e.cAns || {}) : Object.values(e.gAnswers || {});
  const first = vals.map((s) => (s || '').trim()).find(Boolean);
  if (first) return first;
  if (e.gMood) return `Felt ${e.gMood.toLowerCase()}`;
  return 'Entry saved';
}

// ── shared atoms ────────────────────────────────────────────────
function Eyebrow({ kanji, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
      {kanji && <span style={{ fontFamily: FJ, fontWeight: 700, fontSize: 16, color: v('crest-red'), lineHeight: 1 }}>{kanji}</span>}
      <span style={{ fontFamily: FB, fontWeight: 600, fontSize: 11, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: v('crest-red') }}>{children}</span>
    </div>
  );
}

function Chip({ children, active, onClick, kanji }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '9px 14px', borderRadius: 9999, cursor: 'pointer',
      fontFamily: FB, fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap',
      color: active ? v('paper') : v('fg'),
      background: active ? v('crest-red') : v('bg-elevated'),
      border: `1px solid ${active ? v('crest-red') : v('border')}`,
      transition: 'background 120ms, border-color 120ms, color 120ms',
    }}>
      {kanji && <span style={{ fontFamily: FJ, fontWeight: 700, fontSize: 13,
        color: active ? v('paper') : v('crest-red') }}>{kanji}</span>}
      {children}
    </button>
  );
}

function StarterChip({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 12px', borderRadius: 9999, cursor: 'pointer',
      fontFamily: FB, fontSize: 12.5, fontWeight: 500, color: v('fg-muted'),
      background: 'transparent', border: `1px dashed ${v('border-strong')}`,
      whiteSpace: 'nowrap',
    }}>{children}</button>
  );
}

function Primary({ children, onClick, style }) {
  const [p, setP] = useState(false);
  return (
    <button onClick={onClick}
      onMouseDown={() => setP(true)} onMouseUp={() => setP(false)} onMouseLeave={() => setP(false)}
      style={{ fontFamily: FB, fontWeight: 600, fontSize: 15, letterSpacing: '0.03em',
        color: v('paper'), background: p ? v('crest-red-press') : v('crest-red'),
        border: 'none', borderRadius: 4, padding: '14px 20px', cursor: 'pointer',
        transform: p ? 'scale(0.985)' : 'none', transition: 'background 120ms, transform 120ms',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...style }}>
      {children}
    </button>
  );
}

function Secondary({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{ fontFamily: FB, fontWeight: 500, fontSize: 15,
      color: v('fg'), background: 'transparent', border: `1px solid ${v('ink-200')}`,
      borderRadius: 4, padding: '14px 18px', cursor: 'pointer', ...style }}>{children}</button>
  );
}

function Journal({ value, onChange, placeholder, minHeight = 132 }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', minHeight, resize: 'none', boxSizing: 'border-box',
        fontFamily: FB, fontSize: 15.5, lineHeight: 1.65, color: v('fg'),
        background: v('bg-elevated'), border: `1px solid ${v('border')}`, borderRadius: 6,
        padding: '14px 15px', outline: 'none',
        boxShadow: 'inset 0 1px 2px rgba(26,24,22,0.05)' }} />
  );
}

// Full-screen shell — replaces the old iOS device frame. Sizing/centering in theme.css.
function Shell({ children }) {
  return <div className="tj-shell">{children}</div>;
}

// ── status-bar-safe header ──────────────────────────────────────
function EntryHeader({ mode, setMode, onBack, onSave, startedAt }) {
  const seg = (id, label) => {
    const on = mode === id;
    return (
      <button onClick={() => setMode(id)} style={{
        fontFamily: FB, fontWeight: 600, fontSize: 12.5, letterSpacing: '0.02em',
        padding: '7px 15px', borderRadius: 9999, cursor: 'pointer', border: 'none',
        color: on ? v('paper') : v('fg-muted'),
        background: on ? v('crest-red') : 'transparent', transition: 'all 120ms',
      }}>{label}</button>
    );
  };
  return (
    <div style={{ padding: 'calc(env(safe-area-inset-top) + 14px) 16px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: FB, fontSize: 22, color: v('fg-muted'), padding: 4, lineHeight: 1 }}>←</button>
        <div style={{ display: 'flex', gap: 2, background: v('bg-sunken'),
          border: `1px solid ${v('border')}`, borderRadius: 9999, padding: 3 }}>
          {seg('guided', 'Guided')}
          {seg('cards', 'Cards')}
        </div>
        <button onClick={onSave} style={{ background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: FB, fontSize: 13.5, fontWeight: 600, color: v('fg-subtle'), padding: 4 }}>Close</button>
      </div>
      <div style={{ fontFamily: FM, fontSize: 11.5, fontWeight: 500, letterSpacing: '0.08em',
        color: v('fg-subtle'), textTransform: 'uppercase' }}>{fmtStamp(startedAt || Date.now())}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CHOOSER
// ════════════════════════════════════════════════════════════════
function ChoiceCard({ kanji, title, tag, desc, meta, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ textAlign: 'left', width: '100%', cursor: 'pointer', display: 'block',
        background: v('bg-elevated'), borderRadius: 6, padding: '20px 20px 18px',
        border: `1px solid ${h ? v('border-strong') : v('border')}`,
        boxShadow: h ? v('shadow-2') : v('shadow-1'), transition: 'box-shadow 200ms, border-color 200ms' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: v('paper-2'), border: `1px solid ${v('border')}`,
          fontFamily: FJ, fontWeight: 700, fontSize: 24, color: v('crest-red') }}>{kanji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 22, color: v('fg'), lineHeight: 1.12 }}>{title}</div>
          <div style={{ fontFamily: FM, fontSize: 9.5, fontWeight: 500, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: v('crest-red'), marginTop: 6 }}>{tag}</div>
        </div>
        <span style={{ fontFamily: FB, fontSize: 20, color: v('fg-subtle'), alignSelf: 'center', flexShrink: 0 }}>→</span>
      </div>
      <p style={{ fontFamily: FB, fontSize: 13.5, lineHeight: 1.6, color: v('fg-muted'),
        margin: '13px 0 0' }}>{desc}</p>
      <div style={{ fontFamily: FM, fontSize: 11, color: v('fg-subtle'), marginTop: 11,
        letterSpacing: '0.04em' }}>{meta}</div>
    </button>
  );
}

function Chooser({ onPick, onHistory, stats }) {
  return (
    <div style={{ height: '100%', background: v('bg'), display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 20px) 22px 0' }}>
        <a href="../../index.html" style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: FB, fontSize: 12.5, fontWeight: 500, color: v('fg-subtle'),
          textDecoration: 'none', marginBottom: 16 }}>← Members area</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <img src={asset('crestRed', 'assets/crest-red.gif')} alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 16, color: v('fg'), lineHeight: 1.15 }}>
            Training Journal
            <div style={{ fontFamily: FB, fontSize: 10.5, color: v('fg-subtle'), letterSpacing: '0.04em', fontWeight: 400 }}>
              Northern Rockies Karate-do
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '28px 22px 24px' }}>
        <Eyebrow kanji="稽古">Tonight's entry</Eyebrow>
        <h1 style={{ fontFamily: FD, fontWeight: 600, fontSize: 34, lineHeight: 1.08,
          letterSpacing: '-0.02em', color: v('fg'), margin: 0 }}>How would you like<br/>to reflect tonight?</h1>
        <hr style={{ border: 0, borderTop: `2px solid ${v('crest-red')}`, width: 44, margin: '16px 0 14px' }} />
        <p style={{ fontFamily: FD, fontStyle: 'italic', fontSize: 17, lineHeight: 1.55,
          color: v('fg-muted'), margin: '0 0 26px' }}>
          Both keep a record of your training. Choose whichever helps the words come tonight.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ChoiceCard kanji="導" title="Guided practice" tag="Recommended to start"
            desc="A few gentle questions, one at a time — with suggested ways to begin each sentence. Built to make the habit easy when a blank page feels hard."
            meta="~3 min · 4 prompts" onClick={() => onPick('guided')} />
          <ChoiceCard kanji="心" title="Prompt cards" tag="When reflection comes naturally"
            desc="Answer in any order, in your own words. Less scaffolding, more freedom — for nights when you already know what to write."
            meta="~2 min · answer any" onClick={() => onPick('cards')} />
        </div>

        {/* Always-visible entry point to past entries (empty state when none yet). */}
        {stats.count > 0 ? (
          <button onClick={onHistory} style={{ marginTop: 20, width: '100%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'transparent', border: `1px solid ${v('border')}`, borderRadius: 6,
            padding: '14px 16px', fontFamily: FB }}>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: v('fg') }}>Past entries</span>
              <span style={{ fontFamily: FM, fontSize: 11, color: v('fg-subtle'), letterSpacing: '0.04em' }}>
                {stats.count} {stats.count === 1 ? 'night' : 'nights'} logged{stats.streak > 1 ? ` · ${stats.streak}-night streak` : ''}
              </span>
            </span>
            <span style={{ fontSize: 18, color: v('fg-subtle') }}>→</span>
          </button>
        ) : (
          <div style={{ marginTop: 20, width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', background: 'transparent',
            border: `1px dashed ${v('border-strong')}`, borderRadius: 6, padding: '14px 16px' }}>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
              <span style={{ fontFamily: FB, fontSize: 14, fontWeight: 600, color: v('fg-muted') }}>Past entries</span>
              <span style={{ fontFamily: FM, fontSize: 11, color: v('fg-subtle'), letterSpacing: '0.04em' }}>
                Your saved nights will appear here
              </span>
            </span>
          </div>
        )}

        <div style={{ fontFamily: FB, fontSize: 12, color: v('fg-subtle'), textAlign: 'center',
          marginTop: 22, lineHeight: 1.5 }}>
          You can switch styles anytime — no entry is ever lost.
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// GUIDED FLOW
// ════════════════════════════════════════════════════════════════
const MOODS = ['Sharp', 'Steady', 'Heavy', 'Drained', 'Fired up'];
const DISCIPLINES = [
  { k: '型', name: 'Kata' }, { k: '組手', name: 'Kumite' },
  { k: '分解', name: 'Bunkai' }, { k: '古武道', name: 'Kobudo' },
];
const GUIDED = [
  { kanji: '気', eyebrow: 'Prompt 1 of 4', q: "How did tonight's training feel?",
    help: 'No right answer — a few honest words on your energy, focus, and body.',
    kind: 'mood', ph: 'My body felt…', starters: ['My energy was…', 'It clicked when…', 'I struggled with…'] },
  { kanji: '型', eyebrow: 'Prompt 2 of 4', q: 'What did you work on?',
    help: 'Tap what you trained, then note one specific thing you drilled.',
    kind: 'disc', ph: 'Tonight we drilled…', starters: ['We focused on…', 'Sensei corrected…', 'New to me was…'] },
  { kanji: '心', eyebrow: 'Prompt 3 of 4', q: 'How did the new skill feel?',
    help: 'Describe the feeling, not just the technique — that is what you will remember.',
    kind: 'text', ph: 'At first it felt… and then…', starters: ['Awkward when…', 'It clicked when…', 'My timing was…'] },
  { kanji: '改', eyebrow: 'Prompt 4 of 4', q: 'One thing to refine next time.',
    help: 'Small and specific beats big and vague. Future you will thank present you.',
    kind: 'text', ph: 'Next class I want to…', starters: ['Keep my…', 'Slow down on…', 'Ask Sensei about…'] },
];

function GuidedFlow({ data, set, onBack, onSave, mode, setMode }) {
  const step = data.gStep || 0;
  const cur = GUIDED[step];
  const answers = data.gAnswers || {};
  const mood = data.gMood || '';
  const discs = data.gDiscs || {};

  const append = (frag) => {
    const prev = answers[step] || '';
    const next = prev && !prev.endsWith(' ') ? prev + ' ' + frag + ' ' : prev + frag + ' ';
    set({ gAnswers: { ...answers, [step]: next } });
  };

  return (
    <div style={{ height: '100%', background: v('bg'), display: 'flex', flexDirection: 'column' }}>
      <EntryHeader mode={mode} setMode={setMode} onBack={onBack} onSave={onSave} startedAt={data.startedAt} />
      {/* progress */}
      <div style={{ display: 'flex', gap: 5, padding: '4px 16px 0' }}>
        {GUIDED.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 3,
            background: i <= step ? v('crest-red') : v('ink-200') }} />
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px 22px 8px' }}>
        <Eyebrow kanji={cur.kanji}>{cur.eyebrow}</Eyebrow>
        <h2 style={{ fontFamily: FD, fontWeight: 600, fontSize: 28, lineHeight: 1.14,
          letterSpacing: '-0.02em', color: v('fg'), margin: 0, minHeight: 64,
          textWrap: 'balance' }}>{cur.q}</h2>
        <p style={{ fontFamily: FB, fontSize: 13.5, lineHeight: 1.55, color: v('fg-muted'), margin: '12px 0 20px' }}>{cur.help}</p>

        {cur.kind === 'mood' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {MOODS.map((m) => (
              <Chip key={m} active={mood === m} onClick={() => set({ gMood: mood === m ? '' : m })}>{m}</Chip>
            ))}
          </div>
        )}

        {cur.kind === 'disc' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            {DISCIPLINES.map((d) => (
              <Chip key={d.name} kanji={d.k} active={!!discs[d.name]}
                onClick={() => set({ gDiscs: { ...discs, [d.name]: !discs[d.name] } })}>{d.name}</Chip>
            ))}
          </div>
        )}

        <Journal value={answers[step] || ''} onChange={(val) => set({ gAnswers: { ...answers, [step]: val } })}
          placeholder={cur.ph} />

        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: FB, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: v('fg-subtle'), marginBottom: 10 }}>Need a nudge? Tap to begin a line</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {cur.starters.map((s) => <StarterChip key={s} onClick={() => append(s)}>{s}</StarterChip>)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '12px 22px calc(env(safe-area-inset-bottom) + 14px)' }}>
        {step > 0 && <Secondary onClick={() => set({ gStep: step - 1 })} style={{ flex: '0 0 auto' }}>Back</Secondary>}
        <Primary style={{ flex: 1 }}
          onClick={() => step < GUIDED.length - 1 ? set({ gStep: step + 1 }) : onSave()}>
          {step < GUIDED.length - 1 ? <>Continue <span style={{ fontSize: 17 }}>→</span></> : 'Save entry'}
        </Primary>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CARDS FLOW
// ════════════════════════════════════════════════════════════════
const CARDS = [
  { kanji: '型', q: 'What did you work on?', chips: ['Seisan kata', 'Light kumite', 'Bunkai drills', 'Bo basics'] },
  { kanji: '心', q: 'How did the new skill feel?', chips: ['Awkward at first', 'Surprisingly natural', 'Still forcing it'] },
  { kanji: '分解', q: 'Where will this fit in your kata?', chips: ['Seisan', 'Niseishi', 'Bassai', 'Not sure yet'] },
  { kanji: '改', q: 'One thing to refine next time.', chips: ['Back heel down', 'Slower turns', 'Breathe on impact'] },
];

function CardsFlow({ data, set, onBack, onSave, mode, setMode }) {
  const ans = data.cAns || {};
  const answeredCount = Object.values(ans).filter(Boolean).length;
  const activeIdx = CARDS.findIndex((_, i) => !ans[i]);
  const allDone = activeIdx === -1;

  const answer = (i, text) => set({ cAns: { ...ans, [i]: text } });

  return (
    <div style={{ height: '100%', background: v('bg'), display: 'flex', flexDirection: 'column' }}>
      <EntryHeader mode={mode} setMode={setMode} onBack={onBack} onSave={onSave} startedAt={data.startedAt} />

      <div style={{ padding: '4px 22px 0' }}>
        <Eyebrow kanji="稽古">Let's reflect together</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ flex: 1, height: 5, borderRadius: 4, background: v('ink-200'), overflow: 'hidden' }}>
            <div style={{ width: `${(answeredCount / CARDS.length) * 100}%`, height: '100%',
              background: v('crest-red'), transition: 'width 240ms' }} />
          </div>
          <span style={{ fontFamily: FM, fontSize: 11.5, fontWeight: 500, color: v('fg-muted') }}>
            {answeredCount} of {CARDS.length}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '18px 22px 8px',
        display: 'flex', flexDirection: 'column', gap: 11 }}>
        {CARDS.map((c, i) => {
          const isAnswered = !!ans[i];
          const isActive = i === activeIdx;
          if (isAnswered) return <AnsweredCard key={i} card={c} text={ans[i]} onEdit={() => answer(i, '')} />;
          if (isActive) return <ActiveCard key={i} card={c} onAnswer={(t) => answer(i, t)} />;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '14px 16px',
              borderRadius: 6, border: `1px dashed ${v('border-strong')}`, opacity: 0.5 }}>
              <span style={{ fontFamily: FJ, fontWeight: 700, fontSize: 15, color: v('fg-subtle') }}>{c.kanji}</span>
              <span style={{ flex: 1, fontFamily: FB, fontWeight: 500, fontSize: 14, color: v('fg-muted') }}>{c.q}</span>
              <span style={{ fontFamily: FM, fontSize: 10, color: v('fg-subtle'), letterSpacing: '0.08em' }}>NEXT</span>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '12px 22px calc(env(safe-area-inset-bottom) + 14px)' }}>
        <Primary style={{ width: '100%', opacity: allDone ? 1 : 0.45, pointerEvents: allDone ? 'auto' : 'none' }}
          onClick={onSave}>{allDone ? 'Finish entry' : `Answer ${CARDS.length - answeredCount} more to finish`}</Primary>
      </div>
    </div>
  );
}

function AnsweredCard({ card, text, onEdit }) {
  return (
    <div style={{ background: v('bg-elevated'), border: `1px solid ${v('border')}`, borderRadius: 6,
      padding: '13px 16px', boxShadow: v('shadow-1') }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 18, height: 18, borderRadius: 9999, background: v('crest-red'), color: v('paper'),
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>✓</span>
          <span style={{ fontFamily: FB, fontWeight: 600, fontSize: 13, color: v('fg-muted') }}>{card.q}</span>
        </div>
        <button onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: FB, fontSize: 12, color: v('fg-subtle') }}>Edit</button>
      </div>
      <div style={{ fontFamily: FB, fontSize: 14.5, lineHeight: 1.55, color: v('fg'), paddingLeft: 26 }}>{text}</div>
    </div>
  );
}

function ActiveCard({ card, onAnswer }) {
  const [text, setText] = useState('');
  return (
    <div style={{ background: v('bg-elevated'), border: `1.5px solid ${v('crest-red')}`, borderRadius: 6,
      padding: '16px 16px 14px', boxShadow: v('shadow-2') }}>
      <Eyebrow kanji={card.kanji}>Your turn</Eyebrow>
      <div style={{ fontFamily: FD, fontWeight: 600, fontSize: 21, lineHeight: 1.15,
        letterSpacing: '-0.01em', color: v('fg'), marginBottom: 13 }}>{card.q}</div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="In your own words…"
        style={{ width: '100%', minHeight: 60, resize: 'none', boxSizing: 'border-box',
          fontFamily: FB, fontSize: 15, lineHeight: 1.55, color: v('fg'), background: v('bg'),
          border: `1px solid ${v('border')}`, borderRadius: 6, padding: '11px 13px', outline: 'none' }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, margin: '12px 0 14px' }}>
        {card.chips.map((ch) => (
          <StarterChip key={ch} onClick={() => setText((t) => t ? t + ', ' + ch.toLowerCase() : ch)}>{ch}</StarterChip>
        ))}
      </div>
      <Primary style={{ width: '100%', opacity: text.trim() ? 1 : 0.45, pointerEvents: text.trim() ? 'auto' : 'none' }}
        onClick={() => onAnswer(text.trim())}>Save answer</Primary>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// HISTORY + ENTRY VIEW
// ════════════════════════════════════════════════════════════════
function History({ entries, stats, onBack, onOpen }) {
  const sorted = [...entries].sort((a, b) => b.savedAt - a.savedAt);
  return (
    <div style={{ height: '100%', background: v('bg'), display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 14px) 22px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: FB, fontSize: 22, color: v('fg-muted'), padding: 4, lineHeight: 1 }}>←</button>
          <span style={{ fontFamily: FM, fontSize: 11.5, fontWeight: 500, letterSpacing: '0.08em',
            color: v('fg-subtle'), textTransform: 'uppercase' }}>
            {stats.count} {stats.count === 1 ? 'night' : 'nights'}{stats.streak > 1 ? ` · ${stats.streak} streak` : ''}
          </span>
        </div>
        <h2 style={{ fontFamily: FD, fontWeight: 600, fontSize: 30, lineHeight: 1.1,
          letterSpacing: '-0.02em', color: v('fg'), margin: '14px 0 0' }}>Past entries</h2>
        <hr style={{ border: 0, borderTop: `2px solid ${v('crest-red')}`, width: 44, margin: '14px 0 0' }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px calc(env(safe-area-inset-bottom) + 20px)',
        display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map((e) => (
          <button key={e.id} onClick={() => onOpen(e.id)} style={{ textAlign: 'left', cursor: 'pointer',
            background: v('bg-elevated'), border: `1px solid ${v('border')}`, borderRadius: 6,
            padding: '13px 16px', boxShadow: v('shadow-1') }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: FM, fontSize: 11, fontWeight: 500, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: v('crest-red') }}>{fmtShort(e.savedAt)}</span>
              <span style={{ fontFamily: FB, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em',
                textTransform: 'uppercase', color: v('fg-subtle') }}>{e.mode === 'cards' ? 'Cards' : 'Guided'}</span>
            </div>
            <div style={{ fontFamily: FB, fontSize: 14, lineHeight: 1.5, color: v('fg'),
              overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{entryPreview(e)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function EntryView({ entry, onBack, onDelete }) {
  const prompts = entry.mode === 'cards' ? CARDS : GUIDED;
  const answers = entry.mode === 'cards' ? (entry.cAns || {}) : (entry.gAnswers || {});
  const discs = Object.keys(entry.gDiscs || {}).filter((k) => entry.gDiscs[k]);
  return (
    <div style={{ height: '100%', background: v('bg'), display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 14px) 22px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: FB, fontSize: 22, color: v('fg-muted'), padding: 4, lineHeight: 1 }}>←</button>
          <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: FB, fontSize: 13, fontWeight: 500, color: v('fg-subtle'), padding: 4 }}>Delete</button>
        </div>
        <div style={{ fontFamily: FM, fontSize: 11.5, fontWeight: 500, letterSpacing: '0.08em',
          color: v('fg-subtle'), textTransform: 'uppercase', marginTop: 10 }}>{fmtStamp(entry.savedAt)}</div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 22px calc(env(safe-area-inset-bottom) + 24px)',
        display: 'flex', flexDirection: 'column', gap: 20 }}>
        {entry.mode === 'guided' && entry.gMood && (
          <div>
            <Eyebrow kanji="気">How it felt</Eyebrow>
            <div style={{ fontFamily: FB, fontSize: 15, color: v('fg') }}>{entry.gMood}</div>
          </div>
        )}
        {entry.mode === 'guided' && discs.length > 0 && (
          <div>
            <Eyebrow kanji="型">Worked on</Eyebrow>
            <div style={{ fontFamily: FB, fontSize: 15, color: v('fg') }}>{discs.join(' · ')}</div>
          </div>
        )}
        {prompts.map((p, i) => {
          const a = (answers[i] || '').trim();
          if (!a) return null;
          return (
            <div key={i}>
              <Eyebrow kanji={p.kanji}>{p.q}</Eyebrow>
              <div style={{ fontFamily: FB, fontSize: 15.5, lineHeight: 1.6, color: v('fg'),
                whiteSpace: 'pre-wrap' }}>{a}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SAVED CONFIRMATION
// ════════════════════════════════════════════════════════════════
function Saved({ stats, onDone, onHistory }) {
  return (
    <div style={{ height: '100%', background: v('bg-inverse'), display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '0 34px', textAlign: 'center' }}>
      <img src={asset('crestSilver', 'assets/crest-black-silver.png')} alt="" style={{ width: 88, height: 88, objectFit: 'contain', marginBottom: 26 }} />
      <div style={{ fontFamily: FJ, fontWeight: 700, fontSize: 30, color: v('silver-300'), marginBottom: 6 }}>礼</div>
      <h2 style={{ fontFamily: FD, fontWeight: 600, fontSize: 30, lineHeight: 1.15, color: v('paper'),
        margin: '0 0 14px', whiteSpace: 'nowrap' }}>Entry saved</h2>
      <p style={{ fontFamily: FD, fontStyle: 'italic', fontSize: 16, lineHeight: 1.6,
        color: v('silver-300'), margin: '0 0 26px', maxWidth: 280 }}>
        Tonight's training is recorded. The practice speaks for itself.
      </p>
      <div style={{ fontFamily: FM, fontSize: 12, letterSpacing: '0.08em', color: v('silver-500'),
        textTransform: 'uppercase', marginBottom: 30 }}>
        {stats.count} {stats.count === 1 ? 'night' : 'nights'} logged{stats.streak > 1 ? ` · ${stats.streak}-night streak` : ''}
      </div>
      <Primary onClick={onDone} style={{ width: 200 }}>Done</Primary>
      {stats.count > 0 && (
        <button onClick={onHistory} style={{ marginTop: 16, background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: FB, fontSize: 13.5, fontWeight: 500, color: v('silver-300'),
          textDecoration: 'underline', textUnderlineOffset: 3 }}>View all entries</button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ROOT
// ════════════════════════════════════════════════════════════════
function Root() {
  const [store, setStore] = useState(loadState);   // { entries, draft }
  const [view, setView] = useState('choose');       // choose | entry | saved | history | view
  const [viewingId, setViewingId] = useState(null);
  const [, force] = useState(0);

  useEffect(() => {
    // Cormorant can mis-measure at first paint; re-render once webfonts settle.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => force((n) => n + 1));
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify(store)); } catch (e) {}
  }, [store]);

  const data = store.draft;
  const stats = computeStats(store.entries);
  const set = (patch) => setStore((s) => ({ ...s, draft: { ...s.draft, ...patch } }));

  const startEntry = (mode) => {
    setStore((s) => ({ ...s, draft: { ...s.draft, mode, startedAt: s.draft.startedAt || Date.now() } }));
    setView('entry');
  };

  const saveEntry = () => {
    setStore((s) => {
      const d = s.draft;
      const entry = {
        id: (d.startedAt || Date.now()) + '-' + Math.random().toString(36).slice(2, 7),
        savedAt: Date.now(), mode: d.mode,
        gAnswers: d.gAnswers, gMood: d.gMood, gDiscs: d.gDiscs, cAns: d.cAns,
      };
      return { entries: [...s.entries, entry], draft: emptyDraft() };
    });
    setView('saved');
  };

  const deleteEntry = (id) => {
    setStore((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }));
    setView('history');
  };

  let screen;
  if (view === 'choose') {
    screen = <Chooser onPick={startEntry} onHistory={() => setView('history')} stats={stats} />;
  } else if (view === 'saved') {
    screen = <Saved stats={stats} onDone={() => setView('choose')} onHistory={() => setView('history')} />;
  } else if (view === 'history') {
    screen = <History entries={store.entries} stats={stats} onBack={() => setView('choose')}
      onOpen={(id) => { setViewingId(id); setView('view'); }} />;
  } else if (view === 'view') {
    const entry = store.entries.find((e) => e.id === viewingId);
    screen = entry
      ? <EntryView entry={entry} onBack={() => setView('history')} onDelete={() => deleteEntry(entry.id)} />
      : <History entries={store.entries} stats={stats} onBack={() => setView('choose')} onOpen={(id) => { setViewingId(id); setView('view'); }} />;
  } else {
    const common = {
      data, set, mode: data.mode, setMode: (m) => set({ mode: m }),
      onBack: () => setView('choose'), onSave: saveEntry,
    };
    screen = data.mode === 'guided' ? <GuidedFlow {...common} /> : <CardsFlow {...common} />;
  }

  return <Shell>{screen}</Shell>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
