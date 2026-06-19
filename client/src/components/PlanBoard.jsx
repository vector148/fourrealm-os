import { useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { getRealmDefs, getTaxonomy } from "../utils/taxonomy.js";
import { fmt } from "../utils/score.js";
import { itemKey } from "../utils/helpers.js";

const MAX_SLOTS = 4;

const PILL_COLOR = {
  narrative: "red", action: "yellow", discovery: "green", mechanic: "blue",
  thriller: "red", exciting: "yellow", healing: "green", drama: "blue",
};

export default function PlanBoard({ type, games, films, planning, onSave, onOpenItem }) {
  const { showToast } = useApp();
  const items = type === "games" ? games : films;
  const defs = getRealmDefs(type);
  const dragRef = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  function getQueue(pillarKey) {
    return planning[type]?.[pillarKey] || [];
  }

  function updateQueue(pillarKey, newQueue) {
    onSave({ ...planning, [type]: { ...planning[type], [pillarKey]: newQueue } });
  }

  function removeSlot(pillarKey, idx) {
    const q = [...getQueue(pillarKey)];
    q.splice(idx, 1);
    updateQueue(pillarKey, q);
  }

  function handleDragStart(pillarKey, idx) {
    dragRef.current = { pillarKey, idx };
  }

  function handleDrop(toPillarKey, toIdx) {
    if (!dragRef.current) return;
    const { pillarKey: fromPillar, idx: fromIdx } = dragRef.current;
    if (fromPillar !== toPillarKey) { showToast("Chỉ có thể kéo trong cùng pillar."); return; }
    const q = [...getQueue(fromPillar)];
    const [item] = q.splice(fromIdx, 1);
    q.splice(Math.min(toIdx, q.length), 0, item);
    updateQueue(fromPillar, q);
    dragRef.current = null;
    setDragOver(null);
  }

  function handleSlotClick(pillarKey, entry) {
    const item = items.find((i) => i.title === entry.title);
    if (item) onOpenItem?.(item);
  }

  function clearAll() {
    if (!window.confirm("Xóa toàn bộ Planning?")) return;
    const next = { ...planning, [type]: {} };
    defs.forEach((d) => { next[type][d.key] = []; });
    onSave(next);
  }

  return (
    <div>
      <div className="planning-board">
        {defs.map((def) => {
          const queue = getQueue(def.key);
          const slots = Array.from({ length: MAX_SLOTS }, (_, i) => queue[i] || null);
          const pillColor = PILL_COLOR[def.key] || "blue";

          return (
            <section
              key={def.key}
              className="planning-pillar"
              data-pillar={def.key}
            >
              {/* Header */}
              <div className="planning-pillar-head">
                <div className="planning-pillar-name">
                  <span className={`dot ${pillColor}`} style={{ marginBottom: 0 }} />
                  {def.label}
                </div>
                <div className="planning-pillar-count">{queue.length}/{MAX_SLOTS}</div>
              </div>

              {/* Slots */}
              <div className="queue-grid">
                {slots.map((entry, idx) => {
                  const dKey = `${def.key}-${idx}`;
                  const fullItem = entry ? items.find((i) => i.title === entry.title) : null;
                  const tax = fullItem ? getTaxonomy(fullItem, type) : null;
                  const pillCls = tax ? PILL_COLOR[tax.key] || "blue" : pillColor;

                  if (!entry) {
                    return (
                      <div
                        key={idx}
                        className={`queue-slot is-empty ${dragOver === dKey ? "is-drop-target" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(dKey); }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={() => handleDrop(def.key, idx)}
                      >
                        <div className="empty-cover">
                          <div className="empty-plus">+</div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      className={`queue-slot ${dragOver === dKey ? "is-drop-target" : ""}`}
                      draggable
                      onDragStart={() => handleDragStart(def.key, idx)}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(dKey); }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={() => handleDrop(def.key, idx)}
                      onClick={() => handleSlotClick(def.key, entry)}
                    >
                      <div className="queue-badge">{idx + 1}</div>

                      <div className="cover-wrap">
                        {entry.cover
                          ? <img src={entry.cover} alt={entry.title} loading="lazy"
                              onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                          : null}
                        <div className="cover-fallback" style={entry.cover ? { display: "none" } : {}}>
                          {type === "games" ? "🎮" : "🎬"}
                        </div>
                      </div>

                      <div className="meta">
                        <div className="title">{entry.title}</div>
                        <div className="row">
                          <span className={`pill ${pillCls}`}>{tax?.label || def.label}</span>
                          {fullItem && <span className="score" style={{ fontSize: 12 }}>{fmt(fullItem.score)}</span>}
                        </div>
                      </div>

                      <button
                        className="queue-remove"
                        title="Xóa khỏi Planning"
                        onClick={(e) => { e.stopPropagation(); removeSlot(def.key, idx); }}
                      >✕</button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="planning-clear-row">
        <button className="glass-btn" onClick={clearAll}>Dọn Planning</button>
      </div>
    </div>
  );
}
