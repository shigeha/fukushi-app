import { useState, useRef, useEffect } from "react";

const COLORS = {
  primary: "#2D6A4F",
  primaryLight: "#52B788",
  primaryPale: "#D8F3DC",
  accent: "#F4A261",
  accentLight: "#FFE8D6",
  danger: "#E63946",
  dangerLight: "#FFE0E0",
  bg: "#F8FAF9",
  card: "#FFFFFF",
  text: "#1B3A2D",
  textMuted: "#6B8F71",
  border: "#B7E4C7",
};

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans JP', sans-serif; background: ${COLORS.bg}; color: ${COLORS.text}; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
`;

// ── サンプルデータ ──────────────────────────────────────────────
const INITIAL_NOTICES = [
  { id: 1, title: "令和7年度 第1回役員会開催のお知らせ", date: "2026-05-20", urgent: true, body: "下記の通り役員会を開催します。\n日時：令和7年5月20日（火）19:00〜\n場所：地区センター 第2会議室\n議題：年間活動計画・予算審議" },
  { id: 2, title: "夏祭り準備委員会 メンバー募集", date: "2026-05-15", urgent: false, body: "8月の夏祭りに向けて準備委員会を設置します。参加希望の方はお問い合わせ欄よりご連絡ください。" },
  { id: 3, title: "福祉活動報告書（4月分）を掲載しました", date: "2026-05-10", urgent: false, body: "4月の活動報告書を資料コーナーに掲載しました。ご確認ください。" },
];

const INITIAL_MEETINGS = [
  { id: 1, title: "令和7年度 第1回役員会", date: "2026-05-20", time: "19:00", place: "地区センター 第2会議室", agenda: "年間活動計画・予算審議・役割分担の確認", responses: { "田中会長": "参加", "山田副会長": "参加", "鈴木書記": "未回答", "佐藤会計": "欠席" } },
  { id: 2, title: "夏祭り準備委員会（第1回）", date: "2026-06-10", time: "18:30", place: "地区センター 多目的室", agenda: "企画案の検討・役割分担", responses: {} },
];

const INITIAL_REPORTS = [
  { id: 1, title: "高齢者訪問活動（4月）", date: "2026-05-01", author: "鈴木書記", content: "今月は15世帯を訪問しました。皆さん元気に過ごされており、来月も継続して実施する予定です。", image: null },
  { id: 2, title: "地域清掃活動 完了報告", date: "2026-04-20", author: "佐藤会計", content: "公園・歩道の清掃を行い、参加者30名で実施しました。大変お疲れ様でした。", image: null },
];

const INITIAL_CHATS = [
  { id: 1, user: "田中会長", text: "皆さん、5月の役員会よろしくお願いします！", time: "10:30" },
  { id: 2, user: "山田副会長", text: "承知しました。資料は前日までに送ります。", time: "10:45" },
  { id: 3, user: "鈴木書記", text: "議事録の準備をしておきます。", time: "11:02" },
];

// ── コンポーネント ──────────────────────────────────────────────
function Badge({ text, color = COLORS.primary }) {
  return (
    <span style={{ background: color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, letterSpacing: 0.5 }}>
      {text}
    </span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: COLORS.card, borderRadius: 14, boxShadow: "0 2px 12px rgba(45,106,79,0.08)", border: `1px solid ${COLORS.border}`, padding: 20, marginBottom: 14, ...style }}>
      {children}
    </div>
  );
}

function SectionHeader({ title, icon, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <h2 style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 20, color: COLORS.primary, display: "flex", alignItems: "center", gap: 8 }}>
        <span>{icon}</span>{title}
      </h2>
      {action}
    </div>
  );
}

function Btn({ children, onClick, color = COLORS.primary, small = false, outline = false }) {
  const [hov, setHov] = useState(false);
  const base = { background: outline ? "transparent" : (hov ? COLORS.primaryLight : color), color: outline ? color : "#fff", border: outline ? `2px solid ${color}` : "none", borderRadius: 8, padding: small ? "6px 14px" : "10px 20px", fontSize: small ? 13 : 14, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", fontFamily: "'Noto Sans JP', sans-serif" };
  return <button style={base} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{children}</button>;
}

// ─── お知らせ画面 ───────────────────────────────────────────────
function NoticesPage() {
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", urgent: false });

  const post = () => {
    if (!form.title.trim()) return;
    setNotices([{ id: Date.now(), title: form.title, date: new Date().toISOString().slice(0, 10), urgent: form.urgent, body: form.body }, ...notices]);
    setForm({ title: "", body: "", urgent: false });
    setShowForm(false);
  };

  if (selected) return (
    <div>
      <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: COLORS.primary, fontSize: 14, cursor: "pointer", marginBottom: 12, fontWeight: 700 }}>← 一覧に戻る</button>
      <Card>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          {selected.urgent && <Badge text="緊急" color={COLORS.danger} />}
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>{selected.date}</span>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>{selected.title}</h3>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, color: COLORS.text }}>{selected.body}</p>
      </Card>
    </div>
  );

  return (
    <div>
      <SectionHeader title="お知らせ掲示板" icon="📋" action={<Btn small onClick={() => setShowForm(!showForm)}>＋ 投稿する</Btn>} />
      {showForm && (
        <Card style={{ background: COLORS.primaryPale, border: `1px solid ${COLORS.primaryLight}` }}>
          <p style={{ fontWeight: 700, marginBottom: 10, color: COLORS.primary }}>新しいお知らせを投稿</p>
          <input placeholder="タイトル" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
          <textarea placeholder="内容" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
          <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={form.urgent} onChange={e => setForm({ ...form, urgent: e.target.checked })} />
            緊急連絡として投稿する
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn small onClick={post}>投稿</Btn>
            <Btn small outline onClick={() => setShowForm(false)}>キャンセル</Btn>
          </div>
        </Card>
      )}
      {notices.map(n => (
        <Card key={n.id} style={{ cursor: "pointer", transition: "box-shadow 0.15s" }} onClick={() => setSelected(n)}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
            {n.urgent && <Badge text="緊急" color={COLORS.danger} />}
            <span style={{ fontSize: 12, color: COLORS.textMuted }}>{n.date}</span>
          </div>
          <p style={{ fontWeight: 700, color: COLORS.text }}>{n.title}</p>
        </Card>
      ))}
    </div>
  );
}

// ─── 会議・行事管理 ─────────────────────────────────────────────
function MeetingsPage() {
  const [meetings, setMeetings] = useState(INITIAL_MEETINGS);
  const [selected, setSelected] = useState(null);
  const [myName, setMyName] = useState("鈴木書記");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time: "", place: "", agenda: "" });

  const respond = (meetingId, answer) => {
    setMeetings(meetings.map(m => m.id === meetingId ? { ...m, responses: { ...m.responses, [myName]: answer } } : m));
    if (selected?.id === meetingId) setSelected(m => ({ ...m, responses: { ...m.responses, [myName]: answer } }));
  };

  const addMeeting = () => {
    if (!form.title || !form.date) return;
    const newM = { id: Date.now(), ...form, responses: {} };
    setMeetings([newM, ...meetings]);
    setForm({ title: "", date: "", time: "", place: "", agenda: "" });
    setShowForm(false);
  };

  if (selected) {
    const m = meetings.find(x => x.id === selected.id) || selected;
    const counts = { 参加: 0, 欠席: 0, 未回答: 0 };
    Object.values(m.responses).forEach(v => counts[v] = (counts[v] || 0) + 1);
    const myAnswer = m.responses[myName];
    return (
      <div>
        <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: COLORS.primary, fontSize: 14, cursor: "pointer", marginBottom: 12, fontWeight: 700 }}>← 一覧に戻る</button>
        <Card>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>{m.title}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 14px", fontSize: 14, marginBottom: 16 }}>
            <span style={{ color: COLORS.textMuted }}>📅 日時</span><span>{m.date} {m.time}</span>
            <span style={{ color: COLORS.textMuted }}>📍 場所</span><span>{m.place || "未定"}</span>
            <span style={{ color: COLORS.textMuted }}>📌 議題</span><span>{m.agenda || "—"}</span>
          </div>
          <div style={{ background: COLORS.bg, borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <p style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>出欠状況</p>
            <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
              {["参加", "欠席", "未回答"].map(k => (
                <span key={k} style={{ fontSize: 13 }}><span style={{ color: k === "参加" ? COLORS.primary : k === "欠席" ? COLORS.danger : COLORS.textMuted, fontWeight: 700 }}>{counts[k] || 0}</span> {k}</span>
              ))}
            </div>
            {Object.entries(m.responses).map(([name, ans]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span>{name}</span>
                <Badge text={ans} color={ans === "参加" ? COLORS.primary : ans === "欠席" ? COLORS.danger : COLORS.textMuted} />
              </div>
            ))}
          </div>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>あなたの出欠 ({myName})</p>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn small onClick={() => respond(m.id, "参加")} color={myAnswer === "参加" ? COLORS.primary : "#aaa"}>✓ 参加</Btn>
            <Btn small onClick={() => respond(m.id, "欠席")} color={myAnswer === "欠席" ? COLORS.danger : "#aaa"}>✗ 欠席</Btn>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="会議・行事管理" icon="📅" action={<Btn small onClick={() => setShowForm(!showForm)}>＋ 追加</Btn>} />
      <div style={{ background: COLORS.accentLight, borderRadius: 10, padding: "8px 14px", marginBottom: 14, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
        <span>表示中のユーザー：</span>
        <select value={myName} onChange={e => setMyName(e.target.value)} style={{ border: "none", background: "transparent", fontWeight: 700, color: COLORS.text, cursor: "pointer" }}>
          {["田中会長", "山田副会長", "鈴木書記", "佐藤会計"].map(n => <option key={n}>{n}</option>)}
        </select>
      </div>
      {showForm && (
        <Card style={{ background: COLORS.primaryPale }}>
          <p style={{ fontWeight: 700, marginBottom: 10, color: COLORS.primary }}>新しい会議・行事を追加</p>
          <input placeholder="タイトル" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
            <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={inputStyle} />
          </div>
          <input placeholder="場所" value={form.place} onChange={e => setForm({ ...form, place: e.target.value })} style={inputStyle} />
          <input placeholder="議題" value={form.agenda} onChange={e => setForm({ ...form, agenda: e.target.value })} style={inputStyle} />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn small onClick={addMeeting}>追加</Btn>
            <Btn small outline onClick={() => setShowForm(false)}>キャンセル</Btn>
          </div>
        </Card>
      )}
      {meetings.map(m => {
        const myAns = m.responses[myName];
        return (
          <Card key={m.id} style={{ cursor: "pointer" }} onClick={() => setSelected(m)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>{m.title}</p>
                <p style={{ fontSize: 13, color: COLORS.textMuted }}>📅 {m.date} {m.time} ／ 📍 {m.place || "場所未定"}</p>
              </div>
              <Badge text={myAns || "未回答"} color={myAns === "参加" ? COLORS.primary : myAns === "欠席" ? COLORS.danger : COLORS.textMuted} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── 活動報告 ───────────────────────────────────────────────────
function ReportsPage() {
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", content: "" });
  const [imgPrev, setImgPrev] = useState(null);
  const fileRef = useRef();

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setImgPrev(ev.target.result);
    reader.readAsDataURL(f);
  };

  const post = () => {
    if (!form.title.trim()) return;
    setReports([{ id: Date.now(), ...form, date: new Date().toISOString().slice(0, 10), image: imgPrev }, ...reports]);
    setForm({ title: "", author: "", content: "" });
    setImgPrev(null);
    setShowForm(false);
  };

  return (
    <div>
      <SectionHeader title="活動報告" icon="📝" action={<Btn small onClick={() => setShowForm(!showForm)}>＋ 報告する</Btn>} />
      {showForm && (
        <Card style={{ background: COLORS.primaryPale }}>
          <p style={{ fontWeight: 700, marginBottom: 10, color: COLORS.primary }}>活動報告を投稿</p>
          <input placeholder="タイトル" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} />
          <input placeholder="投稿者名" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} style={inputStyle} />
          <textarea placeholder="報告内容" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 6 }}>📎 写真・資料のアップロード</p>
            <input type="file" ref={fileRef} onChange={handleFile} accept="image/*,.pdf" style={{ display: "none" }} />
            <Btn small outline onClick={() => fileRef.current.click()}>ファイルを選択</Btn>
            {imgPrev && <img src={imgPrev} alt="preview" style={{ display: "block", maxWidth: "100%", maxHeight: 200, marginTop: 8, borderRadius: 8 }} />}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn small onClick={post}>投稿</Btn>
            <Btn small outline onClick={() => { setShowForm(false); setImgPrev(null); }}>キャンセル</Btn>
          </div>
        </Card>
      )}
      {reports.map(r => (
        <Card key={r.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <p style={{ fontWeight: 700 }}>{r.title}</p>
            <span style={{ fontSize: 12, color: COLORS.textMuted }}>{r.date}</span>
          </div>
          <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>投稿者：{r.author}</p>
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>{r.content}</p>
          {r.image && <img src={r.image} alt="report" style={{ marginTop: 10, maxWidth: "100%", borderRadius: 8 }} />}
        </Card>
      ))}
    </div>
  );
}

// ─── チャット ───────────────────────────────────────────────────
function ChatPage() {
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [myName, setMyName] = useState("鈴木書記");
  const [text, setText] = useState("");
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chats]);

  const send = () => {
    if (!text.trim()) return;
    const now = new Date();
    setChats([...chats, { id: Date.now(), user: myName, text: text.trim(), time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}` }]);
    setText("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <SectionHeader title="メンバーチャット" icon="💬" />
      <div style={{ background: COLORS.accentLight, borderRadius: 10, padding: "8px 14px", marginBottom: 12, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
        <span>送信者：</span>
        <select value={myName} onChange={e => setMyName(e.target.value)} style={{ border: "none", background: "transparent", fontWeight: 700, color: COLORS.text, cursor: "pointer" }}>
          {["田中会長", "山田副会長", "鈴木書記", "佐藤会計"].map(n => <option key={n}>{n}</option>)}
        </select>
      </div>
      <div style={{ flex: 1, overflowY: "auto", paddingRight: 4, marginBottom: 12, maxHeight: 360 }}>
        {chats.map(c => {
          const isMe = c.user === myName;
          return (
            <div key={c.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 8, marginBottom: 12, alignItems: "flex-end" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: isMe ? COLORS.primary : COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {c.user[0]}
              </div>
              <div style={{ maxWidth: "70%" }}>
                {!isMe && <p style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 3 }}>{c.user}</p>}
                <div style={{ background: isMe ? COLORS.primary : COLORS.card, color: isMe ? "#fff" : COLORS.text, borderRadius: isMe ? "14px 4px 14px 14px" : "4px 14px 14px 14px", padding: "10px 14px", fontSize: 14, border: isMe ? "none" : `1px solid ${COLORS.border}` }}>
                  {c.text}
                </div>
                <p style={{ fontSize: 11, color: COLORS.textMuted, textAlign: isMe ? "right" : "left", marginTop: 3 }}>{c.time}</p>
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

// ─── お問い合わせ ───────────────────────────────────────────────
function InquiryPage() {
  const [inquiries, setInquiries] = useState([
    { id: 1, name: "地域住民A", subject: "福祉サービスについて", message: "高齢の親の見守りサービスについて詳しく教えていただけますか？", date: "2026-05-11", status: "回答済" },
    { id: 2, name: "地域住民B", subject: "夏祭りボランティア参加について", message: "夏祭りにボランティアとして参加したいのですが、どうすれば良いですか？", date: "2026-05-12", status: "未回答" },
  ]);
  const [form, setForm] = useState({ name: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReply, setAiReply] = useState("");
  const [selected, setSelected] = useState(null);

  const submit = () => {
    if (!form.name || !form.message) return;
    setInquiries([{ id: Date.now(), ...form, date: new Date().toISOString().slice(0, 10), status: "未回答" }, ...inquiries]);
    setForm({ name: "", subject: "", message: "" });
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const generateAiReply = async (inq) => {
    setSelected(inq);
    setIsAiLoading(true);
    setAiReply("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `あなたは町の福祉会の担当者です。以下のお問い合わせに対して、丁寧かつ親切な日本語で回答文を作成してください。回答は200文字以内にまとめてください。\n\n件名：${inq.subject}\nお問い合わせ内容：${inq.message}`
          }]
        })
      });
      const data = await res.json();
      setAiReply(data.content?.[0]?.text || "回答の生成に失敗しました。");
    } catch {
      setAiReply("エラーが発生しました。");
    }
    setIsAiLoading(false);
  };

  return (
    <div>
      <SectionHeader title="お問い合わせ" icon="✉️" />
      {/* 送信フォーム */}
      <Card style={{ background: COLORS.primaryPale }}>
        <p style={{ fontWeight: 700, color: COLORS.primary, marginBottom: 12 }}>新しいお問い合わせ</p>
        {sent && <div style={{ background: COLORS.primary, color: "#fff", borderRadius: 8, padding: "8px 14px", marginBottom: 10, fontSize: 13 }}>✓ 送信しました。担当者より折り返しご連絡します。</div>}
        <input placeholder="お名前" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        <input placeholder="件名（任意）" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={inputStyle} />
        <textarea placeholder="お問い合わせ内容" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
        <Btn onClick={submit}>送信する</Btn>
      </Card>
      {/* 受信一覧（役員向け） */}
      <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.primary, marginBottom: 10, marginTop: 4 }}>【役員用】受信一覧</p>
      {inquiries.map(inq => (
        <Card key={inq.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14 }}>{inq.subject || "（件名なし）"}</p>
              <p style={{ fontSize: 12, color: COLORS.textMuted }}>{inq.name} ／ {inq.date}</p>
            </div>
            <Badge text={inq.status} color={inq.status === "回答済" ? COLORS.primary : COLORS.accent} />
          </div>
          <p style={{ fontSize: 13, color: COLORS.text, marginBottom: 10, lineHeight: 1.6 }}>{inq.message}</p>
          <Btn small onClick={() => generateAiReply(inq)}>🤖 AI回答文を生成</Btn>
          {selected?.id === inq.id && (
            <div style={{ marginTop: 10, background: COLORS.bg, borderRadius: 8, padding: 12, border: `1px solid ${COLORS.border}` }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.primary, marginBottom: 6 }}>AI生成回答文：</p>
              {isAiLoading ? <p style={{ fontSize: 13, color: COLORS.textMuted }}>生成中…</p> : <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{aiReply}</p>}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ─── 緊急連絡 ───────────────────────────────────────────────────
function EmergencyPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ type: "安否確認", detail: "" });
  const TYPES = ["安否確認", "緊急招集", "災害情報", "その他"];
  const [history, setHistory] = useState([
    { id: 1, type: "緊急招集", detail: "明日の防災訓練の集合時間を8時に変更します。", date: "2026-05-10 14:30", sender: "田中会長" }
  ]);

  const send = () => {
    if (!form.detail.trim()) return;
    setHistory([{ id: Date.now(), ...form, date: new Date().toLocaleString("ja-JP"), sender: "現在のユーザー" }, ...history]);
    setSent(true);
    setForm({ type: "安否確認", detail: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div>
      <SectionHeader title="緊急連絡" icon="🚨" />
      <Card style={{ background: COLORS.dangerLight, border: `2px solid ${COLORS.danger}` }}>
        <p style={{ fontWeight: 700, color: COLORS.danger, marginBottom: 12, fontSize: 15 }}>🚨 緊急連絡を送信する</p>
        {sent && <div style={{ background: COLORS.danger, color: "#fff", borderRadius: 8, padding: "8px 14px", marginBottom: 10, fontSize: 13 }}>✓ 全メンバーに緊急連絡を送信しました。</div>}
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>種別</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TYPES.map(t => (
              <button key={t} onClick={() => setForm({ ...form, type: t })} style={{ padding: "6px 14px", borderRadius: 20, border: `2px solid ${form.type === t ? COLORS.danger : COLORS.border}`, background: form.type === t ? COLORS.danger : "#fff", color: form.type === t ? "#fff" : COLORS.text, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{t}</button>
            ))}
          </div>
        </div>
        <textarea placeholder="緊急連絡の内容を入力してください…" value={form.detail} onChange={e => setForm({ ...form, detail: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
        <Btn onClick={send} color={COLORS.danger}>🚨 今すぐ全員に送信</Btn>
      </Card>
      <p style={{ fontWeight: 700, fontSize: 15, color: COLORS.primary, marginBottom: 10 }}>送信履歴</p>
      {history.map(h => (
        <Card key={h.id} style={{ borderLeft: `4px solid ${COLORS.danger}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <Badge text={h.type} color={COLORS.danger} />
            <span style={{ fontSize: 12, color: COLORS.textMuted }}>{h.date}</span>
          </div>
          <p style={{ fontSize: 14, marginTop: 6, lineHeight: 1.6 }}>{h.detail}</p>
          <p style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>送信者：{h.sender}</p>
        </Card>
      ))}
    </div>
  );
}

// ─── 共通スタイル ───────────────────────────────────────────────
const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${COLORS.border}`,
  fontSize: 14, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 10,
  background: "#fff", color: COLORS.text, outline: "none",
};

// ─── メインアプリ ───────────────────────────────────────────────
const TABS = [
  { id: "notices", label: "お知らせ", icon: "📋" },
  { id: "meetings", label: "会議管理", icon: "📅" },
  { id: "reports", label: "活動報告", icon: "📝" },
  { id: "chat", label: "チャット", icon: "💬" },
  { id: "inquiry", label: "お問い合わせ", icon: "✉️" },
  { id: "emergency", label: "緊急連絡", icon: "🚨" },
];

export default function App() {
  const [tab, setTab] = useState("notices");

  const renderPage = () => {
    switch (tab) {
      case "notices": return <NoticesPage />;
      case "meetings": return <MeetingsPage />;
      case "reports": return <ReportsPage />;
      case "chat": return <ChatPage />;
      case "inquiry": return <InquiryPage />;
      case "emergency": return <EmergencyPage />;
      default: return null;
    }
  };

  return (
    <>
      <style>{STYLE}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* ヘッダー */}
        <div style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`, padding: "18px 20px 14px", color: "#fff" }}>
          <p style={{ fontSize: 11, opacity: 0.8, letterSpacing: 1 }}>COMMUNITY WELFARE</p>
          <h1 style={{ fontFamily: "'Zen Kaku Gothic New', sans-serif", fontSize: 22, fontWeight: 700 }}>🌿 福祉会 連絡アプリ</h1>
        </div>
        {/* タブバー */}
        <div style={{ background: "#fff", borderBottom: `2px solid ${COLORS.border}`, display: "flex", overflowX: "auto", flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: "0 0 auto", padding: "10px 14px", border: "none", background: "none", cursor: "pointer",
              borderBottom: tab === t.id ? `3px solid ${t.id === "emergency" ? COLORS.danger : COLORS.primary}` : "3px solid transparent",
              color: tab === t.id ? (t.id === "emergency" ? COLORS.danger : COLORS.primary) : COLORS.textMuted,
              fontWeight: tab === t.id ? 700 : 400, fontSize: 12, fontFamily: "'Noto Sans JP', sans-serif",
              whiteSpace: "nowrap", transition: "all 0.15s"
            }}>
              <div>{t.icon}</div>
              <div>{t.label}</div>
            </button>
          ))}
        </div>
        {/* コンテンツ */}
        <div style={{ flex: 1, padding: "20px 16px", overflowY: "auto" }}>
          {renderPage()}
        </div>
      </div>
    </>
  );
}
