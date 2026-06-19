import { useState, useMemo } from "react";
import DetailModal from "../components/DetailModal.jsx";
import { getTaxonomy } from "../utils/taxonomy.js";
import { fmt } from "../utils/score.js";
import { getYear } from "../utils/helpers.js";

const PILL_COLOR = {
  narrative: "red", action: "yellow", discovery: "green", mechanic: "blue",
  thriller: "red", exciting: "yellow", healing: "green", drama: "blue",
  emotional: "red", thrilling: "yellow", cozy: "green", mystery: "blue",
  epic: "yellow", edm: "yellow", wistful: "red", chill: "green",
  horror: "blue", pop_en: "green", pop_cn: "red", pop_vn: "yellow",
};

export default function History({ type, items, onUpdateItem, onDeleteItem }) {
  const [detail, setDetail] = useState(null);

  const completed = useMemo(() =>
    items
      .filter((i) => i.status === "completed" && i.score != null)
      .sort((a, b) => {
        const da = a.date || a.complete || "";
        const db = b.date || b.complete || "";
        return db.localeCompare(da);
      })
      .slice(0, 24),
    [items]
  );

  const avgScore = completed.length
    ? (completed.reduce((s, i) => s + Number(i.score || 0), 0) / completed.length).toFixed(2)
    : "—";

  return (
    <div>
      <div className="pillar-header" style={{ marginBottom: 4 }}>
        <span className="section-title">Đã Phá Đảo</span>
        <span className="pillar-sub">{completed.length} mục hoàn thành gần nhất</span>
      </div>

      {/* Stats */}
      <div className="pillar-chart" style={{ marginBottom: 18 }}>
        <div className="pillar glass-card" style={{ textAlign: "center", padding: "18px 12px" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-main)", fontFamily: "var(--font-display)" }}>
            {completed.length}
          </div>
          <div className="section-title" style={{ marginTop: 4 }}>Đã xong</div>
        </div>
        <div className="pillar glass-card" style={{ textAlign: "center", padding: "18px 12px" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-main)", fontFamily: "var(--font-display)" }}>
            {avgScore}
          </div>
          <div className="section-title" style={{ marginTop: 4 }}>Điểm TB</div>
        </div>
      </div>

      {/* List */}
      {!completed.length ? (
        <div className="empty-state">Chưa có mục hoàn thành nào.</div>
      ) : (
        <div className="ranking-list">
          {completed.map((item, i) => {
            const tax = getTaxonomy(item, type);
            const pillColor = PILL_COLOR[tax.key] || "blue";
            return (
              <div
                key={item.id || item.title}
                className="ranking-row"
                onClick={() => setDetail(item)}
              >
                <div className="rank-no" style={{ fontSize: 16, opacity: 0.5 }}>#{i + 1}</div>
                <div style={{ position: "relative", width: 44, height: 58, flexShrink: 0 }}>
                  {item.cover
                    ? <img src={item.cover} alt={item.title} loading="lazy"
                        style={{ width: 44, height: 58, objectFit: "cover", borderRadius: 8 }}
                        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                    : null}
                  <div style={item.cover
                    ? { display: "none" }
                    : { width: 44, height: 58, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: "rgba(255,255,255,0.04)", borderRadius: 8 }
                  }>{type === "games" ? "🎮" : "🎬"}</div>
                </div>
                <div className="rank-title">
                  {item.title}
                  <small>
                    <span className={`pill ${pillColor}`} style={{ fontSize: 9, padding: "2px 7px" }}>{tax.label}</span>
                    {" "}{getYear(item)}
                  </small>
                </div>
                <div className="rank-score">{fmt(item.score)}</div>
              </div>
            );
          })}
        </div>
      )}

      {detail && (
        <DetailModal
          item={detail}
          type={type}
          onClose={() => setDetail(null)}
          onDelete={async (item) => { await onDeleteItem(item); setDetail(null); }}
          onUpdate={(updated) => { onUpdateItem(updated); setDetail(updated); }}
        />
      )}
    </div>
  );
}
