import { useState, useRef, useEffect } from "react";
import { db } from "./firebase";
import {
  collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, doc, updateDoc, deleteDoc
} from "firebase/firestore";

const COLORS = {
  primary: "#2D6A4F", primaryLight: "#52B788", primaryPale: "#D8F3DC",
  accent: "#F4A261", accentLight: "#FFE8D6", danger: "#E63946", dangerLight: "#FFE0E0",
  bg: "#F8FAF9", card: "#FFFFFF", text: "#1B3A2D", textMuted: "#6B8F71", border: "#B7E4C7",
};

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${COLORS.border}`,
  fontSize: 14, marginBottom: 10, background: "#fff", color: COLORS.text, outline: "none", fontFamily: "sans-serif",
};

const MEMBERS = ["竹林茂晴", "木村徹也", "羽多野文子", "嶋田欣之助", "佐藤タエ", "橋本信子", "中山文子", "藤本富勝", "上野智子", "山本一樹", "早川裕二", "杉本萬樹", "江島敏文", "山本武幸"];

function Badge({ text, color }) {
  return <span style={{ background: color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{text}</span>;
}
function Card({ children, style = {}, onClick }) {
  return <div onClick={onClick} style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(45,106,79,0.08)", border: `1px solid ${COLORS.border}`, padding: 18, marginBottom: 12, ...style }}>{children}</div>;
}
function Btn({ children, onClick, color = COLORS.primary, small, outline }) {
  return <button onClick={onClick} style={{ background: outline ? "transparent" : color, color: outline ? color : "#fff", border: outline ? `2px solid ${color}` : "none", borderRadius: 8, padding: small ? "6px 14px" : "10px 20px", fontSize: small ? 13 : 14, fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" }}>{children}</button>;
}

// ─── お知らせ ───────────────────────────────────────────
function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", urgent: false });

  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => setNotices(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const post = async () => {
    if (!form.title.trim()) return;
    await addDoc(collection(db, "notices"), {
      ...form,
      date: new Date().toISOString().slice(0, 10),
      createdAt: serverTimestamp(),
    });
    setForm({ title: "", body: "", urgent: false });
    setShowForm(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const remove = async (id) => {
    if (!window.confirm("この投稿を削除しますか？")) return;
    await deleteDoc(doc(db, "notices", id));
    setSelected(null);
  };

  if (selected) return (
    <div>
      <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: COLORS.primary, fontWeight: 700, cursor: "pointer", marginBottom: 12, fontSize: 14 }}>← 一覧に戻る</button>
      <Card>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>{selected.urgent && <Badge text="緊急" color={COLORS.danger} />}<span style={{ fontSize: 12, color: COLORS.textMuted }}>{selected.date}</span></div>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>{selected.title}</h3>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: 14, marginBottom: 16 }}>{selected.body}</p>
        <Btn small outline color={COLORS.danger} onClick={() => remove(selected.id)}>🗑 削除</Btn>
      </Card>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, color: COLORS.primary, fontWeight: 700 }}>📋 お知らせ掲示板</h2>
        <Btn small onClick={() => setShowForm(!showForm)}>＋ 投稿</Btn>
      </div>
      {sent && <div style={{ background: COLORS.primary, color: "#fff", borderRadius: 8, padding: "8px 14px", marginBottom: 10, fontSize: 13 }}>✓ 投稿しました！</div>}
      {showForm && <Card style={{ background: COLORS.primaryPale }}>
        <input placeholder="タイトル" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
        <textarea placeholder="内容" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontSize: 13, cursor: "pointer" }}><input type="checkbox" checked={form.urgent} onChange={e => setForm({ ...form, urgent: e.target.checked })} /> 緊急として投稿</label>
        <div style={{ display: "flex", gap: 8 }}><Btn small onClick={post}>投稿</Btn><Btn small outline onClick={() => setShowForm(false)}>キャンセル</Btn></div>
      </Card>}
      {notices.map(n => <Card key={n.id} onClick={() => setSelected(n)} style={{ cursor: "pointer" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>{n.urgent && <Badge text="緊急" color={COLORS.danger} />}<span style={{ fontSize: 12, color: COLORS.textMuted }}>{n.date}</span></div>
        <p style={{ fontWeight: 700 }}>{n.title}</p>
      </Card>)}
    </div>
  );
}

// ─── 活動報告 ────────────────────────────────────────────
function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", content: "" });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => setReports(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFileName(f.name);
    setFileType(f.type);
    const r = new FileReader();
    r.onload = ev => setFile(ev.target.result);
    r.readAsDataURL(f);
  };

  const post = async () => {
    if (!form.title.trim()) return;
    await addDoc(collection(db, "reports"), {
      ...form,
      date: new Date().toISOString().slice(0, 10),
      file: file || null,
      fileName: fileName || null,
      fileType: fileType || null,
      createdAt: serverTimestamp(),
    });
    setForm({ title: "", author: "", content: "" });
    setFile(null);
    setFileName("");
    setFileType("");
    setShowForm(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const remove = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("この投稿を削除しますか？")) return;
    await deleteDoc(doc(db, "reports", id));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, color: COLORS.primary, fontWeight: 700 }}>📝 活動報告</h2>
        <Btn small onClick={() => setShowForm(!showForm)}>＋ 報告</Btn>
      </div>
      {sent && <div style={{ background: COLORS.primary, color: "#fff", borderRadius: 8, padding: "8px 14px", marginBottom: 10, fontSize: 13 }}>✓ 投稿しました！</div>}
      {showForm && <Card style={{ background: COLORS.primaryPale }}>
        <input placeholder="タイトル" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
        <input placeholder="投稿者名" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} style={inputStyle} />
        <textarea placeholder="報告内容" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
        <div style={{ marginBottom: 10 }}>
          <input type="file" ref={fileRef} onChange={handleFile} accept="image/*,application/pdf" style={{ display: "none" }} />
          <Btn small outline onClick={() => fileRef.current.click()}>📎 写真・PDFを追加</Btn>
          {file && fileType === "application/pdf" && (
            <div style={{ marginTop: 8, padding: "8px 12px", background: "#fff", borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              📄 {fileName}
            </div>
          )}
          {file && fileType !== "application/pdf" && (
            <img src={file} style={{ display: "block", maxWidth: "100%", maxHeight: 160, marginTop: 8, borderRadius: 8 }} />
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}><Btn small onClick={post}>投稿</Btn><Btn small outline onClick={() => { setShowForm(false); setFile(null); setFileName(""); }}>キャンセル</Btn></div>
      </Card>}
      {reports.map(r => <Card key={r.id}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "flex-start" }}>
          <p style={{ fontWeight: 700 }}>{r.title}</p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: COLORS.textMuted }}>{r.date}</span>
            <button onClick={e => remove(e, r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.danger, fontSize: 16 }}>🗑</button>
          </div>
        </div>
        <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>投稿者：{r.author}</p>
        <p style={{ fontSize: 14, lineHeight: 1.7 }}>{r.content}</p>
        {r.file && r.fileType === "application/pdf" && (
          <a href={r.file} download={r.fileName} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, padding: "8px 14px", background: COLORS.primaryPale, borderRadius: 8, color: COLORS.primary, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            📄 {r.fileName}（ダウンロード）
          </a>
        )}
        {r.file && r.fileType !== "application/pdf" && (
          <img src={r.file} style={{ marginTop: 10, maxWidth: "100%", borderRadius: 8 }} />
        )}
        {r.image && !r.file && <img src={r.image} style={{ marginTop: 10, maxWidth: "100%", borderRadius: 8 }} />}
      </Card>)}
    </div>
  );
}

// ─── イベント ────────────────────────────────────────────
function EventsPage() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [myName, setMyName] = useState(MEMBERS[0]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time: "", place: "", detail: "" });

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const add = async () => {
    if (!form.title || !form.date) return;
    await addDoc(collection(db, "events"), {
      ...form,
      responses: {},
      createdAt: serverTimestamp(),
    });
    setForm({ title: "", date: "", time: "", place: "", detail: "" });
    setShowForm(false);
  };

  const respond = async (id, ans) => {
    const e = events.find(x => x.id === id);
    await updateDoc(doc(db, "events", id), {
      responses: { ...(e.responses || {}), [myName]: ans }
    });
  };

  const remove = async (id) => {
    if (!window.confirm("このイベントを削除しますか？")) return;
    await deleteDoc(doc(db, "events", id));
    setSelected(null);
  };

  const answerColor = (ans) => {
    if (ans === "参加") return COLORS.primary;
    if (ans === "不参加") return COLORS.danger;
    if (ans === "検討中") return COLORS.accent;
    return "#aaa";
  };

  if (selected) {
    const ev = events.find(x => x.id === selected);
    if (!ev) return null;
    const responses = ev.responses || {};
    const counts = { 参加: 0, 不参加: 0, 検討中: 0 };
    Object.values(responses).forEach(v => { if (counts[v] !== undefined) counts[v]++; });
    return (
      <div>
        <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: COLORS.primary, fontWeight: 700, cursor: "pointer", marginBottom: 12, fontSize: 14 }}>← 一覧に戻る</button>
        <Card>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>{ev.title}</h3>
          <div style={{ fontSize: 14, lineHeight: 2, marginBottom: 12 }}>
            <div>📅 {ev.date} {ev.time}</div>
            <div>📍 {ev.place || "場所未定"}</div>
            {ev.detail && <div>📌 {ev.detail}</div>}
          </div>
          <div style={{ background: COLORS.bg, borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <p style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>回答状況</p>
            <div style={{ display: "flex", gap: 14, marginBottom: 10, fontSize: 13 }}>
              {["参加", "不参加", "検討中"].map(k => (
                <span key={k}><b style={{ color: answerColor(k) }}>{counts[k]}</b> {k}</span>
              ))}
            </div>
            {Object.entries(responses).map(([name, ans]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span>{name}</span>
                <Badge text={ans} color={answerColor(ans)} />
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>あなたの回答（{myName}）</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {["参加", "不参加", "検討中"].map(ans => (
              <button key={ans} onClick={() => respond(ev.id, ans)} style={{
                padding: "8px 16px", borderRadius: 8, border: `2px solid ${answerColor(ans)}`,
                background: responses[myName] === ans ? answerColor(ans) : "#fff",
                color: responses[myName] === ans ? "#fff" : answerColor(ans),
                fontWeight: 700, cursor: "pointer", fontSize: 13
              }}>{ans}</button>
            ))}
          </div>
          <Btn small outline color={COLORS.danger} onClick={() => remove(ev.id)}>🗑 削除</Btn>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, color: COLORS.primary, fontWeight: 700 }}>📆 イベント</h2>
        <Btn small onClick={() => setShowForm(!showForm)}>＋ 追加</Btn>
      </div>
      <div style={{ background: COLORS.accentLight, borderRadius: 10, padding: "8px 14px", marginBottom: 12, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
        あなたの名前：
        <select value={myName} onChange={e => setMyName(e.target.value)} style={{ border: "none", background: "transparent", fontWeight: 700, cursor: "pointer" }}>
          {MEMBERS.map(n => <option key={n}>{n}</option>)}
        </select>
      </div>
      {showForm && <Card style={{ background: COLORS.primaryPale }}>
        <input placeholder="イベント名（必須）" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
          <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={inputStyle} />
        </div>
        <input placeholder="場所" value={form.place} onChange={e => setForm({ ...form, place: e.target.value })} style={inputStyle} />
        <textarea placeholder="詳細・備考" value={form.detail} onChange={e => setForm({ ...form, detail: e.target.value })} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
        <div style={{ display: "flex", gap: 8 }}><Btn small onClick={add}>追加</Btn><Btn small outline onClick={() => setShowForm(false)}>キャンセル</Btn></div>
      </Card>}
      {events.map(ev => {
        const responses = ev.responses || {};
        const myAns = responses[myName];
        const counts = { 参加: 0, 不参加: 0, 検討中: 0 };
        Object.values(responses).forEach(v => { if (counts[v] !== undefined) counts[v]++; });
        return (
          <Card key={ev.id} onClick={() => setSelected(ev.id)} style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <p style={{ fontWeight: 700, fontSize: 15 }}>{ev.title}</p>
              {myAns && <Badge text={myAns} color={answerColor(myAns)} />}
            </div>
            <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 6 }}>📅 {ev.date} {ev.time}　📍 {ev.place || "場所未定"}</p>
            <div style={{ display: "flex", gap: 10, fontSize: 12 }}>
              {["参加", "不参加", "検討中"].map(k => (
                <span key={k} style={{ color: answerColor(k) }}><b>{counts[k]}</b> {k}</span>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── お問い合わせ ─────────────────────────────────────────
function InquiryPage() {
  const [inquiries, setInquiries] = useState([]);
  const [form, setForm] = useState({ name: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => setInquiries(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const submit = async () => {
    if (!form.name || !form.message) return;
    await addDoc(collection(db, "inquiries"), {
      ...form,
      date: new Date().toISOString().slice(0, 10),
      status: "未回答",
      aiReply: "",
      createdAt: serverTimestamp(),
    });
    setForm({ name: "", subject: "", message: "" });
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const remove = async (id) => {
    if (!window.confirm("この問い合わせを削除しますか？")) return;
    await deleteDoc(doc(db, "inquiries", id));
  };

  const genAI = async (inq) => {
    setLoading(inq.id);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `あなたは町の福祉会の担当者です。以下のお問い合わせに丁寧な日本語で200文字以内の回答文を作成してください。\n件名：${inq.subject}\n内容：${inq.message}` }]
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "生成できませんでした。";
      await updateDoc(doc(db, "inquiries", inq.id), { aiReply: reply, status: "回答済" });
    } catch {
      await updateDoc(doc(db, "inquiries", inq.id), { aiReply: "エラーが発生しました。" });
    }
    setLoading(null);
  };

  return (
    <div>
      <h2 style={{ fontSize: 18, color: COLORS.primary, fontWeight: 700, marginBottom: 14 }}>✉️ お問い合わせ</h2>
      <Card style={{ background: COLORS.primaryPale }}>
        <p style={{ fontWeight: 700, color: COLORS.primary, marginBottom: 10 }}>お問い合わせを送る</p>
        {sent && <div style={{ background: COLORS.primary, color: "#fff", borderRadius: 8, padding: "8px 14px", marginBottom: 10, fontSize: 13 }}>✓ 送信しました。</div>}
        <input placeholder="お名前" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        <input placeholder="件名（任意）" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={inputStyle} />
        <textarea placeholder="内容" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        <Btn onClick={submit}>送信する</Btn>
      </Card>
      <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.primary, marginBottom: 10 }}>【役員用】受信一覧</p>
      {inquiries.map(inq => <Card key={inq.id}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "flex-start" }}>
          <div><p style={{ fontWeight: 700, fontSize: 14 }}>{inq.subject || "（件名なし）"}</p><p style={{ fontSize: 12, color: COLORS.textMuted }}>{inq.name} ／ {inq.date}</p></div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Badge text={inq.status} color={inq.status === "回答済" ? COLORS.primary : COLORS.accent} />
            <button onClick={() => remove(inq.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.danger, fontSize: 16 }}>🗑</button>
          </div>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{inq.message}</p>
        <Btn small onClick={() => genAI(inq)}>{loading === inq.id ? "生成中…" : "🤖 AI回答文を生成"}</Btn>
        {inq.aiReply && <div style={{ marginTop: 10, background: COLORS.bg, borderRadius: 8, padding: 12, border: `1px solid ${COLORS.border}` }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.primary, marginBottom: 6 }}>AI生成回答文：</p>
          <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{inq.aiReply}</p>
        </div>}
      </Card>)}
    </div>
  );
}

// ─── メインApp ───────────────────────────────────────────
const TABS = [
  { id: "notices", label: "お知らせ", icon: "📋" },
  { id: "reports", label: "活動報告", icon: "📝" },
  { id: "events", label: "イベント", icon: "📆" },
  { id: "inquiry", label: "問い合わせ", icon: "✉️" },
];

export default function App() {
  const [tab, setTab] = useState("notices");
  const pages = {
    notices: <NoticesPage />,
    reports: <ReportsPage />,
    events: <EventsPage />,
    inquiry: <InquiryPage />,
  };
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "sans-serif", background: COLORS.bg }}>
      <div style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`, padding: "16px 20px 12px", color: "#fff" }}>
        <p style={{ fontSize: 11, opacity: 0.8, letterSpacing: 1 }}>COMMUNITY WELFARE</p>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>🌿 福祉会 連絡アプリ</h1>
      </div>
      <div style={{ background: "#fff", borderBottom: `2px solid ${COLORS.border}`, display: "flex", overflowX: "auto", flexShrink: 0 }}>
        {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: "0 0 auto", padding: "8px 12px", border: "none", background: "none", cursor: "pointer", borderBottom: tab === t.id ? `3px solid ${COLORS.primary}` : "3px solid transparent", color: tab === t.id ? COLORS.primary : COLORS.textMuted, fontWeight: tab === t.id ? 700 : 400, fontSize: 11, whiteSpace: "nowrap" }}>
          <div style={{ fontSize: 16 }}>{t.icon}</div><div>{t.label}</div>
        </button>)}
      </div>
      <div style={{ flex: 1, padding: "18px 14px", overflowY: "auto" }}>
        {pages[tab]}
      </div>
    </div>
  );
}
