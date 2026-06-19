import { useEffect, useRef, useState } from "react";
import {
  buildGoogleAiUrl,
  fetchPoster,
  getStoredKey,
  getTmdbKey,
  lookup,
  parseFreeform,
  resolveImportedCover,
  sanitizeCover,
  setStoredKey,
  setTmdbKey,
} from "../utils/titleImporter.js";

const PILL_COLOR = {
  narrative: "red", action: "yellow", discovery: "green", mechanic: "blue",
  thriller: "red", exciting: "yellow", healing: "green", drama: "blue",
  emotional: "red", thrilling: "yellow", cozy: "green", mystery: "blue",
  energetic: "yellow", melancholic: "red", chill: "green", intense: "blue",
};

const MODELS = ["gpt-4.1-mini", "gpt-4o-mini", "gpt-4.1", "gpt-4o"];

const TYPE_LABELS = { games: "Game", films: "Film", series: "Series", music: "Music" };

export default function AiImporter({ type, onImported }) {
  const [aiType, setAiType] = useState(type || "games");
  const [title, setTitle] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [tmdbKey, setTmdbKeyValue] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [status, setStatus] = useState("Chưa kết nối");
  const [pasteText, setPasteText] = useState("");
  const [pending, setPending] = useState(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [coverStatus, setCoverStatus] = useState("");
  const [confirmOk, setConfirmOk] = useState(false);
  const [fetching, setFetching] = useState(false);
  const coverTimerRef = useRef(null);

  useEffect(() => {
    const storedOpenAi = getStoredKey();
    const storedTmdb = getTmdbKey();
    if (storedOpenAi) setApiKey(storedOpenAi);
    if (storedTmdb) setTmdbKeyValue(storedTmdb);
    setStatus(storedOpenAi ? "Sẵn sàng" : "Chưa kết nối");
  }, []);

  useEffect(() => { setAiType(type || "games"); }, [type]);

  function handleApiKeyChange(value) {
    setApiKey(value);
    setStoredKey(value);
    setStatus(value.trim() ? "Sẵn sàng" : "Chưa kết nối");
  }

  function handleTmdbKeyChange(value) {
    setTmdbKeyValue(value);
    setTmdbKey(value);
  }

  async function showConfirm(result) {
    setPending(result);
    setCoverUrl("");
    setConfirmOk(false);
    setCoverStatus("Đang lấy ảnh bìa...");
    const resolvedCover = await resolveImportedCover(result);
    if (resolvedCover) {
      setCoverUrl(resolvedCover);
      setConfirmOk(true);
      setCoverStatus("Ảnh hợp lệ");
    } else {
      setCoverStatus("Chưa có ảnh bìa. Bạn có thể tìm ảnh hoặc thêm thẻ không cần ảnh.");
    }
  }

  async function handleLookup() {
    if (!title.trim()) return;
    setStatus("Đang hỏi AI...");
    setPending(null);
    try {
      const result = await lookup({ title, type: aiType, apiKey, model });
      await showConfirm(result);
      setStatus("Chờ xác nhận");
    } catch (error) {
      setStatus("Error: " + error.message);
    }
  }

  function handleGoogleAi() {
    window.open(buildGoogleAiUrl({ title: title.trim() || "?", type: aiType }), "_blank", "noopener,noreferrer");
    setStatus("Chờ dán từ Google AI");
  }

  function handlePaste() {
    if (!pasteText.trim()) return;
    try {
      setStatus("Đang phân tích dữ liệu dán...");
      showConfirm(parseFreeform(pasteText, { type: aiType }))
        .then(() => setStatus("Đã phân tích, chờ xác nhận"))
        .catch((error) => setStatus("Lỗi phân tích: " + error.message));
    } catch (error) {
      setStatus("Lỗi phân tích: " + error.message);
    }
  }

  async function verifyCover(value) {
    clearTimeout(coverTimerRef.current);
    const clean = sanitizeCover(value);
    if (!clean) {
      setCoverStatus("URL ảnh không hợp lệ.");
      setConfirmOk(false);
      return;
    }
    setCoverStatus("Đang kiểm tra ảnh...");
    setConfirmOk(false);
    const ok = await resolveImportedCover({ cover: clean });
    if (ok) {
      setCoverUrl(ok);
      setCoverStatus("Ảnh hợp lệ");
      setConfirmOk(true);
    } else {
      setCoverStatus("Không tải được ảnh.");
      setConfirmOk(false);
    }
  }

  function handleCoverInput(value) {
    setCoverUrl(value);
    clearTimeout(coverTimerRef.current);
    coverTimerRef.current = setTimeout(() => verifyCover(value), 500);
  }

  async function handleFetchPoster() {
    if (!pending) return;
    setFetching(true);
    setCoverStatus("Đang tìm kiếm ảnh...");
    const found = await fetchPoster({ title: pending.title, type: aiType });
    setFetching(false);
    if (found) {
      setCoverUrl(found);
      verifyCover(found);
    } else {
      setCoverStatus("Không tìm thấy ảnh phù hợp.");
      setConfirmOk(false);
    }
  }

  function handleConfirm() {
    if (!pending) return;
    const finalCover = sanitizeCover(coverUrl) || "";
    const row = {
      title: pending.title,
      year: pending.year || "",
      cover: finalCover,
      trailerUrl: pending.trailerUrl || "",
      source: pending.source || "AI import",
      score: null,
      status: "active",
      subcategory: pending.subcategory || "",
    };
    if (aiType === "games") row.gameplay = pending.pillar;
    else if (aiType === "music") { row.mood = pending.pillar; row.artist = pending.artist || ""; row.genre = pending.subcategory || ""; }
    else if (aiType === "series") { row.affect = pending.pillar; row.seasons = pending.seasons || ""; row.episodes = pending.episodes || ""; }
    else row.affect = pending.pillar;
    onImported?.(aiType, row);
    setPending(null);
    setTitle("");
    setPasteText("");
    setStatus("Đã thêm: " + pending.title);
  }

  const pillColor = pending ? (PILL_COLOR[pending.pillar] || "blue") : "blue";
  const confirmDisabled = Boolean(coverUrl) && !confirmOk;

  return (
    <section className="ai-import-panel" aria-label="AI lookup">
      <div className="ai-import-head">
        <div><div className="ai-import-title">AI Lookup</div><span className="ai-import-status">{status}</span></div>
        <div className="ai-mode-toggle" role="group" aria-label="Content type">
          <button className={`mode-toggle ${aiType === "games" ? "active" : ""}`} onClick={() => setAiType("games")}>Game</button>
          <button className={`mode-toggle ${aiType === "films" ? "active" : ""}`} onClick={() => setAiType("films")}>Film</button>
          <button className={`mode-toggle ${aiType === "series" ? "active" : ""}`} onClick={() => setAiType("series")}>Series</button>
          <button className={`mode-toggle ${aiType === "music" ? "active" : ""}`} onClick={() => setAiType("music")}>Music</button>
        </div>
      </div>

      <div className="ai-import-body">
        <div className="ai-import-fields">
          <input className="planning-input" placeholder="Nhập tên tựa game hoặc phim..." value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLookup()} />
          <input className="planning-input" placeholder="Khóa OpenAI API (lưu cục bộ trên máy)" type="password" value={apiKey} onChange={(e) => handleApiKeyChange(e.target.value)} />
          <input className="planning-input" placeholder="Khóa TMDB API (tùy chọn, để tải ảnh bìa)" type="password" value={tmdbKey} onChange={(e) => handleTmdbKeyChange(e.target.value)} />
          <select className="planning-input" value={model} onChange={(e) => setModel(e.target.value)}>{MODELS.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <div className="ai-action-row"><button className="glass-btn" onClick={handleLookup}>Find info</button><button className="glass-btn" onClick={handleGoogleAi}>Open Google AI</button></div>
        </div>

        <div className="ai-paste-fields">
          <textarea className="planning-input" placeholder="Dán kết quả AI dạng JSON hoặc văn bản..." value={pasteText} onChange={(e) => setPasteText(e.target.value)} />
          <button className="glass-btn" onClick={handlePaste}>Build confirmation card</button>
        </div>
      </div>

      {pending && (
        <div className="confirm-card">
          <div className="confirm-preview-card">
            <div className="cover-wrap">{sanitizeCover(coverUrl) ? <img src={sanitizeCover(coverUrl)} alt={pending.title} loading="lazy" onError={() => { setCoverStatus("Lỗi tải ảnh."); setConfirmOk(false); }} /> : <div className="cover-fallback">{TYPE_LABELS[aiType]}</div>}</div>
            <div className="meta"><div className="title">{pending.title}</div><div className="row"><span className={`pill ${pillColor}`}>{pending.pillar}</span></div></div>
          </div>
          <div className="confirm-body">
            <span className="confirm-type-tag">{TYPE_LABELS[aiType]}</span>
            <div className="confirm-headline">{pending.title} <small>{pending.year || "-"}</small></div>
            <p className="confirm-reason">{pending.reason}</p>
            <span className="confirm-confidence">Confidence {Math.round((pending.confidence || 0) * 100)}%</span>
            <div className="confirm-cover-field">
              <label className="confirm-cover-label">Direct cover image (.jpg/.png/.webp)</label>
              <div className="confirm-cover-row"><input className="planning-input" value={coverUrl} onChange={(e) => handleCoverInput(e.target.value)} placeholder="https://image.tmdb.org/..." /><button className="glass-btn confirm-cover-fetch" onClick={handleFetchPoster} disabled={fetching}>{fetching ? "..." : "Tìm ảnh"}</button></div>
              <span className={`confirm-cover-status${confirmOk ? " is-ok" : coverStatus.includes("failed") || coverStatus.includes("No suitable") ? " is-bad" : coverStatus.includes("Checking") || coverStatus.includes("Searching") ? " is-checking" : ""}`}>{coverStatus}</span>
            </div>
            <div className="confirm-actions"><button className="glass-btn confirm-yes" onClick={handleConfirm} disabled={confirmDisabled}>Yes, add it</button><button className="glass-btn confirm-no" onClick={() => { setPending(null); setStatus("Đã hủy."); }}>Not this</button></div>
          </div>
        </div>
      )}
    </section>
  );
}
