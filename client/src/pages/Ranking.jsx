import { useState, useMemo } from "react";
import DetailModal from "../components/DetailModal.jsx";
import { getRealmDefs, getTaxonomy } from "../utils/taxonomy.js";
import { fmt } from "../utils/score.js";
import { getYear } from "../utils/helpers.js";

const PILL_COLOR = {
  narrative: "red", action: "yellow", discovery: "green", mechanic: "blue",
  thriller: "red", exciting: "yellow", healing: "green", drama: "blue",
  emotional: "blue", thrilling: "yellow", cozy: "green", mystery: "blue",
  epic: "red", edm: "yellow", wistful: "blue", chill: "green",
  horror: "purple", pop_en: "green", pop_cn: "red", pop_vn: "yellow",
};

export default function Ranking({ type, items, onUpdateItem, onDeleteItem }) {
  const [detail, setDetail] = useState(null);
  const [pillar, setPillar] = useState("all");
  const [year, setYear] = useState("all");
  const defs = getRealmDefs(type);

  const years = useMemo(() => {
    const ys = [...new Set(items.map((i) => getYear(i)).filter(Boolean))].sort((a, b) => b - a);
    return ys;
  }, [items]);

  const ranked = useMemo(() => {
    return items
      .filter((i) => type === "music" || String(i.status || "").toLowerCase() === "completed")
      .filter((i) => i.score != null && i.score !== "")
      .filter((i) => pillar === "all" || getTaxonomy(i, type).key === pillar)
      .filter((i) => year === "all" || getYear(i) === year)
      .sort((a, b) => Number(b.score) - Number(a.score));
  }, [items, pillar, year, type]);

  return (
    <div>
      <div className="ranking-head" style={{ marginBottom: 16 }}>
        <div>
          <div className="section-title">Bảng Phong Thần</div>
          <div className="pillar-sub" style={{ marginTop: 2 }}>{ranked.length} mục có điểm</div>
        </div>

        {/* Filters */}
        <div className="ranking-filters">
          <div className="filter-chips">
            <button
              className={`chip ${pillar === "all" ? "active" : ""}`}
              onClick={() => setPillar("all")}
            >Tất cả</button>
            {defs.map((d) => {
              if (d.key === "separator") return null;
              const pillColor = PILL_COLOR[d.key] || "blue";
              return (
                <button
                  key={d.key}
                  className={`chip realm-chip ${pillar === d.key ? "active" : ""}`}
                  onClick={() => setPillar(d.key === pillar ? "all" : d.key)}
                >
                  <span className={`dot ${pillColor}`} style={{ width: 7, height: 7, marginBottom: 0, marginRight: 5 }} />
                  {d.label}
                </button>
              );
            })}
          </div>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="all">Tất cả năm</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Ranking list */}
      {!ranked.length ? (
        <div className="empty-state">Chưa có mục có điểm.</div>
      ) : (
        <div className="ranking-list">
          {ranked.map((item, i) => {
            const tax = getTaxonomy(item, type);
            const pillColor = PILL_COLOR[tax.key] || "blue";
            return (
              <div key={item.id || item.title} className="ranking-row" onClick={() => setDetail(item)}>
                <div className="rank-no">#{i + 1}</div>
                <div style={{ position: "relative", width: 44, height: 58, flexShrink: 0 }}>
                  {item.cover
                    ? <img src={item.cover} alt={item.title} loading="lazy"
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
