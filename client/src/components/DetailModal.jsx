import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { getTaxonomy, getRealmDefs } from "../utils/taxonomy.js";
import { toStars, fmt } from "../utils/score.js";
import { getTrailerInfo } from "../utils/helpers.js";
import { api } from "../api/index.js";

export default function DetailModal({ item, type, onClose, onDelete, onUpdate, onRemoveUpcoming }) {
  const { showToast } = useApp();
  const [editingScore, setEditingScore] = useState(false);
  const [scoreVal, setScoreVal] = useState("");
  const [completing, setCompleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [editingPillar, setEditingPillar] = useState(false);
  const [editingYear, setEditingYear] = useState(false);
  const [yearVal, setYearVal] = useState("");

  if (!item) return null;

  const tax = getTaxonomy(item, type);
  const isCompleted = type === "music" || String(item.status || "").toLowerCase() === "completed";
  const activeStatus = "active";
  const stars = item.score != null ? toStars(item.score) : "-";
  const trailer = getTrailerInfo(item);
  const dateStr = isCompleted
    ? item.complete || item.date || item.purchase || ""
    : item.date || item.purchase || item.complete || "";
  const statusStr = type === "music" ? "" : (item.status || "unknown").toUpperCase();

  function getUpdateEndpoint() {
    if (type === "games")  return api.updateGame;
    if (type === "series") return api.updateSeries;
    if (type === "music")  return api.updateMusic;
    return api.updateFilm;
  }

  function getPillarField() {
    if (type === "games") return "gameplay";
    if (type === "music") return "mood";
    return "affect";
  }

  async function savePillar(newKey) {
    const field = getPillarField();
    try {
      if (item._upcomingOnly) {
        const updated = await api.updateUpcoming(type, item.title, { [field]: newKey });
        onUpdate?.({ ...item, ...updated });
        showToast("Classification updated.");
      } else if (item._isMissing) {
        onUpdate?.({ ...item, [field]: newKey });
        showToast("Classification updated locally.");
      } else {
        const endpoint = getUpdateEndpoint();
        const updated = await endpoint(item.id, { [field]: newKey });
        onUpdate?.({ ...item, ...updated });
        showToast("Classification updated.");
      }
    } catch {
      showToast("Failed to update classification.");
    }
    setEditingPillar(false);
  }

  function getDeleteEndpoint() {
    if (type === "games")  return api.deleteGame;
    if (type === "series") return api.deleteSeries;
    if (type === "music")  return api.deleteMusic;
    return api.deleteFilm;
  }

  async function saveScore() {
    if (!isCompleted) {
      showToast("Complete the title before scoring it.");
      return;
    }
    const n = parseFloat(scoreVal);
    if (Number.isNaN(n) || n < 0 || n > 10) {
      showToast("Score must be between 0 and 10.");
      return;
    }

    try {
      const endpoint = getUpdateEndpoint();
      const updated = await endpoint(item.id, { score: n });
      onUpdate?.(updated);
      showToast("Score saved.");
    } catch {
      showToast("Failed to save score.");
    }
    setEditingScore(false);
  }

  async function saveYear() {
    const val = yearVal.trim();
    if (!val) {
      setEditingYear(false);
      return;
    }
    try {
      const endpoint = getUpdateEndpoint();
      const updated = await endpoint(item.id, { releaseDate: val });
      onUpdate?.(updated);
      showToast("Year updated.");
    } catch {
      showToast("Failed to update year.");
    }
    setEditingYear(false);
  }

  function startCompletion() {
    if (!window.confirm(`Mark "${item.title}" as completed?`)) return;
    setCompleting(true);
    setEditingScore(false);
    setScoreVal(item.score ?? "");
  }

  async function completeWithScore() {
    const n = parseFloat(scoreVal);
    if (Number.isNaN(n) || n < 0 || n > 10) {
      showToast("Score is required and must be between 0 and 10.");
      return;
    }

    try {
      const endpoint = getUpdateEndpoint();
      const today = new Date().toISOString().slice(0, 10);
      const updated = await endpoint(item.id, { status: "completed", score: n, complete: today });
      onUpdate?.(updated);
      showToast(`Completed "${item.title}".`);
      setCompleting(false);
    } catch {
      showToast("Failed to complete item.");
    }
  }

  async function undoCompletion() {
    if (!window.confirm(`Cancel completion for "${item.title}"? This will remove the score you gave it.`)) return;
    try {
      const endpoint = getUpdateEndpoint();
      const updated = await endpoint(item.id, { status: activeStatus, score: null, complete: "" });
      onUpdate?.(updated);
      showToast("Completion canceled. Score removed.");
      setEditingScore(false);
      setCompleting(false);
      setScoreVal("");
    } catch {
      showToast("Failed to cancel completion.");
    }
  }

  async function confirmDelete() {
    if (deleteInput !== item.title) return;
    try {
      if (onDelete) {
        await onDelete(item);
      } else {
        const endpoint = getDeleteEndpoint();
        await endpoint(item.id);
      }
      onClose();
      showToast(`Deleted "${item.title}".`);
    } catch {
      showToast("Failed to delete item.");
    }
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content glass-card deep" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" type="button" onClick={onClose} aria-label="Close">x</button>

        <div className="detail-hero">
          <div className="big-title">{item.title}</div>
          {(item.artist || item.creator) && <div className="sub" style={{ opacity: 0.7, fontSize: '0.9em', marginBottom: '8px' }}>{item.artist || item.creator}</div>}
          {item.year && <div className="sub">{item.year}</div>}
          <div className="star-row">{stars}</div>
          {type !== "music" && (
            <div className="timeline">
              <span className="step">{statusStr}</span>
              {dateStr && <><span className="sep">·</span><span>{dateStr}</span></>}
            </div>
          )}
        </div>

        <div className="info-grid detail-info-grid">
          <div className="cell">
            <div className="k">Score</div>
            {editingScore ? (
              <div className="score-edit-row">
                <input
                  className="score-input"
                  autoFocus
                  value={scoreVal}
                  onChange={(e) => setScoreVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveScore();
                    if (e.key === "Escape") setEditingScore(false);
                  }}
                  placeholder="0-10"
                />
                <button className="btn btn-sm btn-primary" type="button" onClick={saveScore}>OK</button>
              </div>
            ) : (
              <button
                className={`v editable score-edit-button ${(!isCompleted || item._isMissing) ? "is-disabled" : ""}`}
                type="button"
                title={item._isMissing ? "Not in library" : isCompleted ? "Edit score" : "Complete this title before scoring"}
                disabled={!isCompleted || item._isMissing}
                onClick={() => { if (isCompleted && !item._isMissing) { setEditingScore(true); setScoreVal(item.score ?? ""); } }}
              >
                {fmt(item.score)} <span className="score-edit-hint">{item._isMissing ? "locked" : isCompleted ? "edit" : "locked"}</span>
              </button>
            )}
          </div>

          {type !== "music" ? (
            <div className="cell">
              <div className="k">Completed</div>
              {completing ? (
                <div className="completion-confirm">
                  <input
                    className="score-input"
                    autoFocus
                    value={scoreVal}
                    onChange={(e) => setScoreVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") completeWithScore();
                      if (e.key === "Escape") { setCompleting(false); setScoreVal(""); }
                    }}
                    placeholder="Score 0-10"
                  />
                  <button className="btn btn-sm btn-primary" type="button" onClick={completeWithScore}>Confirm</button>
                  <button className="btn btn-sm" type="button" onClick={() => { setCompleting(false); setScoreVal(""); }}>Cancel</button>
                </div>
              ) : (
                <button
                  className={`completion-toggle ${isCompleted ? "is-completed" : ""} ${item._isMissing ? "is-disabled" : ""}`}
                  type="button"
                  disabled={item._isMissing}
                  onClick={item._isMissing ? undefined : (isCompleted ? undoCompletion : startCompletion)}
                  title={item._isMissing ? "Not in library" : ""}
                >
                  <span className="completion-dot" />
                  {isCompleted ? "Completed" : "Mark completed"}
                </button>
              )}
            </div>
          ) : (
            <div className="cell">
              <div className="k">Artist</div>
              <div className="v">{item.artist || "-"}</div>
            </div>
          )}

          {type === "games" ? (
            <div className="cell">
              <div className="k">Subcategory</div>
              <div className="v">{item.subcategory || item.genre || "-"}</div>
            </div>
          ) : type === "series" ? (
            <div className="cell">
              <div className="k">SEASONS / EPS</div>
              <div className="v" style={{ fontWeight: 600 }}>
                {item.seasons ? (
                  item.episodes ? `S${item.seasons} · ${item.episodes} eps` : `S${item.seasons}`
                ) : (
                  "-"
                )}
              </div>
            </div>
          ) : (
            <div className="cell">
              <div className="k">Release</div>
              {editingYear ? (
                <div className="score-edit-row">
                  <input
                    className="score-input"
                    autoFocus
                    value={yearVal}
                    onChange={(e) => setYearVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveYear();
                      if (e.key === "Escape") setEditingYear(false);
                    }}
                    placeholder="Year"
                  />
                  <button className="btn btn-sm btn-primary" type="button" onClick={saveYear}>OK</button>
                </div>
              ) : (
                <div 
                  className="v editable"
                  onClick={() => { setEditingYear(true); setYearVal(item.releaseDate || item.year || ""); }}
                  title="Edit release year"
                  style={{ cursor: "pointer" }}
                >
                  {item.releaseDate || item.year || "-"} <span className="score-edit-hint">edit</span>
                </div>
              )}
            </div>
          )}

          <div className="cell">
            <div className="k">Pillar / Affect</div>
            {editingPillar ? (
              <select
                className="pillar-select glass-input"
                autoFocus
                value={tax.key}
                onChange={(e) => savePillar(e.target.value)}
                onBlur={() => setTimeout(() => setEditingPillar(false), 200)}
              >
                {getRealmDefs(type).map((r) => (
                  <option key={r.key} value={r.key}>{r.label}</option>
                ))}
              </select>
            ) : (
              <button
                className="v editable pillar-edit-button"
                type="button"
                title="Change classification"
                onClick={() => setEditingPillar(true)}
              >
                <span className="pillar-dot" style={{ background: tax.dot, boxShadow: `0 0 8px ${tax.dot}` }} />
                <span style={{ color: tax.dot }}>
                  {type === "music"
                    ? [tax.label, item.realm, item.affect].filter(Boolean).join(" / ") || "-"
                    : tax.label || "-"}
                </span>
                <svg className="dropdown-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            )}
          </div>

        </div>

        {trailer.embed ? (
          <div className="trailer-section">
            <div className="trailer-header">Trailer · HD preferred when YouTube allows it</div>
            <div className="trailer-iframe-wrap">
              <iframe src={trailer.embed} title={`${item.title} trailer`} allowFullScreen loading="lazy" />
            </div>
            {trailer.watch && (
              <div className="trailer-actions">
                <a className="btn btn-sm" href={trailer.watch} target="_blank" rel="noopener noreferrer">
                  Watch on YouTube
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state detail-empty-state">No reliable trailer is available yet.</div>
        )}

        {(!item._isMissing || item._upcomingOnly) && (
          !showDelete ? (
            <div className="danger-zone">
              <span className="danger-label">Danger Zone</span>
              <button className="btn btn-sm btn-danger danger-btn" type="button" onClick={() => setShowDelete(true)}>
                {item._upcomingOnly ? "Remove from Upcoming" : "Delete"}
              </button>
            </div>
          ) : (
            <div className="confirm-delete-content glass-card detail-delete-confirm">
              <div className="confirm-delete-title">Confirm {item._upcomingOnly ? "removal" : "deletion"}</div>
              <div className="confirm-delete-desc">
                Type <strong>{item.title}</strong> exactly to confirm.
              </div>
              <input
                className="confirm-delete-input glass-input"
                placeholder={item.title}
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
              />
              <div className="confirm-delete-actions">
                <button className="btn btn-sm" type="button" onClick={() => { setShowDelete(false); setDeleteInput(""); }}>Cancel</button>
                <button
                  className="btn btn-sm btn-danger danger-btn"
                  type="button"
                  disabled={deleteInput !== item.title}
                  onClick={async () => {
                    if (item._upcomingOnly && onRemoveUpcoming) {
                      await onRemoveUpcoming(item);
                      onClose();
                      showToast(`Removed "${item.title}" from Upcoming.`);
                    } else {
                      confirmDelete();
                    }
                  }}
                >
                  {item._upcomingOnly ? "Remove from Upcoming" : "Delete permanently"}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
