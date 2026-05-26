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

const MEMBERS = ["山田太郎", "鈴木花子", "田中一郎", "佐藤明子"];

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
  };

  if (selected) return (
    <div>
      <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: COLORS.primary, fontWeight: 700, cursor: "pointer", marginBottom: 12, fontSize: 14 }}>← 一覧に戻る</button>
      <Card>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>{selected.urgent && <Badge text="緊急" color={COLORS.danger} />}<span style={{ fontSize: 12, color: COLORS.textMuted }}>{selected.date}</span></div>
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>{selected.title}</h3>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: 14 }}>{selected.body}</p>
      </Card>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, color: COLORS.primary, fontWeight: 700 }}>📋 お知らせ掲示板</h2>
        <Btn small onClick={() => setShowForm(!showForm)}>＋ 投稿</Btn>
      </div>
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

// ─── 会議管理 ────────────────────────────────────────────
function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [myName, setMyName] = useState(MEMBERS[0]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time: "", place: "", agenda: "" });

  useEffect(() => {
    const q = query(collection(db, "meetings"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => setMeetings(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const respond = async (id, ans) => {
    const m = meetings.find(x => x.id === id);
    await updateDoc(doc(db, "meetings", id), { responses: { ...(m.responses || {}), [myName]: ans } });
  };

  const add = async () => {
    if (!form.title || !form.date) return;
    await addDoc(collection(db, "meetings"), { ...form, responses: {}, createdAt: serverTimestamp() });
    setForm({ title: "", date: "", time: "", place: "", agenda: "" });
    setShowForm(false);
  };

  if (selected) {
    const m = meetings.find(x => x.id === selected) || {};
    const counts = Object.values(m.responses || {}).reduce((a, v) => ({ ...a, [v]: (a[v] || 0) + 1 }), {});
    return (
      <div>
        <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: COLORS.primary, fontWeight: 700, cursor: "pointer", marginBottom: 12, fontSize: 14 }}>← 一覧に戻る</button>
        <Card>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>{m.title}</h3>
          <div style={{ fontSize: 14, lineHeight: 2, marginBottom: 12 }}>
            <div>📅 {m.date} {m.time}</div><div>📍 {m.place || "未定"}</div><div>📌 {m.agenda || "—"}</div>
          </div>
          <div style={{ background: COLORS.bg, borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <p style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>出欠状況</p>
            <div style={{ display: "flex", gap: 14, marginBottom: 8, fontSize: 13 }}>
              {["参加", "欠席", "未回答"].map(k => <span key={k}><b style={{ color: k === "参加" ? COLORS.primary : k === "欠席" ? COLORS.danger : COLORS.textMuted }}>{counts[k] || 0}</b> {k}</span>)}
            </div>
            {Object.entries(m.responses || {}).map(([name, ans]) => <div key={name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: `1px solid ${COLORS.border}` }}><span>{name}</span><Badge text={ans} color={ans === "参加" ? COLORS.primary : ans === "欠席" ? COLORS.danger : COLORS.textMuted} /></div>)}
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>あなたの出欠（{myName}）</p>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn small onClick={() => respond(m.id, "参加")} color={(m.responses || {})[myName] === "参加" ? COLORS.primary : "#aaa"}>✓ 参加</Btn>
            <Btn small onClick={() => respond(m.id, "欠席")} color={(m.responses || {})[myName] === "欠席" ? COLORS.danger : "#aaa"}>✗ 欠席</Btn>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h2 style={{ fontSize: 18, color: COLORS.primary, fontWeight: 700 }}>📅 会議・行事管理</h2>
        <Btn small onClick={() => setShowForm(!showForm)}>＋ 追加</Btn>
      </div>
      <div style={{ background: COLORS.accentLight, borderRadius: 10, padding: "8px 14px", marginBottom: 12, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
        ユーザー：<select value={myName} onChange={e => setMyName(e.target.value)} style={{ border: "none", background: "transparent", fontWeight: 700, cursor: "pointer" }}>{MEMBERS.map(n => <option key={n}>{n}</option>)}</select>
      </div>
      {showForm && <Card style={{ background: COLORS.primaryPale }}>
        <input placeholder="タイトル" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
          <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={inputStyle} />
        </div>
        <input placeholder="場所" value={form.place} onChange={e => setForm({ ...form, place: e.target.value })} style={inputStyle} />
        <input placeholder="議題" value={form.agenda} onChange={e => setForm({ ...form, agenda: e.target.value })} style={inputStyle} />
        <div style={{ display: "flex", gap: 8 }}><Btn small onClick={add}>追加</Btn><Btn small outline onClick={() => setShowForm(false)}>キャンセル</Btn></div>
      </Card>}
      {meetings.map(m => {
        const ans = (m.responses || {})[myName];
        return <Card key={m.id} onClick={() => setSelected(m.id)} style={{ cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div><p style={{ fontWeight: 700, marginBottom: 4 }}>{m.title}</p><p style={{ fontSize: 13, color: COLORS.textMuted }}>📅 {m.date} {m.time}　📍 {m.place || "場所未定"}</p></div>
            <Badge text={ans || "未回答"} color={ans === "参加" ? COLORS.primary : ans === "欠席" ? COLORS.danger : COLORS.textMuted} />
          </div>
        </Card>;
      })}
    </div>
  );
}

// ─── 活動報告 ────────────────────────────────────────────
function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", content: "" });
  const [img, setImg] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => setReports(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const post = async () => {
    if (!form.title.trim()) return;
    await addDoc(collection(db, "reports"), {
      ...form,
      date: new Date().toISOString().slice(0, 10),
      image: img || null,
      createdAt: serverTimestamp(),
    });
    setForm({ title: "", author: "", content: "" });
    setImg(null);
    setShowForm(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, color: COLORS.primary, fontWeight: 700 }}>📝 活動報告</h2>
        <Btn small onClick={() => setShowForm(!showForm)}>＋ 報告</Btn>
      </div>
      {showForm && <Card style={{ background: COLORS.primaryPale }}>
        <input placeholder="タイトル" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
        <input placeholder="投稿者名" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} style={inputStyle} />
        <textarea placeholder="報告内容" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
        <div style={{ marginBottom: 10 }}>
          <input type="file" ref={fileRef} onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onload = ev => setImg(ev.target.result); r.readAsDataURL(f); } }} accept="image/*" style={{ display: "none" }} />
          <Btn small outline onClick={() => fileRef.current.click()}>📎 写真を追加</Btn>
          {img && <img src={img} style={{ display: "block", maxWidth: "100%", maxHeight: 160, marginTop: 8, borderRadius: 8 }} />}
        </div>
        <div style={{ display: "flex", gap: 8 }}><Btn small onClick={post}>投稿</Btn><Btn small outline onClick={() => { setShowForm(false); setImg(null); }}>キャンセル</Btn></div>
      </Card>}
      {reports.map(r => <Card key={r.id}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><p style={{ fontWeight: 700 }}>{r.title}</p><span style={{ fontSize: 12, color: COLORS.textMuted }}>{r.date}</span></div>
        <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>投稿者：{r.author}</p>
        <p style={{ fontSize: 14, lineHeight: 1.7 }}>{r.content}</p>
        {r.image && <img src={r.image} style={{ marginTop: 10, maxWidth: "100%", borderRadius: 8 }} />}
      </Card>)}
    </div>
  );
}

// ─── チャット ────────────────────────────────────────────
function ChatPage() {
  const [chats, setChats] = useState([]);
  const [myName, setMyName] = useState(MEMBERS[0]);
  const [text, setText] = useState("");
  const bottomRef = useRef();

  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("createdAt", "asc"));
    return onSnapshot(q, snap => setChats(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chats]);

  const send = async () => {
    if (!text.trim()) return;
    const now = new Date();
    await addDoc(collection(db, "chats"), {
      user: myName,
      text: text.trim(),
      time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`,
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h2 style={{ fontSize: 18, color: COLORS.primary, fontWeight: 700, marginBottom: 10 }}>💬 メンバーチャット</h2>
      <div style={{ background: COLORS.accentLight, borderRadius: 10, padding: "8px 14px", marginBottom: 12, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
        送信者：<select value={myName} onChange={e => setMyName(e.target.value)} style={{ border: "none", background: "transparent", fontWeight: 700, cursor: "pointer" }}>{MEMBERS.map(n => <option key={n}>{n}</option>)}</select>
      </div>
      <div style={{ overflowY: "auto", maxHeight: 340, marginBottom: 12, paddingRight: 4 }}>
        {chats.map(c => {
          const isMe = c.user === myName;
          return (
            <div key={c.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 8, marginBottom: 12, alignItems: "flex-end" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: isMe ? COLORS.primary : COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{(c.user || "?")[0]}</div>
              <div style={{ maxWidth: "70%" }}>
                {!isMe && <p style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 2 }}>{c.user}</p>}
                <div style={{ background: isMe ? COLORS.primary : "#fff", color: isMe ? "#fff" : COLORS.text, borderRadius: isMe ? "14px 4px 14px 14px" : "4px 14px 14px 14px", padding: "10px 14px", fontSize: 14, border: isMe ? "none" : `1px solid ${COLORS.border}` }}>{c.text}</div>
                <p style={{ fontSize: 11, color: COLORS.textMuted, textAlign: isMe ? "right" : "left", marginTop: 2 }}>{c.time}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="メッセージを入力…" style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
        <Btn onClick={send}>送信</Btn>
      </div>
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
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <div><p style={{ fontWeight: 700, fontSize: 14 }}>{inq.subject || "（件名なし）"}</p><p style={{ fontSize: 12, color: COLORS.textMuted }}>{inq.name} ／ {inq.date}</p></div>
          <Badge text={inq.status} color={inq.status === "回答済" ? COLORS.primary : COLORS.accent} />
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

// ─── 緊急連絡 ────────────────────────────────────────────
function EmergencyPage() {
  const [form, setForm] = useState({ type: "安否確認", detail: "" });
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState([]);
  const TYPES = ["安否確認", "緊急招集", "災害情報", "その他"];

  useEffect(() => {
    const q = query(collection(db, "emergency"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const send = async () => {
    if (!form.detail.trim()) return;
    await addDoc(collection(db, "emergency"), {
      ...form,
      date: new Date().toLocaleString("ja-JP"),
      sender: "現在のユーザー",
      createdAt: serverTimestamp(),
    });
    setSent(true);
    setForm({ type: "安否確認", detail: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div>
      <h2 style={{ fontSize: 18, color: COLORS.danger, fontWeight: 700, marginBottom: 14 }}>🚨 緊急連絡</h2>
      <Card style={{ background: COLORS.dangerLight, border: `2px solid ${COLORS.danger}` }}>
        {sent && <div style={{ background: COLORS.danger, color: "#fff", borderRadius: 8, padding: "8px 14px", marginBottom: 10, fontSize: 13 }}>✓ 全メンバーに送信しました。</div>}
        <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>種別を選択</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {TYPES.map(t => <button key={t} onClick={() => setForm({ ...form, type: t })} style={{ padding: "6px 14px", borderRadius: 20, border: `2px solid ${form.type === t ? COLORS.danger : COLORS.border}`, background: form.type === t ? COLORS.danger : "#fff", color: form.type === t ? "#fff" : COLORS.text, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{t}</button>)}
        </div>
        <textarea placeholder="緊急連絡の内容…" value={form.detail} onChange={e => setForm({ ...form, detail: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        <Btn onClick={send} color={COLORS.danger}>🚨 全員に送信</Btn>
      </Card>
      <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.primary, marginBottom: 10 }}>送信履歴</p>
      {history.map(h => <Card key={h.id} style={{ borderLeft: `4px solid ${COLORS.danger}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><Badge text={h.type} color={COLORS.danger} /><span style={{ fontSize: 12, color: COLORS.textMuted }}>{h.date}</span></div>
        <p style={{ fontSize: 14, lineHeight: 1.6 }}>{h.detail}</p>
        <p style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>送信者：{h.sender}</p>
      </Card>)}
    </div>
  );
}

// ─── メインApp ───────────────────────────────────────────
const TABS = [
  { id: "notices", label: "お知らせ", icon: "📋" },
  { id: "meetings", label: "会議管理", icon: "📅" },
  { id: "reports", label: "活動報告", icon: "📝" },
  { id: "chat", label: "チャット", icon: "💬" },
  { id: "inquiry", label: "問い合わせ", icon: "✉️" },
  { id: "emergency", label: "緊急連絡", icon: "🚨" },
];

export default function App() {
  const [tab, setTab] = useState("notices");
  const pages = { notices: <NoticesPage />, meetings: <MeetingsPage />, reports: <ReportsPage />, chat: <ChatPage />, inquiry: <InquiryPage />, emergency: <EmergencyPage /> };
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "sans-serif", background: COLORS.bg }}>
      <div style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`, padding: "16px 20px 12px", color: "#fff" }}>
        <p style={{ fontSize: 11, opacity: 0.8, letterSpacing: 1 }}>COMMUNITY WELFARE</p>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>🌿 福祉会 連絡アプリ</h1>
      </div>
      <div style={{ background: "#fff", borderBottom: `2px solid ${COLORS.border}`, display: "flex", overflowX: "auto", flexShrink: 0 }}>
        {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: "0 0 auto", padding: "8px 12px", border: "none", background: "none", cursor: "pointer", borderBottom: tab === t.id ? `3px solid ${t.id === "emergency" ? COLORS.danger : COLORS.primary}` : "3px solid transparent", color: tab === t.id ? (t.id === "emergency" ? COLORS.danger : COLORS.primary) : COLORS.textMuted, fontWeight: tab === t.id ? 700 : 400, fontSize: 11, whiteSpace: "nowrap" }}>
          <div style={{ fontSize: 16 }}>{t.icon}</div><div>{t.label}</div>
        </button>)}
      </div>
      <div style={{ flex: 1, padding: "18px 14px", overflowY: "auto" }}>
        {pages[tab]}
      </div>
    </div>
  );
