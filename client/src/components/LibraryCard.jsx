import { getTaxonomy } from "../utils/taxonomy.js";
import { fmt } from "../utils/score.js";

export default function LibraryCard({ item, type, onOpen, onPlan, onAddLib, inPlan }) {
  const tax = getTaxonomy(item, type);
  const isCompleted = type === "music" || String(item.status || "").toLowerCase() === "completed";
  const score = isCompleted ? fmt(item.score) : "–";
  const isUpcomingOnly = item._upcomingOnly;
  const status = String(item.status || "").toLowerCase();
  const isLibraryCandidate = isUpcomingOnly || status === "upcoming" || status === "wishlist";

  const pillClass = tax?.color ? tax.color.replace('pill-', '') : "blue";

  const fallbackLabel = type === "games" ? "Game" : type === "series" ? "Series" : type === "music" ? "Music" : "Film";

  return (
    <div className={`card type-${type}`} onClick={() => onOpen?.(item)}>
      <div className="cover-wrap">
        {item.cover ? (
          <img src={item.cover} alt={item.title} loading="lazy" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
        ) : null}
        <div className="cover-fallback" style={item.cover ? { display: "none" } : {}}>{fallbackLabel}</div>
        {isLibraryCandidate ? (
          <button className="card-plan-btn" title="Add to library" onClick={(e) => { e.stopPropagation(); onAddLib?.(item); }}>+</button>
        ) : (
          <button className={`card-plan-btn${inPlan ? " is-planned" : ""}`} title={inPlan ? "Already in Planning" : "Add to Planning"} onClick={(e) => { e.stopPropagation(); onPlan?.(item); }}>{inPlan ? "✓" : "+"}</button>
        )}
      </div>
      <div className="meta">
        <div className="title">{item.title}</div>
        {(item.artist || item.creator) ? <div className="artist">{item.artist || item.creator}</div> : null}
        <div className="row">
          <span className={`pill ${pillClass}`}>{tax.label}</span>
          <span className="score">{score}</span>
        </div>
      </div>
    </div>
  );
}
